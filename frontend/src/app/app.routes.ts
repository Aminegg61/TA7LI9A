import { Routes, RouterModule } from '@angular/router';
import { Landing } from './pages/landing/landing';
import { Auth } from './pages/auth/auth';
import { BarberDashboard } from './pages/barber/dashboard/BarberDashboard';
import { authGuard } from './services/guard/auth.guard'; 
import { ClientDashboard } from './pages/client/dashboard/ClientDashboard';
import { landingGuard } from './services/guard/landingGuard';
export const routes: Routes = [ { path: '', component: Landing , canActivate: [landingGuard] }, // homepage
    { path: 'auth', component: Auth },
    { 
    path: 'barber/dashboard', 
    component: BarberDashboard, 
    canActivate: [authGuard], 
    data: { roles: ['ROLE_COIFFEUR'] } 
  },
  { 
    path: 'client/dashboard', 
    component: ClientDashboard, 
    canActivate: [authGuard], 
    data: { roles: ['ROLE_CLIENT'] } 
  }
];
