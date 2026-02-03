-- Migrar equipos críticos del inventario a la tabla equipos_criticos
-- Ejecutar DESPUÉS de tener datos en inventario_general

DO $$
DECLARE
    prioridad_alta_id UUID;
    equipo_record RECORD;
BEGIN
    -- Obtener ID de prioridad Alta
    SELECT id INTO prioridad_alta_id FROM prioridades WHERE nombre = 'Alta';
    
    -- Verificar que existe la prioridad
    IF prioridad_alta_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró la prioridad "Alta". Ejecuta seed.sql primero.';
    END IF;
    
    -- Migrar equipos críticos que no estén ya en equipos_criticos
    FOR equipo_record IN 
        SELECT ig.id, ig.serial, ig.observaciones
        FROM inventario_general ig
        WHERE ig.es_critico = true
        AND NOT EXISTS (
            SELECT 1 FROM equipos_criticos ec WHERE ec.id_equipo = ig.id
        )
    LOOP
        INSERT INTO equipos_criticos (
            id_equipo,
            nivel_prioridad_id,
            accion_requerida,
            resuelto
        ) VALUES (
            equipo_record.id,
            prioridad_alta_id,
            COALESCE(equipo_record.observaciones, 'Revisión requerida'),
            false
        );
        
        RAISE NOTICE 'Migrado equipo crítico: %', equipo_record.serial;
    END LOOP;
    
    RAISE NOTICE 'Migración completada';
END $$;
