# 🔐 Configuración de Variables de Entorno

## 📋 Resumen

Este proyecto utiliza **un único archivo** `.env.local` para todas las variables de entorno. Next.js carga automáticamente este archivo en desarrollo y producción.

## 📁 Archivos de Entorno

```
inventarioti/
├── .env.local          ✅ USAR ESTE (variables reales, ignorado por git)
├── .env.example        📋 Plantilla para nuevos desarrolladores
└── .env                ❌ ELIMINADO (ya no se usa)
```

## 🚀 Configuración Inicial

### 1. Para Desarrollo Local

```bash
# Copiar la plantilla
cp .env.example .env.local

# Editar con tus credenciales reales
nano .env.local  # o usa tu editor favorito
```

### 2. Variables Requeridas

El archivo `.env.local` contiene todas las variables organizadas por categorías:

#### 🗄️ DATABASE
```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

#### 📦 SUPABASE
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### 🔐 CLERK AUTHENTICATION
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

#### 🤖 GEMINI AI
```bash
GEMINI_API_KEY=your_gemini_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
```

#### 📧 EMAIL (RESEND)
```bash
RESEND_API_KEY=re_...
ADMIN_EMAIL=admin@yourdomain.com
```

## 🔄 Cómo Funciona

### Next.js carga automáticamente:

1. **`.env.local`** - Prioridad más alta (desarrollo y producción)
2. **`.env`** - Ya no se usa en este proyecto
3. Las variables con `NEXT_PUBLIC_` están disponibles en el cliente
4. Las variables sin prefijo solo están disponibles en el servidor

### Ejemplo de uso en el código:

```typescript
// En el servidor (API routes, server components)
const apiKey = process.env.GEMINI_API_KEY;

// En el cliente (componentes de React)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
```

## 🌐 Despliegue en Producción

### Vercel
1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Environment Variables
3. Copia todas las variables de `.env.local`
4. Asegúrate de marcar las variables correctas como disponibles en:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

### Otras Plataformas (Netlify, Railway, etc.)
Consulta la documentación específica de cada plataforma para configurar variables de entorno.

## ⚠️ Seguridad

### ✅ HACER:
- Mantener `.env.local` en `.gitignore`
- Usar variables `NEXT_PUBLIC_*` solo para datos no sensibles
- Rotar claves regularmente
- Usar diferentes claves para desarrollo y producción

### ❌ NO HACER:
- Subir `.env.local` a git
- Compartir claves en mensajes/emails
- Usar claves de producción en desarrollo
- Hardcodear valores sensibles en el código

## 🔍 Verificación

Para verificar que todas las variables están configuradas:

```bash
# En desarrollo
npm run dev

# Revisar logs de consola para mensajes de configuración
# Busca: "✅ Supabase configurado correctamente"
```

## 📝 Notas Importantes

1. **No duplicar variables**: Todas las variables están en `.env.local`
2. **Reiniciar después de cambios**: Si modificas `.env.local`, reinicia el servidor de desarrollo
3. **Variables públicas**: Solo usa `NEXT_PUBLIC_*` para datos que pueden ser visibles en el navegador
4. **Service Role Key**: Es la clave más sensible, nunca la expongas al cliente

## 🆘 Solución de Problemas

### Error: "Variable de entorno no encontrada"
```bash
# 1. Verifica que existe en .env.local
cat .env.local | grep VARIABLE_NAME

# 2. Reinicia el servidor
npm run dev
```

### Error: "Supabase no conecta"
```bash
# Verifica las credenciales
# Asegúrate de que NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY están correctas
```

## 📚 Referencias

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Supabase Configuration](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Clerk Authentication](https://clerk.com/docs/quickstarts/nextjs)
