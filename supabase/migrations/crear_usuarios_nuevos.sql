-- Crear nuevos usuarios con contraseñas seguras
INSERT INTO usuarios (email, password_hash, nombre, rol, activo) VALUES
  ('admin@empresa.com', crypt('Admin2024!', gen_salt('bf')), 'Administrador Sistema', 'admin', true),
  ('soporte@empresa.com', crypt('Soporte2024!', gen_salt('bf')), 'Equipo Soporte', 'usuario', true),
  ('gerente@empresa.com', crypt('Gerente2024!', gen_salt('bf')), 'Gerente TI', 'admin', true);

-- Verificar que se crearon correctamente
SELECT id, email, nombre, rol, activo, created_at 
FROM usuarios 
ORDER BY created_at DESC;
