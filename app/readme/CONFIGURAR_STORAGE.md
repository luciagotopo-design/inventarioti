# 🪣 Guía para Configurar el Bucket de Storage en Supabase

## ✅ Método Rápido (Recomendado)

### Paso 1: Crear el Bucket desde la UI

1. Ve a tu proyecto de Supabase: https://supabase.com/dashboard
2. Click en **Storage** en el menú lateral izquierdo
3. Click en **"New bucket"**
4. Configura el bucket:
   ```
   Name: equipos-criticos
   Public bucket: ✅ (activado)
   File size limit: 50 MB
   Allowed MIME types: (dejar vacío o agregar):
     - image/jpeg
     - image/png
     - image/webp
     - video/mp4
   ```
5. Click en **"Create bucket"**

### Paso 2: Configurar Políticas de Acceso

1. En la página de Storage, click en el bucket **equipos-criticos**
2. Ve a la pestaña **"Policies"**
3. Click en **"New Policy"**

#### Política 1: Permitir Subir Archivos

```
Policy name: Permitir subir archivos
Allowed operation: INSERT
Target roles: authenticated
Policy definition: 
  USING expression: true
  WITH CHECK expression: bucket_id = 'equipos-criticos'
```

Click **"Save policy"**

#### Política 2: Permitir Ver Archivos (Público)

```
Policy name: Permitir ver archivos
Allowed operation: SELECT
Target roles: public, authenticated
Policy definition:
  USING expression: bucket_id = 'equipos-criticos'
```

Click **"Save policy"**

#### Política 3: Permitir Actualizar Archivos

```
Policy name: Permitir actualizar archivos
Allowed operation: UPDATE
Target roles: authenticated
Policy definition:
  USING expression: bucket_id = 'equipos-criticos'
  WITH CHECK expression: bucket_id = 'equipos-criticos'
```

Click **"Save policy"**

#### Política 4: Permitir Eliminar Archivos

```
Policy name: Permitir eliminar archivos
Allowed operation: DELETE
Target roles: authenticated
Policy definition:
  USING expression: bucket_id = 'equipos-criticos'
```

Click **"Save policy"**

---

## 🔧 Método SQL Alternativo (Solo crear bucket)

Si prefieres usar SQL:

1. Ve a **SQL Editor** en Supabase
2. Ejecuta:

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'equipos-criticos',
  'equipos-criticos',
  true,
  52428800,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'video/mp4', 'video/quicktime', 'video/webm']
)
ON CONFLICT (id) DO NOTHING;
```

3. Luego configura las políticas desde la UI (arriba)

---

## ✅ Verificar Configuración

### Desde SQL:

```sql
-- Ver el bucket
SELECT * FROM storage.buckets WHERE id = 'equipos-criticos';

-- Ver las políticas (puede no funcionar por permisos)
SELECT * FROM pg_policies WHERE tablename = 'objects';
```

### Desde la UI:

1. Ve a **Storage** → **equipos-criticos**
2. Deberías ver:
   - ✅ Public bucket: Yes
   - ✅ File size limit: 50 MB
   - ✅ 4 policies activas

---

## 🧪 Probar la Configuración

### Opción 1: Subir archivo de prueba desde UI

1. En Storage → equipos-criticos
2. Click **"Upload file"**
3. Sube una imagen de prueba
4. Si se sube correctamente, ¡funciona! ✅

### Opción 2: Probar desde la aplicación

1. Reinicia el servidor: `npm run dev`
2. Ve a **Equipos Críticos**
3. Click en **"Agregar Evidencia"** en cualquier equipo
4. Sube una foto
5. Si aparece en la galería, ¡funciona! ✅

---

## ⚠️ Solución de Problemas

### Error: "new row violates row-level security policy"

**Solución:** Las políticas no están configuradas correctamente.
- Ve a Storage → equipos-criticos → Policies
- Asegúrate de que las 4 políticas estén activas
- Verifica que la política INSERT tenga `Target roles: authenticated`

### Error: "Bucket not found"

**Solución:** El bucket no se creó.
- Ejecuta el SQL del Método Alternativo
- O créalo manualmente desde la UI

### Los archivos se suben pero no se ven

**Solución:** El bucket no es público.
- Ve a Storage → equipos-criticos → Configuration
- Activa **"Public bucket"**

### Error de permisos al ejecutar SQL

**Solución:** Normal, usa la UI para crear políticas.
- Supabase no permite crear políticas de Storage vía SQL en algunos planes
- Usa la interfaz web para crear las políticas (más fácil)

---

## 📸 Captura de Pantalla de Referencia

Tu configuración final debería verse así:

```
Storage > equipos-criticos

Configuration:
  ✅ Public bucket: Yes
  ✅ File size limit: 50 MB
  ✅ Allowed MIME types: image/*, video/*

Policies (4):
  ✅ Permitir subir archivos (INSERT - authenticated)
  ✅ Permitir ver archivos (SELECT - public)
  ✅ Permitir actualizar archivos (UPDATE - authenticated)
  ✅ Permitir eliminar archivos (DELETE - authenticated)

Files:
  📁 (vacío inicialmente)
```

---

## 🎉 ¡Listo!

Una vez configurado el bucket y las políticas, la aplicación podrá:
- ✅ Subir imágenes y videos
- ✅ Ver evidencias existentes
- ✅ Eliminar archivos
- ✅ Todo desde móvil y desktop

**Siguiente paso:** Reinicia el servidor y prueba la funcionalidad.
