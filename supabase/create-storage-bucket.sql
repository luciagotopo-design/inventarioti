-- Script para crear el bucket de Supabase Storage para equipos críticos
-- Ejecutar en el SQL Editor de Supabase

-- 1. Crear el bucket si no existe
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'equipos-criticos',
  'equipos-criticos',
  true,  -- Bucket público para que las imágenes sean accesibles
  52428800,  -- 50MB en bytes
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/heic',
    'video/mp4',
    'video/quicktime',
    'video/webm'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- 2. Verificar que el bucket se creó correctamente
SELECT * FROM storage.buckets WHERE id = 'equipos-criticos';

-- ============================================================
-- IMPORTANTE: Las políticas se deben configurar desde la UI
-- ============================================================
-- 
-- Ve a: Supabase Dashboard → Storage → equipos-criticos → Policies
-- 
-- Crea las siguientes políticas manualmente:
--
-- 1. INSERT Policy (Subir archivos):
--    Name: "Permitir subir archivos"
--    Target roles: authenticated
--    USING expression: true
--    WITH CHECK: bucket_id = 'equipos-criticos'
--
-- 2. SELECT Policy (Ver archivos):
--    Name: "Permitir ver archivos"
--    Target roles: public
--    USING expression: bucket_id = 'equipos-criticos'
--
-- 3. UPDATE Policy (Actualizar archivos):
--    Name: "Permitir actualizar archivos"
--    Target roles: authenticated
--    USING expression: bucket_id = 'equipos-criticos'
--
-- 4. DELETE Policy (Eliminar archivos):
--    Name: "Permitir eliminar archivos"
--    Target roles: authenticated
--    USING expression: bucket_id = 'equipos-criticos'
--
-- ============================================================
-- O usa este método alternativo (ejecuta después del INSERT):
-- ============================================================

-- Habilitar acceso público completo (más simple pero menos seguro)
UPDATE storage.buckets 
SET public = true 
WHERE id = 'equipos-criticos';

