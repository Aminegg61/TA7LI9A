import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppointmentResponseDTO, AppointmentRequestDTO, User } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private baseUrl = 'http://localhost:8080/api/appointments';

  constructor(private http: HttpClient) {}

  searchClients(query: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/search-clients?query=${query}`);
  }

  createAppointment(dto: AppointmentRequestDTO): Observable<AppointmentResponseDTO> {
    return this.http.post<AppointmentResponseDTO>(`${this.baseUrl}/add`, dto);
  }

  getTodayQueue(): Observable<AppointmentResponseDTO[]> {
    return this.http.get<AppointmentResponseDTO[]>(`${this.baseUrl}/today-queue`);
  }

  startAppointment(id: number): Observable<AppointmentResponseDTO> {
    return this.http.put<AppointmentResponseDTO>(`${this.baseUrl}/${id}/start`, {});
  }

  completeAppointment(id: number): Observable<AppointmentResponseDTO> {
    return this.http.put<AppointmentResponseDTO>(`${this.baseUrl}/${id}/done`, {});
  }
  acceptAppointment(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/accept`, {});
  }

  rejectAppointment(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/reject`, {});
  }
  getMyActiveAppointment(): Observable<AppointmentResponseDTO> {
    return this.http.get<AppointmentResponseDTO>(`${this.baseUrl}/my-active`);
  }
}
