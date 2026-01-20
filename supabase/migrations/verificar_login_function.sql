-- Eliminar función si existe
DROP FUNCTION IF EXISTS verificar_login(VARCHAR, VARCHAR);

-- Crear función mejorada para verificar login
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
  WHERE LOWER(u.email) = LOWER(p_email);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permisos de ejecución
GRANT EXECUTE ON FUNCTION verificar_login(VARCHAR, VARCHAR) TO anon, authenticated;
