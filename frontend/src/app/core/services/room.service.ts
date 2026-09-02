import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Room {
  id: number;
  number: number;
}

@Service()
export class RoomService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.apiUrl}/api/rooms`, { withCredentials: true });
  }

  getRoom(id: number): Observable<Room> {
    return this.http.get<Room>(`${this.apiUrl}/api/rooms/${id}`, { withCredentials: true });
  }
}