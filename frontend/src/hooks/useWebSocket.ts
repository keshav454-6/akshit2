import { useEffect, useRef, useState, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  data: any;
}

export function useWebSocket(
  onTransaction?: (data: any) => void,
  onAlert?: (data: any) => void
) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);

  const connect = useCallback(() => {
    try {
      const getWsUrl = () => {
        if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL;
        if (typeof window !== 'undefined') {
          // If accessing via public tunnel (ngrok, localtunnel, etc.)
          if (window.location.hostname.includes('.') && !window.location.hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
            const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            return `${proto}//${window.location.host}/ws/stream`;
          }
          if (window.location.hostname && window.location.hostname !== 'localhost') {
            return `ws://${window.location.hostname}:8000/ws/stream`;
          }
        }
        return 'ws://localhost:8000/ws/stream';
      };
      const wsUrl = getWsUrl();
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
        console.log('[WebSocket] Connected to FraudGuard stream');
      };

      ws.onmessage = (event) => {
        try {
          const msg: WebSocketMessage = JSON.parse(event.data);
          if (msg.type === 'NEW_TRANSACTION' && onTransaction) {
            onTransaction(msg.data);
          } else if (msg.type === 'NEW_ALERT' && onAlert) {
            onAlert(msg.data);
          }
        } catch (e) {
          // ignore non-json
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log('[WebSocket] Disconnected. Reconnecting in 3s...');
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };

      ws.onerror = (err) => {
        console.warn('[WebSocket] Error observed, closing socket');
        ws.close();
      };

      wsRef.current = ws;
    } catch (err) {
      console.warn('[WebSocket] Connection failed, retrying...', err);
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    }
  }, [onTransaction, onAlert]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  return { isConnected };
}

