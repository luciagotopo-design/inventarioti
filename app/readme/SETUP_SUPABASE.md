# 🚀 Configuración de Supabase - Guía de Instalación

## ✅ Migración completada de MongoDB → Supabase PostgreSQL

Todos los endpoints de API han sido migrados a Supabase. El frontend ahora está conectado correctamente.

---

## 📋 Pasos para ejecutar (EN ESTE ORDEN)

### 1️⃣ Ejecutar Schema SQL (Crear Tablas)

1. Abre tu proyecto Supabase: https://tuutoltyoczulqywmjmj.supabase.co
2. Click en **SQL Editor** en el menú izquierdo
3. Click en **New query**
4. Abre el archivo `supabase/schema.sql`
5. **Copia TODO el contenido** y pégalo en el editor
6. Click en **Run** (▶️)
7. Deberías ver: `Success. No rows returned`

**¿Qué hace este script?**
- Crea 8 tablas: `categorias`, `estados`, `sedes`, `prioridades`, `acciones_mantenimiento`, `inventario_general`, `equipos_criticos`, `plan_mantenimiento`
- Define foreign keys, índices y triggers
- Establece constraint UNIQUE en `serial`

---

### 2️⃣ Ejecutar Seed SQL (Datos Maestros)

1. En el mismo **SQL Editor**
2. Click en **New query**
3. Abre el archivo `supabase/seed.sql`
4. **Copia TODO el contenido** y pégalo
5. Click en **Run** (▶️)
6. Deberías ver: `Success. 22 rows affected`

**¿Qué hace este script?**
- Inserta 6 categorías (PC/Portátil, Monitor, Impresora, Drones, UPS, Cables HDMI)
- Inserta 4 estados (Operativo, Dañado, Baja capacidad, En mantenimiento)
- Inserta 3 sedes (Cali, Bogotá, Medellín)
- Inserta 3 prioridades (Alta, Media, Baja)
- Inserta 4 acciones de mantenimiento

---

### 3️⃣ Ejecutar Insert Equipos (32 equipos)

1. En el mismo **SQL Editor**
2. Click en **New query**
3. Abre el archivo `supabase/insert-equipos.sql`
4. **Copia TODO el contenido** y pégalo
5. Click en **Run** (▶️)
6. Deberías ver: `Success. 32 rows affected`

**¿Qué hace este script?**
- Inserta 32 equipos del inventario
- 22 laptops Lenovo V510/X220/SL410
- 1 laptop HP Ultrabook
- 1 laptop Asus Aspire
- 1 Desktop Lenovo
- 1 Monitor Voc
- 1 Impresora Epson
- 1 UPS Unitec
- 13 Cables HDMI
- 4 Drones (DJI Mavic Air 2, Mini SE, etc.)

---

### 4️⃣ Verificar Datos

1. Click en **Table Editor** en el menú izquierdo
2. Deberías ver las 8 tablas creadas
3. Click en **inventario_general** → deberías ver 32 filas
4. Click en **categorias** → deberías ver 6 filas
5. Click en **estados** → deberías ver 4 filas
6. Click en **sedes** → deberías ver 3 filas

---

### 5️⃣ Ejecutar la Aplicación

```powershell
npm run dev
```

Abre http://localhost:3000

**Verifica:**
- ✅ Dashboard carga KPIs correctamente
- ✅ Inventario muestra 32 equipos
- ✅ Filtros funcionan (Sede, Estado, Categoría)
- ✅ Búsqueda funciona
- ✅ Puedes crear/editar/eliminar equipos
- ✅ Importación de Excel funciona

---

## 📊 Resumen de Migración

### ✅ Completado

- [x] Instalado `@supabase/supabase-js`
- [x] Configurado cliente Supabase en `lib/supabase.ts`
- [x] Migrado esquema Prisma → PostgreSQL
- [x] Creado `schema.sql` (8 tablas)
- [x] Creado `seed.sql` (datos maestros)
- [x] Creado `insert-equipos.sql` (32 equipos)
- [x] Migrado **API /api/inventario** (GET, POST)
- [x] Migrado **API /api/inventario/[id]** (GET, PUT, DELETE)
- [x] Migrado **API /api/inventario/import** (Excel upload)
- [x] Migrado **API /api/dashboard** (KPIs y gráficos)
- [x] Migrado **API /api/maestros** (categorías, estados, sedes)
- [x] Agregado mapeo automático snake_case → camelCase
- [x] Frontend actualizado y conectado

### 🗑️ Para Limpiar (Opcional)

Después de verificar que todo funciona:

```powershell
# Desinstalar Prisma
npm uninstall prisma @prisma/client

# Eliminar carpeta prisma
Remove-Item -Recurse -Force prisma

# Eliminar archivo prisma
Remove-Item lib/prisma.ts -Force
```

---

## 🔧 Solución de Problemas

### Error: "relation does not exist"
**Causa:** No ejecutaste `schema.sql`  
**Solución:** Ve al paso 1️⃣ y ejecuta el schema

### Error: "violates foreign key constraint"
**Causa:** No ejecutaste `seed.sql` antes de `insert-equipos.sql`  
**Solución:** Ejecuta en orden: schema.sql → seed.sql → insert-equipos.sql

### Dashboard muestra 0 equipos
**Causa:** No ejecutaste `insert-equipos.sql`  
**Solución:** Ve al paso 3️⃣

### Error: "Cannot read properties of null"
**Causa:** Las tablas no tienen datos maestros  
**Solución:** Ejecuta `seed.sql` nuevamente

---

## 📝 Notas Técnicas

### Mapeo de Campos

Supabase usa **snake_case**, frontend usa **camelCase**:

| Supabase (PostgreSQL)  | Frontend (TypeScript) |
|------------------------|----------------------|
| `categoria_id`         | `categoriaId`        |
| `estado_id`            | `estadoId`           |
| `sede_id`              | `sedeId`             |
| `ubicacion_detallada`  | `ubicacionDetallada` |
| `es_critico`           | `esCritico`          |
| `fecha_registro`       | `fechaRegistro`      |

La función `mapSupabaseToFrontend()` en `lib/utils.ts` hace la conversión automática.

### Ventajas de Supabase vs MongoDB

✅ **Relaciones reales** con foreign keys  
✅ **Transacciones ACID** garantizadas  
✅ **Mejor rendimiento** en queries complejos  
✅ **Interfaz visual** para ver/editar datos  
✅ **SQL estándar** más fácil de debuggear  
✅ **Sin problemas de replica set** como MongoDB Atlas  

---

## 🎉 ¡Listo!

Tu aplicación ahora usa Supabase PostgreSQL con 32 equipos pre-cargados.

**Siguiente paso:** Ejecuta los 3 scripts SQL en orden y luego `npm run dev`
