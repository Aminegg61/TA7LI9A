import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  template: `
    <div class="h-screen w-full bg-neutral-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      <!-- Decorative background blur -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div class="z-10 flex flex-col items-center max-w-sm w-full">
        <!-- Logo Badge -->
        <div class="w-20 h-20 bg-yellow-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.3)] rotate-3 mb-8">
          <span class="text-neutral-950 font-black text-3xl tracking-tighter">T7L</span>
        </div>

        <!-- Typography -->
        <h1 class="text-5xl font-black text-white uppercase italic tracking-tighter mb-4 text-center">
          TA7LI9A
        </h1>
        <p class="text-neutral-400 font-bold text-sm text-center mb-12">
          Real-time barber queue management
        </p>

        <!-- CTAs -->
        <div class="w-full space-y-4">
          <button 
            (click)="goToAuth('CLIENT')"
            class="w-full bg-yellow-500 text-black font-black uppercase tracking-widest py-4 rounded-xl hover:bg-yellow-400 transition-all active:scale-[0.98]">
            I'm a Client
          </button>
          
          <button 
            (click)="goToAuth('COIFFEUR')"
            class="w-full bg-neutral-900 border border-neutral-800 text-neutral-400 font-black uppercase tracking-widest py-4 rounded-xl hover:text-white hover:border-neutral-600 transition-all active:scale-[0.98]">
            I'm a Barber
          </button>
        </div>
      </div>
      
    </div>
  `
})
export class Landing {
  constructor(private router: Router) { }
  
  goToAuth(role: string) {
    this.router.navigate(['/auth'], { queryParams: { role } });
  }
}
