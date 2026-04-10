import React, { useState, useRef, useEffect } from 'react';

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: '🏗️ Hello! I\'m your CivilBridge AI assistant. I can help you with:\n\n• Budget analysis and cost estimates\n• Building plan recommendations\n• Construction advice and guidance\n• Material selection and sourcing\n• Project timeline planning\n\nHow can I assist you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Generate a guest ID if not already stored
  const getGuestId = () => {
    let guestId = localStorage.getItem('civilbridge_guest_id');
    if (!guestId) {
      guestId = 'guest_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      localStorage.setItem('civilbridge_guest_id', guestId);
    }
    return guestId;
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call the AI chat API
      const response = await fetch('http://localhost:3000/api/ai/guest/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          guest_id: getGuestId(),
          history: messages.slice(-5).map(msg => ({
            role: msg.type === 'user' ? 'user' : 'model',
            content: msg.content
          }))
        })
      });

      const data = await response.json();

      // Backend returns `response`; keep backward-compat with `reply` if older clients exist.
      const assistantText = data?.response ?? data?.reply;
      if (assistantText) {
        const assistantMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: assistantText
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('No response from AI');
      }
    } catch (error) {
      console.error('AI chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again in a moment. If you need immediate help, you can explore our budget analysis tools or contact support.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { label: 'Analyze my budget', action: () => setInput('Can you help me analyze a construction budget of 10 million RWF?') },
    { label: 'Building advice', action: () => setInput('What should I consider when building a 3-bedroom house in Rwanda?') },
    { label: 'Material costs', action: () => setInput('What are the current costs for cement and steel in Kigali?') },
    { label: 'Project timeline', action: () => setInput('How long does it typically take to build a 150m² house?') }
  ];

  return (
    <div style={{
      height: '600px',
      display: 'flex',
      flexDirection: 'column',
      background: '#000000',
      borderRadius: '12px',
      border: '1px solid #1a1a1a',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        background: 'linear-gradient(135deg, #000000, #1a1a1a)',
        color: 'white',
        borderBottom: '1px solid #1a1a1a'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px'
          }}>
            🤖
          </div>
          <div>
            <div style={{ fontWeight: '600', fontSize: '16px' }}>CivilBridge AI Assistant</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>Your construction expert</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        padding: '12px 20px',
        background: '#0a0a0a',
        borderBottom: '1px solid #1a1a1a'
      }}>
        <div style={{ fontSize: '12px', fontWeight: '600', color: '#a0a0a0', marginBottom: '8px' }}>
          Quick Actions:
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              style={{
                padding: '6px 12px',
                borderRadius: '16px',
                border: '1px solid #1a1a1a',
                background: '#000000',
                color: '#ffffff',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#1a1a1a';
                e.target.style.borderColor = '#3b82f6';
              }}
              onMouseOut={(e) => {
                e.target.style.background = '#000000';
                e.target.style.borderColor = '#1a1a1a';
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        background: '#000000'
      }}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              marginBottom: '16px',
              display: 'flex',
              justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div
              style={{
                maxWidth: '80%',
                padding: '12px 16px',
                borderRadius: '16px',
                background: message.type === 'user' 
                  ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' 
                  : '#0a0a0a',
                color: message.type === 'user' ? 'white' : '#ffffff',
                border: message.type === 'user' ? 'none' : '1px solid #1a1a1a',
                fontSize: '14px',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap'
              }}
            >
              {message.content}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: '16px',
              background: '#0a0a0a',
              border: '1px solid #1a1a1a',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#666666',
                animation: 'pulse 1.4s infinite ease-in-out both'
              }} />
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#666666',
                animation: 'pulse 1.4s infinite ease-in-out both',
                animationDelay: '0.2s'
              }} />
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#666666',
                animation: 'pulse 1.4s infinite ease-in-out both',
                animationDelay: '0.4s'
              }} />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '16px 20px',
        background: '#0a0a0a',
        borderTop: '1px solid #1a1a1a'
      }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about construction..."
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '24px',
              border: '1px solid #1a1a1a',
              outline: 'none',
              fontSize: '14px',
              background: '#000000',
              color: '#ffffff'
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            style={{
              padding: '12px 20px',
              borderRadius: '24px',
              border: 'none',
              background: input.trim() && !isLoading 
                ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' 
                : '#1a1a1a',
              color: input.trim() && !isLoading ? 'white' : '#666666',
              cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            Send
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
