# Script para copiar el SQL de corrección al portapapeles

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
Write-Host "🚨 ARREGLAR ERROR DE RECURSIÓN INFINITA" -ForegroundColor Red
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
Write-Host ""

$sqlFix = @"
-- ARREGLAR POLÍTICAS RLS - Eliminar recursión infinita

-- 1. Limpiar políticas problemáticas
DROP POLICY IF EXISTS "Usuarios pueden leer su propia información" ON public.usuarios;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propia información" ON public.usuarios;
DROP POLICY IF EXISTS "Admins pueden ver todos los usuarios" ON public.usuarios;
DROP POLICY IF EXISTS "Service role puede ver todos" ON public.usuarios;

-- 2. Crear políticas corregidas (sin recursión)
CREATE POLICY "usuarios_select_own" ON public.usuarios
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "usuarios_update_own" ON public.usuarios
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "usuarios_service_role_all" ON public.usuarios
  FOR ALL
  USING (auth.role() = 'service_role');
"@

Write-Host "❌ ERROR DETECTADO:" -ForegroundColor Red
Write-Host "   infinite recursion detected in policy for relation 'usuarios'" -ForegroundColor Yellow
Write-Host ""
Write-Host "✅ SOLUCIÓN:" -ForegroundColor Green
Write-Host "   Ejecutar este SQL en Supabase Dashboard" -ForegroundColor White
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host $sqlFix -ForegroundColor DarkGray
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

$copiar = Read-Host "¿Copiar SQL al portapapeles? (s/n)"

if ($copiar -eq "s" -or $copiar -eq "S" -or $copiar -eq "") {
    Set-Clipboard -Value $sqlFix
    Write-Host ""
    Write-Host "✅ SQL copiado al portapapeles!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 PASOS SIGUIENTES:" -ForegroundColor Yellow
    Write-Host "   1. Ve a https://supabase.com/dashboard" -ForegroundColor White
    Write-Host "   2. Selecciona tu proyecto" -ForegroundColor White
    Write-Host "   3. Ve a SQL Editor" -ForegroundColor White
    Write-Host "   4. Haz clic en 'New query'" -ForegroundColor White
    Write-Host "   5. Pega el SQL (Ctrl+V)" -ForegroundColor White
    Write-Host "   6. Haz clic en 'Run' o presiona Ctrl+Enter" -ForegroundColor White
    Write-Host "   7. Deberías ver 'Success' ✅" -ForegroundColor White
    Write-Host "   8. Recarga tu aplicación" -ForegroundColor White
    Write-Host ""
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📖 Más información en: ARREGLAR_ERROR_RECURSION.md" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
