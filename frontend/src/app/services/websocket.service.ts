import { Injectable } from '@angular/core';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private stompClient: Client;
  private connectionSubject: Subject<boolean> = new Subject<boolean>();
  private statusSubjects: { [barberId: number]: Subject<string> } = {};

  constructor() {
    this.stompClient = new Client({
      // We use webSocketFactory because standard SockJS usage in STOMP v5 
      // needs a custom factory when mixing with SockJS.
      webSocketFactory: () => {
        return new SockJS('http://localhost:8080/ws-ta7li9a') as any;
      },
      debug: (str) => {
        // console.log(str); // Disabled for prod
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.stompClient.onConnect = (frame) => {
      this.connectionSubject.next(true);
    };

    this.stompClient.onStompError = (frame) => {
      this.connectionSubject.next(false);
    };
  }

  public connect(): void {
    if (!this.stompClient.active) {
      this.stompClient.activate();
    }
  }

  public disconnect(): void {
    if (this.stompClient.active) {
      this.stompClient.deactivate();
    }
  }

  public isConnected(): Observable<boolean> {
    return this.connectionSubject.asObservable();
  }

  public subscribeToBarberStatus(barberId: number): Observable<string> {
    if (!this.statusSubjects[barberId]) {
      this.statusSubjects[barberId] = new Subject<string>();

      const subscribeWhenReady = () => {
        this.stompClient.subscribe(`/topic/status/${barberId}`, (message) => {
          this.statusSubjects[barberId].next(message.body);
        });
      };

      if (this.stompClient.connected) {
        subscribeWhenReady();
      } else {
        // Wait till connected
        this.stompClient.onConnect = () => {
          this.connectionSubject.next(true);
          subscribeWhenReady();
        };
      }
    }

    return this.statusSubjects[barberId].asObservable();
  }
}
