import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../context/useAuth';
import { expertsService } from '../../services/expertsService';
import messagesService from '../../services/messagesService';
import { connectSocket } from '../../services/socketService';
import SEO from '../../components/seo/SEO';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

function resolveOtherParticipant(thread, currentUserId) {
  if (String(thread?.participantOne?.id) === String(currentUserId)) {
    return thread?.participantTwo;
  }
  return thread?.participantOne;
}

function normaliseMessage(message) {
  return {
    ...message,
    id: String(message.id),
    threadId: String(message.threadId),
    senderId: String(message.senderId),
    recipientId: message.recipientId ? String(message.recipientId) : null,
  };
}

function getAttachmentUrl(path) {
  if (!path) return null;
  return path.startsWith('http') ? path : `${BASE_URL}${path}`;
}

function receiptLabel(message) {
  if (message.status === 'READ') return 'Read';
  if (message.status === 'DELIVERED') return 'Delivered';
  return 'Sent';
}

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [threadState, setThreadState] = useState({ loading: true, error: '' });
  const [messageState, setMessageState] = useState({ loading: false, error: '' });
  const [sending, setSending] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [connectionState, setConnectionState] = useState('connecting');
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  const markThreadRead = useCallback(async (threadId) => {
    if (!threadId) return;
    try {
      await messagesService.markThreadRead(threadId);
    } catch {
      // Ignore transient read-sync failures; the next thread fetch will reconcile.
    }
  }, []);

  const loadThreads = useCallback(async () => {
    try {
      setThreadState({ loading: true, error: '' });
      const response = await messagesService.listThreads({ limit: 40 });
      const nextThreads = response?.data || [];
      setConversations(nextThreads);
      setSelectedConversation((current) => {
        if (!current && nextThreads.length) return nextThreads[0];
        if (!current) return null;
        return nextThreads.find((thread) => String(thread.id) === String(current.id)) || current;
      });
      setThreadState({ loading: false, error: '' });
    } catch (error) {
      setThreadState({ loading: false, error: error.message || 'Failed to load conversations.' });
    }
  }, []);

  const loadSuggestions = useCallback(async () => {
    try {
      const response = await expertsService.getAll();
      const nextSuggestions = (response?.experts || [])
        .filter((expert) => String(expert.userId) !== String(user?.id))
        .map((expert) => ({
          id: expert.userId,
          name: expert.user?.fullName || 'Expert',
          role: expert.user?.profession || expert.providerType || 'Expert',
          avatar: (expert.user?.fullName || 'Expert').split(' ').map((part) => part[0]).join('').slice(0, 2),
        }))
        .slice(0, 10);
      setSuggestions(nextSuggestions);
    } catch {
      setSuggestions([]);
    }
  }, [user?.id]);

  const loadMessages = useCallback(async (threadId) => {
    if (!threadId) return;

    try {
      setMessageState({ loading: true, error: '' });
      const response = await messagesService.getThreadMessages(threadId, { limit: 100 });
      setMessages((response?.data || []).slice().reverse().map(normaliseMessage));
      setMessageState({ loading: false, error: '' });
    } catch (error) {
      setMessages([]);
      setMessageState({ loading: false, error: error.message || 'Failed to load messages.' });
    }
  }, []);

  useEffect(() => {
    loadThreads();
    loadSuggestions();
  }, [loadSuggestions, loadThreads]);

  useEffect(() => {
    const socket = connectSocket();

    const handleConnect = () => {
      setConnectionState('connected');
      if (selectedConversation?.id) {
        socket.emit('thread:join', { threadId: selectedConversation.id });
      }
    };
    const handleDisconnect = () => {
      setConnectionState('disconnected');
      setTypingUsers([]);
    };
    const handleConnectError = () => setConnectionState('error');
    const handleIncomingMessage = (payload) => {
      const incoming = normaliseMessage(payload);

      setConversations((current) => {
        const next = current.map((thread) => (
          String(thread.id) === String(incoming.threadId)
            ? { ...thread, lastMessage: incoming, lastMessageAt: incoming.createdAt }
            : thread
        ));
        return next.sort((a, b) => new Date(b.lastMessageAt || b.createdAt) - new Date(a.lastMessageAt || a.createdAt));
      });

      if (String(selectedConversation?.id) !== String(incoming.threadId)) {
        return;
      }

      setMessages((current) => current.some((item) => String(item.id) === String(incoming.id)) ? current : [...current, incoming]);
      setTypingUsers([]);
      if (String(incoming.senderId) !== String(user?.id)) {
        markThreadRead(incoming.threadId);
      }
    };

    const handleStatusUpdate = (payload) => {
      setMessages((current) => current.map((item) => (
        String(item.id) === String(payload.messageId)
          ? { ...item, status: payload.status, deliveredAt: payload.deliveredAt, readAt: payload.readAt }
          : item
      )));
      setConversations((current) => current.map((thread) => {
        if (String(thread.id) !== String(payload.threadId) || !thread.lastMessage) return thread;
        if (String(thread.lastMessage.id) !== String(payload.messageId)) return thread;
        return {
          ...thread,
          lastMessage: {
            ...thread.lastMessage,
            status: payload.status,
            deliveredAt: payload.deliveredAt,
            readAt: payload.readAt,
          },
        };
      }));
    };

    const handleTypingStart = ({ threadId, userId }) => {
      if (String(threadId) !== String(selectedConversation?.id) || String(userId) === String(user?.id)) return;
      setTypingUsers((current) => current.includes(String(userId)) ? current : [...current, String(userId)]);
    };

    const handleTypingStop = ({ threadId, userId }) => {
      if (String(threadId) !== String(selectedConversation?.id)) return;
      setTypingUsers((current) => current.filter((item) => item !== String(userId)));
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('message:new', handleIncomingMessage);
    socket.on('message:status', handleStatusUpdate);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('message:new', handleIncomingMessage);
      socket.off('message:status', handleStatusUpdate);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
    };
  }, [markThreadRead, selectedConversation?.id, user?.id]);

  useEffect(() => {
    const socket = connectSocket();
    if (!selectedConversation?.id) return undefined;

    socket.emit('thread:join', { threadId: selectedConversation.id });
    loadMessages(selectedConversation.id);
    markThreadRead(selectedConversation.id);

    return () => {
      socket.emit('thread:leave', { threadId: selectedConversation.id });
      setTypingUsers([]);
    };
  }, [loadMessages, markThreadRead, selectedConversation?.id]);

  useEffect(() => {
    return () => {
      window.clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const emitTyping = useCallback((isTyping) => {
    if (!selectedConversation?.id) return;
    const socket = connectSocket();
    socket.emit(isTyping ? 'typing:start' : 'typing:stop', { threadId: selectedConversation.id });
  }, [selectedConversation?.id]);

  const handleDraftChange = (value) => {
    setNewMessage(value);
    emitTyping(Boolean(value.trim()));
    window.clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = window.setTimeout(() => emitTyping(false), 1200);
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if ((!newMessage.trim() && !attachment) || !selectedConversation || sending) return;

    try {
      setSending(true);
      emitTyping(false);
      const response = await messagesService.sendMessage(selectedConversation.id, {
        body: newMessage.trim(),
        attachment,
      });
      const created = response?.data ? normaliseMessage(response.data) : null;
      if (created) {
        setMessages((current) => current.some((item) => String(item.id) === String(created.id)) ? current : [...current, created]);
      }
      setNewMessage('');
      setAttachment(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await loadThreads();
    } catch (error) {
      setMessageState((current) => ({ ...current, error: error.message || 'Failed to send message.' }));
    } finally {
      setSending(false);
    }
  };

  const handleNewChat = async (participant) => {
    try {
      const response = await messagesService.createThread({ participantId: participant.id });
      const createdThread = response?.data;
      await loadThreads();
      setSelectedConversation(createdThread || null);
      setShowNewChat(false);
      setSearchTerm('');
    } catch (error) {
      setThreadState({ loading: false, error: error.message || 'Failed to start conversation.' });
    }
  };

  const filteredConversations = useMemo(() => conversations.filter((conversation) => {
    const other = resolveOtherParticipant(conversation, user?.id);
    const term = searchTerm.toLowerCase();
    return !term || other?.fullName?.toLowerCase().includes(term) || conversation.subject?.toLowerCase().includes(term);
  }), [conversations, searchTerm, user?.id]);

  const filteredSuggestions = useMemo(() => suggestions.filter((suggestion) => {
    const term = searchTerm.toLowerCase();
    return !term || suggestion.name.toLowerCase().includes(term) || suggestion.role.toLowerCase().includes(term);
  }), [searchTerm, suggestions]);

  const typingLabel = useMemo(() => {
    if (!typingUsers.length) return '';
    const other = resolveOtherParticipant(selectedConversation, user?.id);
    return `${other?.fullName || 'Someone'} is typing...`;
  }, [selectedConversation, typingUsers, user?.id]);

  return (
    <div style={styles.container}>
      <SEO title="Messages" noindex />
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Messages</h1>
          <p style={styles.subtitle}>Real-time project communication with delivery status, attachments, and presence.</p>
        </div>
        <button type="button" onClick={() => setShowNewChat(true)} style={styles.newChatButton}>Start Conversation</button>
      </div>

      <div style={styles.chatContainer}>
        <aside style={styles.conversationsList}>
          <div style={styles.conversationsHeader}>
            <h3 style={styles.listTitle}>Threads</h3>
            <div style={styles.connectionPill}>Socket: {connectionState}</div>
          </div>

          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            style={styles.searchInput}
          />

          <div style={styles.conversations}>
            {threadState.loading ? (
              Array.from({ length: 5 }).map((_, index) => <div key={index} style={styles.conversationSkeleton} />)
            ) : threadState.error ? (
              <div style={styles.sidebarState}>
                <p style={styles.sidebarStateText}>{threadState.error}</p>
                <button type="button" onClick={loadThreads} style={styles.newChatButton}>Retry</button>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div style={styles.sidebarState}>
                <p style={styles.sidebarStateText}>No conversations yet.</p>
              </div>
            ) : (
              filteredConversations.map((conversation) => {
                const other = resolveOtherParticipant(conversation, user?.id);
                const lastMessage = conversation.lastMessage?.body || (conversation.lastMessage?.attachmentName ? 'Attachment shared' : 'No messages yet');
                const unread = conversation.lastMessage && String(conversation.lastMessage.recipientId) === String(user?.id) && conversation.lastMessage.status !== 'READ';

                return (
                  <button
                    key={conversation.id}
                    type="button"
                    style={{
                      ...styles.conversationItem,
                      ...(selectedConversation?.id === conversation.id ? styles.conversationSelected : {}),
                    }}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div style={styles.conversationAvatar}>{getInitials(other?.fullName || 'User')}</div>
                    <div style={styles.conversationInfo}>
                      <div style={styles.conversationName}>{other?.fullName || 'Unknown user'}</div>
                      <div style={styles.conversationRole}>{conversation.subject || other?.email || 'Direct conversation'}</div>
                      <div style={styles.conversationMessage}>{lastMessage}</div>
                    </div>
                    <div style={styles.conversationMeta}>
                      <div style={styles.conversationTime}>{conversation.lastMessageAt ? new Date(conversation.lastMessageAt).toLocaleDateString() : ''}</div>
                      {unread ? <span style={styles.unreadDot} /> : null}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section style={styles.chatArea}>
          {selectedConversation ? (
            <>
              <div style={styles.chatHeader}>
                <div style={styles.chatParticipant}>
                  <div style={styles.participantAvatar}>{getInitials(resolveOtherParticipant(selectedConversation, user?.id)?.fullName || 'User')}</div>
                  <div>
                    <div style={styles.participantName}>{resolveOtherParticipant(selectedConversation, user?.id)?.fullName || 'Unknown user'}</div>
                    <div style={styles.participantStatus}>{typingLabel || selectedConversation.subject || 'Direct conversation'}</div>
                  </div>
                </div>
              </div>

              <div style={styles.messagesContainer}>
                {messageState.loading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} style={{ ...styles.messageItem, ...(index % 2 === 0 ? styles.messageReceived : styles.messageSent) }}>
                      <div style={styles.messageSkeleton} />
                    </div>
                  ))
                ) : messageState.error ? (
                  <div style={styles.emptyChat}>
                    <h3 style={styles.emptyTitle}>Could not load this thread</h3>
                    <p style={styles.emptyText}>{messageState.error}</p>
                    <button type="button" style={styles.newChatButton} onClick={() => loadMessages(selectedConversation.id)}>Retry</button>
                  </div>
                ) : messages.length === 0 ? (
                  <div style={styles.emptyChat}>
                    <h3 style={styles.emptyTitle}>No messages yet</h3>
                    <p style={styles.emptyText}>Send the first message to start this conversation.</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isMe = String(message.senderId) === String(user?.id);
                    return (
                      <div key={message.id} style={{ ...styles.messageItem, ...(isMe ? styles.messageSent : styles.messageReceived) }}>
                        <div style={{ ...styles.messageContent, ...(isMe ? styles.messageContentSent : styles.messageContentReceived) }}>
                          {message.body ? <div style={styles.messageText}>{message.body}</div> : null}
                          {message.attachmentUrl ? (
                            <a href={getAttachmentUrl(message.attachmentUrl)} target="_blank" rel="noreferrer" style={styles.attachmentCard}>
                              <strong>{message.attachmentName || 'Attachment'}</strong>
                              <span>{message.attachmentMimeType || 'File'}</span>
                            </a>
                          ) : null}
                          <div style={styles.messageMeta}>
                            <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {isMe ? <span>{receiptLabel(message)}</span> : null}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                {typingLabel ? <div style={styles.typingIndicator}>{typingLabel}</div> : null}
                <div ref={messagesEndRef} />
              </div>

              <div style={styles.messageInputContainer}>
                <form onSubmit={handleSendMessage} style={styles.messageForm}>
                  <div style={styles.inputStack}>
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(event) => handleDraftChange(event.target.value)}
                      onBlur={() => emitTyping(false)}
                      style={styles.messageInput}
                    />
                    {attachment ? <div style={styles.attachmentPill}>{attachment.name}</div> : null}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    style={{ display: 'none' }}
                    onChange={(event) => setAttachment(event.target.files?.[0] || null)}
                  />
                  <button type="button" style={styles.attachButton} onClick={() => fileInputRef.current?.click()}>
                    Attach
                  </button>
                  <button type="submit" style={styles.sendButton} disabled={sending}>
                    {sending ? 'Sending...' : 'Send'}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div style={styles.emptyChat}>
              <h3 style={styles.emptyTitle}>Select a conversation</h3>
              <p style={styles.emptyText}>Choose a thread from the left to view messages, files, and status updates.</p>
            </div>
          )}
        </section>
      </div>

      {showNewChat ? (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Start New Conversation</h3>
            <input
              type="text"
              placeholder="Search for a person..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              style={styles.modalInput}
            />
            <div style={styles.suggestions}>
              {filteredSuggestions.length === 0 ? (
                <div style={styles.sidebarState}><p style={styles.sidebarStateText}>No people available to start a chat with.</p></div>
              ) : (
                filteredSuggestions.map((participant) => (
                  <div key={participant.id} style={styles.suggestionItem}>
                    <div style={styles.suggestionAvatar}>{participant.avatar}</div>
                    <div style={styles.suggestionInfo}>
                      <div style={styles.suggestionName}>{participant.name}</div>
                      <div style={styles.suggestionRole}>{participant.role}</div>
                    </div>
                    <button type="button" onClick={() => handleNewChat(participant)} style={styles.suggestionButton}>
                      Start
                    </button>
                  </div>
                ))
              )}
            </div>
            <div style={styles.modalActions}>
              <button type="button" onClick={() => setShowNewChat(false)} style={styles.cancelButton}>Close</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function getInitials(value) {
  return (value || 'User').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

const styles = {
  container: { maxWidth: '100%', margin: '0 auto', padding: '24px' },
  header: { marginBottom: '24px', display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'center' },
  title: { margin: '0 0 8px', fontSize: '28px', fontWeight: 700, color: 'var(--text-color)' },
  subtitle: { margin: 0, fontSize: '16px', color: 'var(--text-muted)', maxWidth: 640 },
  chatContainer: { display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px', minHeight: '72vh' },
  conversationsList: { background: 'var(--card-bg)', border: '1px solid #1a1a1a', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  conversationsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 12px', gap: 12 },
  listTitle: { margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--text-color)' },
  newChatButton: { border: '1px solid #2b3442', background: 'transparent', borderRadius: '10px', color: '#dbe4f0', padding: '10px 14px', cursor: 'pointer', fontWeight: 700 },
  searchInput: { margin: '0 20px 12px', padding: '12px 14px', borderRadius: '10px', border: '1px solid #262626', background: 'rgba(255,255,255,0.03)', color: 'var(--text-color)' },
  connectionPill: { padding: '8px 10px', borderRadius: '999px', background: 'rgba(37,99,235,0.12)', color: '#93c5fd', fontSize: '12px', fontWeight: 700 },
  conversations: { display: 'grid', gap: '8px', padding: '0 12px 12px', overflowY: 'auto' },
  conversationItem: { display: 'grid', gridTemplateColumns: '48px 1fr auto', gap: '12px', alignItems: 'center', padding: '12px', borderRadius: '10px', cursor: 'pointer', background: 'transparent', border: '1px solid transparent', textAlign: 'left' },
  conversationSelected: { background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.18)' },
  conversationAvatar: { width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, #2563eb, #38bdf8)', display: 'grid', placeItems: 'center', fontWeight: 700, color: '#ffffff' },
  conversationInfo: { minWidth: 0 },
  conversationName: { color: 'var(--text-color)', fontWeight: 600, marginBottom: '2px' },
  conversationRole: { color: 'var(--text-muted)', fontSize: '12px', marginBottom: '4px' },
  conversationMessage: { color: 'var(--text-muted)', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  conversationMeta: { display: 'grid', justifyItems: 'end', gap: '8px' },
  conversationTime: { color: 'var(--text-muted)', fontSize: '11px', maxWidth: 90, textAlign: 'right' },
  unreadDot: { width: 10, height: 10, borderRadius: '50%', background: '#3b82f6' },
  conversationSkeleton: { height: 72, borderRadius: '10px', background: 'linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.08), rgba(255,255,255,0.04))' },
  sidebarState: { padding: '24px 12px', textAlign: 'center' },
  sidebarStateText: { color: 'var(--text-muted)', marginBottom: '12px' },
  chatArea: { background: 'var(--card-bg)', border: '1px solid #1a1a1a', borderRadius: '12px', display: 'flex', flexDirection: 'column', minHeight: '72vh' },
  chatHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #1a1a1a' },
  chatParticipant: { display: 'flex', alignItems: 'center', gap: '12px' },
  participantAvatar: { width: '46px', height: '46px', borderRadius: '16px', background: 'linear-gradient(135deg, #2563eb, #38bdf8)', display: 'grid', placeItems: 'center', color: '#ffffff', fontWeight: 700 },
  participantName: { color: 'var(--text-color)', fontWeight: 600 },
  participantStatus: { color: 'var(--text-muted)', fontSize: '13px' },
  messagesContainer: { flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' },
  messageItem: { display: 'flex' },
  messageSent: { justifyContent: 'flex-end' },
  messageReceived: { justifyContent: 'flex-start' },
  messageContent: { maxWidth: '72%', padding: '12px 14px', borderRadius: '16px', border: '1px solid #1a1a1a', display: 'grid', gap: 8 },
  messageContentSent: { background: 'rgba(37,99,235,0.18)' },
  messageContentReceived: { background: 'rgba(255,255,255,0.04)' },
  messageText: { lineHeight: 1.6, color: 'var(--text-color)' },
  messageMeta: { display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: '11px', color: 'var(--text-muted)' },
  attachmentCard: { display: 'grid', gap: 4, borderRadius: 12, border: '1px solid rgba(148,163,184,0.18)', padding: 12, textDecoration: 'none', color: '#dbe4f0' },
  typingIndicator: { color: '#93c5fd', fontSize: 13 },
  messageSkeleton: { width: 220, height: 54, borderRadius: '12px', background: 'linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.08), rgba(255,255,255,0.04))' },
  messageInputContainer: { borderTop: '1px solid #1a1a1a', padding: '16px 20px' },
  messageForm: { display: 'flex', gap: '12px', alignItems: 'flex-end' },
  inputStack: { flex: 1, display: 'grid', gap: 8 },
  messageInput: { width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #262626', background: 'rgba(255,255,255,0.03)', color: 'var(--text-color)' },
  attachmentPill: { display: 'inline-flex', alignItems: 'center', borderRadius: 999, border: '1px solid #2b3442', padding: '6px 10px', color: '#dbe4f0', fontSize: 12 },
  attachButton: { border: '1px solid #2b3442', borderRadius: '10px', background: 'transparent', color: '#dbe4f0', fontWeight: 700, padding: '12px 16px', cursor: 'pointer' },
  sendButton: { border: 'none', borderRadius: '10px', background: 'linear-gradient(135deg, #2563eb, #38bdf8)', color: '#ffffff', fontWeight: 700, padding: '12px 18px', cursor: 'pointer' },
  emptyChat: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px' },
  emptyTitle: { color: 'var(--text-color)', marginBottom: '8px' },
  emptyText: { color: 'var(--text-muted)', maxWidth: 320, lineHeight: 1.6 },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { width: '100%', maxWidth: 600, background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid #1a1a1a', padding: '24px' },
  modalTitle: { margin: '0 0 16px', color: 'var(--text-color)' },
  modalInput: { width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #262626', background: 'rgba(255,255,255,0.03)', color: 'var(--text-color)', marginBottom: 16 },
  suggestions: { display: 'grid', gap: '10px', maxHeight: 320, overflowY: 'auto' },
  suggestionItem: { display: 'grid', gridTemplateColumns: '48px 1fr auto', gap: '12px', alignItems: 'center', padding: '12px', borderRadius: '10px', border: '1px solid #1a1a1a' },
  suggestionAvatar: { width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, #2563eb, #38bdf8)', display: 'grid', placeItems: 'center', color: '#ffffff', fontWeight: 700 },
  suggestionInfo: { minWidth: 0 },
  suggestionName: { color: 'var(--text-color)', fontWeight: 600, marginBottom: '4px' },
  suggestionRole: { color: 'var(--text-muted)', fontSize: '13px' },
  suggestionButton: { border: 'none', borderRadius: '8px', background: 'rgba(37,99,235,0.12)', color: '#bfdbfe', padding: '10px 12px', cursor: 'pointer', fontWeight: 700 },
  modalActions: { marginTop: '16px', display: 'flex', justifyContent: 'flex-end' },
  cancelButton: { border: '1px solid #262626', background: 'transparent', color: 'var(--text-color)', borderRadius: '8px', padding: '10px 14px', cursor: 'pointer' },
};
