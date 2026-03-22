"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export default function useActivityStream() {
  const [events, setEvents] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const esRef = useRef(null);
  const reconnectRef = useRef(null);
  const attemptsRef = useRef(0);

  const connect = useCallback(() => {
    if (esRef.current) esRef.current.close();

    const es = new EventSource("/api/events/stream");
    esRef.current = es;

    es.addEventListener("connected", () => {
      setIsConnected(true);
      setConnectionError(null);
      attemptsRef.current = 0;
    });

    es.addEventListener("activity", (e) => {
      try {
        const event = JSON.parse(e.data);
        setEvents((prev) => {
          if (prev.some((p) => p.id === event.id)) return prev;
          return [event, ...prev].slice(0, 100);
        });
      } catch (err) {
        console.error("[SSE] Parse error:", err);
      }
    });

    es.onerror = () => {
      setIsConnected(false);
      es.close();
      if (attemptsRef.current < 5) {
        const delay = Math.min(1000 * Math.pow(2, attemptsRef.current), 30000);
        attemptsRef.current += 1;
        reconnectRef.current = setTimeout(connect, delay);
      } else {
        setConnectionError("Connection lost. Please refresh.");
      }
    };
  }, []);

  useEffect(() => {
    connect();

    const handleVisibility = () => {
      if (document.hidden) {
        esRef.current?.close();
        setIsConnected(false);
      } else {
        attemptsRef.current = 0;
        connect();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      esRef.current?.close();
      clearTimeout(reconnectRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [connect]);

  return { events, isConnected, connectionError, clearEvents: () => setEvents([]) };
}
