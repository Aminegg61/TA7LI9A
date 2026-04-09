import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private baseUrl = 'http://localhost:8080'; // backend URL

  constructor(private http: HttpClient) {}

  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/auth/register`, data);
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/auth/login`, data);
  }

  getUserRole(): string {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded: any = jwtDecode(token);
      console.log(decoded.role);
      
      return decoded.role; // هادي هي اللي جاية من Spring Boot
    }
    return '';
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}
