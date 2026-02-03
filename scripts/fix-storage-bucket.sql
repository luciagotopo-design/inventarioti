-- Script para hacer el bucket de Storage PÚBLICO
-- Ejecutar en Supabase Dashboard > SQL Editor

-- 1. Verificar estado actual del bucket
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE name = 'equipos-criticos';

-- 2. Actualizar bucket para que sea PÚBLICO
UPDATE storage.buckets 
SET public = true 
WHERE name = 'equipos-criticos';

-- 3. Configurar límites y tipos permitidos
UPDATE storage.buckets 
SET 
  file_size_limit = 52428800,  -- 50MB en bytes
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'video/mp4', 'video/quicktime', 'video/webm']
WHERE name = 'equipos-criticos';

-- 4. Verificar que los cambios se aplicaron
SELECT 
  id,
  name,
  public AS "¿Es público?",
  file_size_limit AS "Tamaño máximo (bytes)",
  allowed_mime_types AS "Tipos permitidos",
  created_at
FROM storage.buckets 
WHERE name = 'equipos-criticos';

-- 5. Verificar políticas RLS existentes
SELECT 
  policyname AS "Nombre de Política",
  cmd AS "Operación",
  roles AS "Roles",
  qual AS "Condición USING",
  with_check AS "Condición WITH CHECK"
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
ORDER BY policyname;

-- RESULTADO ESPERADO:
-- public debe ser: true
-- file_size_limit debe ser: 52428800
-- allowed_mime_types debe incluir tipos de imagen y video

-- Si el bucket no existe, créalo con este comando:
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES ('equipos-criticos', 'equipos-criticos', true, 52428800, 
--   ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 
--         'video/mp4', 'video/quicktime', 'video/webm'])
-- ON CONFLICT (id) DO UPDATE 
-- SET public = true, 
--     file_size_limit = 52428800,
--     allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 
--                                  'video/mp4', 'video/quicktime', 'video/webm'];
