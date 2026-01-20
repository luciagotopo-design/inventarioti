## 📸 Sistema de Carga de Evidencias para Equipos Críticos

Sistema completo para subir imágenes y videos desde móvil o escritorio con almacenamiento en Supabase Storage.

---

## 🚀 Configuración Inicial

### 1. Crear el Bucket en Supabase

1. Ve a tu proyecto de Supabase: https://supabase.com/dashboard
2. Click en **Storage** en el menú lateral
3. Ve a **SQL Editor**
4. Copia y pega el contenido de `supabase/create-storage-bucket.sql`
5. Click en **Run** para ejecutar el script

Esto creará:
- ✅ Bucket `equipos-criticos` con límite de 50MB por archivo
- ✅ Políticas de seguridad (RLS) para permitir subida autenticada
- ✅ Acceso público para ver imágenes
- ✅ Soporte para: JPG, PNG, WEBP, HEIC, MP4, MOV, WEBM

### 2. Verificar Variables de Entorno

El archivo `.env.local` ya está configurado con:

```env
NEXT_PUBLIC_SUPABASE_STORAGE_ENDPOINT=https://tuutoltyoczulqywmjmj.storage.supabase.co/storage/v1/s3
NEXT_PUBLIC_SUPABASE_STORAGE_REGION=us-east-2
SUPABASE_STORAGE_ACCESS_KEY=e377412c9e63996a69737c97afe92105
SUPABASE_STORAGE_SECRET_KEY=44f57bae94463e2b313bbe806cf2a475febab96d77468e50e6d2a8d7c81755e9
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=equipos-criticos
```

### 3. Reiniciar el Servidor

```bash
# Detener el servidor actual (Ctrl+C)
npm run dev
```

---

## 📱 Cómo Usar

### Desde Móvil

1. **Ir a Equipos Críticos**
   - Abre la app en tu móvil
   - Click en el menú hamburguesa (☰)
   - Selecciona "Equipos Críticos"

2. **Seleccionar un Equipo**
   - Busca el equipo que quieres documentar
   - Click en **"Agregar Evidencia"**

3. **Tomar Fotos/Videos**
   - Click en **"Tomar foto/video"**
   - Permitir acceso a la cámara
   - Toma foto o graba video del problema
   - Puedes agregar hasta **10 archivos**

4. **Subir Evidencias**
   - Agrega una descripción (opcional)
   - Click en **"Subir Evidencias"**
   - ¡Listo! Las imágenes se guardan en la nube

### Desde Escritorio

1. **Ir a Equipos Críticos**
   - Navega a `/equipos-criticos`
   - Click en **"Agregar Evidencia"** en cualquier equipo

2. **Seleccionar Archivos**
   - Click en **"Seleccionar archivos"**
   - Elige imágenes/videos desde tu computadora
   - O arrastra y suelta archivos

3. **Subir**
   - Agrega descripción (opcional)
   - Click en **"Subir Evidencias"**

---

## 🎯 Características

### ✅ Soporte de Archivos

**Imágenes:**
- JPG/JPEG
- PNG
- WEBP
- HEIC (iPhone)

**Videos:**
- MP4
- MOV (iPhone)
- WEBM

**Límites:**
- Máximo **50MB por archivo**
- Hasta **10 archivos por carga**

### ✅ Funcionalidades

1. **Captura desde Cámara**
   - Acceso directo a cámara del móvil
   - Modo selfie y cámara trasera
   - Grabación de video

2. **Vista Previa**
   - Ver archivos antes de subir
   - Eliminar archivos individuales
   - Ver tamaño de cada archivo

3. **Compresión Automática**
   - Imágenes se redimensionan a máx 1920px
   - Calidad optimizada (80%)
   - Reduce tiempo de carga

4. **Drag & Drop**
   - Arrastra archivos al área de carga
   - Solo en navegadores de escritorio

5. **Galería de Evidencias**
   - Ver todas las evidencias de un equipo
   - Click para ver en tamaño completo
   - Diferencia entre imágenes y videos

---

## 📂 Estructura de Archivos

```
supabase/equipos-criticos/
  ├── [equipo-id]/
  │   ├── 1737012345-abc123.jpg
  │   ├── 1737012346-def456.jpg
  │   └── 1737012347-ghi789.mp4
  └── ...
```

Cada equipo crítico tiene su propia carpeta con todas sus evidencias.

---

## 🔧 Archivos Creados/Modificados

### Nuevos Archivos

1. **`lib/storage.ts`** - Servicio de almacenamiento
   - `uploadFile()` - Sube un archivo
   - `uploadMultipleFiles()` - Sube múltiples archivos
   - `deleteFile()` - Elimina un archivo
   - `compressImage()` - Comprime imágenes
   - `getPublicUrl()` - Obtiene URL pública

2. **`components/ui/FileUpload.tsx`** - Componente de carga
   - Drag & drop
   - Vista previa
   - Soporte de cámara
   - Responsive

3. **`supabase/create-storage-bucket.sql`** - Script SQL
   - Crea bucket
   - Configura políticas RLS
   - Permisos de acceso

### Archivos Modificados

1. **`app/(protected)/equipos-criticos/page.tsx`**
   - Botón "Agregar Evidencia"
   - Modal de carga
   - Galería de evidencias
   - Función `handleUploadEvidence()`

2. **`.env.local`**
   - Variables de Storage S3
   - Access keys
   - Configuración del bucket

---

## 🔐 Seguridad

- ✅ **Autenticación**: Solo usuarios autenticados pueden subir
- ✅ **Validación**: Solo tipos de archivo permitidos
- ✅ **Tamaño**: Límite de 50MB por archivo
- ✅ **Bucket Público**: Imágenes accesibles vía URL
- ✅ **RLS**: Políticas de Row Level Security activas

---

## 📊 Flujo de Trabajo

```
Usuario → Selecciona Equipo → Click "Agregar Evidencia"
    ↓
Toma Fotos/Videos o Selecciona Archivos
    ↓
Vista Previa y Descripción
    ↓
Click "Subir Evidencias"
    ↓
Compresión Automática (imágenes)
    ↓
Upload a Supabase Storage
    ↓
Actualizar Equipo Crítico en DB
    ↓
Mostrar en Galería de Evidencias
```

---

## 🐛 Solución de Problemas

### El bucket no existe
- Ejecuta `supabase/create-storage-bucket.sql` en Supabase SQL Editor

### Error al subir archivos
- Verifica que las variables de entorno estén correctas
- Revisa las políticas RLS en Supabase Storage
- Checa que el archivo no exceda 50MB

### No se ven las imágenes
- Verifica que el bucket sea público
- Revisa la consola del navegador para errores
- Confirma que la URL tenga el formato correcto

### La cámara no funciona en móvil
- Permitir acceso a la cámara en el navegador
- Usar HTTPS (requerido para acceso a cámara)
- Verificar permisos del dispositivo

---

## ✅ Checklist de Implementación

- [x] Variables de entorno configuradas
- [ ] Script SQL ejecutado en Supabase
- [ ] Bucket `equipos-criticos` creado
- [ ] Políticas RLS activas
- [ ] Servidor reiniciado con `npm run dev`
- [ ] Probar desde móvil
- [ ] Probar desde desktop
- [ ] Verificar que las imágenes se vean

---

## 🎉 ¡Todo Listo!

Ahora puedes documentar problemas con imágenes y videos directamente desde tu móvil. Las evidencias se guardan automáticamente en Supabase Storage y se vinculan al equipo crítico correspondiente.
