import { Routes } from '@angular/router';
import { Login } from './componentes/zonaCliente/login/login';
import { Inicio } from './componentes/zonaTienda/inicio/inicio';
import { PaginaServicios } from './componentes/zonaTienda/pagina-servicios/pagina-servicios';
import { DetallesServicioComponent } from './componentes/zonaTienda/detalles-servicio/detalles-servicio';
import { ContratacionComponent } from './componentes/zonaTienda/contratacion/contratacion';

export const rutasApp: Routes = [ 

  {
    path: 'login',
    component: Login
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

]
