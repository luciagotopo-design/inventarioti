# 📊 Nueva Sección de Reportes

## ✅ Cambios Implementados

### 1️⃣ Mejoras Visuales en el Frontend

**Textos más visibles y mejor contraste:**
- ✅ Headers aumentados de `text-3xl` a `text-4xl`
- ✅ Descripciones con `font-medium` para mayor peso
- ✅ Colores mejorados: `text-gray-700` en lugar de `text-gray-600`
- ✅ Botones con tamaños `lg` y textos en `text-base` o `text-lg`
- ✅ Badges y labels con mejor contraste

**Páginas actualizadas:**
- [app/categorias/page.tsx](app/categorias/page.tsx) - Gestión de categorías mejorada
- [app/inventario/page.tsx](app/inventario/page.tsx) - Header más visible
- [app/dashboard/page.tsx](app/dashboard/page.tsx) - Títulos más grandes

---

### 2️⃣ Nueva Sección de Reportes

**Ubicación:** Sidebar → **"Reportes"** (📊)

**Archivos creados:**
- `app/reportes/page.tsx` - Interfaz de generación de reportes
- `app/api/reportes/diagnosticos/route.ts` - API reporte de diagnósticos
- `app/api/reportes/mantenimientos/route.ts` - API reporte de mantenimientos

**Características:**
- ✅ Interfaz visual moderna con cards diferenciados
- ✅ Iconos y colores para cada tipo de reporte
- ✅ Filtros avanzados para mantenimientos
- ✅ Exportación a **CSV** y **JSON**
- ✅ Información detallada de qué incluye cada reporte
- ✅ Guía de uso integrada

---

## 📋 Tipos de Reportes Disponibles

### 🔴 Reporte de Diagnósticos (Equipos Críticos)

**¿Qué incluye?**
- Serial, Marca, Modelo del equipo
- Categoría y Estado actual
- Sede y Ubicación detallada
- Responsable del equipo
- **Prioridad** (Alta, Media, Baja)
- **Acción requerida**
- **Costo estimado** de reparación
- **Fecha límite** de acción
- Observaciones
- Fecha de registro

**Endpoint:** `GET /api/reportes/diagnosticos?formato=csv|json`

**Casos de uso:**
- 📊 Presentaciones ejecutivas de equipos en riesgo
- 💰 Planificación de presupuestos de reparación
- ⏰ Seguimiento de fechas límite
- 📈 Análisis de tendencias de fallas

---

### 🔵 Reporte de Acciones de Mantenimiento

**¿Qué incluye?**
- Serial, Marca, Modelo del equipo
- Categoría y Sede
- Responsable del equipo
- **Tipo de acción** de mantenimiento
- Descripción de la acción
- **Responsable de ejecución**
- **Fecha programada** vs **Fecha ejecución**
- **Estado de ejecución** (Pendiente, En Proceso, Completado, Cancelado)
- **Presupuesto** vs **Costo real**
- Observaciones

**Endpoint:** `GET /api/reportes/mantenimientos?formato=csv|json&estado=Pendiente&fechaInicio=2026-01-01&fechaFin=2026-12-31`

**Filtros disponibles:**
- `estado` - Pendiente | En Proceso | Completado | Cancelado
- `fechaInicio` - Fecha inicial (YYYY-MM-DD)
- `fechaFin` - Fecha final (YYYY-MM-DD)

**Casos de uso:**
- 📅 Planificación mensual/trimestral de mantenimientos
- 💵 Control de costos reales vs presupuestados
- ✅ Seguimiento de cumplimiento de cronogramas
- 📊 Reportes de gestión para directivos

---

## 🚀 Cómo Usar

### Paso 1: Acceder a Reportes

1. Ejecuta `npm run dev`
2. En el Sidebar, click en **"📊 Reportes"**
3. Verás dos cards grandes con opciones

### Paso 2: Generar Reporte de Diagnósticos

**Opción A - Descargar CSV (Excel):**
```
1. Click en "📥 Descargar CSV" (card rojo)
2. Se descarga automáticamente: diagnosticos_YYYY-MM-DD.csv
3. Abre en Excel o Google Sheets
4. Usa filtros, tablas dinámicas, gráficos
```

**Opción B - Descargar JSON (API):**
```
1. Click en "📥 Descargar JSON" (card rojo)
2. Se descarga: diagnosticos_YYYY-MM-DD.json
3. Estructura JSON completa con metadata
4. Úsalo en scripts, APIs, backups
```

### Paso 3: Generar Reporte de Mantenimientos

**Con filtros:**
```
1. En el card azul, configura filtros:
   - Estado: Selecciona "Pendiente" (ver solo pendientes)
   - Fecha Inicio: 2026-01-01
   - Fecha Fin: 2026-03-31

2. Click "📥 Descargar CSV"
3. Obtienes solo mantenimientos del Q1 2026 pendientes
```

**Sin filtros (todos):**
```
1. Deja filtros vacíos
2. Click "📥 Descargar CSV" o "📥 Descargar JSON"
3. Obtienes TODOS los mantenimientos
```

---

## 📊 Abrir en Excel/Google Sheets

### Microsoft Excel

```
1. Descarga el archivo .csv
2. Abre Excel
3. Archivo → Abrir → Selecciona el .csv
4. Datos aparecen en columnas automáticamente
5. Aplica formato, filtros, tablas dinámicas
```

### Google Sheets

```
1. Abre Google Sheets (sheets.google.com)
2. Archivo → Importar
3. Subir → Arrastra el .csv
4. Tipo de importador: "Detectar automáticamente"
5. Click "Importar datos"
6. ¡Listo! Datos en la hoja
```

---

## 💡 Ejemplos de Análisis

### Ejemplo 1: Priorizar Reparaciones por Costo

**Reporte:** Diagnósticos CSV  
**Pasos en Excel:**
1. Abre `diagnosticos_2026-01-14.csv`
2. Selecciona toda la tabla
3. Datos → Ordenar → Por "Costo Estimado" (Mayor a menor)
4. Resultado: Equipos más costosos arriba
5. Filtra por "Prioridad = Alta"
6. Obtén top 10 equipos críticos más costosos

### Ejemplo 2: Análisis de Mantenimientos Atrasados

**Reporte:** Mantenimientos CSV (filtro: Estado = Pendiente)  
**Pasos en Excel:**
1. Abre `mantenimientos_2026-01-14.csv`
2. Agrega columna "Días Atraso" = HOY() - FechaProgramada
3. Filtra: Días Atraso > 0
4. Ordena por "Días Atraso" (Mayor a menor)
5. Resultado: Mantenimientos más atrasados

### Ejemplo 3: Presupuesto vs Realidad

**Reporte:** Mantenimientos CSV (filtro: Estado = Completado)  
**Pasos en Excel:**
1. Filtra mantenimientos completados
2. Suma columna "Presupuesto"
3. Suma columna "Costo Real"
4. Calcula: Diferencia = Costo Real - Presupuesto
5. Gráfico de barras: Presupuesto vs Costo Real

---

## 🔧 Integración con APIs Externas

### Ejemplo: Power BI / Tableau

```python
import requests
import pandas as pd

# Obtener datos
response = requests.get('http://localhost:3000/api/reportes/diagnosticos?formato=json')
data = response.json()

# Convertir a DataFrame
df = pd.DataFrame(data['diagnosticos'])

# Análisis
print(f"Total equipos críticos: {len(df)}")
print(f"Costo total estimado: ${df['costo_estimado'].sum():,.2f}")

# Exportar para Power BI
df.to_csv('powerbi_import.csv', index=False)
```

### Ejemplo: Notificaciones Automatizadas

```javascript
// Script Node.js - Ejecutar diariamente (cron)
const axios = require('axios');
const nodemailer = require('nodemailer');

async function reporteDiario() {
  // Obtener equipos críticos
  const { data } = await axios.get('http://localhost:3000/api/reportes/diagnosticos?formato=json');
  
  const equiposUrgentes = data.diagnosticos.filter(d => 
    d.prioridad === 'Alta' && new Date(d.fecha_limite) < new Date()
  );
  
  if (equiposUrgentes.length > 0) {
    // Enviar email de alerta
    await transporter.sendMail({
      to: 'gerencia@empresa.com',
      subject: `⚠️ ALERTA: ${equiposUrgentes.length} equipos críticos vencidos`,
      html: `<h1>Equipos que requieren atención URGENTE:</h1>
             <ul>${equiposUrgentes.map(e => `<li>${e.serial} - ${e.accion_requerida}</li>`).join('')}</ul>`
    });
  }
}
```

---

## 📁 Estructura de Archivos CSV

### diagnosticos.csv

```csv
Serial,Marca,Modelo,Categoría,Estado,Sede,Ubicación,Responsable,Prioridad,Acción Requerida,Costo Estimado,Fecha Límite,Observaciones,Fecha Registro
LRO85C9L,Lenovo,V510,PC/Portátil,Dañado,Cali,Oficina Principal,Diana Gonzalez,Alta,"Revisar botón encendido",150000,2026-02-01,"Presenta fallas intermitentes",2026-01-14
...
```

### mantenimientos.csv

```csv
Serial Equipo,Marca,Modelo,Categoría,Sede,Responsable Equipo,Acción,Descripción,Responsable Ejecución,Fecha Programada,Fecha Ejecución,Estado,Presupuesto,Costo Real,Observaciones
CDN2440PBB,Hp,Ultrabook,PC/Portátil,Cali,Diana Gonzalez,Limpieza preventiva,"Limpieza interna y externa",Juan Pérez,2026-01-15,Pendiente,Pendiente,50000,0,"Programado para próxima semana"
...
```

---

## 🎉 Resumen

✅ **Frontend mejorado** - Textos más grandes y legibles  
✅ **Página de Reportes** - Interfaz visual moderna  
✅ **2 tipos de reportes** - Diagnósticos y Mantenimientos  
✅ **Exportación dual** - CSV (Excel) y JSON (APIs)  
✅ **Filtros avanzados** - Estado, fechas, etc.  
✅ **Documentación completa** - Ejemplos de uso  
✅ **Sin errores** - Listo para producción  

**Próximo paso:** `npm run dev` → Sidebar → **"📊 Reportes"** → Genera tu primer reporte 🚀
