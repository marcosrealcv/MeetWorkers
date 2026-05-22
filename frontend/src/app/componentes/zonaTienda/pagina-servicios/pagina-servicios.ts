import { Component, signal, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TarjetasSubcategorias } from '../tarjetas-subcategorias/tarjetas-subcategorias';
import { Servicio } from '../../../models/servicio.interface';
import { ServiciosService } from '../../../services/servicios.service';
import { CategoriasService, Categoria, Subcategoria } from '../../../services/categorias.service';

@Component({
  selector: 'app-pagina-servicios',
  imports: [TarjetasSubcategorias],
  templateUrl: './pagina-servicios.html',
  styleUrl: './pagina-servicios.css',
})
export class PaginaServicios implements OnInit {
  categoria = signal<string>('Todos los servicios');
  serviciosFiltrados = signal<Servicio[]>([]);
  categoriasPrincipales = signal<Servicio[]>([]);
  subcategorias = signal<Subcategoria[]>([]);
  mostrandoSubcategorias = signal<boolean>(false);
  pathCategoriaPrincipal = signal<string>('');

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private serviciosService = inject(ServiciosService);
  private categoriasService = inject(CategoriasService);

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const pathCat = params.get('pathCategoria');
      
      if (pathCat) {
        // Si hay categoría seleccionada, mostrar sus subcategorías
        this.mostrandoSubcategorias.set(true);
        this.cargarSubcategorias(pathCat);
      } else {
        // Si no hay categoría, mostrar todas las categorías principales
        this.mostrandoSubcategorias.set(false);
        this.cargarCategoriasprincipales();
      }
    });
  }

  private cargarCategoriasprincipales(): void {
    this.categoria.set('Categorías Principales');
    
    this.categoriasService.obtenerCategorias().subscribe({
      next: (categorias) => {
        // Convertir categorías a formato de servicio para las tarjetas
        const serviciosDeCategorias: Servicio[] = categorias.map((cat, index) => ({
          id: index + 1,
          nombre: cat.nombreCategoria,
          descripcion: `Explorar servicios de ${cat.nombreCategoria}`,
          precio: '',
          categoria: cat.nombreCategoria,
          pathCategoria: cat.pathCategoria,
          imagen: this.obtenerImagenCategoria(cat.nombreCategoria),
          rating: 4.5
        }));
        this.categoriasPrincipales.set(serviciosDeCategorias);
        this.serviciosFiltrados.set(serviciosDeCategorias);
      },
      error: (err) => {
        console.error('Error cargando categorías:', err);
        this.serviciosFiltrados.set([]);
      }
    });
  }

  private cargarSubcategorias(pathCat: string): void {
    this.categoria.set(this.formatearCategoriaDesdePath(pathCat));
    this.pathCategoriaPrincipal.set(pathCat);

    this.categoriasService.obtenerCategorias().subscribe({
      next: (categorias) => {
        const categoriaPrincipal = categorias.find((categoria) => categoria.pathCategoria === pathCat);

        if (categoriaPrincipal) {
          this.categoria.set(categoriaPrincipal.nombreCategoria);
        }
      },
      error: (err) => {
        console.error('Error cargando categoría principal:', err);
      }
    });

    // Obtener subcategorías dinámicamente
    this.categoriasService.obtenerSubcategorias(pathCat).subscribe({
      next: (subcategorias) => {
        this.subcategorias.set(subcategorias);
        
        // Convertir subcategorías a formato Servicio
        const servicios: Servicio[] = subcategorias.map((subcat, index) => ({
          id: index + 1,
          nombre: subcat.nombreCategoria,
          descripcion: `Servicios de ${subcat.nombreCategoria}`,
          precio: '',
          categoria: subcat.nombreCategoria,
          pathCategoria: subcat.pathCategoria,
          imagen: this.obtenerImagenSubcategoria(subcat.nombreCategoria, pathCat),
          rating: 4.5
        }));
        this.serviciosFiltrados.set(servicios);
      },
      error: (err) => {
        console.error('Error cargando subcategorías:', err);
        // Fallback a datos locales
        const filtrados = this.serviciosService.filtrarPorPathCategoria(pathCat);
        this.serviciosFiltrados.set(filtrados);
      }
    });
  }

  volverACategoriasprincipales(): void {
    this.router.navigate(['/pagina-servicios']);
  }

  private obtenerImagenCategoria(nombreCategoria: string): string {
    const imagenes: { [key: string]: string } = {
      'Automoción': '/imgs/automocion/automocion.png',
      'Belleza': '/imgs/belleza/belleza.png',
      'Limpieza': '/imgs/limpieza/limpieza.png',
      'Enseñanza': '/imgs/enseñanza/enseñanza.png',
      'Reparaciones': '/imgs/reparaciones/reparaciones.png',
      'Cuidado Personal': '/imgs/cuidado_personal/cuidado.png',
      'Construcciones y Reformas': '/imgs/construcciones_y_reformas/consturccion.png',
      'Otro': '/imgs/otros/otros.png'
    };
    return imagenes[nombreCategoria] || '/imgs/otros/otros.png';
  }

  private obtenerImagenSubcategoria(nombreSubcategoria: string, pathCategoriaParent: string): string {
    // Normalizar nombre para construcción de ruta
    const nombreNormalizado = nombreSubcategoria.toLowerCase().replace(/\s+/g, '_').replace(/[áéíóúñ]/g, match => {
      const acentos: { [key: string]: string } = { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ñ': 'n' };
      return acentos[match] || match;
    });
    
    console.log('🔍 Subcategoría recibida:', nombreSubcategoria, '| Normalizada:', nombreNormalizado, '| Path:', pathCategoriaParent);
    
    // Mapeo explícito para subcategorías conocidas (case-insensitive)
    const mapeoSubcategorias: { [key: string]: { [key: string]: string } } = {
      'automocion': {
        'mecanico': '/imgs/automocion/mecanico/mecanico.png',
        'chapista': '/imgs/automocion/chapista/chapista.png',
        'tapiceria': '/imgs/automocion/tapiceria/tapiceria.png',
        'neumaticos': '/imgs/automocion/neumaticos/neumaticos.png',
        'electricista del automóvil': '/imgs/automocion/electricista_auto/electricista_auto.png',
        'electricista': '/imgs/automocion/electricista_auto/electricista_auto.png',
        'electricista_auto': '/imgs/automocion/electricista_auto/electricista_auto.png',
        'electricista_del_automovil': '/imgs/automocion/electricista_auto/electricista_auto.png',
      },
      'belleza': {
        'peluqueria': '/imgs/belleza/peluqueria/peluqueria.png',
        'peluquería': '/imgs/belleza/peluqueria/peluqueria.png',
        'manicura': '/imgs/belleza/manicura/manicura.png',
        'pedicura': '/imgs/belleza/pedicura/pedicura.png',
        'depilacion': '/imgs/belleza/depilacion/depilacion.png',
        'depilación': '/imgs/belleza/depilacion/depilacion.png',
        'masaje corporal': '/imgs/belleza/masaje/masaje.png',
        'masaje facial': '/imgs/belleza/masaje/masaje.png',
        'masaje': '/imgs/belleza/masaje/masaje.png',
        'masaje_corporal': '/imgs/belleza/masaje/masaje.png',
        'masaje_facial': '/imgs/belleza/masaje/masaje.png',
        'estetica': '/imgs/belleza/estetica/estetica.png',
        'estética': '/imgs/belleza/estetica/estetica.png',
        'estetica corporal': '/imgs/belleza/estetica/estetica.png',
        'estética corporal': '/imgs/belleza/estetica/estetica.png',
        'estetica_corporal': '/imgs/belleza/estetica/estetica.png',
      },
      'limpieza': {
        'limpieza residencial': '/imgs/limpieza/hogar/hogar.png',
        'limpieza del hogar': '/imgs/limpieza/hogar/hogar.png',
        'limpieza_del_hogar': '/imgs/limpieza/hogar/hogar.png',
        'limpieza de oficinas': '/imgs/limpieza/oficinas/oficinas.png',
        'limpieza_de_oficinas': '/imgs/limpieza/oficinas/oficinas.png',
        'limpieza de ventanas': '/imgs/limpieza/ventanas/ventanas.png',
        'limpieza_de_ventanas': '/imgs/limpieza/ventanas/ventanas.png',
        'presupuesto especial': '/imgs/limpieza/especial/especial.png',
        'presupuesto_especial': '/imgs/limpieza/especial/especial.png',
      },
      'enseñanza': {  
        'ingles': '/imgs/enseñanza/ingles/ingles.png',
        'inglés': '/imgs/enseñanza/ingles/ingles.png',
        'clases de ingles': '/imgs/enseñanza/ingles/ingles.png',
        'clases de inglés': '/imgs/enseñanza/ingles/ingles.png',
        'clases ingles': '/imgs/enseñanza/ingles/ingles.png',
        'clases_ingles': '/imgs/enseñanza/ingles/ingles.png',
        'matematicas': '/imgs/enseñanza/matematicas/matematicas.png',
        'matemáticas': '/imgs/enseñanza/matematicas/matematicas.png',
        'clases de matematicas': '/imgs/enseñanza/matematicas/matematicas.png',
        'clases de matemáticas': '/imgs/enseñanza/matematicas/matematicas.png',
        'clases matematicas': '/imgs/enseñanza/matematicas/matematicas.png',
        'clases_matematicas': '/imgs/enseñanza/matematicas/matematicas.png',
        'español': '/imgs/enseñanza/espanol/espanol.png',
        'clases de español': '/imgs/enseñanza/espanol/espanol.png',
        'clases español': '/imgs/enseñanza/espanol/espanol.png',
        'clases_español': '/imgs/enseñanza/espanol/espanol.png',
        'informatica': '/imgs/enseñanza/informatica/informatica.png',
        'informática': '/imgs/enseñanza/informatica/informatica.png',
        'clases de informatica': '/imgs/enseñanza/informatica/informatica.png',
        'clases de informática': '/imgs/enseñanza/informatica/informatica.png',
        'clases informatica': '/imgs/enseñanza/informatica/informatica.png',
        'clases_informatica': '/imgs/enseñanza/informatica/informatica.png',
        'deportes': '/imgs/enseñanza/deportes/deportes.png',
        'deporte': '/imgs/enseñanza/deportes/deportes.png',
        'clases de deportes': '/imgs/enseñanza/deportes/deportes.png',
        'clases deportes': '/imgs/enseñanza/deportes/deportes.png',
        'clases_deportes': '/imgs/enseñanza/deportes/deportes.png',
        'apoyo': '/imgs/enseñanza/apoyo/apoyo.png',
        'apoyo escolar': '/imgs/enseñanza/apoyo/apoyo.png',
        'apoyo_escolar': '/imgs/enseñanza/apoyo/apoyo.png',
        'clases de apoyo': '/imgs/enseñanza/apoyo/apoyo.png',
        'clases apoyo': '/imgs/enseñanza/apoyo/apoyo.png',
        'clases_apoyo': '/imgs/enseñanza/apoyo/apoyo.png',
        'musica': '/imgs/enseñanza/musica/musica.png',
        'música': '/imgs/enseñanza/musica/musica.png',
        'clases de musica': '/imgs/enseñanza/musica/musica.png',
        'clases de música': '/imgs/enseñanza/musica/musica.png',
        'clases musica': '/imgs/enseñanza/musica/musica.png',
        'clases_musica': '/imgs/enseñanza/musica/musica.png',
        // Subcategorías de reparaciones y construcciones que vienen bajo categoría 4
        'electricidad': '/imgs/reparaciones/electricista/electricista.png',
        'albanileria': '/imgs/reparaciones/albanil/albanil.png',
        'carpinteria': '/imgs/reparaciones/carpintero/carpintero.png',
        'fontaneria': '/imgs/reparaciones/fontanero/fontanero.png',
        'herreria': '/imgs/reparaciones/herreria/herreria.png',
        'vidrieria': '/imgs/reparaciones/vidrieria/vidrieria.png',
        'estanterias_personalizadas': '/imgs/construcciones_y_reformas/estanterias/estanterias.png',
        'remodelacion_de_banos': '/imgs/construcciones_y_reformas/banos/banos.png',
        'diseno_de_interiores': '/imgs/construcciones_y_reformas/interiores/interiores.png',
        'muebles_a_medida': '/imgs/construcciones_y_reformas/muebles/muebles.png',
        'armarios_empotrados': '/imgs/construcciones_y_reformas/armarios/armarios.png',
        'remodelacion_de_cocinas': '/imgs/construcciones_y_reformas/cocina/cocina.png',
        'reformas_integrales': '/imgs/construcciones_y_reformas/integrales/integrales.png',
      },
      'reparaciones': {
        'albanil': '/imgs/reparaciones/albanil/albanil.png',
        'albañil': '/imgs/reparaciones/albanil/albanil.png',
        'albanileria': '/imgs/reparaciones/albanil/albanil.png',
        'carpintero': '/imgs/reparaciones/carpintero/carpintero.png',
        'carpinteria': '/imgs/reparaciones/carpintero/carpintero.png',
        'electricista': '/imgs/reparaciones/electricista/electricista.png',
        'electricidad': '/imgs/reparaciones/electricista/electricista.png',
        'fontanero': '/imgs/reparaciones/fontanero/fontanero.png',
        'fontaneria': '/imgs/reparaciones/fontanero/fontanero.png',
        'herreria': '/imgs/reparaciones/herreria/herreria.png',
        'herraría': '/imgs/reparaciones/herreria/herreria.png',
        'herraira': '/imgs/reparaciones/herreria/herreria.png',
        'herrero': '/imgs/reparaciones/herreria/herreria.png',
        'vidrieria': '/imgs/reparaciones/vidrieria/vidrieria.png',
      },
      'otro': {
        'especifica en la descripcion': '/imgs/otros/especifica_en_la_descripcion/especifica_en_la_descripcion.png',
        'especifica_en_la_descripcion': '/imgs/otros/especifica_en_la_descripcion/especifica_en_la_descripcion.png',
      },
      'cuidado_personal': {
        'cuidado de niños': '/imgs/cuidado_personal/niños/niños.png',
        'cuidado_de_ninos': '/imgs/cuidado_personal/niños/niños.png',
        'cuidado de ancianos': '/imgs/cuidado_personal/ancianos/ancianos.png',
        'cuidado_de_ancianos': '/imgs/cuidado_personal/ancianos/ancianos.png',
        'cuidado de mascotas': '/imgs/cuidado_personal/mascotas/mascotas.png',
        'cuidado_de_mascotas': '/imgs/cuidado_personal/mascotas/mascotas.png',
      },
    };

    // Obtener categoría padre normalizada
    const categoriaNormalizada = pathCategoriaParent.split('-')[0];
    let categoriaKey = '';
    
    // Buscar la categoría correcta en el mapeo
    if (categoriaNormalizada === '1') categoriaKey = 'automocion';
    if (categoriaNormalizada === '2') categoriaKey = 'belleza';
    if (categoriaNormalizada === '3') categoriaKey = 'enseñanza';
    if (categoriaNormalizada === '4') categoriaKey = 'reparaciones';
    if (categoriaNormalizada === '5') categoriaKey = 'limpieza';
    if (categoriaNormalizada === '6') categoriaKey = 'cuidado_personal';
    if (categoriaNormalizada === '7') categoriaKey = 'reparaciones';
    if (categoriaNormalizada === '8') categoriaKey = 'otro';
    
    console.log('📂 Categoría identificada:', categoriaKey, 'ID:', categoriaNormalizada);
    
    // Buscar en el mapeo con nombre normalizado (case-insensitive)
    if (categoriaKey && mapeoSubcategorias[categoriaKey]) {
      const subcategoriaKey = nombreNormalizado.toLowerCase();
      if (mapeoSubcategorias[categoriaKey][subcategoriaKey]) {
        const rutaEncontrada = mapeoSubcategorias[categoriaKey][subcategoriaKey];
        console.log('✅ Imagen encontrada:', rutaEncontrada);
        return rutaEncontrada;
      } else {
        console.log('⚠️ No encontrado en mapeo explícito, claves disponibles:', Object.keys(mapeoSubcategorias[categoriaKey]));
      }
    }

    // Si no encuentra en mapeo, intenta construir la ruta dinámicamente
    const rutaDinamica = `/imgs/${categoriaKey}/${nombreNormalizado}/${nombreNormalizado}.png`;
    console.log('⚠️ Usando ruta dinámica:', rutaDinamica);
    return rutaDinamica;
  }

  private formatearCategoriaDesdePath(path: string): string {
    // Extrae el nombre de la categoría del path (ej: "1-automocion" → "Automóvil")
    const mapeoNombres: { [key: string]: string } = {
      '1': 'Automóvil',
      '2': 'Belleza',
      '3': 'Enseñanza',
      '4': 'Enseñanza',
      '5': 'Limpieza',
      '6': 'Enseñanza',
      '7': 'Reparaciones'
    };

    const id = path.split('-')[0];
    return mapeoNombres[id] || 'Servicios';
  }
}

