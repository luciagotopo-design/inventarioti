-- Insertar 32 equipos del inventario
-- Ejecutar DESPUÉS de schema.sql y seed.sql

-- Obtener IDs de maestros para referencias
DO $$
DECLARE
    cat_pc_id UUID;
    cat_monitor_id UUID;
    cat_impresora_id UUID;
    cat_drones_id UUID;
    cat_ups_id UUID;
    cat_cables_id UUID;
    est_operativo_id UUID;
    est_danado_id UUID;
    est_baja_id UUID;
    sede_cali_id UUID;
BEGIN
    -- Obtener IDs de categorías
    SELECT id INTO cat_pc_id FROM categorias WHERE nombre = 'PC/Portátil';
    SELECT id INTO cat_monitor_id FROM categorias WHERE nombre = 'Monitor';
    SELECT id INTO cat_impresora_id FROM categorias WHERE nombre = 'Impresora';
    SELECT id INTO cat_drones_id FROM categorias WHERE nombre = 'Drones';
    SELECT id INTO cat_ups_id FROM categorias WHERE nombre = 'UPS';
    SELECT id INTO cat_cables_id FROM categorias WHERE nombre = 'Cables HDMI';
    
    -- Obtener IDs de estados
    SELECT id INTO est_operativo_id FROM estados WHERE nombre = 'Operativo';
    SELECT id INTO est_danado_id FROM estados WHERE nombre = 'Dañado';
    SELECT id INTO est_baja_id FROM estados WHERE nombre = 'Baja capacidad';
    
    -- Obtener ID de sede
    SELECT id INTO sede_cali_id FROM sedes WHERE nombre = 'Cali';

    -- Insertar equipos
    INSERT INTO inventario_general (serial, cantidad, marca, modelo, categoria_id, estado_id, sede_id, ubicacion_detallada, responsable, es_critico, observaciones) VALUES
    ('CDN2440PBB', 1, 'Hp', 'Ultrabook', cat_pc_id, est_operativo_id, sede_cali_id, 'Oficina Principal', 'Diana Gonzalez', false, 'Presenta fallo en bateria, por lo cual solo fucniona s esta conectado a la corriente'),
    ('453S', 1, 'Asus', 'Aspire', cat_pc_id, est_operativo_id, sede_cali_id, 'Oficina Principal', 'Diana Gonzalez', false, 'NINGUNA'),
    ('PL80WR', 1, 'Lenovo', 'V510', cat_pc_id, est_operativo_id, sede_cali_id, 'Oficina Principal', 'Diana Gonzalez', false, 'NINGUNA'),
    ('LRNB7204009', 1, 'Lenovo', 'V510', cat_pc_id, est_operativo_id, sede_cali_id, 'Oficina Principal', 'Diana Gonzalez', false, 'NINGUNA'),
    ('LRO85CJV', 1, 'Lenovo', 'V510', cat_pc_id, est_operativo_id, sede_cali_id, 'Oficina Principal', 'Diana Gonzalez', false, 'NINGUNA'),
    ('LRO85BQ5', 1, 'Lenovo', 'V510', cat_pc_id, est_operativo_id, sede_cali_id, 'Oficina Principal', 'Diana Gonzalez', false, 'Daños fisicos en carcasa'),
    ('LR085RB1', 1, 'Lenovo', 'V510', cat_pc_id, est_operativo_id, sede_cali_id, 'Oficina Principal', 'Diana Gonzalez', false, 'NINGUNA'),
    ('LRO8H17C', 1, 'Lenovo', 'V510', cat_pc_id, est_operativo_id, sede_cali_id, 'Oficina Principal', 'Diana Gonzalez', false, 'NINGUNA'),
    ('LR094F3K', 1, 'Lenovo', 'V510', cat_pc_id, est_operativo_id, sede_cali_id, 'Oficina Principal', 'Diana Gonzalez', false, 'NINGUNA'),
    ('LRNXB712', 1, 'Lenovo', 'V510', cat_pc_id, est_operativo_id, sede_cali_id, 'Oficina Principal', 'Diana Gonzalez', false, 'NINGUNA'),
    ('LRO84DX3', 1, 'Lenovo', 'V510', cat_pc_id, est_operativo_id, sede_cali_id, 'Oficina Principal', 'Diana Gonzalez', false, 'NINGUNA'),
    ('LRO84EWS', 1, 'Lenovo', 'V510', cat_pc_id, est_operativo_id, sede_cali_id, 'Oficina Principal', 'Diana Gonzalez', false, 'NINGUNA'),
    ('LRO84EJR', 1, 'Lenovo', 'V510', cat_pc_id, est_operativo_id, sede_cali_id, 'Oficina Principal', 'Diana Gonzalez', false, 'NINGUNA'),
    ('LRO84ER3', 1, 'Lenovo', 'V510', cat_pc_id, est_operativo_id, sede_cali_id, 'Oficina Principal', 'Diana Gonzalez', false, 'NINGUNA'),
    ('LRO85C9L', 1, 'Lenovo', 'V510', cat_pc_id, est_danado_id, sede_cali_id, 'Oficina Principal', 'Diana Gonzalez', true, 'Presnta fallas con el boton de encendido, estara en revision-07'),
    ('LRO84EA1', 1, 'Lenovo', 'V510', cat_pc_id, est_operativo_id, sede_cali_id, 'Oficina Principal', 'Diana Gonzalez', false, 'NINGUNA'),
    ('4293B43', 1, 'Lenovo', 'X220', cat_pc_id, est_baja_id, sede_cali_id, 'Oficina Principal', 'Diana Gonzalez', true, 'Se debera cambiar, teclado, ram y disco duro para mjeor rendimiento'),
    ('R365W10', 1, 'Lenovo', 'V510', cat_pc_id, est_danado_id, sede_cali_id, 'Oficina Principal', 'Diana Gonzalez', true, 'Presnta fallas con el boton de encendido, estara en revision'),
    ('LRO84EVN', 1, 'Lenovo', 'V510', cat_pc_id, est_danado_id, sede_cali_id, 'Oficina Principal', 'Diana Gonzalez', true, 'Al encender solo muestra pantalla negra'),
    ('LRO85BWL', 1, 'Lenovo', 'V510', cat_pc_id, est_danado_id, sede_cali_id, 'Oficina Principal', 'Diana Gonzalez', true, 'Al encender solo muestra pantalla negra'),
    ('LRO35BYZ', 1, 'Lenovo', 'V510', cat_pc_id, est_danado_id, sede_cali_id, 'Oficina Principal', 'Diana Gonzalez', true, 'Daño en visagra y carcasa'),
    ('LRO85C49', 1, 'Lenovo', 'V510', cat_pc_id, est_danado_id, sede_cali_id, 'Oficina Principal', 'Diana Gonzalez', true, 'Cambio de disco duro'),
    ('CABLES-HDMI-001', 13, 'x', 'x', cat_cables_id, est_operativo_id, sede_cali_id, 'Oficina Principal', 'Diana Gonzalez', false, 'NINGUNA'),
    ('DESK-LEN-001', 1, 'Lenovo', 'Escritorio', cat_pc_id, est_operativo_id, sede_cali_id, 'Oficina Principal', 'Diana Gonzalez', false, 'NINGUNA'),
    ('MON-VOC-E950SW', 1, 'Voc', 'E950SW', cat_monitor_id, est_operativo_id, sede_cali_id, 'Oficina Principal', 'Diana Gonzalez', false, 'NINGUNA'),
    ('IMP-EPS-L495', 1, 'Epson', 'L495', cat_impresora_id, est_operativo_id, sede_cali_id, 'Oficina Principal', 'Diana Gonzalez', false, 'Mantenimiento preventivo'),
    ('UPS-UNITEC-001', 1, 'Unitec', 'x', cat_ups_id, est_operativo_id, sede_cali_id, 'Oficina Principal', 'Diana Gonzalez', false, 'NINGUNA'),
    ('2842A57', 1, 'Lenovo', 'SL410', cat_pc_id, est_danado_id, sede_cali_id, 'Oficina Principal', 'Diana Gonzalez', true, 'Cambio de disco duro a ssd'),
    ('DRN-DJI-MAVIC', 1, 'DJI', 'Mavic Air 2', cat_drones_id, est_operativo_id, sede_cali_id, 'Oficina Principal', 'Diana Gonzalez', false, 'NINGUNA'),
    ('DRN-AVIODANCE', 1, 'x', 'Aviodance', cat_drones_id, est_operativo_id, sede_cali_id, 'Oficina Principal', 'Diana Gonzalez', false, 'NINGUNA'),
    ('DRN-3MINI', 1, 'x', '3 Mini', cat_drones_id, est_operativo_id, sede_cali_id, 'Oficina Principal', 'Diana Gonzalez', false, 'NINGUNA'),
    ('DRN-DJI-MINISE', 1, 'DJI', 'Mini SE', cat_drones_id, est_operativo_id, sede_cali_id, 'Oficina Principal', 'Diana Gonzalez', false, 'NINGUNA');

END $$;
