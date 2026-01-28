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
| { status: 'error'; message: string };

export function toHttpStateList<T>(source$: Observable<T[]>): Observable<HttpState<T[]>> {

  return source$.pipe(
    map(items => items.length === 0 ?
      { status: 'empty' } as HttpState<T[]> :
      { status: 'success', data: items } as HttpState<T[]>
    ),
    startWith({ status: 'loading' as const }),
    catchError(() => of({ status: 'error' as const, message: 'Errore di caricamento.' }))
  );
}

export function toHttpStateItem<T>(source$: Observable<T>): Observable<HttpState<T>> {

  return source$.pipe(
    map(item => item ?
      { status: 'success', data: item } as HttpState<T> :
      { status: 'empty' } as HttpState<T>
    ),
    startWith({ status: 'loading' as const }),
    catchError(() => of({ status: 'error' as const, message: 'Errore di caricamento.' }))
  );
}