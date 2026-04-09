import { useState, useEffect, useRef, useCallback } from 'react';
import { getWebSocketUrl } from '../utils/api';

export function useWebSocket(interviewId) {
  const [status, setStatus] = useState('connecting');
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const ws = useRef(null);
  
  useEffect(() => {
    if (!interviewId) return;
    
    ws.current = new WebSocket(getWebSocketUrl(interviewId));
    
    ws.current.onopen = () => {
      setStatus('connected');
    };
    
    ws.current.onclose = () => {
      // If we already hit an error, keep that state.
      setStatus((prev) => (prev === 'error' ? prev : 'disconnected'));
    };
    
    ws.current.onerror = () => {
      setStatus('error');
      setError('WebSocket connection error');
    };
    
    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages(prev => [...prev, data]);
      } catch (e) {
        console.error("Failed to parse WS message", e);
      }
    };
    
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [interviewId]);
  
  const sendMessage = useCallback((msg) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      if (msg instanceof Uint8Array || msg instanceof ArrayBuffer || msg instanceof Blob) {
        ws.current.send(msg);
      } else {
        ws.current.send(JSON.stringify(msg));
      }
    } else {
        console.warn("WebSocket implies disconnected state");
    }
  }, []);
  
  return { status, error, messages, sendMessage, setMessages };
}
