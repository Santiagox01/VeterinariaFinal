# VeterinariaFinal

Sistema de gestion de inventario y punto de venta para accesorios veterinarios. Esta aplicacion web permite administrar productos, controlar stock, procesar ventas y generar facturas en formato PDF.

## Arquitectura

La aplicacion sigue una arquitectura **SPA (Single Page Application)** con separacion de responsabilidades:

```
┌─────────────────────────────────────────────────────────────────┐
│                         Cliente (Browser)                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Pages     │  │ Components  │  │      UI Components      │  │
│  │ (Dashboard, │  │ (Forms,     │  │   (Radix UI + Custom)   │  │
│  │  Sales...)  │  │  Invoice)   │  │                         │  │
│  └──────┬──────┘  └──────┬──────┘  └───────────────────────┬─┘  │
│         │                │                                  │    │
│         └────────────────┴──────────────────────────────────┘    │
│                                    │                             │
│  ┌─────────────────────────────────┴───────────────────────────┐ │
│  │                    React Query (TanStack)                   │ │
│  │              Cache, Sincronizacion, Estado Servidor         │ │
│  └─────────────────────────────────┬───────────────────────────┘ │
│                                    │                             │
│  ┌─────────────────────────────────┴───────────────────────────┐ │
│  │                     Capa de Servicios                       │ │
│  │          (accessories.ts, sales.ts, utils.ts)               │ │
│  └─────────────────────────────────┬───────────────────────────┘ │
└────────────────────────────────────┼─────────────────────────────┘
                                     │ HTTPS
                                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Supabase Cloud                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   PostgreSQL    │  │    REST API     │  │   Row Level     │  │
│  │    Database     │  │   (Auto-gen)    │  │   Security      │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Patron de Arquitectura

- **Frontend**: Arquitectura basada en componentes con React, siguiendo el patron de presentacion/contenedor
- **Estado del Servidor**: React Query gestiona el cache, sincronizacion y estado de datos remotos
- **Capa de Servicios**: Funciones puras en `/client/lib/` que encapsulan las llamadas a Supabase
- **Backend-as-a-Service**: Supabase proporciona base de datos PostgreSQL, autenticacion y API REST automatica
- **Enrutamiento**: React Router v6 con rutas declarativas para navegacion SPA

### Flujo de Datos

1. Los componentes de pagina solicitan datos a traves de hooks de React Query
2. React Query verifica el cache antes de hacer peticiones a la capa de servicios
3. La capa de servicios ejecuta operaciones CRUD contra Supabase
4. Supabase aplica politicas RLS y retorna los datos
5. React Query actualiza el cache y los componentes se re-renderizan

## Descripcion General

VeterinariaFinal es una aplicacion de una sola pagina (SPA) desarrollada con React y TypeScript que proporciona una solucion completa para la gestion de inventario de accesorios veterinarios. La aplicacion incluye funcionalidades para:

- Gestion completa de productos (crear, editar, eliminar)
- Control de inventario con indicadores visuales de stock
- Agregar stock a productos existentes
- Punto de venta con carrito de compras
- Historial de ventas
- Generacion de facturas en PDF
- Busqueda y filtrado de productos

## Tecnologias Utilizadas

### Frontend
- **React 18.3** - Biblioteca principal para la interfaz de usuario
- **TypeScript 5.7** - Tipado estatico para mayor seguridad del codigo
- **React Router 6** - Navegacion entre paginas
- **Tailwind CSS 3.4** - Framework de estilos utilitarios
- **Radix UI** - Componentes accesibles y personalizables
- **Lucide React** - Iconos vectoriales
- **React Query (TanStack Query 5)** - Gestion de estado del servidor y cache
- **React Hook Form** - Manejo de formularios

### Backend
- **Supabase** - Base de datos PostgreSQL y autenticacion

### Herramientas de Desarrollo
- **Vite 6** - Bundler y servidor de desarrollo rapido
- **PostCSS** - Procesamiento de CSS
- **Autoprefixer** - Compatibilidad entre navegadores

### Generacion de Documentos
- **jsPDF 3** - Generacion de facturas en formato PDF

## Estructura del Proyecto

```
/
├── client/                    # Aplicacion frontend
│   ├── components/           # Componentes reutilizables
│   │   ├── ui/              # Componentes base de Radix UI
│   │   ├── AccessoryForm.tsx # Formulario de accesorios
│   │   ├── SalesForm.tsx    # Formulario de ventas
│   │   └── Invoice.tsx      # Componente de factura
│   ├── pages/               # Paginas de la aplicacion
│   │   ├── Dashboard.tsx    # Panel principal
│   │   ├── Accessories.tsx  # Gestion de accesorios
│   │   ├── AccessoryDetail.tsx # Detalle de accesorio
│   │   ├── Sales.tsx        # Punto de venta
│   │   └── SalesHistory.tsx # Historial de ventas
│   ├── lib/                 # Servicios y utilidades
│   │   ├── supabaseClient.ts # Conexion a Supabase
│   │   ├── accessories.ts   # Operaciones de accesorios
│   │   ├── sales.ts         # Operaciones de ventas
│   │   └── utils.ts         # Funciones utilitarias
│   ├── hooks/               # Hooks personalizados
│   ├── App.tsx              # Componente principal con rutas
│   └── global.css           # Estilos globales
├── shared/                   # Tipos compartidos
├── SUPABASE_SETUP.sql        # Schema de la tabla accesorios
├── SUPABASE_SALES_SETUP.sql  # Schema de las tablas de ventas
└── package.json              # Dependencias del proyecto
```

## Funcionalidades

### Panel de Control (Dashboard)

El panel principal muestra un resumen del inventario:
- Total de productos activos
- Valor total del inventario en COP
- Cantidad de productos con stock bajo (menos de 5 unidades)
- Numero de categorias de productos
- Lista de los 5 productos mas recientes

### Gestion de Accesorios

Permite administrar el catalogo completo de productos:
- **Crear** nuevos accesorios con nombre, tipo, precio y stock inicial
- **Editar** informacion de accesorios existentes
- **Agregar stock** a productos mediante un modal dedicado
- **Eliminar** productos (eliminacion logica)
- **Buscar** por nombre o tipo de producto
- **Filtrar** por categoria

Los tipos de productos disponibles incluyen: Correa, Bozal, Comedero, Bebedero, Juguete, Cama, Collar, Vacuna, Medicamento, Cuidado y Otro.

### Indicadores de Stock

El sistema utiliza colores para indicar el nivel de stock:
- **Verde**: Stock alto (20 o mas unidades)
- **Amarillo**: Stock medio (entre 5 y 19 unidades)
- **Naranja**: Stock bajo (menos de 5 unidades)

### Punto de Venta

El modulo de ventas permite:
- Ingresar nombre del cliente
- Buscar y agregar productos al carrito
- Especificar cantidad por producto
- Validar disponibilidad de stock
- Confirmar la venta (reduce automaticamente el stock)

### Historial de Ventas

Registro completo de todas las ventas realizadas con:
- Numero de factura
- Nombre del cliente
- Cantidad de productos
- Monto total
- Fecha y hora de la venta

### Generacion de Facturas

Cada venta genera una factura que puede ser:
- Visualizada en pantalla
- Impresa directamente
- Descargada como archivo PDF

Las facturas incluyen:
- Encabezado con nombre del negocio
- Numero de factura y fecha
- Datos del cliente
- Lista detallada de productos con precios
- Subtotal y total

## Rutas de la Aplicacion

| Ruta | Descripcion |
|------|-------------|
| `/` | Panel de control principal |
| `/accessories` | Lista y gestion de accesorios |
| `/accessory/:id` | Detalle de un accesorio especifico |
| `/sales` | Formulario de punto de venta |
| `/sales-history` | Historial de ventas realizadas |

## Base de Datos

La aplicacion utiliza Supabase como backend con las siguientes tablas:

### Tabla `accesorios`
- `id` - Identificador unico (formato: ACC001, ACC002, etc.)
- `nombre` - Nombre del producto
- `tipo` - Categoria del producto
- `precio` - Precio en COP
- `stock` - Cantidad disponible
- `activo` - Estado del producto (activo/inactivo)
- `fecha_creacion` - Fecha de creacion
- `fecha_actualizacion` - Fecha de ultima actualizacion

### Tabla `ventas`
- `id` - Identificador de la venta (formato: VTA + timestamp)
- `cliente` - Nombre del cliente
- `precio_total` - Monto total de la venta
- `fecha_venta` - Fecha y hora de la venta
- `activo` - Estado de la venta

### Tabla `venta_items`
- `id` - Identificador del item
- `venta_id` - Referencia a la venta
- `accesorio_id` - Referencia al accesorio
- `cantidad` - Cantidad vendida
- `precio_unitario` - Precio al momento de la venta
- `subtotal` - Total del item

## Instalacion

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Configurar las variables de entorno de Supabase
4. Ejecutar los scripts SQL en Supabase para crear las tablas
5. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Genera la version de produccion
- `npm run preview` - Previsualiza la version de produccion

## Configuracion de Supabase

Para configurar la base de datos, ejecutar los siguientes archivos SQL en el orden indicado:

1. `SUPABASE_SETUP.sql` - Crea la tabla de accesorios con indices y politicas RLS
2. `SUPABASE_SALES_SETUP.sql` - Crea las tablas de ventas y sus relaciones

## Licencia

Este proyecto es de uso privado.
