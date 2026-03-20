import { Routes } from '@angular/router';
import { Login } from './componentes/zonaCliente/login/login';
import { IniciarSesion } from './componentes/zonaCliente/iniciar-sesion/iniciar-sesion';
import { Cuenta } from './componentes/zonaCliente/cuenta/cuenta';
import { Inicio } from './componentes/zonaTienda/inicio/inicio';
import { PaginaServicios } from './componentes/zonaTienda/pagina-servicios/pagina-servicios';
import { DetallesServicioComponent } from './componentes/zonaTienda/detalles-servicio/detalles-servicio';
import { ContratacionComponent } from './componentes/zonaTienda/contratacion/contratacion';

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
    path: 'pagina-servicios',
    component: PaginaServicios
  },
  {
    path: 'detalles-servicio',
    component: DetallesServicioComponent
  },
  {
    path: 'contratacion',
    component: ContratacionComponent
  },
  {
    path: '**',
    redirectTo: ''
  }

]
