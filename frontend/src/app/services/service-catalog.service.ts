import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServiceResponseDTO } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ServiceCatalogService {
  private baseUrl = 'http://localhost:8080/api/services';

  constructor(private http: HttpClient) {}

  getMyServices(): Observable<ServiceResponseDTO[]> {
    return this.http.get<ServiceResponseDTO[]>(`${this.baseUrl}/my-services`);
  }

  getBarberServices(barberId: number): Observable<ServiceResponseDTO[]> {
    return this.http.get<ServiceResponseDTO[]>(`${this.baseUrl}/barber/${barberId}`);
  }

  addService(dto: any): Observable<ServiceResponseDTO> {
    return this.http.post<ServiceResponseDTO>(`${this.baseUrl}/add`, dto);
  }

  updateService(id: number, dto: any): Observable<ServiceResponseDTO> {
    return this.http.put<ServiceResponseDTO>(`${this.baseUrl}/update/${id}`, dto);
  }

  deleteService(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`, { responseType: 'text' }) as Observable<string>;
  }
}
