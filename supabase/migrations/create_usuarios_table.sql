-- Crear tabla de usuarios para login
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nombre VARCHAR(255),
  rol VARCHAR(50) DEFAULT 'usuario',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas rápidas por email
CREATE INDEX idx_usuarios_email ON usuarios(email);

-- Insertar usuario administrador por defecto
-- Contraseña: admin123 (debes cambiarla después)
INSERT INTO usuarios (email, password_hash, nombre, rol) VALUES
('admin@inventarioti.com', crypt('admin123', gen_salt('bf')), 'Administrador', 'admin');

-- Habilitar Row Level Security
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Política: Solo usuarios autenticados pueden leer
CREATE POLICY "Usuarios pueden leer su propia información" ON usuarios
  FOR SELECT
  USING (auth.uid()::text = id::text);

-- Función para verificar login
CREATE OR REPLACE FUNCTION verificar_login(p_email VARCHAR, p_password VARCHAR)
RETURNS TABLE (
  id UUID,
  email VARCHAR,
  nombre VARCHAR,
  rol VARCHAR,
  valido BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.nombre,
    u.rol,
    (u.password_hash = crypt(p_password, u.password_hash) AND u.activo) as valido
  FROM usuarios u
  WHERE u.email = p_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
