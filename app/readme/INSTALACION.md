# 📝 Guía de Instalación Paso a Paso

## ⚡ Inicio Rápido

### 1. Instalar Dependencias

```powershell
npm install
```

Si encuentras problemas con la política de ejecución de PowerShell:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 2. Configurar Base de Datos

**Opción A: MongoDB Atlas (Recomendado para producción)**

1. Ve a https://www.mongodb.com/cloud/atlas
2. Crea una cuenta gratuita
3. Crea un nuevo cluster (tier gratuito)
4. En "Database Access" → Crea un usuario con contraseña
5. En "Network Access" → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)
6. Obtén la connection string desde "Connect" → "Connect your application"

**Opción B: MongoDB Local**

```powershell
# Descarga MongoDB Community Server desde:
# https://www.mongodb.com/try/download/community

# Después de instalar, inicia el servicio:
net start MongoDB
```

### 3. Crear archivo .env

Crea un archivo llamado `.env` en la raíz del proyecto:

```env
DATABASE_URL="mongodb+srv://usuario:password@cluster.mongodb.net/inventarioti?retryWrites=true&w=majority"
```

Reemplaza `usuario`, `password` y `cluster` con tus credenciales de MongoDB Atlas.

Para MongoDB local usa:
```env
DATABASE_URL="mongodb://localhost:27017/inventarioti"
```

### 4. Generar Cliente de Prisma

```powershell
npx prisma generate
```

### 5. Poblar Datos Iniciales

```powershell
npx tsx prisma/seed.ts
```

Esto creará:
- ✅ 9 Categorías de equipos
- ✅ 6 Estados operativos
- ✅ 5 Sedes
- ✅ 3 Niveles de prioridad
- ✅ 7 Tipos de acciones de mantenimiento

### 6. Ejecutar el Proyecto

```powershell
npm run dev
```

Abre tu navegador en: **http://localhost:3000**

## 🎯 Verificación de Instalación

### Comprobar que todo funciona:

1. **Dashboard** → Deberías ver los KPIs en 0 (normal, no hay equipos aún)
2. **Inventario General** → Crea un equipo de prueba
3. **Equipos Críticos** → Debería estar vacío inicialmente
4. **Plan de Mantenimiento** → Debería estar vacío inicialmente

### Ver la Base de Datos:

```powershell
npx prisma studio
```

Esto abre una interfaz visual para ver y editar los datos en: http://localhost:5555

## 🛠️ Comandos Útiles

```powershell
# Desarrollo
npm run dev

# Ver base de datos
npx prisma studio

# Re-generar cliente Prisma (si cambias el schema)
npx prisma generate

# Re-ejecutar seed (si necesitas resetear datos maestros)
npx tsx prisma/seed.ts

# Build para producción
npm run build

# Ejecutar en producción
npm start
```

## ❌ Solución de Problemas Comunes

### Error: "Cannot find module '@prisma/client'"
**Solución:**
```powershell
npx prisma generate
npm install
```

### Error: "P1001: Can't reach database server"
**Solución:**
- Verifica que MongoDB esté ejecutándose
- Verifica que la URL en `.env` sea correcta
- Si usas MongoDB Atlas, verifica que tu IP esté en la whitelist

### Error: "prisma: command not found"
**Solución:**
```powershell
npm install -D prisma
npx prisma generate
```

### Error ejecutando el seed
**Solución:**
```powershell
npm install -D tsx
npx tsx prisma/seed.ts
```

### Los estilos de Tailwind no se aplican
**Solución:**
```powershell
# Detén el servidor (Ctrl+C)
# Borra la carpeta .next
Remove-Item -Recurse -Force .next
# Reinicia el servidor
npm run dev
```

## 📦 Dependencias Principales

- **Next.js 16**: Framework React
- **Prisma**: ORM para MongoDB
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Estilos
- **MongoDB**: Base de datos NoSQL

## 🚀 Próximos Pasos

1. ✅ Crear algunos equipos de prueba en "Inventario General"
2. ✅ Marcar algún equipo como crítico
3. ✅ Crear un plan de mantenimiento
4. ✅ Explorar el Dashboard con datos reales

## 💡 Tips

- Usa Prisma Studio (`npx prisma studio`) para inspeccionar y editar datos fácilmente
- Los filtros en Inventario General son acumulativos
- Puedes marcar equipos como críticos desde el formulario de creación/edición
- El Dashboard se actualiza automáticamente con los cambios

## 🆘 Necesitas Ayuda?

- Revisa el README.md principal
- Consulta la documentación de [Next.js](https://nextjs.org/docs)
- Consulta la documentación de [Prisma](https://www.prisma.io/docs)

---

**¡Listo! Tu sistema de inventario TI está funcionando** 🎉
