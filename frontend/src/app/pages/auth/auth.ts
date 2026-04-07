import { Component, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { RequestRegister } from '../../models/request-register.model';

@Component({
  selector: 'app-auth',
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth {
  role: 'CLIENT' | 'COIFFEUR' = 'CLIENT';
  mode: 'login' | 'register' = 'login';
  showPassword = false;
  showConfirmPassword = false;

  registerData: RequestRegister = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    role: "CLIENT"
  }
  constructor(private route: ActivatedRoute, private authService: AuthService, private cd: ChangeDetectorRef) { }

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

  onRegister(form: any) {
    if (form.invalid) {
      alert("Veuillez remplir tous les champs !");
      return;
    }

    if (this.registerData.password !== this.registerData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    this.registerData.role = this.role;

    if (this.registerData.password !== this.registerData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    this.authService.register(this.registerData).subscribe({
      next: (res) => {
        console.log("Compte créé avec succès !");
        // 1️⃣ reset les champs
        this.registerData = {
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
          phoneNumber: "",
          role: this.role // gard role actuel
        };
        
        this.mode = 'login';
        this.cd.detectChanges();
        this.registerData
      },
      error: (err) => {
        console.error(err);
        alert("Erreur lors de l'inscription !");
      }
    });
  }
}
