export interface RequestRegister {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  role: 'CLIENT' | 'COIFFEUR';
}