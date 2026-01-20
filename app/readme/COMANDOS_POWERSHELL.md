# 💻 Comandos para Windows PowerShell

## 🚀 Instalación Inicial (Una sola vez)

```powershell
# 1. Navegar al proyecto (si no estás ya ahí)
cd C:\Users\PC\Downloads\inventarioti

# 2. Instalar todas las dependencias
npm install

# 3. Si hay problemas con políticas de ejecución:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 4. Generar el cliente de Prisma
npx prisma generate

# 5. Poblar datos maestros (categorías, estados, sedes, etc.)
npx tsx prisma/seed.ts
```

## ⚙️ Configuración de Base de Datos

### Crear archivo .env:

```powershell
# Crear el archivo .env
New-Item -Path .env -ItemType File

# Abrirlo con notepad
notepad .env
```

Luego pega esto en el archivo:
```
DATABASE_URL="mongodb+srv://usuario:password@cluster.mongodb.net/inventarioti?retryWrites=true&w=majority"
```

## 🎯 Comandos de Desarrollo Diarios

```powershell
# Iniciar servidor de desarrollo
npm run dev

# Ver la base de datos visualmente
npx prisma studio

# Re-generar cliente si cambias el schema
npx prisma generate

# Re-ejecutar seed si necesitas resetear datos
npx tsx prisma/seed.ts
```

## 🔍 Comandos de Verificación

```powershell
# Ver versión de Node
node --version

# Ver versión de npm
npm --version

# Verificar que las dependencias estén instaladas
npm list --depth=0

# Ver estructura de archivos
tree /F
```

## 🛠️ Comandos de Mantenimiento

```powershell
# Limpiar cache de Next.js
Remove-Item -Recurse -Force .next

# Limpiar node_modules (si hay problemas)
Remove-Item -Recurse -Force node_modules
npm install

# Actualizar dependencias
npm update

# Ver logs del build
npm run build
```

## 📦 Comandos de Build y Producción

```powershell
# Build para producción
npm run build

# Ejecutar en modo producción
npm start

# Build y ejecutar
npm run build; npm start
```

## 🗄️ Comandos de Prisma

```powershell
# Ver base de datos en el navegador (Prisma Studio)
npx prisma studio

# Generar cliente de Prisma
npx prisma generate

# Ver schema formateado
npx prisma format

# Validar schema
npx prisma validate

# Ejecutar seed
npx tsx prisma/seed.ts
```

## 🐛 Solución de Problemas

### Si el proyecto no inicia:

```powershell
# 1. Limpiar todo
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules

# 2. Reinstalar
npm install

# 3. Generar Prisma
npx prisma generate

# 4. Intentar de nuevo
npm run dev
```

### Si Prisma no funciona:

```powershell
# Reinstalar Prisma
npm uninstall @prisma/client prisma
npm install @prisma/client prisma --save-dev

# Generar cliente
npx prisma generate
```

### Si falta tsx:

```powershell
npm install -D tsx
```

## 📊 Comandos de Git (Opcional)

```powershell
# Inicializar repositorio
git init

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Sistema de Inventario TI completo"

# Ver estado
git status

# Ver historial
git log
```

## 🌐 Abrir URLs Automáticamente

```powershell
# Abrir aplicación en navegador
Start-Process "http://localhost:3000"

# Abrir Prisma Studio
Start-Process "http://localhost:5555"
```

## 🔄 Workflow Completo Recomendado

### Primera vez:
```powershell
npm install
npx prisma generate
npx tsx prisma/seed.ts
npm run dev
```

### Día a día:
```powershell
cd C:\Users\PC\Downloads\inventarioti
npm run dev
```

### Si cambias el schema de Prisma:
```powershell
npx prisma generate
npm run dev
```

## 💾 Backup de Datos (Opcional)

```powershell
# Si usas MongoDB local, exportar datos:
mongodump --db inventarioti --out C:\backup

# Restaurar datos:
mongorestore --db inventarioti C:\backup\inventarioti
```

## 🎨 Ver Logs en Tiempo Real

```powershell
# El servidor muestra logs automáticamente
# Para ver solo errores, filtra con:
npm run dev 2>&1 | Select-String "error"
```

## ✅ Checklist Rápido

```powershell
# ✅ 1. Instalar dependencias
npm install

# ✅ 2. Crear .env con DATABASE_URL
New-Item -Path .env -ItemType File
notepad .env

# ✅ 3. Generar Prisma
npx prisma generate

# ✅ 4. Seed
npx tsx prisma/seed.ts

# ✅ 5. Ejecutar
npm run dev

# ✅ 6. Abrir navegador
Start-Process "http://localhost:3000"
```

## 🆘 Comandos de Emergencia

```powershell
# Si todo falla, reset completo:
Remove-Item -Recurse -Force .next, node_modules
npm install
npx prisma generate
npx tsx prisma/seed.ts
npm run dev
```

## 📝 Notas Importantes

- **PowerShell vs CMD**: Estos comandos son para PowerShell. Si usas CMD, algunos comandos pueden variar.
- **Permisos**: Si tienes problemas de permisos, ejecuta PowerShell como Administrador.
- **Firewall**: Si el puerto 3000 está bloqueado, usa: `npm run dev -- -p 3001`

---

**¡Todo listo para empezar a desarrollar!** 🚀
