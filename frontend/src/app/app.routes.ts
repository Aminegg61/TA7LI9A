import { Routes, RouterModule } from '@angular/router';
import { Landing } from './pages/landing/landing';
import { Auth } from './pages/auth/auth';
import { BarberDashboard } from './pages/barber/dashboard/dashboard';
import { authGuard } from './services/auth.guard';
import { ClientDashboard } from './pages/client/dashboard/dashboard';
export const routes: Routes = [ { path: '', component: Landing }, // homepage
    { path: 'auth', component: Auth },
    { 
    path: 'barber/dashboard', 
    component: BarberDashboard, 
    canActivate: [authGuard], 
    data: { roles: ['COIFFEUR'] } 
  },
  { 
    path: 'client/dashboard', 
    component: ClientDashboard, 
    canActivate: [authGuard], 
    data: { roles: ['CLIENT'] } 
  }
];
