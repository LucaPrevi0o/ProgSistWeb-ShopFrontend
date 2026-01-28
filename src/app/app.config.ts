import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { catchError, map, Observable, of, startWith } from 'rxjs';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes)
  ]
};

export const API_BASE_URL = 'http://localhost:3000';

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