# 🔧 Configuración de Storage - Guía Paso a Paso

## ⚠️ El Error que Tuviste
```
ERROR: 42501: must be owner of table objects
```

Esto ocurre porque las políticas de Storage **NO se configuran con SQL** en Supabase. Debes usar la interfaz web.

---

## ✅ Solución: Configurar desde Dashboard

### PASO 1: Acceder a Storage
1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Click en **"Storage"** en el menú lateral izquierdo
4. Click en el bucket **"equipos-criticos"**

### PASO 2: Configurar el Bucket como Público
1. Dentro del bucket "equipos-criticos", click en **"Configuration"** (pestaña superior)
2. Activa estas opciones:
   - ✅ **Public bucket** → Permite URLs públicas
   - **File size limit**: `52428800` (50MB)
   - **Allowed MIME types**: `image/*,video/*`
3. Click en **"Save"**

### PASO 3: Crear Políticas de Acceso
1. Click en la pestaña **"Policies"** (junto a Configuration)
2. Click en **"New Policy"**

#### Política 1: Upload (Subir archivos)
```
Policy name: Allow authenticated users to upload
Allowed operation: INSERT ✅
Target roles: authenticated
Policy definition: 
  - USING: true
  - WITH CHECK: bucket_id = 'equipos-criticos'
```

#### Política 2: View (Ver archivos)
```
Policy name: Allow public to view files
Allowed operation: SELECT ✅
Target roles: public
Policy definition:
  - USING: bucket_id = 'equipos-criticos'
  - WITH CHECK: (dejar vacío)
```

#### Política 3: Update (Actualizar archivos)
```
Policy name: Allow authenticated users to update
Allowed operation: UPDATE ✅
Target roles: authenticated
Policy definition:
  - USING: bucket_id = 'equipos-criticos'
  - WITH CHECK: bucket_id = 'equipos-criticos'
```

#### Política 4: Delete (Eliminar archivos)
```
Policy name: Allow authenticated users to delete
Allowed operation: DELETE ✅
Target roles: authenticated
Policy definition:
  - USING: bucket_id = 'equipos-criticos'
  - WITH CHECK: (dejar vacío)
```

---

## 🚀 MÉTODO RÁPIDO (Recomendado para Desarrollo)

Si quieres configurarlo rápido:

1. Ve a Storage → equipos-criticos → **Policies**
2. Click en **"New Policy"**
3. Selecciona la plantilla **"Allow all operations"**
4. En "Target roles" selecciona: **authenticated**
5. En "Policy definition" escribe:
   ```sql
   bucket_id = 'equipos-criticos'
   ```
6. Click en **"Review"** → **"Save policy"**

Esto creará UNA política que permite todas las operaciones (INSERT, SELECT, UPDATE, DELETE) para usuarios autenticados.

---

## ✅ Verificar la Configuración

### En Supabase SQL Editor, ejecuta:
```sql
-- Ver configuración del bucket
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE name = 'equipos-criticos';
```

**Resultado esperado:**
```
public: true
file_size_limit: 52428800
allowed_mime_types: {image/*,video/*}
```

### Ver políticas activas:
```sql
-- Ver políticas configuradas
SELECT 
  policyname,
  cmd as operation,
  roles
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%equipos-criticos%';
```

---

## 🧪 Probar la Configuración

Después de configurar:

1. **Recarga tu aplicación** (Ctrl + Shift + R)
2. **Intenta subir una evidencia**
3. **Verifica en consola** que aparezca:
   ```
   📤 Subiendo archivo: nombre.jpg
   📁 Ruta del archivo: equipos-criticos/[id]/...
   🪣 Bucket: equipos-criticos
   ✅ Archivo subido a Supabase Storage
   ```
4. **Recarga la página** → La imagen debe persistir

---

## 🐛 Si Aún Hay Errores

### Error: "new row violates row-level security policy"
- ✅ Verifica que creaste la política para **INSERT**
- ✅ Verifica que el rol es **authenticated**
- ✅ Verifica que la expresión es `bucket_id = 'equipos-criticos'`

### Error: "Object not found"
- ✅ Marca el bucket como **Public**
- ✅ Crea la política para **SELECT** con rol **public**

### Error: Token expirado
- ✅ Ya lo resolvimos cambiando el cliente de Storage
- ✅ Recarga la página para obtener un nuevo token

---

## 📚 Recursos

- [Supabase Storage Policies](https://supabase.com/docs/guides/storage#policy-examples)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Configuration](https://supabase.com/docs/guides/storage/uploads/standard-uploads)

---

## ✅ Resumen

1. ❌ **NO uses SQL** para crear políticas de Storage
2. ✅ **USA el Dashboard** de Supabase → Storage → Policies
3. ✅ Marca el bucket como **Público**
4. ✅ Crea políticas para: INSERT (authenticated), SELECT (public), UPDATE (authenticated), DELETE (authenticated)
5. ✅ Recarga la app y prueba

¡Con esto debería funcionar perfectamente! 🚀
