-- Script de Verificación de Conexión y Datos en Supabase
-- Ejecutar en SQL Editor de Supabase

-- 1. Verificar que las tablas existen
SELECT 
    'Tablas en la base de datos:' as info;

SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Contar registros en cada tabla
SELECT 
    'Conteo de registros por tabla:' as info;

SELECT 
    'categorias' as tabla,
    COUNT(*) as registros
FROM categorias
UNION ALL
SELECT 
    'estados' as tabla,
    COUNT(*) as registros
FROM estados
UNION ALL
SELECT 
    'sedes' as tabla,
    COUNT(*) as registros
FROM sedes
UNION ALL
SELECT 
    'prioridades' as tabla,
    COUNT(*) as registros
FROM prioridades
UNION ALL
SELECT 
    'acciones_mantenimiento' as tabla,
    COUNT(*) as registros
FROM acciones_mantenimiento
UNION ALL
SELECT 
    'inventario_general' as tabla,
    COUNT(*) as registros
FROM inventario_general
UNION ALL
SELECT 
    'equipos_criticos' as tabla,
    COUNT(*) as registros
FROM equipos_criticos
UNION ALL
SELECT 
    'plan_mantenimiento' as tabla,
    COUNT(*) as registros
FROM plan_mantenimiento
ORDER BY tabla;

-- 3. Verificar datos maestros básicos
SELECT 
    'Categorías disponibles:' as info;
SELECT id, nombre FROM categorias ORDER BY nombre;

SELECT 
    'Estados disponibles:' as info;
SELECT id, nombre, color FROM estados ORDER BY nombre;

SELECT 
    'Sedes disponibles:' as info;
SELECT id, nombre FROM sedes ORDER BY nombre;

-- 4. Verificar equipos (si existen)
SELECT 
    'Equipos en inventario:' as info;
SELECT 
    serial,
    marca,
    modelo,
    es_critico,
    categoria_id,
    estado_id,
    sede_id
FROM inventario_general
LIMIT 5;

-- 5. Verificar políticas de seguridad (RLS)
SELECT 
    'Políticas de Row Level Security:' as info;

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 6. Si RLS está habilitado, puede causar problemas
-- Para desarrollo, puedes deshabilitarlo temporalmente:

-- IMPORTANTE: Solo para desarrollo local
-- ALTER TABLE categorias DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE estados DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE sedes DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE prioridades DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE acciones_mantenimiento DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE inventario_general DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE equipos_criticos DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE plan_mantenimiento DISABLE ROW LEVEL SECURITY;
