# Script para ejecutar migración de usuarios en Supabase
# Ejecuta esto después de configurar tu proyecto de Supabase

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🔧 CONFIGURACIÓN DE USUARIOS EN SUPABASE" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Verificar que existe el archivo de migración
$migracionPath = ".\supabase\migrations\sync_auth_users.sql"

if (-not (Test-Path $migracionPath)) {
    Write-Host "❌ ERROR: No se encuentra el archivo de migración" -ForegroundColor Red
    Write-Host "   Ruta esperada: $migracionPath" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Archivo de migración encontrado" -ForegroundColor Green
Write-Host ""

# Leer el contenido del archivo SQL
$sqlContent = Get-Content $migracionPath -Raw

Write-Host "📋 INSTRUCCIONES PARA EJECUTAR LA MIGRACIÓN:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Ve a tu dashboard de Supabase:" -ForegroundColor White
Write-Host "   https://supabase.com/dashboard" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Selecciona tu proyecto" -ForegroundColor White
Write-Host ""
Write-Host "3. Ve a SQL Editor (en el menú lateral izquierdo)" -ForegroundColor White
Write-Host ""
Write-Host "4. Haz clic en 'New query'" -ForegroundColor White
Write-Host ""
Write-Host "5. Copia el siguiente SQL y pégalo en el editor:" -ForegroundColor White
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host $sqlContent -ForegroundColor DarkGray
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "6. Haz clic en 'Run' (o presiona Ctrl+Enter)" -ForegroundColor White
Write-Host ""
Write-Host "7. Verifica que se ejecutó correctamente (debe decir 'Success')" -ForegroundColor White
Write-Host ""

# Preguntar si quiere copiar al portapapeles
$copiar = Read-Host "¿Deseas copiar el SQL al portapapeles? (s/n)"

if ($copiar -eq "s" -or $copiar -eq "S") {
    Set-Clipboard -Value $sqlContent
    Write-Host ""
    Write-Host "✅ SQL copiado al portapapeles!" -ForegroundColor Green
    Write-Host "   Ahora solo pégalo en el SQL Editor de Supabase" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📧 CONFIGURAR EMAIL EN SUPABASE" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para que funcione el envío de correos:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Ve a Authentication → Settings → Email en tu dashboard" -ForegroundColor White
Write-Host "2. Asegúrate que 'Enable email confirmations' esté activado" -ForegroundColor White
Write-Host "3. (Opcional) Configura tu SMTP personalizado en Project Settings → Auth" -ForegroundColor White
Write-Host ""
Write-Host "Lee el archivo CONFIGURAR_EMAIL_SUPABASE.md para más detalles" -ForegroundColor Cyan
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ ¡Listo! Ahora puedes probar el registro de usuarios" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
