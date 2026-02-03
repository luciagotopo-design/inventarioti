-- Migración: Eliminar restricción UNIQUE del campo serial
-- Fecha: 2026-02-03
-- Descripción: Permite que múltiples equipos puedan tener el mismo número de serie

-- PRIMERO: Eliminar la restricción UNIQUE (constraint)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'inventario_general_serial_key' 
        AND conrelid = 'inventario_general'::regclass
    ) THEN
        ALTER TABLE inventario_general DROP CONSTRAINT inventario_general_serial_key;
        RAISE NOTICE '✅ Restricción única eliminada: inventario_general_serial_key';
    ELSE
        RAISE NOTICE 'ℹ️ La restricción ya no existe';
    END IF;
END $$;

-- SEGUNDO: Eliminar el índice único (si aún existe después de eliminar la restricción)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'inventario_general' 
        AND indexname = 'inventario_general_serial_key'
    ) THEN
        DROP INDEX inventario_general_serial_key;
        RAISE NOTICE '✅ Índice único eliminado: inventario_general_serial_key';
    ELSE
        RAISE NOTICE 'ℹ️ El índice ya no existe o fue eliminado con la restricción';
    END IF;
END $$;

-- Verificar que se eliminó correctamente
SELECT 
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 
            FROM pg_constraint 
            WHERE conname = 'inventario_general_serial_key'
        ) 
        THEN '✅ Restricción UNIQUE eliminada correctamente del campo serial'
        ELSE '❌ La restricción aún existe'
    END as resultado;

-- Comentario sobre la columna
COMMENT ON COLUMN inventario_general.serial IS 'Número de serie o etiqueta del equipo (permite duplicados)';
