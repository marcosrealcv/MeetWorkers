import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-iniciar-sesion',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './iniciar-sesion.html',
  styleUrl: './iniciar-sesion.css',
})
export class IniciarSesion {
  cargando = false;
  mensajeError = '';

  formularioLogin!: ReturnType<FormBuilder['group']>;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.formularioLogin = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    this.mensajeError = '';

    if (this.formularioLogin.invalid) {
      this.formularioLogin.markAllAsTouched();
      return;
    }

    this.cargando = true;

    this.authService.iniciarSesion({
      email: this.formularioLogin.value.email ?? '',
      contrasena: this.formularioLogin.value.contrasena ?? '',
    }).subscribe({
      next: () => {
        this.cargando = false;
        void this.router.navigate(['/cuenta']);
      },
      error: (error: HttpErrorResponse) => {
        this.cargando = false;
        this.mensajeError = error.error?.error ?? 'No se pudo iniciar sesión';
      }
    });
  }

}
