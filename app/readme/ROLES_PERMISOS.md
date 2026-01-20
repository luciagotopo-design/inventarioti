# Sistema de Roles y Permisos

## Descripción General

El sistema de roles permite gestionar diferentes niveles de acceso para los usuarios del inventario TI.

## Estructura de la Base de Datos

### Tabla `roles`
```sql
- id: UUID (Primary Key)
- nombre: VARCHAR(50) UNIQUE
- descripcion: TEXT
- permisos: JSONB
- activo: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Tabla `usuarios`
```sql
- id: UUID (Primary Key)
- clerk_user_id: VARCHAR (Referencia a Clerk)
- email: VARCHAR
- nombre: VARCHAR
- rol_id: UUID (FK → roles.id)
- activo: BOOLEAN
- ultimo_acceso: TIMESTAMP
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## Roles Predeterminados

### 1. Super Admin
- **Descripción**: Acceso completo al sistema
- **Permisos**: `{"all": true}`
- **Funciones**:
  - Gestión completa de usuarios y roles
  - Configuración del sistema
  - Acceso a todas las funcionalidades

### 2. Administrador
- **Descripción**: Gestión de inventario y usuarios
- **Permisos**: `{"usuarios": true, "inventario": true, "reportes": true, "mantenimiento": true}`
- **Funciones**:
  - Crear/editar/eliminar equipos
  - Gestionar usuarios
  - Generar reportes
  - Planificar mantenimientos

### 3. Técnico
- **Descripción**: Gestión de mantenimiento y equipos
- **Permisos**: `{"inventario": true, "mantenimiento": true, "reportes": false}`
- **Funciones**:
  - Ver y editar inventario
  - Gestionar planes de mantenimiento
  - No puede gestionar usuarios ni generar reportes

### 4. Consulta
- **Descripción**: Solo lectura
- **Permisos**: `{"inventario": false, "mantenimiento": false, "reportes": true}`
- **Funciones**:
  - Ver inventario (sin editar)
  - Ver planes de mantenimiento (sin editar)
  - Generar reportes de consulta

## Permisos Disponibles

Los permisos se almacenan en formato JSON:

```json
{
  "usuarios": true|false,
  "inventario": true|false,
  "mantenimiento": true|false,
  "reportes": true|false,
  "configuracion": true|false
}
```

## Uso del Sistema

### Administración de Roles

1. **Acceder a la página**: `/admin/roles`
2. **Crear Rol**:
   - Click en "Nuevo Rol"
   - Ingresar nombre y descripción
   - Seleccionar permisos
   - Guardar

3. **Editar Rol**:
   - Click en "Editar" en la tarjeta del rol
   - Modificar datos
   - Actualizar

4. **Eliminar Rol**:
   - Solo si no hay usuarios asignados
   - Click en "Eliminar"
   - Confirmar acción

### Administración de Usuarios

1. **Acceder a la página**: `/admin/usuarios`
2. **Ver Usuarios**: Lista completa con roles asignados
3. **Cambiar Rol**:
   - Click en "Editar" en la fila del usuario
   - Seleccionar nuevo rol
   - Guardar cambios

4. **Activar/Desactivar**:
   - Click en el badge de estado
   - El usuario se activa/desactiva inmediatamente

5. **Eliminar Usuario**:
   - Click en "Eliminar"
   - Confirmar acción
   - Se elimina de Supabase y Clerk

## API Endpoints

### Roles
- `GET /api/roles` - Listar roles
- `POST /api/roles` - Crear rol
- `PUT /api/roles` - Actualizar rol
- `DELETE /api/roles?id=<id>` - Eliminar rol

### Usuarios
- `GET /api/usuarios` - Listar usuarios con roles
- `POST /api/usuarios` - Crear usuario
- `PUT /api/usuarios` - Actualizar usuario (cambiar rol, activar/desactivar)
- `DELETE /api/usuarios?id=<id>&clerkUserId=<clerk_id>` - Eliminar usuario

## Migraciones

Para aplicar el sistema de roles en la base de datos:

```sql
-- Ejecutar en Supabase SQL Editor
\i supabase/migrations/create_roles_system.sql
```

## Consideraciones de Seguridad

1. **RLS (Row Level Security)**: Habilitado en ambas tablas
2. **Políticas**:
   - Solo usuarios autenticados pueden ver roles
   - Solo Super Admin y Administradores pueden modificar roles
3. **Validaciones**:
   - No se puede eliminar un rol con usuarios asignados
   - El rol "Super Admin" debe asignarse manualmente al primer usuario

## Flujo de Asignación de Rol

```
1. Usuario se registra en Clerk
2. Webhook de Clerk notifica al sistema
3. Se crea registro en tabla usuarios
4. Se asigna rol por defecto: "Consulta"
5. Administrador puede cambiar el rol desde /admin/usuarios
```

## Componentes de UI

### Página de Roles
- Ubicación: `app/(protected)/admin/roles/page.tsx`
- Características:
  - Vista de tarjetas con información de cada rol
  - Modal para crear/editar roles
  - Selector de permisos con checkboxes
  - Estadísticas de roles activos/inactivos

### Página de Usuarios
- Ubicación: `app/(protected)/admin/usuarios/page.tsx`
- Características:
  - Tabla con lista de usuarios
  - Indicadores de estado (activo/inactivo)
  - Badges de roles con iconos
  - Modal para editar usuario y cambiar rol
  - Botón para activar/desactivar usuarios

## Roadmap

- [ ] Implementar control de acceso granular en componentes
- [ ] Agregar logs de cambios de roles
- [ ] Notificaciones por email al cambiar rol
- [ ] Dashboard de actividad por rol
- [ ] Permisos a nivel de campo (CRUD específico)
