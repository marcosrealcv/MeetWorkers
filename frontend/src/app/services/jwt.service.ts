import { Injectable } from '@angular/core';

const TOKEN_STORAGE_KEY = 'meetworkers_jwt';

@Injectable({
  providedIn: 'root'
})
export class JwtService {
  guardarToken(token: string): void {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }

  obtenerToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  eliminarToken(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  tieneToken(): boolean {
    return !!this.obtenerToken();
  }
}
