import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

@Component({
  selector: 'app-iniciar-sesion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './iniciar-sesion.html',
  styleUrls: ['./iniciar-sesion.css'],
})
export class IniciarSesion {
  cargando = false;
  cargandoRecuperacion = false;
  mensajeError = '';
  mensajeExito = '';
  mostrarContrasena = false;
  mostrarRecuperacion = false;
  mostrarContrasenaRecuperacion = false;

  formularioLogin!: ReturnType<FormBuilder['group']>;

  formularioRecuperacion!: ReturnType<FormBuilder['group']>;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.formularioLogin = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required]],
    });

    this.formularioRecuperacion = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      nuevaContrasena: ['', [Validators.required, Validators.minLength(8), Validators.pattern(PASSWORD_REGEX)]],
      confirmarContrasena: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    this.mensajeError = '';
    this.mensajeExito = '';

    if (this.formularioLogin.invalid) {
      this.formularioLogin.markAllAsTouched();
      return;
    }

    this.cargando = true;

    this.authService.iniciarSesion({
      email: String(this.formularioLogin.value.email ?? ''),
      contrasena: String(this.formularioLogin.value.contrasena ?? ''),
    }).subscribe({
      next: () => {
        this.cargando = false;
        void this.router.navigate(['/cuenta']);
      },
      error: (error: HttpErrorResponse) => {
        this.cargando = false;
        this.mensajeError = error.error?.error ?? 'No se pudo iniciar sesión';
      },
    });
  }

  onRestablecerContrasena(): void {
    this.mensajeError = '';
    this.mensajeExito = '';

    if (this.formularioRecuperacion.invalid) {
      this.formularioRecuperacion.markAllAsTouched();
      return;
    }

    const nuevaContrasena = String(this.formularioRecuperacion.value.nuevaContrasena ?? '');
    const confirmarContrasena = String(this.formularioRecuperacion.value.confirmarContrasena ?? '');

    if (nuevaContrasena !== confirmarContrasena) {
      this.mensajeError = 'Las contraseñas no coinciden';
      return;
    }

    this.cargandoRecuperacion = true;

    this.authService.restablecerContrasena({
      email: String(this.formularioRecuperacion.value.email ?? ''),
      nuevaContrasena,
    }).subscribe({
      next: (respuesta) => {
        this.cargandoRecuperacion = false;
        this.mensajeExito = respuesta.mensaje;
        this.formularioRecuperacion.reset();
        this.mostrarRecuperacion = false;
      },
      error: (error: HttpErrorResponse) => {
        this.cargandoRecuperacion = false;
        this.mensajeError = error.error?.error ?? 'No se pudo restablecer la contraseña';
      },
    });
  }

  alternarVisibilidadContrasena(): void {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

  alternarVisibilidadContrasenaRecuperacion(): void {
    this.mostrarContrasenaRecuperacion = !this.mostrarContrasenaRecuperacion;
  }

  abrirRecuperacion(): void {
    this.mensajeError = '';
    this.mensajeExito = '';
    this.mostrarRecuperacion = true;
  }

  cerrarRecuperacion(): void {
    this.mensajeError = '';
    this.mensajeExito = '';
    this.mostrarRecuperacion = false;
  }
}
