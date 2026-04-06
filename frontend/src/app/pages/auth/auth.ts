import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { RequestRegister } from '../../models/request-register.model';

@Component({
  selector: 'app-auth',
  imports: [CommonModule,FormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth {
  role: 'CLIENT' | 'COIFFEUR' = 'CLIENT';
  mode: 'login' | 'register' = 'login';

   registerData: RequestRegister = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    role: "CLIENT"
  }
  constructor(private route: ActivatedRoute, private authService: AuthService) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.role = params['role'];
      console.log("ROLE:", this.role);
    });
  }

  toggleRole() {
    this.role = this.role === 'CLIENT' ? 'COIFFEUR' : 'CLIENT';
    console.log(this.role);

  }

  onRegister() {
    this.registerData.role = this.role;
    console.log(1111111111111111111111111111111111111111111111111111111111111111);
    
    if (this.registerData.password !== this.registerData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    this.authService.register(this.registerData).subscribe({
      next: (res) => {
        alert("Compte créé avec succès !");
      },
      error: (err) => {
        console.error(err);
        alert("Erreur lors de l'inscription !");
      }
    });
  }
}
