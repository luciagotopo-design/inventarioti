# 🖥️ Sistema de Inventario TI

Sistema profesional de gestión de inventario tecnológico desarrollado con Next.js, TypeScript, Tailwind CSS, Prisma y MongoDB.

## 📋 Características Principales

### 🎯 Funcionalidades Clave

- **Dashboard Ejecutivo**: KPIs en tiempo real, gráficos de distribución por sede, categoría y estado
- **Inventario General**: CRUD completo de equipos con búsqueda avanzada y filtros
- **Equipos Críticos**: Gestión de equipos que requieren atención prioritaria con sistema de semáforo
- **Plan de Mantenimiento**: Programación y seguimiento de mantenimientos preventivos y correctivos

### 🏗️ Arquitectura Técnica

- **Framework**: Next.js 16 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS 4
- **Base de Datos**: MongoDB
- **ORM**: Prisma
- **UI**: Componentes reutilizables personalizados

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+ 
- MongoDB (local o MongoDB Atlas)
- npm o yarn

### Paso 1: Clonar e Instalar Dependencias

```bash
# Instalar dependencias
npm install

# Dependencias adicionales si es necesario:
npm install @prisma/client prisma mongodb date-fns tsx
```

### Paso 2: Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# MongoDB Connection String
DATABASE_URL="mongodb+srv://usuario:password@cluster.mongodb.net/inventarioti?retryWrites=true&w=majority"

# Para MongoDB local:
# DATABASE_URL="mongodb://localhost:27017/inventarioti"

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Paso 3: Generar Cliente de Prisma

```bash
npx prisma generate
```

### Paso 4: Poblar Datos Maestros (Seed)

```bash
npx tsx prisma/seed.ts
```

Este comando creará:
- 9 Categorías (Computador Portátil, Desktop, Monitor, etc.)
- 6 Estados (Operativo, Dañado, En Mantenimiento, etc.)
- 5 Sedes (Sede Principal, Sede Norte, Medellín, Cali, Barranquilla)
- 3 Niveles de Prioridad (Alta, Media, Baja)
- 7 Acciones de Mantenimiento

### Paso 5: Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
inventarioti/
├── app/
│   ├── api/                      # API Routes
│   │   ├── dashboard/            # Estadísticas del dashboard
│   │   ├── inventario/           # CRUD de equipos
│   │   ├── equipos-criticos/     # Gestión de críticos
│   │   ├── plan-mantenimiento/   # Planes de mantenimiento
│   │   └── maestros/             # Datos maestros
│   ├── dashboard/                # Página Dashboard
│   ├── inventario/               # Página Inventario
│   ├── equipos-criticos/         # Página Equipos Críticos
│   ├── plan-mantenimiento/       # Página Plan Mantenimiento
│   ├── layout.tsx                # Layout principal
│   └── page.tsx                  # Página de inicio
├── components/
│   ├── ui/                       # Componentes reutilizables
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Table.tsx
│   │   ├── Modal.tsx
│   │   ├── Textarea.tsx
│   │   └── KPICard.tsx
│   └── layout/
│       └── Sidebar.tsx           # Navegación lateral
├── lib/
│   ├── prisma.ts                 # Cliente de Prisma
│   └── utils.ts                  # Utilidades compartidas
├── prisma/
│   ├── schema.prisma             # Modelo de datos
│   └── seed.ts                   # Script de seed
├── types/
│   └── index.ts                  # Tipos de TypeScript
└── .env.example                  # Ejemplo de variables de entorno
```

## 🗃️ Modelo de Datos

### Entidades Maestras
- **Categoria**: Tipos de equipos (Laptop, Desktop, Monitor, etc.)
- **Estado**: Estados operativos (Operativo, Dañado, Faltante, etc.)
- **Sede**: Ubicaciones físicas
- **Prioridad**: Niveles de urgencia (Alta, Media, Baja)
- **AccionMantenimiento**: Tipos de mantenimiento

### Entidades Principales
- **InventarioGeneral**: Tabla principal de equipos
- **EquipoCritico**: Equipos que requieren atención prioritaria
- **PlanMantenimiento**: Programación de mantenimientos

### Relaciones
- InventarioGeneral → EquipoCritico (1 a 1)
- InventarioGeneral → PlanMantenimiento (1 a muchos)

## 🎨 Guía de Uso

### Dashboard
- Visualiza KPIs principales: total de equipos, porcentaje operativo, equipos críticos
- Gráficos de distribución por sede, categoría y estado
- Indicadores visuales con código de colores

### Inventario General
- **Crear**: Botón "+ Nuevo Equipo"
- **Buscar**: Campo de búsqueda por serial, marca o responsable
- **Filtrar**: Por sede, estado y categoría
- **Editar/Eliminar**: Botones de acción en cada fila

### Equipos Críticos
- Se muestran equipos con estados problemáticos o marcados manualmente
- Sistema de semáforo por prioridad (Alto=Rojo, Medio=Amarillo, Bajo=Verde)
- Alertas de fecha límite
- Resolución con notas

### Plan de Mantenimiento
- Programar mantenimientos por equipo
- Seguimiento de estados: Pendiente, En Proceso, Completado, Cancelado
- Control de presupuesto vs costo real
- Historial completo por equipo

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Ejecutar producción
npm start

# Linter
npm run lint

# Generar cliente Prisma
npx prisma generate

# Ver base de datos en Prisma Studio
npx prisma studio

# Ejecutar seed
npx tsx prisma/seed.ts
```

## 🌐 Despliegue en Producción

### Opción 1: Vercel (Recomendado)

1. Crea una cuenta en [Vercel](https://vercel.com)
2. Conecta tu repositorio de GitHub
3. Configura las variables de entorno en Vercel:
   - `DATABASE_URL`: Tu URL de MongoDB Atlas
4. Vercel detectará automáticamente Next.js y desplegará

### Opción 2: MongoDB Atlas

1. Crea un cluster gratuito en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Configura acceso de red (Allow from anywhere para desarrollo)
3. Crea un usuario de base de datos
4. Obtén la connection string y actualiza `.env`

### Configuración Post-Despliegue

```bash
# En el servidor o después del despliegue
npx prisma generate
npx tsx prisma/seed.ts
```

## 📊 Características Avanzadas

### Validaciones
- Serial único por equipo
- Campos requeridos marcados con *
- Validación de fechas
- Control de duplicados

### Seguridad
- Confirmación antes de eliminar
- Validación de datos en backend
- Manejo de errores centralizado

### Performance
- Paginación en listados
- Consultas optimizadas con Prisma
- Carga asíncrona de datos
- Componentes optimizados

## 🛠️ Solución de Problemas

### Error: "Cannot find module '@prisma/client'"
```bash
npx prisma generate
```

### Error de conexión a MongoDB
- Verifica que la URL en `.env` sea correcta
- Revisa que MongoDB esté ejecutándose
- Verifica las credenciales de acceso

### Los datos maestros no aparecen
```bash
npx tsx prisma/seed.ts
```

## 📝 Roadmap Futuro

- [ ] Exportación a Excel/PDF
- [ ] Carga masiva de equipos (CSV)
- [ ] Historial de cambios (Audit log)
- [ ] Notificaciones por email
- [ ] Módulo de reportes avanzados
- [ ] Integración con códigos QR
- [ ] Módulo de garantías y proveedores
- [ ] App móvil con React Native

## 👥 Contribución

Este es un proyecto de demostración. Para contribuir:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la Licencia MIT.

## 📞 Soporte

Para preguntas o soporte:
- Abre un issue en GitHub
- Revisa la documentación de [Next.js](https://nextjs.org/docs)
- Consulta la documentación de [Prisma](https://www.prisma.io/docs)

---

**Desarrollado con ❤️ usando Next.js, TypeScript y Prisma**


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
