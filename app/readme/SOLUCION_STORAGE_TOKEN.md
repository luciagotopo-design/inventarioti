# ✅ Solución al Error de Storage - Token Expirado

## Problema Resuelto
El error `"exp" claim timestamp check failed` ocurría porque el cliente de Supabase Storage estaba usando una clave anónima que expiraba.

## Cambios Realizados

### 1. **lib/storage.ts**
- ✅ Cambiado de `createClient()` anónimo a usar el cliente autenticado `supabase`
- ✅ Todas las operaciones ahora usan el token de sesión del usuario
- ✅ Agregados logs adicionales para debugging

### 2. **Beneficios**
- ✅ El token se renueva automáticamente con la sesión del usuario
- ✅ No más errores de expiración
- ✅ Mejor seguridad usando RLS (Row Level Security)

## Verificar Configuración de Supabase Storage

### Paso 1: Verificar Bucket
```sql
-- En Supabase SQL Editor
SELECT * FROM storage.buckets WHERE name = 'equipos-criticos';
```

### Paso 2: Verificar Políticas de Storage
Asegúrate de tener estas políticas en el bucket `equipos-criticos`:

```sql
-- Política para INSERT (subir archivos)
CREATE POLICY "Usuarios autenticados pueden subir archivos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'equipos-criticos');

-- Política para SELECT (ver archivos)
CREATE POLICY "Archivos públicos visibles para todos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'equipos-criticos');

-- Política para DELETE (eliminar archivos)
CREATE POLICY "Usuarios autenticados pueden eliminar sus archivos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'equipos-criticos');
```

### Paso 3: Configurar el Bucket como Público

En Supabase Dashboard:
1. Ve a **Storage** → **equipos-criticos**
2. Click en **Configuration**
3. Marca **Public bucket** ✅
4. Guarda cambios

## Probar la Solución

1. **Recarga la página** (Ctrl + R) para obtener un nuevo token
2. **Sube una evidencia** a un equipo crítico
3. **Verifica en consola** los logs:
   ```
   📤 Subiendo archivo: nombre.jpg Tamaño: 123456
   📁 Ruta del archivo: equipos-criticos/[id]/timestamp-xxx.jpg
   🪣 Bucket: equipos-criticos
   ✅ Archivo subido a Supabase Storage
   ✅ Archivo subido exitosamente: https://...
   ```

4. **Recarga la página** nuevamente → Las imágenes deben persistir

## Solución de Problemas

### Si aún hay errores:

1. **Verifica que estés autenticado**
   ```javascript
   // En consola del navegador
   const { data: { session } } = await supabase.auth.getSession()
   console.log('Sesión:', session)
   ```

2. **Verifica las políticas RLS**
   - Ve a Supabase → Storage → Policies
   - Asegúrate de tener políticas para INSERT y SELECT

3. **Revisa el bucket**
   - Debe ser público
   - Debe tener el nombre correcto: `equipos-criticos`

4. **Limpia la caché del navegador**
   - Ctrl + Shift + Delete
   - Selecciona "Cookies y datos de sitio"

## Logs de Debugging

Ahora verás logs más detallados:
- 📤 Inicio de upload
- 📁 Ruta completa del archivo
- 🪣 Nombre del bucket
- ✅ Confirmación de éxito
- 📋 Detalles del error (si ocurre)

## Siguiente Paso

Después de aplicar estos cambios:
1. Recarga completamente el navegador (Ctrl + Shift + R)
2. Intenta subir una evidencia
3. Si hay errores, copia los logs de consola y compártelos
