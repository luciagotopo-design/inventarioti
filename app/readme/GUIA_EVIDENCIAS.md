# 📋 Guía de Configuración y Uso del Sistema de Evidencias

## ✅ Completado

### 1. Backend y Storage
- ✅ Bucket `equipos-criticos` creado en Supabase Storage
- ✅ Configurado para 50MB por archivo
- ✅ Soporta: JPG, PNG, WEBP, HEIC, MP4, MOV, WEBM
- ✅ API de inventario actualizada para manejar imágenes
- ✅ API de sincronización copia imágenes automáticamente
- ✅ Servicio de storage con compresión automática

### 2. Frontend
- ✅ Modal de detalles completos del equipo
- ✅ Componente FileUpload con soporte de cámara
- ✅ Página de inventario con upload de imágenes
- ✅ Página de equipos críticos con evidencias
- ✅ Visualización de imágenes y videos
- ✅ Diseño responsive completo

## ⚠️ Configuración Requerida

### Paso 1: Configurar Políticas RLS en Supabase

Las políticas de Row Level Security (RLS) deben configurarse manualmente desde el Dashboard de Supabase:

1. **Accede a Supabase Dashboard**
   - Ve a: https://supabase.com/dashboard
   - Selecciona tu proyecto: `tuutoltyoczulqywmjmj`

2. **Navega a Storage**
   - Click en "Storage" en el menú lateral
   - Selecciona el bucket `equipos-criticos`
   - Click en la pestaña "Policies"

3. **Crear 4 Políticas RLS**

   **Política 1: INSERT (Subir archivos)**
   ```
   Nombre: Permitir subir archivos a usuarios autenticados
   Acción: INSERT
   Target roles: authenticated
   WITH CHECK expression: bucket_id = 'equipos-criticos'
   ```

   **Política 2: SELECT (Ver archivos)**
   ```
   Nombre: Permitir ver archivos públicamente
   Acción: SELECT
   Target roles: public
   USING expression: bucket_id = 'equipos-criticos'
   ```

   **Política 3: UPDATE (Actualizar archivos)**
   ```
   Nombre: Permitir actualizar archivos a usuarios autenticados
   Acción: UPDATE
   Target roles: authenticated
   USING expression: bucket_id = 'equipos-criticos'
   WITH CHECK expression: bucket_id = 'equipos-criticos'
   ```

   **Política 4: DELETE (Eliminar archivos)**
   ```
   Nombre: Permitir eliminar archivos a usuarios autenticados
   Acción: DELETE
   Target roles: authenticated
   USING expression: bucket_id = 'equipos-criticos'
   ```

### Paso 2: Ejecutar Script SQL (Opcional)

Si prefieres usar SQL, ejecuta el archivo: `supabase/configure-storage-policies.sql`

```powershell
# En el SQL Editor de Supabase, pega el contenido del archivo
```

### Paso 3: Reiniciar el Servidor

```powershell
# Detener servidor actual (Ctrl+C si está corriendo)

# Reiniciar
npm run dev
```

## 🎯 Cómo Usar

### Desde Inventario

1. **Crear/Editar Equipo**
   - Click en "Nuevo Equipo" o "Editar" en un equipo existente
   - Llena los datos del equipo
   - En la sección "Imágenes y Videos del Equipo":
     - Arrastra archivos o haz click para seleccionar
     - O usa el botón de cámara para tomar fotos (móvil)
   - Click en "Crear" o "Actualizar"

2. **Ver Detalles de un Equipo**
   - Click en el botón "👁️ Ver" en cualquier equipo
   - Se abrirá un modal con toda la información
   - Las imágenes se muestran en una galería
   - Click en una imagen para verla en tamaño completo

### Desde Equipos Críticos

1. **Ver Detalles**
   - Click en "👁️ Ver Detalles" en cualquier equipo crítico
   - Muestra toda la información del equipo
   - Incluye las imágenes del inventario

2. **Agregar Evidencias**
   - Click en "Agregar Evidencia"
   - Agrega descripción (opcional)
   - Sube imágenes/videos del problema
   - Las evidencias se agregan al equipo crítico

3. **Sincronización Automática**
   - Al sincronizar equipos críticos, las imágenes del inventario se copian automáticamente
   - Los equipos críticos mantienen sus propias evidencias

## 📱 Uso Móvil

### Captura con Cámara
- En móvil, el botón de cámara abrirá la cámara del dispositivo
- Toma fotos directamente o graba videos
- Las imágenes se comprimen automáticamente a 1920px

### Tipos de Archivo Soportados
- **Imágenes**: JPG, PNG, WEBP, HEIC (iPhone)
- **Videos**: MP4, MOV (iPhone), WEBM
- **Límite**: 50MB por archivo, máximo 10 archivos por vez

## 🔧 Verificación

### 1. Verificar Bucket
```powershell
npx tsx scripts/setup-storage.ts
```

Deberías ver:
```
✅ Bucket encontrado: equipos-criticos
✅ Formato de URL pública: https://...
```

### 2. Probar Upload desde la App
1. Ve a Inventario
2. Crea un nuevo equipo
3. Sube una imagen de prueba
4. Si funciona, verás la imagen en el modal de detalles

### 3. Verificar Sincronización
1. Marca el equipo como crítico
2. Ve a Equipos Críticos
3. Click en "Sincronizar Equipos Críticos"
4. Verifica que el equipo apareció con sus imágenes

## ❌ Solución de Problemas

### Error: "No se pudo subir ningún archivo"

**Causa**: Políticas RLS no configuradas

**Solución**:
1. Ve a Supabase Dashboard → Storage → equipos-criticos → Policies
2. Verifica que las 4 políticas estén creadas
3. Si no existen, créalas según el Paso 1

### Error: "StorageApiError: mime type not supported"

**Causa**: Tipo de archivo no permitido

**Solución**:
- Solo usa JPG, PNG, WEBP, HEIC, MP4, MOV, WEBM
- Verifica la extensión del archivo

### Error: "File size exceeds limit"

**Causa**: Archivo mayor a 50MB

**Solución**:
- Reduce el tamaño del archivo
- Para videos, considera usar menor calidad o duración

### Las imágenes no se muestran

**Causa**: Política SELECT no configurada o bucket no público

**Solución**:
1. Verifica política SELECT con target role "public"
2. Confirma que el bucket sea público:
   ```sql
   UPDATE storage.buckets 
   SET public = true 
   WHERE id = 'equipos-criticos';
   ```

### La cámara no funciona en móvil

**Causa**: Navegador no tiene permisos o app no usa HTTPS

**Solución**:
- Asegúrate de usar HTTPS (en producción)
- En desarrollo, usa localhost (funciona sin HTTPS)
- Verifica permisos del navegador para cámara

## 📊 Estructura de Archivos en Storage

```
equipos-criticos/
├── {serial-equipo}/
│   ├── {timestamp}-{random}.jpg
│   ├── {timestamp}-{random}.png
│   ├── {timestamp}-{random}.mp4
│   └── ...
└── {otro-serial}/
    └── ...
```

## 🔄 Flujo de Sincronización

```
1. Usuario crea equipo en Inventario
   └─> Sube 3 imágenes
   
2. Usuario marca equipo como crítico
   
3. Sistema sincroniza automáticamente
   └─> Copia las 3 imágenes a Equipos Críticos
   
4. Usuario agrega 2 evidencias más en Equipos Críticos
   └─> Ahora el equipo crítico tiene 5 imágenes
   
5. Las 3 originales siguen en Inventario
   Las 5 están en Equipos Críticos
```

## 🎉 Funcionalidades Implementadas

### Modal de Detalles
- ✅ Ver toda la información del equipo
- ✅ Galería de imágenes/videos
- ✅ Click en imagen para verla en grande
- ✅ Detección automática de videos
- ✅ Responsive (móvil y escritorio)

### Upload de Archivos
- ✅ Drag & drop
- ✅ Selección múltiple (hasta 10)
- ✅ Captura con cámara (móvil)
- ✅ Preview antes de subir
- ✅ Compresión automática de imágenes
- ✅ Validación de tipo y tamaño
- ✅ Barra de progreso visual

### Integración
- ✅ Inventario: Upload al crear/editar
- ✅ Equipos Críticos: Evidencias adicionales
- ✅ Sincronización automática de imágenes
- ✅ API actualizada para manejar arrays de URLs
- ✅ Base de datos con campo imagenes: String[]

## 📝 Próximos Pasos

1. ✅ **Configurar políticas RLS** (Manual en Dashboard)
2. ✅ Reiniciar servidor
3. ✅ Probar upload desde navegador
4. ✅ Probar upload desde móvil
5. ✅ Verificar sincronización
6. ✅ Probar modal de detalles

---

**¡Listo para usar!** 🚀

Si tienes algún problema, revisa la sección de "Solución de Problemas" o verifica los logs del servidor.
