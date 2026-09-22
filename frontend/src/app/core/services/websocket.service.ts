import { Service } from '@angular/core';
import { RxStomp } from '@stomp/rx-stomp';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Service()
export class WebsocketService {
  private rxStomp = new RxStomp();


  public connect(accessToken: string): void {
    const wsUrl = environment.apiUrl.replace(/^http/, 'ws') + '/backend-websocket';

    this.rxStomp.configure({
      brokerURL: wsUrl,
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`
      },
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      reconnectDelay: 5000,
    });

    this.rxStomp.activate();
  }

  public subscribeToShowtime(showtimeId: number): Observable<any> {
    return this.rxStomp.watch(`/topic/showtimes/${showtimeId}`).pipe(
      map(message => JSON.parse(message.body))
    );
  }

  public disconnect(): void {
    this.rxStomp.deactivate();
  }
}
