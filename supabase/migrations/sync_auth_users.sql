-- ====================================================
-- SINCRONIZAR auth.users CON tabla usuarios
-- ====================================================

-- Eliminar tabla usuarios antigua si existe (usa auth.users de Supabase)
DROP TABLE IF EXISTS usuarios CASCADE;

-- Crear tabla usuarios que sincroniza con auth.users
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  nombre VARCHAR(255),
  rol VARCHAR(50) DEFAULT 'usuario',
  activo BOOLEAN DEFAULT true,
  email_confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON public.usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON public.usuarios(rol);

-- Habilitar Row Level Security
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (CORREGIDAS - sin recursión)
DROP POLICY IF EXISTS "Usuarios pueden leer su propia información" ON public.usuarios;
CREATE POLICY "Usuarios pueden leer su propia información" ON public.usuarios
  FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuarios pueden actualizar su propia información" ON public.usuarios;
CREATE POLICY "Usuarios pueden actualizar su propia información" ON public.usuarios
  FOR UPDATE
  USING (auth.uid() = id);

-- Política para permitir lectura de service_role (sin recursión)
DROP POLICY IF EXISTS "Service role puede ver todos" ON public.usuarios;
CREATE POLICY "Service role puede ver todos" ON public.usuarios
  FOR ALL
  USING (auth.role() = 'service_role');

-- Función helper para verificar si es admin (evita recursión)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_user_meta_data->>'rol' = 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================
-- FUNCIÓN: Crear usuario en tabla cuando se registra
-- ====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, email, nombre, email_confirmed_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.email),
    NEW.email_confirmed_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================
-- TRIGGER: Crear usuario automáticamente al registrarse
-- ====================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ====================================================
-- FUNCIÓN: Actualizar email_confirmed_at cuando se confirma
-- ====================================================
CREATE OR REPLACE FUNCTION public.handle_user_email_confirmed()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo actualizar si cambió de null a una fecha
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    UPDATE public.usuarios
    SET email_confirmed_at = NEW.email_confirmed_at,
        activo = true,
        updated_at = NOW()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================
-- TRIGGER: Actualizar cuando se confirma email
-- ====================================================
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS DISTINCT FROM NEW.email_confirmed_at)
  EXECUTE FUNCTION public.handle_user_email_confirmed();

-- ====================================================
-- INSERTAR USUARIO ADMIN SI NO EXISTE
-- ====================================================
-- Nota: El admin debe registrarse manualmente primero en Supabase Auth
-- Luego ejecutar esto para darle rol admin
-- UPDATE public.usuarios SET rol = 'admin' WHERE email = 'gotopoluis19@gmail.com';
