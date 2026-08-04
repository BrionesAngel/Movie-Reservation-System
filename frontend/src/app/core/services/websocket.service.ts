import { Service, inject, signal } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { AuthService } from './auth.service';

@Service()
export class WebSocketService {
  private client?: Client;
  private authService = inject(AuthService);

  connected = signal(false);

  connect(endpoint = 'http://localhost:8080/backend-websocket'): Promise<void> {
    return new Promise((resolve, reject) => {
      const token = this.authService.getAccessToken?.();

      this.client = new Client({
        webSocketFactory: () => new SockJS(endpoint),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        connectHeaders: token
          ? { Authorization: `Bearer ${token}` }
          : {},
        onConnect: () => {
          this.connected.set(true);
          resolve();
        },
        onDisconnect: () => this.connected.set(false),
        onStompError: (frame) => {
          this.connected.set(false);
          reject(frame);
        },
      });

      this.client.activate();
    });
  }

  subscribe<T>(destination: string, callback: (data: T) => void): () => void {
    if (!this.client?.connected) return () => { };

    const sub = this.client.subscribe(destination, (msg: IMessage) => {
      callback(JSON.parse(msg.body) as T);
    });

    return () => sub.unsubscribe();
  }

  publish(destination: string, body: unknown): void {
    if (!this.client?.connected) return;

    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }

  disconnect(): void {
    this.client?.deactivate();
    this.connected.set(false);
  }
}
