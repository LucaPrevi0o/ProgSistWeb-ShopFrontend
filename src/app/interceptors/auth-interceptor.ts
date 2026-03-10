import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { UserService } from '../services/user-service';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {

  const auth = inject(UserService);
  const token = auth.getToken();
  if (!token) return next(req);
  const authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  return next(authReq);
};