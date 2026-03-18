import { Routes } from '@angular/router';
import { Login } from './componentes/zonaCliente/login/login';
import { IniciarSesion } from './componentes/zonaCliente/iniciar-sesion/iniciar-sesion';
import { Cuenta } from './componentes/zonaCliente/cuenta/cuenta';
import { Inicio } from './componentes/zonaTienda/inicio/inicio';

export const rutasApp: Routes = [ 

  {
    path: 'registro',
    component: Login
  },
  {
    path: 'iniciar-sesion',
    component: IniciarSesion
  },
  {
    path: 'cuenta',
    component: Cuenta
  },
  {
    path: 'login',
    redirectTo: 'iniciar-sesion',
    pathMatch: 'full'
  },
  {
    path: '', 
    component: Inicio
  },
  {
    path: '**',
    redirectTo: ''
  }

]
