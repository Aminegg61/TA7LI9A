export interface RequestRegister {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  role: 'CLIENT' | 'COIFFEUR';
}

export interface RequestLogin{
  email:string;
  password:string;
}