import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <div class="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <!-- Decorative background blur -->
      <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div class="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-[2.5rem] p-8 z-10 shadow-2xl relative">
        
        <!-- Logo -->
        <div class="flex justify-center mb-8">
          <div class="w-14 h-14 bg-yellow-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.2)] rotate-3">
            <span class="text-neutral-950 font-black text-xl tracking-tighter">T7L</span>
          </div>
        </div>

        <!-- Role Toggle -->
        <div class="flex bg-neutral-950 p-1 rounded-2xl mb-8 relative">
          <!-- Active Highlight -->
          <div 
            class="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-neutral-800 rounded-xl transition-all duration-300"
            [class.left-1]="role === 'CLIENT'"
            [class.left-[calc(50%+2px)]]="role === 'COIFFEUR'">
          </div>
          
          <button 
            type="button"
            (click)="setRole('CLIENT')"
            class="flex-1 relative z-10 py-3 text-xs font-black uppercase tracking-widest transition-colors duration-300"
            [class.text-yellow-500]="role === 'CLIENT'"
            [class.text-neutral-500]="role !== 'CLIENT'">
            Client
          </button>
          <button 
            type="button"
            (click)="setRole('COIFFEUR')"
            class="flex-1 relative z-10 py-3 text-xs font-black uppercase tracking-widest transition-colors duration-300"
            [class.text-yellow-500]="role === 'COIFFEUR'"
            [class.text-neutral-500]="role !== 'COIFFEUR'">
            Barber
          </button>
        </div>

        <h2 class="text-2xl font-black text-white italic uppercase tracking-tight text-center mb-6">
          {{ isLogin ? 'Welcome Back' : 'Create Account' }}
        </h2>

        <!-- Error Alert -->
        <div *ngIf="errorMessage" class="mb-6 p-4 bg-red-900/20 border border-red-900/30 rounded-xl">
          <p class="text-red-500 text-xs font-bold">{{ errorMessage }}</p>
        </div>
        
        <div *ngIf="successMessage" class="mb-6 p-4 bg-green-900/20 border border-green-900/30 rounded-xl">
          <p class="text-green-500 text-xs font-bold">{{ successMessage }}</p>
        </div>

        <!-- Form -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          
          <!-- Register Fields -->
          <ng-container *ngIf="!isLogin">
            <div class="flex gap-4">
              <div class="flex-1 space-y-1">
                <label class="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">First Name</label>
                <input formControlName="firstName" type="text" 
                  class="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors placeholder:text-neutral-700" 
                  placeholder="John">
              </div>
              <div class="flex-1 space-y-1">
                <label class="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Last Name</label>
                <input formControlName="lastName" type="text" 
                  class="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors placeholder:text-neutral-700" 
                  placeholder="Doe">
              </div>
            </div>
            
            <div class="space-y-1">
              <label class="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Phone Number</label>
              <input formControlName="phoneNumber" type="tel" 
                class="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors placeholder:text-neutral-700" 
                placeholder="0612345678">
            </div>
          </ng-container>

          <!-- Common Fields -->
          <div class="space-y-1">
            <label class="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Email</label>
            <input formControlName="email" type="email" 
              class="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors placeholder:text-neutral-700" 
              placeholder="you@example.com">
          </div>

          <div class="space-y-1">
            <label class="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Password</label>
            <input formControlName="password" type="password" 
              class="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors placeholder:text-neutral-700" 
              placeholder="••••••••">
          </div>

          <div class="space-y-1" *ngIf="!isLogin">
            <label class="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Confirm Password</label>
            <input formControlName="confirmPassword" type="password" 
              class="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors placeholder:text-neutral-700" 
              placeholder="••••••••">
          </div>

          <button 
            type="submit"
            [disabled]="loading"
            class="w-full bg-yellow-500 text-black font-black uppercase tracking-widest py-4 rounded-xl hover:bg-yellow-400 transition-all active:scale-[0.98] mt-6 disabled:opacity-50 flex justify-center">
            <span *ngIf="!loading">{{ isLogin ? 'Sign In' : 'Sign Up' }}</span>
            <span *ngIf="loading" class="animate-pulse">Loading...</span>
          </button>

        </form>

        <!-- Toggle Mode -->
        <div class="mt-8 text-center">
          <p class="text-neutral-500 text-xs font-bold">
            {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
            <button 
              type="button" 
              (click)="toggleMode()"
              class="text-yellow-500 ml-1 hover:text-yellow-400 uppercase tracking-widest">
              {{ isLogin ? 'Register' : 'Login' }}
            </button>
          </p>
        </div>

      </div>
    </div>
  `
})
export class Auth implements OnInit {
  form: FormGroup;
  isLogin = true;
  role: 'CLIENT' | 'COIFFEUR' = 'CLIENT';
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      firstName: [''],
      lastName: [''],
      phoneNumber: [''],
      confirmPassword: ['']
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['role'] === 'COIFFEUR' || params['role'] === 'CLIENT') {
        this.role = params['role'];
      }
    });

    if (this.authService.isLoggedIn()) {
      this.redirectByRole(this.authService.getUserRole());
    }
  }

  setRole(r: 'CLIENT' | 'COIFFEUR') {
    this.role = r;
  }

  toggleMode() {
    this.isLogin = !this.isLogin;
    this.errorMessage = '';
    this.successMessage = '';
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const val = this.form.value;

    if (this.isLogin) {
      this.authService.login({ email: val.email, password: val.password }).subscribe({
        next: (res: any) => {
          localStorage.setItem('token', res.token);
          this.redirectByRole(res.role);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = 'Login failed. Please check your credentials.';
        }
      });
    } else {
      if (val.password !== val.confirmPassword) {
        this.errorMessage = 'Passwords do not match';
        this.loading = false;
        return;
      }

      this.authService.register({
        firstName: val.firstName,
        lastName: val.lastName,
        email: val.email,
        phoneNumber: val.phoneNumber,
        password: val.password,
        confirmPassword: val.confirmPassword,
        role: this.role
      }).subscribe({
        next: (res) => {
          this.loading = false;
          this.successMessage = 'Registration successful! Please login.';
          this.isLogin = true;
          this.form.reset();
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = 'Registration failed. Try again.';
        }
      });
    }
  }

  private redirectByRole(role: string) {
    if (role === 'ROLE_COIFFEUR') {
      this.router.navigate(['/barber/dashboard']);
    } else {
      this.router.navigate(['/client/dashboard']);
    }
  }
}
