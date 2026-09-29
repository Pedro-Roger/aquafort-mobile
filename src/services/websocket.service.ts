import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import { getActiveFarmId } from './api';

const TOKEN_KEY = 'aquafort_token';
const ACTIVE_FARM_KEY = 'aquafort_active_farm_id';

export interface OxygenSemaphoreEvent {
  pondId: string;
  pondCode: string;
  cycleId: string;
  oxygenMgL: number;
  status: 'OK' | 'WARNING' | 'CRITICAL';
  measuredAt: string;
  thresholdWarning: number;
  thresholdCritical: number;
}

type OxygenSemaphoreListener = (event: OxygenSemaphoreEvent) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Set<OxygenSemaphoreListener> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isConnecting = false;

  async connect(): Promise<void> {
    if (this.socket?.connected || this.isConnecting) return;

    this.isConnecting = true;

    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const farmId = await getActiveFarmId();

      if (!token) {
        console.warn('[WS] No auth token, skipping WebSocket connection');
        this.isConnecting = false;
        return;
      }

      const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

      this.socket = io(baseUrl, {
        auth: { token },
        extraHeaders: farmId ? { 'X-Farm-Id': farmId } : undefined,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000,
        timeout: 10000,
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        console.log('[WS] Connected:', this.socket?.id);
        this.reconnectAttempts = 0;
      });

      this.socket.on('disconnect', (reason) => {
        console.log('[WS] Disconnected:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.error('[WS] Connection error:', error.message);
        this.reconnectAttempts++;
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('[WS] Max reconnection attempts reached');
        }
      });

      this.socket.on('reconnect_attempt', (attempt) => {
        console.log('[WS] Reconnection attempt:', attempt);
      });

      this.socket.on('reconnect', (attempt) => {
        console.log('[WS] Reconnected after', attempt, 'attempts');
      });

      this.socket.on('oxygen:semaphore', (data: OxygenSemaphoreEvent) => {
        console.log('[WS] Oxygen semaphore event:', data);
        this.listeners.forEach((listener) => listener(data));
      });

      this.socket.on('oxygen:alert', (data: OxygenSemaphoreEvent) => {
        console.log('[WS] Oxygen alert event:', data);
        this.listeners.forEach((listener) => listener(data));
      });

    } catch (error) {
      console.error('[WS] Failed to initialize:', error);
    } finally {
      this.isConnecting = false;
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  onOxygenSemaphore(listener: OxygenSemaphoreListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const websocketService = new WebSocketService();