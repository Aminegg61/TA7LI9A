import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth'; // تأكد من المسار الصحيح لـ AuthService ديالك

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1️⃣ واش المستخدم ديجا داير Login؟ (واش كاين Token)
  if (!authService.isLoggedIn()) {
    router.navigate(['/auth']);
    return false;
  }

  // 2️⃣ واش هاد المسار محتاج Role معين؟
  // هاد الداتا غنجيبوها من الـ Routing configuration
  const expectedRoles = route.data['roles'] as Array<string>;
  const userRole = authService.getUserRole();

  if (expectedRoles && !expectedRoles.includes(userRole)) {
    // إلا كان داخل لبلاصة ماشي ديالو (مثلا كليان باغي يدخل للحلاق)
    if (userRole === 'ROLE_COIFFEUR') {
      router.navigate(['/barber/dashboard']);
    } else {
      router.navigate(['/client/dashboard']);
    }
    return false;
  }

  return true;
};