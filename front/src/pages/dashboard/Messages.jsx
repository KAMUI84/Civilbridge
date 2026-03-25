// Enhanced Messages System with Chat Functionality
import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';

export default function Messages() {
  const { dashboardConfig } = useOutletContext();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const messagesEndRef = useRef(null);

  // Mock conversations
  const mockConversations = [
    { 
      id: 1, 
      name: 'Sarah Wilson', 
      role: 'Professional', 
      avatar: 'SW',
      lastMessage: 'The blueprints are ready for review',
      lastMessageTime: '2 min ago',
      unreadCount: 2,
      online: true
    },
    { 
      id: 2, 
      name: 'John Doe', 
      role: 'Client', 
      avatar: 'JD',
      lastMessage: 'Can we schedule a site visit?',
      lastMessageTime: '1 hour ago',
      unreadCount: 0,
      online: false
    },
    { 
      id: 3, 
      name: 'Mike Johnson', 
      role: 'Professional', 
      avatar: 'MJ',
      lastMessage: 'Budget estimate submitted',
      lastMessageTime: '3 hours ago',
      unreadCount: 1,
      online: true
    },
    { 
      id: 4, 
      name: 'David Chen', 
      role: 'Professional', 
      avatar: 'DC',
      lastMessage: 'Audit completed successfully',
      lastMessageTime: '1 day ago',
      unreadCount: 0,
      online: false
    }
  ];

  // Mock messages for selected conversation
  const mockMessages = {
    1: [
      { id: 1, sender: 'Sarah Wilson', content: 'Hi! I\'ve completed the bridge design blueprints', time: '10:00 AM', isMe: false },
      { id: 2, sender: 'Me', content: 'Great! Can you send them over?', time: '10:05 AM', isMe: true },
      { id: 3, sender: 'Sarah Wilson', content: 'The blueprints are ready for review', time: '10:15 AM', isMe: false }
    ],
    2: [
      { id: 1, sender: 'John Doe', content: 'Hello, I need help with my project', time: '9:00 AM', isMe: false },
      { id: 2, sender: 'Me', content: 'Sure, what do you need?', time: '9:30 AM', isMe: true },
      { id: 3, sender: 'John Doe', content: 'Can we schedule a site visit?', time: '11:00 AM', isMe: false }
    ]
  };

  useEffect(() => {
    setConversations(mockConversations);
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      setMessages(mockMessages[selectedConversation.id] || []);
      // Mark as read
      setConversations(prev => 
        prev.map(c => 
          c.id === selectedConversation.id 
            ? { ...c, unreadCount: 0 }
            : c
        )
      );
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && selectedConversation) {
      const newMsg = {
        id: messages.length + 1,
        sender: 'Me',
        content: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true
      };
      
      setMessages([...messages, newMsg]);
      setNewMessage('');

      // Update conversation
      setConversations(prev => 
        prev.map(c => 
          c.id === selectedConversation.id 
            ? { ...c, lastMessage: newMessage, lastMessageTime: 'Just now' }
            : c
        )
      );
    }
  };

  const handleNewChat = (participant) => {
    const newConversation = {
      id: Date.now(),
      name: participant.name,
      role: participant.role,
      avatar: participant.name.split(' ').map(n => n[0]).join(''),
      lastMessage: 'New conversation started',
      lastMessageTime: 'Just now',
      unreadCount: 0,
      online: true
    };
    
    setConversations([newConversation, ...conversations]);
    setSelectedConversation(newConversation);
    setShowNewChat(false);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Messages</h1>
        <p style={styles.subtitle}>Communicate with your team and clients</p>
      </div>

      <div style={styles.chatContainer}>
        {/* Conversations List */}
        <div style={styles.conversationsList}>
          <div style={styles.conversationsHeader}>
            <h3 style={styles.listTitle}>Conversations</h3>
            <button
              onClick={() => setShowNewChat(true)}
              style={styles.newChatButton}
            >
              + New Chat
            </button>
          </div>
          
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />

          <div style={styles.conversations}>
            {filteredConversations.map(conversation => (
              <div
                key={conversation.id}
                style={{
                  ...styles.conversationItem,
                  ...(selectedConversation?.id === conversation.id && styles.conversationSelected)
                }}
                onClick={() => setSelectedConversation(conversation)}
              >
                <div style={styles.conversationAvatar}>
                  {conversation.avatar}
                  {conversation.online && <div style={styles.onlineIndicator} />}
                </div>
                <div style={styles.conversationInfo}>
                  <div style={styles.conversationName}>{conversation.name}</div>
                  <div style={styles.conversationRole}>{conversation.role}</div>
                  <div style={styles.conversationMessage}>{conversation.lastMessage}</div>
                </div>
                <div style={styles.conversationMeta}>
                  <div style={styles.conversationTime}>{conversation.lastMessageTime}</div>
                  {conversation.unreadCount > 0 && (
                    <div style={styles.unreadBadge}>{conversation.unreadCount}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div style={styles.chatArea}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div style={styles.chatHeader}>
                <div style={styles.chatParticipant}>
                  <div style={styles.participantAvatar}>
                    {selectedConversation.avatar}
                    {selectedConversation.online && <div style={styles.onlineIndicator} />}
                  </div>
                  <div>
                    <div style={styles.participantName}>{selectedConversation.name}</div>
                    <div style={styles.participantStatus}>
                      {selectedConversation.online ? 'Online' : 'Offline'} • {selectedConversation.role}
                    </div>
                  </div>
                </div>
                <div style={styles.chatActions}>
                  <button style={styles.chatActionButton}>📞 Call</button>
                  <button style={styles.chatActionButton}>📹 Video</button>
                  <button style={styles.chatActionButton}>ℹ️ Info</button>
                </div>
              </div>

              {/* Messages */}
              <div style={styles.messagesContainer}>
                {messages.map(message => (
                  <div
                    key={message.id}
                    style={{
                      ...styles.messageItem,
                      ...(message.isMe ? styles.messageSent : styles.messageReceived)
                    }}
                  >
                    <div style={styles.messageContent}>
                      <div style={styles.messageText}>{message.content}</div>
                      <div style={styles.messageTime}>{message.time}</div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div style={styles.messageInputContainer}>
                <form onSubmit={handleSendMessage} style={styles.messageForm}>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    style={styles.messageInput}
                  />
                  <button type="submit" style={styles.sendButton}>
                    Send
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div style={styles.emptyChat}>
              <div style={styles.emptyIcon}>💬</div>
              <h3 style={styles.emptyTitle}>Select a conversation</h3>
              <p style={styles.emptyText}>Choose a conversation from the list to start messaging</p>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Start New Conversation</h3>
            <div style={styles.newChatForm}>
              <input
                type="text"
                placeholder="Search for a person..."
                style={styles.modalInput}
              />
              <div style={styles.suggestions}>
                <div style={styles.suggestionItem}>
                  <div style={styles.suggestionAvatar}>SW</div>
                  <div style={styles.suggestionInfo}>
                    <div style={styles.suggestionName}>Sarah Wilson</div>
                    <div style={styles.suggestionRole}>Professional</div>
                  </div>
                  <button
                    onClick={() => handleNewChat({ name: 'Sarah Wilson', role: 'Professional' })}
                    style={styles.suggestionButton}
                  >
                    Start Chat
                  </button>
                </div>
                <div style={styles.suggestionItem}>
                  <div style={styles.suggestionAvatar}>JD</div>
                  <div style={styles.suggestionInfo}>
                    <div style={styles.suggestionName}>John Doe</div>
                    <div style={styles.suggestionRole}>Client</div>
                  </div>
                  <button
                    onClick={() => handleNewChat({ name: 'John Doe', role: 'Client' })}
                    style={styles.suggestionButton}
                  >
                    Start Chat
                  </button>
                </div>
              </div>
            </div>
            <div style={styles.modalActions}>
              <button
                onClick={() => setShowNewChat(false)}
                style={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '100%',
    margin: '0 auto',
    padding: '24px'
  },
  title: {
    margin: '0 0 8px',
    fontSize: '28px',
    fontWeight: 700,
    color: 'var(--text-color)'
  },
  subtitle: {
    margin: '0 0 32px',
    fontSize: '16px',
    color: 'var(--text-muted)'
  },
  placeholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px',
    background: 'var(--card-bg)',
    border: '1px solid #1a1a1a',
    borderRadius: '12px',
    fontSize: '18px',
    color: 'var(--text-muted)'
  }
};
