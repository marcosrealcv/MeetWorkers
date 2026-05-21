import { Injectable, inject } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class SessionExpiredInterceptor implements HttpInterceptor {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((err: unknown) => {
        if (err instanceof HttpErrorResponse && err.status === 401) {
          try {
            // Cerrar sesión
            this.authService.cerrarSesion();
            // No usar alert() (síncrono) — navegamos de forma asíncrona
            console.warn('Session expired:', err.error?.error ?? err.message ?? '');
            setTimeout(() => {
              void this.router.navigate(['/iniciar-sesion']);
            }, 100);
          } catch (e) {
            // ignore
          }
        }

        return throwError(() => err);
      })
    );
  }
}
