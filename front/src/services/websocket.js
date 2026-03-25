// WebSocket Service for Real-time Features
class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
    this.isConnecting = false;
    this.heartbeatInterval = null;
  }

  connect(url = 'ws://localhost:3001') {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;
    console.log('🔌 Connecting to WebSocket...');

    try {
      this.ws = new WebSocket(url);
      this.setupEventListeners();
    } catch (error) {
      console.error('❌ WebSocket connection error:', error);
      this.handleReconnect();
    }
  }

  setupEventListeners() {
    this.ws.onopen = () => {
      console.log('✅ WebSocket connected');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.emit('connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('❌ Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = (event) => {
      console.log('🔌 WebSocket disconnected:', event.code, event.reason);
      this.isConnecting = false;
      this.stopHeartbeat();
      this.emit('disconnected');
      
      if (event.code !== 1000) {
        this.handleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      this.isConnecting = false;
      this.emit('error', error);
    };
  }

  handleMessage(data) {
    const { type, payload } = data;
    
    switch (type) {
      case 'notification':
        this.emit('notification', payload);
        break;
      case 'message':
        this.emit('message', payload);
        break;
      case 'project_update':
        this.emit('project_update', payload);
        break;
      case 'user_status':
        this.emit('user_status', payload);
        break;
      case 'task_update':
        this.emit('task_update', payload);
        break;
      case 'payment_update':
        this.emit('payment_update', payload);
        break;
      case 'heartbeat':
        this.sendHeartbeatResponse();
        break;
      default:
        console.log('📨 Unknown message type:', type, payload);
    }
  }

  send(type, payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ type, payload });
      this.ws.send(message);
      return true;
    } else {
      console.warn('⚠️ WebSocket not connected, message not sent:', type);
      return false;
    }
  }

  sendHeartbeatResponse() {
    this.send('heartbeat_response', { timestamp: Date.now() });
  }

  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.send('heartbeat', { timestamp: Date.now() });
    }, 30000); // Send heartbeat every 30 seconds
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      this.emit('reconnect_failed');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Error in ${event} listener:`, error);
        }
      });
    }
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
  }

  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  getConnectionState() {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'closed';
      default:
        return 'unknown';
    }
  }
}

// Create singleton instance
const wsService = new WebSocketService();

// Mock WebSocket Server for Development
class MockWebSocketServer {
  constructor() {
    this.clients = new Set();
    this.notifications = [];
    this.messages = [];
    this.projects = [];
    this.tasks = [];
    this.payments = [];
    this.userStatuses = new Map();
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🚀 Mock WebSocket Server started');
    
    // Simulate real-time events
    this.startSimulation();
  }

  stop() {
    this.isRunning = false;
    console.log('🛑 Mock WebSocket Server stopped');
  }

  addClient(client) {
    this.clients.add(client);
    console.log(`👤 Client connected. Total clients: ${this.clients.size}`);
    
    // Send initial data
    this.sendToClient(client, 'connected', {
      message: 'Connected to mock WebSocket server',
      timestamp: Date.now()
    });
  }

  removeClient(client) {
    this.clients.delete(client);
    console.log(`👋 Client disconnected. Total clients: ${this.clients.size}`);
  }

  sendToClient(client, type, payload) {
    if (client && typeof client.send === 'function') {
      client.send(JSON.stringify({ type, payload }));
    }
  }

  broadcast(type, payload) {
    const message = JSON.stringify({ type, payload });
    this.clients.forEach(client => {
      if (client && typeof client.send === 'function') {
        client.send(message);
      }
    });
  }

  startSimulation() {
    // Simulate notifications every 30 seconds
    setInterval(() => {
      if (!this.isRunning) return;
      
      const notification = {
        id: Date.now(),
        type: ['project', 'message', 'system', 'approval'][Math.floor(Math.random() * 4)],
        title: 'New notification',
        message: 'This is a simulated real-time notification',
        time: 'Just now',
        read: false,
        priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)]
      };
      
      this.broadcast('notification', notification);
      this.notifications.push(notification);
    }, 30000);

    // Simulate project updates every 45 seconds
    setInterval(() => {
      if (!this.isRunning) return;
      
      const projectUpdate = {
        id: Math.floor(Math.random() * 100) + 1,
        title: 'Project Update',
        status: ['planning', 'in_progress', 'completed'][Math.floor(Math.random() * 3)],
        progress: Math.floor(Math.random() * 100),
        timestamp: Date.now()
      };
      
      this.broadcast('project_update', projectUpdate);
    }, 45000);

    // Simulate user status changes every 20 seconds
    setInterval(() => {
      if (!this.isRunning) return;
      
      const users = ['Sarah Wilson', 'John Doe', 'Mike Johnson', 'David Chen'];
      const user = users[Math.floor(Math.random() * users.length)];
      const online = Math.random() > 0.5;
      
      const statusUpdate = {
        user,
        online,
        lastSeen: Date.now()
      };
      
      this.broadcast('user_status', statusUpdate);
      this.userStatuses.set(user, statusUpdate);
    }, 20000);
  }

  // API methods for testing
  createNotification(notification) {
    this.broadcast('notification', notification);
    this.notifications.push(notification);
  }

  sendMessage(message) {
    this.broadcast('message', message);
    this.messages.push(message);
  }

  updateProject(project) {
    this.broadcast('project_update', project);
    const existingIndex = this.projects.findIndex(p => p.id === project.id);
    if (existingIndex >= 0) {
      this.projects[existingIndex] = project;
    } else {
      this.projects.push(project);
    }
  }

  updateTask(task) {
    this.broadcast('task_update', task);
    const existingIndex = this.tasks.findIndex(t => t.id === task.id);
    if (existingIndex >= 0) {
      this.tasks[existingIndex] = task;
    } else {
      this.tasks.push(task);
    }
  }

  updatePayment(payment) {
    this.broadcast('payment_update', payment);
    const existingIndex = this.payments.findIndex(p => p.id === payment.id);
    if (existingIndex >= 0) {
      this.payments[existingIndex] = payment;
    } else {
      this.payments.push(payment);
    }
  }

  getStats() {
    return {
      clients: this.clients.size,
      notifications: this.notifications.length,
      messages: this.messages.length,
      projects: this.projects.length,
      tasks: this.tasks.length,
      payments: this.payments.length,
      userStatuses: this.userStatuses.size
    };
  }
}

// Create mock server instance
const mockServer = new MockWebSocketServer();

// React Hook for WebSocket
export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState('disconnected');
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Connect to WebSocket
    wsService.connect();

    // Listen for events
    const handleConnected = () => {
      setIsConnected(true);
      setConnectionState('connected');
      setError(null);
    };

    const handleDisconnected = () => {
      setIsConnected(false);
      setConnectionState('disconnected');
    };

    const handleError = (err) => {
      setError(err);
      setConnectionState('error');
    };

    const handleMessage = (message) => {
      setLastMessage(message);
    };

    wsService.on('connected', handleConnected);
    wsService.on('disconnected', handleDisconnected);
    wsService.on('error', handleError);
    wsService.on('notification', handleMessage);
    wsService.on('message', handleMessage);
    wsService.on('project_update', handleMessage);
    wsService.on('task_update', handleMessage);
    wsService.on('payment_update', handleMessage);

    return () => {
      wsService.off('connected', handleConnected);
      wsService.off('disconnected', handleDisconnected);
      wsService.off('error', handleError);
      wsService.off('notification', handleMessage);
      wsService.off('message', handleMessage);
      wsService.off('project_update', handleMessage);
      wsService.off('task_update', handleMessage);
      wsService.off('payment_update', handleMessage);
    };
  }, []);

  const send = useCallback((type, payload) => {
    return wsService.send(type, payload);
  }, []);

  const disconnect = useCallback(() => {
    wsService.disconnect();
  }, []);

  return {
    isConnected,
    connectionState,
    lastMessage,
    error,
    send,
    disconnect,
    wsService
  };
}

// React Hook for Real-time Notifications
export function useRealTimeNotifications() {
  const [notifications, setNotifications] = useState([]);
  const { isConnected, lastMessage } = useWebSocket();

  useEffect(() => {
    if (lastMessage && lastMessage.type === 'notification') {
      setNotifications(prev => [lastMessage.payload, ...prev].slice(0, 50));
    }
  }, [lastMessage]);

  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    markAsRead,
    clearAll,
    isConnected
  };
}

// React Hook for Real-time Messages
export function useRealTimeMessages() {
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const { isConnected, lastMessage } = useWebSocket();

  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.type) {
        case 'message':
          setMessages(prev => [...prev, lastMessage.payload]);
          break;
        case 'user_status':
          const { user, online } = lastMessage.payload;
          setOnlineUsers(prev => {
            const newSet = new Set(prev);
            if (online) {
              newSet.add(user);
            } else {
              newSet.delete(user);
            }
            return newSet;
          });
          break;
      }
    }
  }, [lastMessage]);

  const sendMessage = useCallback((message) => {
    return wsService.send('message', message);
  }, []);

  return {
    messages,
    onlineUsers,
    sendMessage,
    isConnected
  };
}

// Export services
export { wsService, mockServer };
export default wsService;
