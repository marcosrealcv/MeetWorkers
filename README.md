# MEET WORKERS — Memoria final del proyecto

## Datos del Proyecto
* **Título del proyecto:** MEET WORKERS - Plataforma web integral para la publicación, descubrimiento y reserva de servicios.
* **Autores:** Jaime Araque Martínez, Marcos Real Pérez
* **Año académico:** 2025/2026
* **Ciclo y Centro:** Técnico Superior en Desarrollo de Aplicaciones Web (DAW) — I.E.S. Alonso de Avellaneda

---

## 1. Introducción y justificación

### Descripción, finalidad y objetivos
Meet Workers es una aplicación web bidireccional enfocada en la economía de servicios. Su finalidad principal es servir de punto de encuentro entre profesionales independientes (fontaneros, peluqueros, mecánicos, etc.) y usuarios que buscan satisfacer una necesidad específica.

**Objetivos principales:**
1. **Gestión de roles:** Perfiles diferenciados para `Proveedor` y `Cliente`.
2. **Publicación:** Crear, editar y gestionar servicios y solicitudes de trabajos (avisos).
3. **Agendamiento:** Reservar mediante calendario interactivo (Google Calendar).
4. **Búsqueda y filtrado:** Navegación por categorías y subcategorías, junto a búsqueda por distancia.
5. **Avisos y notificaciones:** Recordatorios automáticos y avisos al aceptar/cancelar trabajos.

### Motivación
La idea original de Meet Workers nace al analizar las aplicaciones y páginas web actuales destinadas a la reserva de citas, las cuales suelen estar enfocadas en nichos muy concretos y cerrados, como es el caso de las plataformas exclusivas para el sector de la peluquería o la estética. Si bien estas herramientas cumplen su función, presentan una limitación clara: la fragmentación del mercado.

Nuestra principal motivación ha sido romper con esa sectorización para desarrollar una solución verdaderamente universal y centralizada. El propósito que impulsó este proyecto fue construir un único entorno digital donde agendar citas sea un proceso estandarizado y ágil, independientemente del gremio. Queríamos que la plataforma aportara la misma comodidad y fluidez tanto a un usuario que quiere reservar un corte de pelo, como al que necesita llevar el coche a un mecánico o al que busca un fontanero para una reparación en el hogar.

Además, para aportar un valor diferencial e innovador respecto a los sistemas de reservas tradicionales, decidimos implementar un modelo de interacción bidireccional. En Meet Workers, la comunicación no se limita a un catálogo estático donde el cliente busca al profesional; hemos incluido una funcionalidad mediante la cual los propios clientes pueden redactar y publicar solicitudes de trabajos específicos que necesiten cubrir. De esta forma, los prestadores de servicios registrados tienen acceso a un tablón de demandas reales, pudiendo contactar y ofrecer sus servicios directamente a los usuarios. Esto transforma la aplicación en un ecosistema mucho más dinámico, equitativo y adaptable a las necesidades reales del día a día.

---

## 2. Análisis y diseño del proyecto

### 2.1 Arquitectura general
* **Frontend:** Single Page Application (SPA) desarrollada en Angular que consume una API REST.
* **Backend:** Servidor en Node.js + Express que expone los endpoints y orquesta la lógica de negocio.
* **Base de datos:** MongoDB (colecciones organizadas para usuarios, servicios, trabajos/avisos, reservas y reseñas).

### 2.2 Tecnologías y herramientas utilizadas
* **Frontend:** Angular 21, TypeScript, TailwindCSS.
* **Backend:** Node.js, Express, TypeScript (desarrollo con `ts-node`).
* **Base de datos:** MongoDB (se incluye el fichero JSON de ejemplo: `meetworkers.categorias.json`).
* **Librerías y herramientas destacadas:**
  * Google Calendar / FullCalendar (gestión de calendario y reservas).
  * Postman (pruebas y validación de la API durante el desarrollo).

### Entorno de desarrollo
* **SO:** Windows 11
* **CPU:** Intel Core i5-13420H
* **RAM:** 32 GB
* **Almacenamiento:** SSD 1,5TB

### Seguridad
* **Autenticación:** JWT (JSON Web Tokens) para rutas protegidas (`src/app/services/jwt.service.ts` en el frontend, junto con la lógica de emisión/validación de tokens en el backend).
* **Almacenamiento de contraseñas:** Uso de `bcrypt` para hashing seguro en el servidor.
* **Buenas prácticas recomendadas:** Uso de `helmet`, validación de entrada (`express-validator` / `Joi`), CORS restringido y políticas de *rate limiting* en entornos de producción.

### 2.3 Análisis de usuarios
* **Proveedores de servicios:** Crean y gestionan sus propios servicios, definen su disponibilidad horaria, gestionan las reservas entrantes y responden a los avisos publicados.
* **Clientes:** Buscan y filtran servicios, realizan reservas en la agenda y publican avisos de trabajos demandados.

### 2.4 Requisitos

#### Requisitos funcionales principales:
* Registro y autenticación de usuarios con distinción de roles (clientes/proveedores).
* CRUD completo de servicios para los proveedores.
* Publicación de avisos (solicitudes de trabajo) por parte de los clientes.
* Gestión de reservas integrando calendario y franjas horarias.
* Sistema de notificaciones y avisos automáticos (recordatorios y acciones sobre aceptaciones o cancelaciones).

#### Requisitos no funcionales (completados / recomendados):
* **Rendimiento:** Creación de índices sobre campos críticos de búsqueda en MongoDB (categoría, ubicación) y paginación en listados extensos.
* **Usabilidad:** Interfaz totalmente responsive adaptada tanto a dispositivos móviles como a pantallas de escritorio.
* **Mantenibilidad:** Arquitectura de código modular mediante la clara separación de responsabilidades (`services`, `models`, `routes`).

### 2.5 Estructura de navegación (rutas principales)
* `/` — Home (buscador, carrusel de destacados, accesos rápidos)
* `/login` — Formulario de inicio de sesión
* `/registro` — Formulario de registro de nuevos usuarios
* `/pagina-servicios` — Listado general de categorías y subcategorías
* `/publicar-trabajo` — Formulario para que el cliente publique un aviso/trabajo
* `/trabajos-solicitados` — Listado público de avisos activos en la plataforma
* `/detalle-aviso` — Vista detallada de un aviso o trabajo específico
* `/zona-cliente/cuenta` — Panel del cliente (historial, trabajos aceptados, reseñas)
* `/dashboard-profesional` — Panel del profesional (gestión de servicios propios, agenda)

### 2.6 Organización de la lógica de negocio
* El flujo sigue el patrón: **Rutas $\rightarrow$ Controladores $\rightarrow$ Modelos (Mongoose)**.
* Los servicios externos (como geocoding o mapas) se encuentran encapsulados en módulos e interfaces específicas.

### 2.7 Modelo de datos simplificado
* **Usuarios:** `{ _id, nombre, email, contraseña(hasheada), rol, foto_perfil, subcategoria, ... }`
* **Servicios:** `{ _id, proveedor_id, nombre, descripcion, categoria, subcategoria, precio, imagen, pathCategoria }`
* **Reservas:** `{ _id, servicio_id | trabajo_id, cliente_id, prestador_id, fecha_hora, estado }`
* **Trabajos/Avisos:** `{ _id, cliente_id, titulo, descripcion, categoria, subcategoria, estado, prestador_aceptado_id, cancelación_meta }`

---

## 3. Conclusiones y planificación

### 3.1 Planificación y evolución del desarrollo
El desarrollo de Meet Workers se ha llevado a cabo bajo un enfoque ágil y dinámico, adaptándose a las necesidades técnicas que iban surgiendo. La coordinación del equipo se ha gestionado mediante comunicación constante por canales de voz (Discord) y un control de versiones estructurado en Git (GitHub), utilizando ramas independientes (`Jaime` y `Marcos`) y unificando el código mediante *Pull Requests* hacia la rama `main`.

La planificación real ejecutada se divide en las siguientes fases:

* **Febrero 2026 — Estructuración y base del proyecto:**
  * Configuración inicial del entorno de desarrollo.
  * Diseño de la estructura básica del frontend en Angular.
  * Maquetación preliminar de la interfaz, incluyendo componentes clave como el *Header* y el *Footer*.
* **Marzo 2026 — Backend, autenticación y despliegue de datos:**
  * Creación de la estructura del backend en Node.js/Express y configuración de la base de datos local.
  * Implementación del sistema de seguridad y autenticación de usuarios (Registro y Login).
  * Desarrollo de la lógica para cargar dinámicamente las categorías, subcategorías y proveedores desde la base de datos.
  * Diseño de la página de inicio y carga dinámica de tarjetas de servicios.
* **Abril 2026 — Lógica de negocio y bidireccionalidad:**
  * Implementación de la funcionalidad estrella: la opción para los clientes de publicar trabajos o avisos personalizados.
  * Desarrollo de la lógica de gestión de reservas y asignación de trabajos para los prestadores de servicios.
* **Mayo 2026 — Despliegue en la nube, refinamiento y detalles finales:**
  * Migración de la base de datos desde un entorno local (localhost) hacia la nube utilizando MongoDB Atlas.
  * Desarrollo del sistema de reseñas y valoraciones.
  * Creación y rediseño de los *dashboards* (panel de cuenta y zona del profesional).
  * Implementación de la cancelación de reservas bidireccional (cliente a prestador y viceversa).
  * Resolución de *bugs* críticos (como la carga de fotos de perfil pesadas) y maquetación final con imágenes reales.

### 3.2 Conclusiones del proyecto

#### Consecución de los objetivos propuestos
El proyecto "Meet Workers" ha cumplido con éxito su objetivo principal: crear un ecosistema digital unificado que rompe con la fragmentación del mercado de servicios. Se ha logrado desarrollar una plataforma verdaderamente bidireccional, donde no solo el profesional puede exponer sus servicios, sino que el cliente tiene el poder de demandar trabajos específicos. Esto transforma la experiencia clásica de un catálogo estático en un entorno de mercado dinámico y equitativo.

#### Desafíos técnicos y aprendizajes
Durante el ciclo de desarrollo, nos hemos enfrentado a diversos retos arquitectónicos que han supuesto un gran aprendizaje:
* **Gestión del estado y sesión:** La persistencia de datos complejos (como las imágenes de perfil codificadas en Data-URL) en el `localStorage` generó problemas de rendimiento y corrupción de sesión, lo que nos obligó a refactorizar la gestión de estado y el guardado de recursos.
* **Sincronización en Angular:** Afrontamos y resolvimos errores de ciclo de vida en el frontend (como el clásico `ExpressionChangedAfterItHasBeenCheckedError`), implementando estrategias de actualización asíncrona (`setTimeout`) en puntos críticos y un manejo más preciso de los observables y el enrutamiento.
* **Control de versiones en equipo:** La integración continua de nuevas funcionalidades (como rutas de backend y paneles interactivos) requirió una gestión muy rigurosa de las fusiones (*merges*) en GitHub para evitar conflictos en la lógica de reservas y perfiles.

#### Líneas de trabajo futuro
Aunque la plataforma es plenamente funcional como un Producto Mínimo Viable (MVP), el ecosistema creado abre la puerta a diversas mejoras que lo acercarían a un entorno de producción masivo:
1. **Geolocalización avanzada:** Sustituir la búsqueda actual por un filtrado de distancia real utilizando coordenadas, apoyándonos en índices geoespaciales de MongoDB (`2dsphere`) y APIs de mapas.
2. **Transacciones económicas:** Integración de una pasarela de pagos segura (como Stripe) para poder gestionar adelantos o pagos íntegros de los servicios directamente desde la aplicación.
3. **Sistema de reputación consolidado:** Evolucionar el actual sistema de reseñas hacia un algoritmo que destaque a los mejores proveedores en la página de inicio basándose en la tasa de trabajos completados con éxito y su puntuación media.

### 3.3 Resumen consolidado de la aplicación

#### Resultados actuales
* Implementada una SPA en Angular con integración básica con un backend REST en Node.js y MongoDB.
* Funcionalidades principales completadas: publicación de avisos/trabajos, aceptación por parte de prestadores, pestaña de `Trabajos aceptados` en la cuenta con posibilidad de cancelar y detallar el motivo, sistema funcional de reseñas y puntuaciones.

#### Retos y soluciones resúmenes
* **Integración del flujo de sesión:** Corrección de la persistencia de `foto_perfil` en `localStorage` filtrando o limitando el almacenamiento de data-URLs pesados.
* **Gestión de rutas nuevas en backend:** Reconfiguración y reinicio en caliente tras añadir endpoints críticos (como `/api/trabajos/mis-aceptados`).
* **Problemas de render en Angular:** Solución de la excepción `ExpressionChangedAfterItHasBeenCheckedError` aplicando ciclos diferidos en el ciclo de vida del componente.

#### Aprendizajes y mejoras futuras
* Añadir filtrado por distancia real usando coordenadas y un índice geoespacial en MongoDB.
* Integrar pasarela de pagos y un sistema de reputación avanzado.

#### Planificación temporal original de hitos
* **Febrero:** Diseño y modelado de datos + setup inicial.
* **Marzo:** Backend básico, autenticación y modelos principales.
* **Abril:** Frontend (componentes principales) y calendario (FullCalendar).
* **Mayo:** Integración, tests, depuración y documentación final.

---

## Ejecución local (arranque rápido)

### Requisitos previos
* Node.js (>=18)
* npm
* Angular CLI (para desarrollo frontend)
* MongoDB (Instancia local o en la nube con Atlas)

### 1) Backend

```bash
cd backend
npm start
```

#### Variables de entorno (.env)
* `MONGODB_URI` — String de conexión a MongoDB.
* `JWT_SECRET` — Clave secreta para la firma y verificación de los tokens JWT.
* `GOOGLE_CALENDAR_API_KEY` — Credencial de integración para las firmas con Google Calendar.

### 2) Frontend

```bash
cd frontend
ng serve
```

---

## Endpoints relevantes

* `POST /api/clientes/registro` — Registro de nuevos usuarios.
* `POST /api/clientes/login` — Inicio de sesión (Retorna el JWT).
* `GET /api/categorias` — Obtiene el catálogo completo de categorías.
* `GET /api/subcategorias/:pathCategoria` — Listado de subcategorías vinculadas a un path.
* `GET /api/trabajos` — Listado público de avisos disponibles.
* `GET /api/trabajos/:id` — Consulta detallada de un aviso.
* `GET /api/trabajos/mis-aceptados` — Trabajos activos que un prestador ha aceptado.
* `PUT /api/trabajos/:id/cancelar` — Cancelación de un trabajo por parte del prestador especificando el motivo.

---

## Archivos de interés en este repositorio
* `frontend/` — Código fuente de la SPA en Angular. Assets y recursos gráficos ubicados en `frontend/public/imgs`.
* `backend/` — Lógica del servidor en Express y definición de esquemas de datos con Mongoose.
* `meetworkers.categorias.json` — Archivo de inicialización que contiene el catálogo base de categorías/subcategorías.
