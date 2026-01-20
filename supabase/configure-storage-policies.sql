-- Configuración de políticas para Supabase Storage
-- Ejecutar en SQL Editor de Supabase Dashboard

-- 1. Verificar que el bucket existe
SELECT * FROM storage.buckets WHERE id = 'equipos-criticos';

-- 2. Eliminar políticas existentes si las hay (para recrearlas)
DROP POLICY IF EXISTS "Permitir subir archivos a usuarios autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Permitir ver archivos públicamente" ON storage.objects;
DROP POLICY IF EXISTS "Permitir actualizar archivos a usuarios autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Permitir eliminar archivos a usuarios autenticados" ON storage.objects;

-- 3. Crear políticas RLS para storage.objects

-- Política INSERT: Usuarios autenticados pueden subir archivos
CREATE POLICY "Permitir subir archivos a usuarios autenticados"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'equipos-criticos');

-- Política SELECT: Todos pueden ver archivos (bucket público)
CREATE POLICY "Permitir ver archivos públicamente"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'equipos-criticos');

-- Política UPDATE: Usuarios autenticados pueden actualizar archivos
CREATE POLICY "Permitir actualizar archivos a usuarios autenticados"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'equipos-criticos')
WITH CHECK (bucket_id = 'equipos-criticos');

-- Política DELETE: Usuarios autenticados pueden eliminar archivos
CREATE POLICY "Permitir eliminar archivos a usuarios autenticados"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'equipos-criticos');

-- 4. Verificar que las políticas se crearon
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%equipos-criticos%'
ORDER BY policyname;

-- 5. Mensaje de confirmación
SELECT 'Políticas RLS configuradas correctamente para bucket equipos-criticos' AS status;
