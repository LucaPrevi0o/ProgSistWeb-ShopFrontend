import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL } from '../app.config';
import { UserService } from './user-service';

describe('UserService', () => {
  let service: UserService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(UserService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('stores a successful login session', () => {
    service.login({ email: 'user@example.com', password: 'secret123' } as any).subscribe();
    http.expectOne(`${API_BASE_URL}/auth/login`).flush({ id: 4, token: 'jwt', role: 'USER' });

    expect(service.getToken()).toBe('jwt');
    expect(service.getUserId()).toBe('4');
    expect(service.isLoggedIn()).toBe(true);
  });

  it('clears every local session field on logout', () => {
    localStorage.setItem('jwtToken', 'jwt');
    localStorage.setItem('userId', '4');
    localStorage.setItem('userRole', 'ADMIN');

    service.logout();

    expect(service.getToken()).toBeNull();
    expect(service.getUserId()).toBeNull();
    expect(service.getRole()).toBeNull();
  });
});
