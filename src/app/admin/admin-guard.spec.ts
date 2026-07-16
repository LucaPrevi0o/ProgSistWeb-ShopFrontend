import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { firstValueFrom, of } from 'rxjs';
import { UserService } from '../services/user-service';
import { AdminService } from './admin-service';
import { AdminGuard } from './admin-guard';

describe('AdminGuard', () => {
  const redirect = {} as any;
  const router = { createUrlTree: () => redirect } as unknown as Router;

  it('redirects a logged-in non-admin customer', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        { provide: UserService, useValue: { isLoggedIn: () => true, isAdmin: () => false } },
        { provide: AdminService, useValue: { me: () => of({ role: 'ADMIN' }) } }
      ]
    });

    expect(TestBed.runInInjectionContext(() => AdminGuard({} as any, {} as any))).toBe(redirect);
  });

  it('permits an administrator confirmed by the API', async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        { provide: UserService, useValue: { isLoggedIn: () => true, isAdmin: () => true } },
        { provide: AdminService, useValue: { me: () => of({ role: 'ADMIN' }) } }
      ]
    });

    const result = TestBed.runInInjectionContext(() => AdminGuard({} as any, {} as any)) as any;
    expect(await firstValueFrom(result)).toBe(true);
  });
});
