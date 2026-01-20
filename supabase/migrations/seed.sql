-- ====================================================
-- DATOS MAESTROS INICIALES - INVENTARIO TI
-- ====================================================

-- ====================================================
-- CATEGORÍAS
-- ====================================================
INSERT INTO categorias (nombre, descripcion) VALUES
('PC/Portátil', 'Computadoras de escritorio y portátiles'),
('Monitor', 'Monitores y pantallas'),
('Impresora', 'Impresoras láser, inkjet y multifuncionales'),
('Drones', 'Drones y equipos de fotografía aérea'),
('UPS', 'Sistemas de alimentación ininterrumpida'),
('Cables HDMI', 'Cables y conectores HDMI');

-- ====================================================
-- ESTADOS
-- ====================================================
INSERT INTO estados (nombre, color, descripcion) VALUES
('Operativo', '#10b981', 'Equipo funcionando correctamente'),
('Dañado', '#ef4444', 'Equipo con fallas graves'),
('Baja capacidad', '#f59e0b', 'Equipo con rendimiento degradado'),
('En mantenimiento', '#3b82f6', 'Equipo en proceso de mantenimiento');

-- ====================================================
-- SEDES
-- ====================================================
INSERT INTO sedes (nombre, ciudad, direccion) VALUES
('Cali', 'Cali', 'Av. Principal #123'),
('Bogotá', 'Bogotá', 'Calle 100 #15-20'),
('Medellín', 'Medellín', 'Carrera 43A #1-50');

-- ====================================================
-- PRIORIDADES
-- ====================================================
INSERT INTO prioridades (nombre, color, nivel, orden, descripcion) VALUES
('Alta', '#ef4444', 1, 1, 'Requiere atención inmediata'),
('Media', '#f59e0b', 2, 2, 'Atención en los próximos días'),
('Baja', '#10b981', 3, 3, 'Sin urgencia');

-- ====================================================
-- ACCIONES DE MANTENIMIENTO
-- ====================================================
INSERT INTO acciones_mantenimiento (nombre, descripcion) VALUES
('Mantenimiento Preventivo', 'Limpieza y revisión general del equipo'),
('Actualización de Software', 'Actualización de sistema operativo y aplicaciones'),
('Reemplazo de Componentes', 'Cambio de piezas defectuosas o desgastadas'),
('Calibración', 'Ajustes y calibración de equipos especializados');
