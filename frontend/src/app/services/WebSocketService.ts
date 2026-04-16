import { Injectable } from '@angular/core';
import SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient: any;
  // Subject bach n-publiyiw l-akhbar l-ga3 l-components
  public statusUpdates = new Subject<any>();

  connect(barberId: number) {
    const socket = new SockJS('http://localhost:8080/ws-ta7li9a'); // Nafs l-URL li derti f Java
    this.stompClient = Stomp.over(socket);

    this.stompClient.connect({}, (frame: any) => {
      console.log('Connected to WebSocket: ' + frame);

      // Subscribe l-dak l-topic khass b dak l-barber
      this.stompClient.subscribe('/topic/status/' + barberId, (message: any) => {
        if (message.body) {
          this.statusUpdates.next(message.body); // Sift l-khbar l-ga3 li m-abonniyin
        }
      });
    });
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.disconnect();
    }
  }
}