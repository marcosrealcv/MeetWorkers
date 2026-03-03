import { Routes } from '@angular/router';
import { Login } from './componentes/zonaCliente/login/login';
import { Inicio } from './componentes/zonaTienda/inicio/inicio';

export const rutasApp: Routes = [ 

  {
    path: 'login',
    component: Login
  },
  {
    path: '', 
    component: Inicio
  }

]
