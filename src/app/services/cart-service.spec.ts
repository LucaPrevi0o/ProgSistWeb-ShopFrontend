import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL } from '../app.config';
import { CartService } from './cart-service';

describe('CartService', () => {
  it('recreates an empty cart after a successful clear', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const service = TestBed.inject(CartService);
    const http = TestBed.inject(HttpTestingController);

    service.clearCart().subscribe(cart => expect(cart.items).toEqual([]));
    http.expectOne(`${API_BASE_URL}/cart`).flush(null, { status: 204, statusText: 'No Content' });
    const create = http.expectOne(`${API_BASE_URL}/cart`);
    expect(create.request.method).toBe('POST');
    create.flush({ id: 1, items: [] });
    http.verify();
  });
});
