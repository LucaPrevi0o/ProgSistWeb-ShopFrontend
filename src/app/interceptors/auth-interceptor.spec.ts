import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UserService } from '../services/user-service';
import { AuthInterceptor } from './auth-interceptor';

describe('AuthInterceptor', () => {
  it('adds the bearer token to outgoing requests', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([AuthInterceptor])),
        provideHttpClientTesting(),
        { provide: UserService, useValue: { getToken: () => 'token' } }
      ]
    });

    TestBed.inject(HttpClient).get('/protected').subscribe();
    const request = TestBed.inject(HttpTestingController).expectOne('/protected');
    expect(request.request.headers.get('Authorization')).toBe('Bearer token');
    request.flush({});
  });
});
