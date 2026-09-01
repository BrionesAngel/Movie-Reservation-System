import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
}

@Service()
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.apiUrl}/api/users`, { withCredentials: true });
  }

  promoteUser(userId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/api/users/${userId}/promote`, null, {
      withCredentials: true
    });
  }
}