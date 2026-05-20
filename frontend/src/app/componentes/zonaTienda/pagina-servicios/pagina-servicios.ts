import { Component, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TarjetasSubcategorias } from '../tarjetas-subcategorias/tarjetas-subcategorias';
import { Servicio } from '../../../models/servicio.interface';
import { ServiciosService } from '../../../services/servicios.service';
import { CategoriasService, Subcategoria } from '../../../services/categorias.service';

@Component({
  selector: 'app-pagina-servicios',
  imports: [TarjetasSubcategorias],
  templateUrl: './pagina-servicios.html',
  styleUrl: './pagina-servicios.css',
})
export class PaginaServicios implements OnInit {
  categoria = signal<string>('Todos los servicios');
  serviciosFiltrados = signal<Servicio[]>([]);
  subcategorias = signal<Subcategoria[]>([]);

  constructor(
    private route: ActivatedRoute,
    private serviciosService: ServiciosService,
    private categoriasService: CategoriasService
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const pathCat = params.get('pathCategoria');
      if (pathCat) {
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
            
            // Obtener el nombre de la categoría
            if (servicios.length > 0) {
              this.categoria.set(servicios[0].categoria);
            }
          },
          error: (err) => {
            console.error('Error cargando subcategorías:', err);
            // Fallback a datos locales
            const filtrados = this.serviciosService.filtrarPorPathCategoria(pathCat);
            this.serviciosFiltrados.set(filtrados);
            if (filtrados.length > 0) {
              this.categoria.set(filtrados[0].nombre);
            }
          }
        });
      } else {
        // Si no hay filtro, mostrar todos los servicios
        this.serviciosFiltrados.set(this.serviciosService.obtenerTodos());
      }
    });
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
        'limpieza residencial': '/imgs/limpieza/residencial/residencial.png',
        'limpieza de oficinas': '/imgs/limpieza/oficinas/oficinas.png',
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
        'español': '/imgs/enseñanza/español/español.png',
        'clases de español': '/imgs/enseñanza/español/español.png',
        'clases español': '/imgs/enseñanza/español/español.png',
        'clases_español': '/imgs/enseñanza/español/español.png',
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
        'albanileria': '/imgs/reparaciones/albañil/albañil.png',
        'carpinteria': '/imgs/reparaciones/carpintero/carpintero.png',
        'fontaneria': '/imgs/reparaciones/fontanero/fontanero.png',
        'herreria': '/imgs/reparaciones/herreria/herreria.png',
        'vidrieria': '/imgs/reparaciones/vidrieria/vidrieria.png',
        'estanterias_personalizadas': '/imgs/construcciones_y_reformas/estanterias/estanterias.png',
        'remodelacion_de_banos': '/imgs/construcciones_y_reformas/baños/baños.png',
        'diseno_de_interiores': '/imgs/construcciones_y_reformas/baños/baños.png',
        'muebles_a_medida': '/imgs/construcciones_y_reformas/estanterias/estanterias.png',
        'armarios_empotrados': '/imgs/construcciones_y_reformas/estanterias/estanterias.png',
        'remodelacion_de_cocinas': '/imgs/construcciones_y_reformas/baños/baños.png',
        'reformas_integrales': '/imgs/construcciones_y_reformas/baños/baños.png',
      },
      'reparaciones': {
        'albanil': '/imgs/reparaciones/albañil/albañil.png',
        'albañil': '/imgs/reparaciones/albañil/albañil.png',
        'carpintero': '/imgs/reparaciones/carpintero/carpintero.png',
        'electricista': '/imgs/reparaciones/electricista/electricista.png',
        'fontanero': '/imgs/reparaciones/fontanero/fontanero.png',
        'herreria': '/imgs/reparaciones/herreria/herreria.png',
        'herraría': '/imgs/reparaciones/herreria/herreria.png',
        'herraira': '/imgs/reparaciones/herreria/herreria.png',
        'herrero': '/imgs/reparaciones/herreria/herreria.png',
        'vidrieria': '/imgs/reparaciones/vidrieria/vidrieria.png',
        'vidriera': '/imgs/reparaciones/vidrieria/vidrieria.png',
        // Subcategorías de construcciones y reformas que vienen bajo ID 7
        'estanterias_personalizadas': '/imgs/construcciones_y_reformas/estanterias/estanterias.png',
        'remodelacion_de_banos': '/imgs/construcciones_y_reformas/baños/baños.png',
        'diseno_de_interiores': '/imgs/construcciones_y_reformas/interiores/interiores.png',
        'muebles_a_medida': '/imgs/construcciones_y_reformas/muebles/muebles.png',
        'armarios_empotrados': '/imgs/construcciones_y_reformas/armarios/armarios.png',
        'remodelacion_de_cocinas': '/imgs/construcciones_y_reformas/cocina/cocina.png',
        'reformas_integrales': '/imgs/construcciones_y_reformas/integrales/integrales.png',
      },
    };

    // Obtener categoría padre normalizada
    const categoriaNormalizada = pathCategoriaParent.split('-')[0];
    let categoriaKey = '';
    
    // Buscar la categoría correcta en el mapeo
    if (categoriaNormalizada === '1') categoriaKey = 'automocion';
    if (categoriaNormalizada === '2') categoriaKey = 'belleza';
    if (categoriaNormalizada === '3') categoriaKey = 'enseñanza';
    if (categoriaNormalizada === '4') categoriaKey = 'enseñanza';
    if (categoriaNormalizada === '5') categoriaKey = 'limpieza';
    if (categoriaNormalizada === '6') categoriaKey = 'enseñanza';
    if (categoriaNormalizada === '7') categoriaKey = 'reparaciones';
    
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
  }

