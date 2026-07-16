import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL } from '../app.config';
import { ProductService } from './product-service';

describe('ProductService', () => {
  let service: ProductService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ProductService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sends pagination and catalogue filters and reads the page header', () => {
    service.getProducts(2, { category: 'Libri', minPrice: 10 }).subscribe(result => {
      expect(result.totalPages).toBe(3);
      expect(result.items).toHaveLength(1);
    });

    const request = http.expectOne(request => request.url === `${API_BASE_URL}/products`);
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('category')).toBe('Libri');
    expect(request.request.params.get('minPrice')).toBe('10');
    request.flush([{ id: 1, name: 'Book' }], { headers: { 'X-Total-Pages': '3' } });
  });

  it('uses one page when pagination metadata is absent', () => {
    service.getProducts().subscribe(result => expect(result.totalPages).toBe(1));

    http.expectOne(`${API_BASE_URL}/products?page=1`).flush([]);
  });
});
