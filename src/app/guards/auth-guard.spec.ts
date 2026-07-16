import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { firstValueFrom, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { UserService } from '../services/user-service';
import { AuthGuard } from './auth-guard';

describe('AuthGuard', () => {
  const redirect = {} as any;
  const router = { createUrlTree: () => redirect } as unknown as Router;

  it('redirects an anonymous visitor to login', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: router }, { provide: UserService, useValue: { isLoggedIn: () => false } }]
    });

    expect(TestBed.runInInjectionContext(() => AuthGuard({} as any, {} as any))).toBe(redirect);
  });

  it('logs out and redirects when the token is no longer accepted', async () => {
    const users = { isLoggedIn: () => true, getCurrentUser: () => throwError(() => new Error('401')), logout: vi.fn() };
    TestBed.configureTestingModule({ providers: [{ provide: Router, useValue: router }, { provide: UserService, useValue: users }] });

    const result = TestBed.runInInjectionContext(() => AuthGuard({} as any, {} as any)) as any;
    expect(await firstValueFrom(result)).toBe(redirect);
    expect(users.logout).toHaveBeenCalledOnce();
  });

  it('allows a valid logged-in customer', async () => {
    const users = { isLoggedIn: () => true, getCurrentUser: () => of({}) };
    TestBed.configureTestingModule({ providers: [{ provide: Router, useValue: router }, { provide: UserService, useValue: users }] });

    const result = TestBed.runInInjectionContext(() => AuthGuard({} as any, {} as any)) as any;
    expect(await firstValueFrom(result)).toBe(true);
  });
});
