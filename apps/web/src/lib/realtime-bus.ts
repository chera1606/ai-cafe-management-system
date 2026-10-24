"use client";

/**
 * Real-time typed event bus simulating WebSocket/SSE connection to the NestJS backend.
 * Provides live events for new orders, kitchen status changes, low stock, and complaints.
 */

export type RealtimeEventType =
  | "ORDER_CREATED"
  | "ORDER_STATUS_CHANGED"
  | "STOCK_ALERT"
  | "KDS_BUMP"
  | "COMPLAINT_NEW";

export interface RealtimeEvent<T = unknown> {
  id: string;
  type: RealtimeEventType;
  timestamp: string;
  data: T;
}

type EventListener = (event: RealtimeEvent) => void;

class RealtimeEventBus {
  private listeners: Map<RealtimeEventType | "*", Set<EventListener>> = new Map();
  private isConnected = true;
  private connectionListeners: Set<(connected: boolean) => void> = new Set();
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.startSimulatedHeartbeat();
    }
  }

  public subscribe(type: RealtimeEventType | "*", listener: EventListener): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);

    return () => {
      const set = this.listeners.get(type);
      if (set) {
        set.delete(listener);
      }
    };
  }

  public emit(type: RealtimeEventType, data: unknown) {
    const event: RealtimeEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      timestamp: new Date().toISOString(),
      data,
    };

    // Specific listeners
    const specific = this.listeners.get(type);
    if (specific) {
      for (const listener of specific) {
        try {
          listener(event);
        } catch (e) {
          console.error("Event bus error:", e);
        }
      }
    }

    // Wildcard listeners
    const wildcard = this.listeners.get("*");
    if (wildcard) {
      for (const listener of wildcard) {
        try {
          listener(event);
        } catch (e) {
          console.error("Event bus error:", e);
        }
      }
    }
  }

  public onConnectionChange(listener: (connected: boolean) => void): () => void {
    this.connectionListeners.add(listener);
    listener(this.isConnected);
    return () => {
      this.connectionListeners.delete(listener);
    };
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  private startSimulatedHeartbeat() {
    // Periodically emit lightweight demo updates (e.g. slight stock shift or completed order)
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      // 5% chance of simulated event
      if (Math.random() < 0.25) {
        const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
        this.emit("ORDER_STATUS_CHANGED", {
          orderId,
          status: "READY",
          updatedAt: new Date().toISOString(),
        });
      }
    }, 25000);
  }
}

export const realtimeBus = new RealtimeEventBus();
