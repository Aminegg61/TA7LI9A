import { Injectable } from '@angular/core';
import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject, Observable, filter, switchMap, first } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WebsocketService {
  private stompClient: Client;
  private isConnected$ = new BehaviorSubject<boolean>(false);

  constructor() {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws-ta7li9a'),
      reconnectDelay: 5000,
      debug: (str) => console.log('STOMP:', str)
    });

    this.stompClient.onConnect = () => this.isConnected$.next(true);
    this.stompClient.onDisconnect = () => this.isConnected$.next(false);
  }

  public connect() {
    if (!this.stompClient.active) this.stompClient.activate();
  }

  public disconnect() {
    if (this.stompClient.active) this.stompClient.deactivate();
  }

  // Hadi hiya l-logic s-s7i7a: k-t-tsenna l-connexion 3ad k-t-dir subscribe
  public subscribeToBarberStatus(barberId: number): Observable<string> {
    return this.isConnected$.pipe(
      filter(connected => connected === true), // Tsennah 7ta y-welli connected
      switchMap(() => new Observable<string>(observer => {
        const topic = `/topic/status/${barberId}`;
        const subscription = this.stompClient.subscribe(topic, (message) => {
          observer.next(message.body);
        });
        return () => subscription.unsubscribe();
      }))
    );
  }
  public subscribeToQueue(barberId: number): Observable<string> {
    return this.isConnected$.pipe(
      filter(connected => connected === true),
      switchMap(() => new Observable<string>(observer => {
        // HNA KHASS YKOUN /topic/queue/ BACH T-MATCHEY L-BACKEND
        const topic = `/topic/queue/${barberId}`; 
        const subscription = this.stompClient.subscribe(topic, (message) => {
          observer.next(message.body);
        });
        return () => subscription.unsubscribe();
      }))
    );
  }
}