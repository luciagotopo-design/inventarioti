-- Crear tabla de roles
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(50) UNIQUE NOT NULL,
  descripcion TEXT,
  permisos JSONB DEFAULT '{}',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertar roles predeterminados
INSERT INTO public.roles (nombre, descripcion, permisos) VALUES
  ('Super Admin', 'Acceso completo al sistema', '{"all": true}'),
  ('Administrador', 'Gestión de inventario y usuarios', '{"usuarios": true, "inventario": true, "reportes": true, "mantenimiento": true}'),
  ('Técnico', 'Gestión de mantenimiento y equipos', '{"inventario": true, "mantenimiento": true, "reportes": false}'),
  ('Consulta', 'Solo lectura', '{"inventario": false, "mantenimiento": false, "reportes": true}')
ON CONFLICT (nombre) DO NOTHING;

-- Modificar tabla usuarios para agregar rol
ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS rol_id UUID REFERENCES public.roles(id),
ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS ultimo_acceso TIMESTAMP WITH TIME ZONE;

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON public.usuarios(rol_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON public.usuarios(email);
CREATE INDEX IF NOT EXISTS idx_roles_activo ON public.roles(activo);

-- Asignar rol de Super Admin al primer usuario (ajusta el email según tu usuario)
UPDATE public.usuarios 
SET rol_id = (SELECT id FROM public.roles WHERE nombre = 'Super Admin' LIMIT 1)
WHERE email = 'gotopoluis19@gmail.com'
AND rol_id IS NULL;

-- Asignar rol de Consulta a usuarios sin rol
UPDATE public.usuarios 
SET rol_id = (SELECT id FROM public.roles WHERE nombre = 'Consulta' LIMIT 1)
WHERE rol_id IS NULL;

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para roles
DROP TRIGGER IF EXISTS update_roles_updated_at ON public.roles;
CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON public.roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para usuarios
DROP TRIGGER IF EXISTS update_usuarios_updated_at ON public.usuarios;
CREATE TRIGGER update_usuarios_updated_at
  BEFORE UPDATE ON public.usuarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies para roles
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Roles visibles para usuarios autenticados"
  ON public.roles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Solo admins pueden modificar roles"
  ON public.roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios u
      INNER JOIN public.roles r ON u.rol_id = r.id
      WHERE u.clerk_user_id = auth.uid()
      AND (r.nombre = 'Super Admin' OR r.nombre = 'Administrador')
    )
  );

-- Comentarios
COMMENT ON TABLE public.roles IS 'Roles del sistema con permisos configurables';
COMMENT ON TABLE public.usuarios IS 'Usuarios del sistema con roles asignados';
COMMENT ON COLUMN public.roles.permisos IS 'JSON con permisos: {modulo: boolean}';
COMMENT ON COLUMN public.usuarios.rol_id IS 'Rol asignado al usuario';
