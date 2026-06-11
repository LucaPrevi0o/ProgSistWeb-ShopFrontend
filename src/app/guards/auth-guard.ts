import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { UserService } from '../services/user-service';

export const AuthGuard: CanActivateFn = () => {
    const router = inject(Router);
    const userService = inject(UserService);

    if (!userService.isLoggedIn()) {
        return router.createUrlTree(['/login']);
    }

    return userService.getCurrentUser().pipe(
        map(() => true),
        catchError(() => {
            userService.logout();
            return of(router.createUrlTree(['/login']));
        })
    );
};
