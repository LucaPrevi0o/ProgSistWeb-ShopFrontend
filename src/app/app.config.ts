import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth-interceptor';
import { catchError, map, Observable, of, startWith } from 'rxjs';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([AuthInterceptor])
    )
  ]
};

export const API_BASE_URL = 'http://localhost:3000';
export const THUMBNAIL_BASE_URL = 'https://placehold.co/260x140/bb2222/white?text=';
export const PRODUCT_BASE_URL = 'https://placehold.co/350x190/bb2222/white?text=';

export type HttpState<T> =
| { status: 'loading' }
| { status: 'success'; data: T }
| { status: 'empty' }
| { status: 'error'; code: number };

export function toHttpState<T>(source$: Observable<T>): Observable<HttpState<T>> {

  return source$.pipe(
    map(items => Array.isArray(items) ? (
      items.length === 0 ?
        { status: 'empty' } as HttpState<T> :
        { status: 'success', data: items } as HttpState<T>
      ) : ({ status: 'success', data: items } as HttpState<T>)
    ),
    startWith({ status: 'loading' as const }),
    catchError((err: any) => of({ status: 'error' as const, code: err?.status ?? 0 }))
  );
}