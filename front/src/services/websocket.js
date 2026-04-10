import { useCallback, useEffect, useState } from 'react';

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

    try {
      this.ws = new WebSocket(url);
      this.setupEventListeners();
    } catch (error) {
      this.isConnecting = false;
      this.handleReconnect();
      this.emit('error', error);
    }
  }

  setupEventListeners() {
    this.ws.onopen = () => {
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
        this.emit('error', error);
      }
    };

    this.ws.onclose = (event) => {
      this.isConnecting = false;
      this.stopHeartbeat();
      this.emit('disconnected');

      if (event.code !== 1000) {
        this.handleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      this.isConnecting = false;
      this.emit('error', error);
    };
  }

  handleMessage(data) {
    const { type, payload } = data;

    switch (type) {
      case 'notification':
      case 'message':
      case 'project_update':
      case 'user_status':
      case 'task_update':
      case 'payment_update':
        this.emit(type, payload);
        break;
      case 'heartbeat':
        this.sendHeartbeatResponse();
        break;
      default:
        this.emit('unknown', data);
    }
  }

  send(type, payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
      return true;
    }

    return false;
  }

  sendHeartbeatResponse() {
    this.send('heartbeat_response', { timestamp: Date.now() });
  }

  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.send('heartbeat', { timestamp: Date.now() });
    }, 30000);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.emit('reconnect_failed');
      return;
    }

    this.reconnectAttempts += 1;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    setTimeout(() => this.connect(), delay);
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) callbacks.splice(index, 1);
  }

  emit(event, data) {
    if (!this.listeners.has(event)) return;
    this.listeners.get(event).forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`WebSocket listener error for ${event}:`, error);
      }
    });
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
  }
}

const wsService = new WebSocketService();

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState('disconnected');
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    wsService.connect();

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

  const send = useCallback((type, payload) => wsService.send(type, payload), []);
  const disconnect = useCallback(() => wsService.disconnect(), []);

  return {
    isConnected,
    connectionState,
    lastMessage,
    error,
    send,
    disconnect,
    wsService,
  };
}

export function useRealTimeNotifications() {
  const [notifications, setNotifications] = useState([]);
  const { isConnected } = useWebSocket();

  useEffect(() => {
    const handleNotification = (notification) => {
      setNotifications((current) => [notification, ...current].slice(0, 50));
    };

    wsService.on('notification', handleNotification);
    return () => wsService.off('notification', handleNotification);
  }, []);

  const markAsRead = useCallback((notificationId) => {
    setNotifications((current) => current.map((notification) => (
      notification.id === notificationId ? { ...notification, read: true } : notification
    )));
  }, []);

  const clearAll = useCallback(() => setNotifications([]), []);

  return {
    notifications,
    markAsRead,
    clearAll,
    isConnected,
  };
}

export function useRealTimeMessages() {
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const { isConnected } = useWebSocket();

  useEffect(() => {
    const handleMessage = (message) => {
      setMessages((current) => [...current, message]);
    };

    const handleUserStatus = (payload = {}) => {
      const { user, online } = payload;
      setOnlineUsers((current) => {
        const next = new Set(current);
        if (!user) return next;
        if (online) next.add(user);
        else next.delete(user);
        return next;
      });
    };

    wsService.on('message', handleMessage);
    wsService.on('user_status', handleUserStatus);

    return () => {
      wsService.off('message', handleMessage);
      wsService.off('user_status', handleUserStatus);
    };
  }, []);

  const sendMessage = useCallback((message) => wsService.send('message', message), []);

  return {
    messages,
    onlineUsers,
    sendMessage,
    isConnected,
  };
}

export { wsService };
export default wsService;
