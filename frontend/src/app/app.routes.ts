import { Routes, RouterModule } from '@angular/router';
import { Landing } from './pages/landing/landing';
import { Auth } from './pages/auth/auth';
export const routes: Routes = [ { path: '', component: Landing }, // homepage
    { path: 'auth', component: Auth }
];
