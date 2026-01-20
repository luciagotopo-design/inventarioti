-- ====================================================
-- ARREGLAR POLÍTICAS RLS - Eliminar recursión infinita
-- ====================================================

-- 1. LIMPIAR POLÍTICAS EXISTENTES
DROP POLICY IF EXISTS "Usuarios pueden leer su propia información" ON public.usuarios;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propia información" ON public.usuarios;
DROP POLICY IF EXISTS "Admins pueden ver todos los usuarios" ON public.usuarios;
DROP POLICY IF EXISTS "Service role puede ver todos" ON public.usuarios;

-- 2. CREAR POLÍTICAS CORREGIDAS (SIN RECURSIÓN)

-- Política: Los usuarios pueden ver solo su propia información
CREATE POLICY "usuarios_select_own" ON public.usuarios
  FOR SELECT
  USING (auth.uid() = id);

-- Política: Los usuarios pueden actualizar solo su propia información
CREATE POLICY "usuarios_update_own" ON public.usuarios
  FOR UPDATE
  USING (auth.uid() = id);

-- Política: Service role puede hacer todo (para triggers y funciones admin)
CREATE POLICY "usuarios_service_role_all" ON public.usuarios
  FOR ALL
  USING (auth.role() = 'service_role');

-- 3. VERIFICAR POLÍTICAS
-- Ejecuta esto después para ver las políticas creadas:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename = 'usuarios';
