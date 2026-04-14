export interface AppointmentResponseDTO {
  id: number;
  clientName: string;
  serviceNames: string[];
  startTime: string;
  endTime: string;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  totalDuration: number;
}

export interface AppointmentRequestDTO {
  clientId?: number | null;
  manualName?: string;
  serviceIds: number[];
}

export interface ServiceResponseDTO {
  id: number;
  name: string;
  price: number;
  duration: string;  // formatted: "30min", "1h", "1h 30min"
  coiffeurName: string;
}

export interface BarberSearchDto {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  currentStatus: 'ACTIVE' | 'FULL' | 'OFFLINE';
  favorite: boolean;
  estimatedWaitTime: number;
  inQueue: boolean;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phoneNumber: string;
  currentStatus: 'ACTIVE' | 'FULL' | 'OFFLINE';
}
