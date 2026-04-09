import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../auth';

export const landingGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    const role = authService.getUserRole();
    if (role === 'ROLE_CLIENT') {
      router.navigate(['/client/dashboard']);
    } else if (role === 'ROLE_COIFFEUR') {
      router.navigate(['/barber/dashboard']);
    }
    return false; // يمنع الوصول للLanding
  }

  return true; // إذا ما عندوش token، خلي يشوف Landing
};