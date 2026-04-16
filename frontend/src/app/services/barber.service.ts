import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BarberSearchDto } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class BarberService {
  private baseUrl = 'http://localhost:8080/api/barber';

  constructor(private http: HttpClient) {}

  updateStatus(status: 'ACTIVE' | 'FULL' | 'OFFLINE'): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/status?status=${status}`, {});
  }
  getCurrentStatus(): Observable<string> {
   return this.http.get(`${this.baseUrl}/status`, { responseType: 'text' });
  }

  searchBarbers(query: string): Observable<BarberSearchDto[]> {
    return this.http.get<BarberSearchDto[]>(`http://localhost:8080/api/barbers/search?q=${query}`);
  }

  addBarber(barberId: number): Observable<string> {
    // Expect text response or format appropriately based on your backend
    return this.http.post('http://localhost:8080/api/barbers/add-barber/' + barberId, {}, { responseType: 'text' }) as Observable<string>;
  }

  getMyBarbers(): Observable<BarberSearchDto[]> {
    return this.http.get<BarberSearchDto[]>('http://localhost:8080/api/barbers/my-barbers');
  }

  getMyFavorites(): Observable<BarberSearchDto[]> {
    return this.http.get<BarberSearchDto[]>('http://localhost:8080/api/barbers/my-favorites');
  }

  removeBarber(barberId: number): Observable<void> {
    return this.http.delete<void>(`http://localhost:8080/api/barbers/remove-barber/${barberId}`);
  }

  toggleFavorite(barberId: number): Observable<void> {
    return this.http.put<void>(`http://localhost:8080/api/barbers/toggle-favorite/${barberId}`, {});
  }
}
