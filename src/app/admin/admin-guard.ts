import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AdminService } from './admin-service';
import { UserService } from '../services/user-service';

export const AdminGuard: CanActivateFn = () => {
    const router = inject(Router);
    const userService = inject(UserService);
    const adminService = inject(AdminService);

    if (!userService.isLoggedIn()) {
        return router.createUrlTree(['/login']);
    }

    if (!userService.isAdmin()) {
        return router.createUrlTree(['/']);
    }

    return adminService.me().pipe(
        map(user => user.role === 'ADMIN' ? true : router.createUrlTree(['/'])),
        catchError(() => of(router.createUrlTree(['/'])))
    );
};
