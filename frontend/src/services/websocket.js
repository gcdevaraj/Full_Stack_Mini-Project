import { Client } from '@stomp/stompjs';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.listeners = new Set();
    this.statusListeners = new Set();
    this.projectSubscription = null;
    this.currentProjectId = null;
  }

  connect() {
    if (this.client && this.connected) return;

    // Use native browser WebSocket via standard ws:// or wss:// protocol
    const isHttps = window.location.protocol === 'https:';
    const wsProto = isHttps ? 'wss:' : 'ws:';
    // Connect directly to backend port 8080 or host
    const host = window.location.hostname || 'localhost';
    const brokerURL = `${wsProto}//${host}:8080/ws`;

    this.client = new Client({
      brokerURL: brokerURL,
      reconnectDelay: 3000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (msg) => {
        // console.log('[STOMP]', msg);
      },
      onConnect: () => {
        this.connected = true;
        this.notifyStatus(true);

        // Subscribe to global updates
        this.client.subscribe('/topic/updates', (message) => {
          try {
            const body = JSON.parse(message.body);
            this.notifyListeners(body);
          } catch (e) {
            console.error('Error parsing WS message:', e);
          }
        });

        // Re-subscribe to current project if active
        if (this.currentProjectId) {
          this.subscribeToProject(this.currentProjectId);
        }
      },
      onDisconnect: () => {
        this.connected = false;
        this.notifyStatus(false);
      },
      onStompError: (frame) => {
        console.warn('STOMP error:', frame?.headers?.message);
        this.connected = false;
        this.notifyStatus(false);
      },
      onWebSocketClose: () => {
        this.connected = false;
        this.notifyStatus(false);
      }
    });

    try {
      this.client.activate();
    } catch (err) {
      console.error('Failed to activate STOMP client:', err);
    }
  }

  subscribeToProject(projectId) {
    this.currentProjectId = projectId;
    if (!this.client || !this.connected) return;

    if (this.projectSubscription) {
      this.projectSubscription.unsubscribe();
      this.projectSubscription = null;
    }

    if (projectId) {
      this.projectSubscription = this.client.subscribe(`/topic/projects/${projectId}`, (message) => {
        try {
          const body = JSON.parse(message.body);
          this.notifyListeners(body);
        } catch (e) {
          console.error('Error parsing project WS message:', e);
        }
      });
    }
  }

  addMessageListener(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  addStatusListener(listener) {
    this.statusListeners.add(listener);
    listener(this.connected);
    return () => this.statusListeners.delete(listener);
  }

  notifyListeners(data) {
    this.listeners.forEach((fn) => {
      try {
        fn(data);
      } catch (err) {
        console.error('Error in message listener:', err);
      }
    });
  }

  notifyStatus(status) {
    this.statusListeners.forEach((fn) => {
      try {
        fn(status);
      } catch (err) {
        console.error('Error in status listener:', err);
      }
    });
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.connected = false;
      this.notifyStatus(false);
    }
  }
}

export const wsService = new WebSocketService();
