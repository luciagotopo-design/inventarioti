-- Agregar columna descripcion_trabajo a plan_mantenimiento
-- Este campo contendrá la descripción detallada del trabajo a realizar o realizado

-- Agregar la columna
ALTER TABLE plan_mantenimiento 
ADD COLUMN IF NOT EXISTS descripcion_trabajo TEXT;

-- Comentario explicativo
COMMENT ON COLUMN plan_mantenimiento.descripcion_trabajo IS 
'Descripción detallada del trabajo de mantenimiento: piezas a cambiar, procedimientos, problemas encontrados, etc.';

-- Verificar que se agregó correctamente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'plan_mantenimiento'
AND column_name = 'descripcion_trabajo';

-- Ver estructura completa de la tabla
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'plan_mantenimiento'
ORDER BY ordinal_position;
