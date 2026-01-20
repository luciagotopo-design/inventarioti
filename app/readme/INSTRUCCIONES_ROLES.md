# Configuración de Roles y Usuarios

## 🔴 PROBLEMA ACTUAL
- No aparecen roles en el dropdown
- No aparecen usuarios registrados
- Las tablas `roles` y `usuarios` no existen en Supabase

## ✅ SOLUCIÓN - EJECUTAR EN SUPABASE SQL EDITOR

### Paso 1: Ir a Supabase
1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **SQL Editor** en el menú lateral
4. Haz clic en **New Query**

### Paso 2: Ejecutar este SQL (COPIA TODO)

```sql
-- ============================================
-- CREACIÓN DE SISTEMA DE ROLES Y USUARIOS
-- ============================================

-- 1. CREAR TABLA DE ROLES
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(50) UNIQUE NOT NULL,
  descripcion TEXT,
  permisos JSONB DEFAULT '{}',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. INSERTAR ROLES PREDETERMINADOS
INSERT INTO public.roles (nombre, descripcion, permisos, activo) VALUES
  ('Super Admin', 'Acceso completo al sistema', '{"all": true}', true),
  ('Administrador', 'Gestión de inventario y usuarios', '{"usuarios": true, "inventario": true, "reportes": true, "mantenimiento": true}', true),
  ('Técnico', 'Gestión de mantenimiento y equipos', '{"inventario": true, "mantenimiento": true, "reportes": false}', true),
  ('Consulta', 'Solo lectura', '{"inventario": false, "mantenimiento": false, "reportes": true}', true)
ON CONFLICT (nombre) DO NOTHING;

-- 3. VERIFICAR SI EXISTE LA TABLA USUARIOS
DO $$ 
BEGIN
  -- Si la tabla no existe, créala
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'usuarios') THEN
    CREATE TABLE public.usuarios (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      nombre VARCHAR(255) NOT NULL,
      rol_id UUID REFERENCES public.roles(id),
      activo BOOLEAN DEFAULT true,
      ultimo_acceso TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  ELSE
    -- Si existe, agregar columnas faltantes
    ALTER TABLE public.usuarios 
    ADD COLUMN IF NOT EXISTS rol_id UUID REFERENCES public.roles(id),
    ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS ultimo_acceso TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- 4. CREAR ÍNDICES
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON public.usuarios(rol_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON public.usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_clerk_id ON public.usuarios(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_roles_activo ON public.roles(activo);

-- 5. FUNCIÓN PARA ACTUALIZAR updated_at AUTOMÁTICAMENTE
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. TRIGGERS PARA updated_at
DROP TRIGGER IF EXISTS update_roles_updated_at ON public.roles;
CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON public.roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_usuarios_updated_at ON public.usuarios;
CREATE TRIGGER update_usuarios_updated_at
  BEFORE UPDATE ON public.usuarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. HABILITAR RLS (Row Level Security)
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- 8. POLÍTICAS RLS - PERMITIR LECTURA A USUARIOS AUTENTICADOS
DROP POLICY IF EXISTS "Permitir lectura de roles" ON public.roles;
CREATE POLICY "Permitir lectura de roles"
  ON public.roles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Permitir lectura de usuarios" ON public.usuarios;
CREATE POLICY "Permitir lectura de usuarios"
  ON public.usuarios FOR SELECT
  TO authenticated
  USING (true);

-- 9. POLÍTICAS RLS - PERMITIR ESCRITURA A TODOS (ajustar según necesidad)
DROP POLICY IF EXISTS "Permitir inserción de roles" ON public.roles;
CREATE POLICY "Permitir inserción de roles"
  ON public.roles FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualización de roles" ON public.roles;
CREATE POLICY "Permitir actualización de roles"
  ON public.roles FOR UPDATE
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Permitir eliminación de roles" ON public.roles;
CREATE POLICY "Permitir eliminación de roles"
  ON public.roles FOR DELETE
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Permitir inserción de usuarios" ON public.usuarios;
CREATE POLICY "Permitir inserción de usuarios"
  ON public.usuarios FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualización de usuarios" ON public.usuarios;
CREATE POLICY "Permitir actualización de usuarios"
  ON public.usuarios FOR UPDATE
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Permitir eliminación de usuarios" ON public.usuarios;
CREATE POLICY "Permitir eliminación de usuarios"
  ON public.usuarios FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================
SELECT 'Roles creados:', COUNT(*) FROM public.roles;
SELECT 'Usuarios en tabla:', COUNT(*) FROM public.usuarios;
```

### Paso 3: Ejecutar la Query
1. Haz clic en **Run** o presiona `Ctrl + Enter`
2. Deberías ver al final:
   ```
   Roles creados: 4
   Usuarios en tabla: X
   ```

### Paso 4: Verificar
Ejecuta esto para ver los roles creados:

```sql
SELECT nombre, descripcion, activo FROM public.roles ORDER BY nombre;
```

Deberías ver:
- Administrador
- Consulta
- Super Admin
- Técnico

## 🎯 SIGUIENTE PASO: Asignar rol Admin

Después de crear las tablas, tu usuario de Clerk necesita tener rol admin en el **metadata de Clerk**:

1. Ve a [Clerk Dashboard](https://dashboard.clerk.com)
2. Selecciona tu app
3. Ve a **Users**
4. Busca tu usuario (gotopoluis19@gmail.com)
5. Edita **Public metadata**
6. Agrega:
   ```json
   {
     "role": "admin"
   }
   ```
7. Guarda

## ✅ LISTO
Ahora recarga la aplicación y deberías ver:
- ✅ Los 4 roles en el dropdown
- ✅ Los usuarios registrados en Clerk
- ✅ Botón "Admin" en el sidebar (solo para ti)
