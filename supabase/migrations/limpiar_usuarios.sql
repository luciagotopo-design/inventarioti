-- Ver usuarios actuales
SELECT id, email, nombre, rol FROM usuarios;

-- Eliminar TODOS los usuarios existentes
DELETE FROM usuarios;

-- Verificar que se eliminaron
SELECT COUNT(*) FROM usuarios;
-- Debería mostrar 0

-- Mensaje de confirmación
SELECT 'Todos los usuarios han sido eliminados' as mensaje;
