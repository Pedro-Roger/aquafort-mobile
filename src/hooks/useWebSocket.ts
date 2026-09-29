import { useEffect, useState, useCallback } from 'react';
import { websocketService, OxygenSemaphoreEvent } from '../services/websocket.service';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<OxygenSemaphoreEvent | null>(null);
  const [events, setEvents] = useState<OxygenSemaphoreEvent[]>([]);

  useEffect(() => {
    const cleanup = websocketService.onOxygenSemaphore((event) => {
      setLastEvent(event);
      setEvents((prev) => [event, ...prev.slice(0, 49)]);
    });

    websocketService.connect();

    const interval = setInterval(() => {
      setIsConnected(websocketService.isConnected());
    }, 2000);

    return () => {
      cleanup();
      clearInterval(interval);
    };
  }, []);

  const clearEvents = useCallback(() => setEvents([]), []);

  return { isConnected, lastEvent, events, clearEvents };
}

export function usePondOxygenAlerts(pondId: string | null) {
  const { events } = useWebSocket();

  const pondEvents = pondId
    ? events.filter((e) => e.pondId === pondId)
    : [];

  const latestEvent = pondEvents[0] ?? null;
  const hasCritical = pondEvents.some((e) => e.status === 'CRITICAL');
  const hasWarning = pondEvents.some((e) => e.status === 'WARNING');

  return { latestEvent, hasCritical, hasWarning, pondEvents };
}