# \ud83d\udc1b Gu\u00eda de Debugging - Sistema Inventario TI

## \ud83d\udce1 Console Logs Implementados

### \ud83d\udcca API Routes (Backend)

Todas las rutas API ahora incluyen logging detallado:

#### \ud83d\udd35 `/api/dashboard`
```
\ud83d\udd35 [API] GET /api/dashboard - Iniciando consulta...
\ud83d\udcca Consultando total de equipos...
\u2705 Total equipos: 150
\ud83d\udcca Buscando estado "Operativo"...
\u2705 Estado Operativo encontrado: 64f7b1a2c3d4e5f6g7h8i9j0
\u2705 [API] Dashboard completado en 245ms
\ud83d\udce4 Enviando respuesta con KPIs
```

#### \ud83d\udd35 `/api/maestros`
```
\ud83d\udd35 [API] GET /api/maestros - Iniciando consulta...
\ud83d\udcca Consultando datos maestros (categor\u00edas, estados, sedes, prioridades, acciones)...
\u2705 Maestros obtenidos - Categor\u00edas: 9, Estados: 6, Sedes: 5
\u2705 [API] Maestros completado en 180ms
```

#### \ud83d\udd35 `/api/inventario`
```
\ud83d\udd35 [API] GET /api/inventario - Iniciando consulta...
\ud83d\udcca Par\u00e1metros - P\u00e1gina: 1, L\u00edmite: 10, B\u00fasqueda: ""
\ud83d\udcca Filtros - Sede: Todas, Estado: Todos, Categor\u00eda: Todas
\u2705 Equipos obtenidos: 10 de 150 totales
\u2705 [API] Inventario completado en 320ms
```

#### \ud83d\udd35 `/api/equipos-criticos`
```
\ud83d\udd35 [API] GET /api/equipos-criticos - Iniciando consulta...
\u2705 Equipos cr\u00edticos obtenidos: 8
\u2705 [API] Equipos cr\u00edticos completado en 150ms
```

#### \ud83d\udd35 `/api/plan-mantenimiento`
```
\ud83d\udd35 [API] GET /api/plan-mantenimiento - Iniciando consulta...
\u2705 Planes de mantenimiento obtenidos: 25
\u2705 [API] Plan mantenimiento completado en 200ms
```

### \ud83d\udc68\u200d\ud83d\udcbb Frontend Pages (Cliente)

#### Dashboard
```
\ud83d\udd35 [DASHBOARD] Iniciando carga de datos...
\ud83d\udd0d Consultando API /api/dashboard...
\ud83d\udcca Response status: 200 OK
\u2705 Dashboard data recibida en 250ms
\ud83d\udcca KPIs - Total: 150, Operativos: 120, Cr\u00edticos: 8
```

#### Inventario
```
\ud83d\udd35 [INVENTARIO] Cargando datos maestros...
\ud83d\udcca Maestros response status: 200
\u2705 Maestros cargados - Categor\u00edas: 9, Estados: 6, Sedes: 5

\ud83d\udd35 [INVENTARIO] Cargando equipos...
\ud83d\udd0d Consultando /api/inventario?page=1&limit=10
\ud83d\udcca Response status: 200
\u2705 Equipos cargados en 325ms - 10 equipos de 150 totales
```

#### Equipos Cr\u00edticos
```
\ud83d\udd35 [EQUIPOS CR\u00cdTICOS] Cargando prioridades...
\ud83d\udcca Maestros response status: 200
\u2705 Prioridades cargadas: 3

\ud83d\udd35 [EQUIPOS CR\u00cdTICOS] Cargando equipos cr\u00edticos...
\ud83d\udd0d Consultando /api/equipos-criticos?resueltos=false
\ud83d\udcca Response status: 200
\u2705 Equipos cr\u00edticos cargados en 155ms - Total: 8
```

#### Plan de Mantenimiento
```
\ud83d\udd35 [PLAN MANTENIMIENTO] Cargando maestros y equipos...
\ud83d\udcca Maestros response: 200, Equipos response: 200
\u2705 Acciones: 7, Equipos: 150

\ud83d\udd35 [PLAN MANTENIMIENTO] Cargando planes...
\ud83d\udd0d Consultando /api/plan-mantenimiento?
\ud83d\udcca Response status: 200
\u2705 Planes cargados en 205ms - Total: 25
```

## \u274c Errores Comunes y Debugging

### Error de Conexi\u00f3n MongoDB
```
\u274c [ERROR] Error fetching dashboard data: Error [PrismaClientKnownRequestError]
\u274c Stack: Server selection timeout: None of the available servers suitable...
```

**Causas:**
1. MongoDB Atlas no tiene IP en whitelist
2. Credenciales incorrectas
3. Cluster en mantenimiento
4. Firewall bloqueando puerto 27017

**Soluci\u00f3n:**
```powershell
# 1. Verificar conexi\u00f3n
$env:DATABASE_URL
# Debe mostrar: mongodb+srv://usuario:password@cluster.mongodb.net/dbname...

# 2. En MongoDB Atlas:
#    - Network Access \u2192 Add IP Address \u2192 Allow Access from Anywhere (0.0.0.0/0)
#    - Database Access \u2192 Verify user has readWrite permissions

# 3. Reiniciar servidor
npm run dev
```

### Error HTTP 500
```
\ud83d\udcca Response status: 500 Internal Server Error
```

**Debugging:**
1. Revisar logs de consola del servidor (terminal donde corre `npm run dev`)
2. Ver el mensaje de error espec\u00edfico en el stack trace
3. Verificar que Prisma client est\u00e1 generado: `npx prisma generate`

### Error HTTP 404
```
\ud83d\udcca Response status: 404 Not Found
```

**Causas:**
- Ruta API incorrecta
- Archivo no existe en `app/api/`
- Error en el routing

## \ud83d\udee0\ufe0f Herramientas de Debugging

### 1. Chrome DevTools
```
F12 \u2192 Console Tab
```
Ver todos los logs de frontend y respuestas de API

### 2. Network Tab
```
F12 \u2192 Network Tab \u2192 Filtrar por "Fetch/XHR"
```
Ver todas las peticiones HTTP, headers, payloads y respuestas

### 3. Terminal del Servidor
```
npm run dev
```
Ver logs del backend (API routes)

### 4. Prisma Studio
```powershell
npx prisma studio
```
Ver y editar datos de MongoDB directamente

## \ud83d\udcdd Mejoras de UI Implementadas

### Componentes Nuevos

1. **LoadingSpinner** (`components/ui/LoadingSpinner.tsx`)
   - Estados de carga uniformes
   - Tama\u00f1os: sm, md, lg, xl
   - Modo fullScreen para p\u00e1ginas completas

2. **ErrorAlert** (`components/ui/ErrorAlert.tsx`)
   - Alertas de error con bot\u00f3n de reintentar
   - Tipos: error, warning, info
   - Mensajes personalizados

3. **EmptyState** (`components/ui/EmptyState.tsx`)
   - Estados vac\u00edos cuando no hay datos
   - Con iconos y acciones opcionales

### Uso en P\u00e1ginas

#### Dashboard
```tsx
if (loading) {
  return <LoadingSpinner fullScreen size="lg" message="Cargando dashboard..." />;
}

if (error || !data) {
  return <ErrorAlert 
    title="Error al cargar el dashboard" 
    message={error} 
    onRetry={fetchDashboardData} 
  />;
}
```

## \ud83d\udcca Monitoreo de Performance

Los logs incluyen medici\u00f3n de tiempo:

```
\u2705 [API] Dashboard completado en 245ms  \u2190 Tiempo backend
\u2705 Dashboard data recibida en 250ms     \u2190 Tiempo total (backend + network)
```

**Benchmarks esperados:**
- Dashboard: < 500ms
- Maestros: < 300ms
- Inventario (10 items): < 400ms
- Equipos Cr\u00edticos: < 200ms
- Plan Mantenimiento: < 300ms

\u26a0\ufe0f **Si los tiempos superan 1 segundo**, verificar:
1. Latencia de MongoDB Atlas
2. Cantidad de datos retornados
3. \u00cdndices en base de datos

## \ud83d\udd0d C\u00f3mo Depurar un Problema

### Paso 1: Abrir DevTools
```
F12 \u2192 Console
```

### Paso 2: Reproducir el Error
- Navegar a la p\u00e1gina problem\u00e1tica
- Ejecutar la acci\u00f3n que falla

### Paso 3: Leer los Logs
```
\ud83d\udd35 Inicio de operaci\u00f3n
\ud83d\udcca Detalles de la operaci\u00f3n
\u2705 \u00c9xito
\u274c Error (si falla)
```

### Paso 4: Identificar la Causa
- \u00bfFall\u00f3 en el frontend o backend?
- \u00bfQu\u00e9 HTTP status se recibi\u00f3?
- \u00bfQu\u00e9 mensaje de error aparece?

### Paso 5: Aplicar Soluci\u00f3n
Ver secci\u00f3n "Errores Comunes" arriba

## \ud83d\udccc Tips Adicionales

### Habilitar Modo Verbose en Prisma
```typescript
// lib/prisma.ts
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});
```

### Ver Queries SQL/MongoDB
```
\ud83d\udd39 prisma:query SELECT * FROM InventarioGeneral WHERE...
```

### Limpiar Cach\u00e9 de Next.js
```powershell
rm -r .next
npm run dev
```

### Regenerar Prisma Client
```powershell
npx prisma generate
```

---

\ud83d\udcac **Nota**: Todos los logs usan emojis para facilitar la lectura:
- \ud83d\udd35 Inicio de operaci\u00f3n
- \ud83d\udcca Informaci\u00f3n
- \ud83d\udd0d Consultando/Buscando
- \u2705 \u00c9xito
- \u274c Error
- \ud83d\udce4 Enviando respuesta
