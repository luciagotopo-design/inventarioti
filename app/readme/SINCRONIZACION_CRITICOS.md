# Sincronización Automática de Equipos Críticos

## 📋 Descripción

Sistema automático que identifica y sincroniza equipos críticos desde la tabla `inventario_general` hacia la tabla `equipos_criticos` basándose en múltiples criterios de análisis.

## 🎯 Funcionalidades

### 1. Identificación Automática de Equipos Críticos

El sistema analiza cada equipo del inventario usando **7 criterios** para determinar si es crítico:

#### Criterios de Criticidad

| Criterio | Puntuación | Descripción |
|----------|-----------|-------------|
| **Marcado como crítico** | +30 | Campo `es_critico = true` en inventario |
| **Fuera de servicio** | +40 | Estado del equipo impide operación |
| **En reparación** | +25 | Equipo con operatividad limitada |
| **Antigüedad ≥ 5 años** | +3 por año (max 30) | Riesgo de fallas por antigüedad |
| **Costo ≥ $5,000,000** | +20 | Alto impacto financiero |
| **≥ 2 mantenimientos pendientes** | +10 por mantenimiento | Riesgo acumulado |
| **Mantenimientos vencidos** | +15 por vencido | Atención urgente requerida |
| **Sin mantenimiento 6+ meses** | +15 | Riesgo de deterioro |

### 2. Niveles de Criticidad

Basándose en la puntuación total:

| Nivel | Puntuación | Plazo de Acción | Prioridad |
|-------|-----------|----------------|-----------|
| **CRÍTICO** | ≥ 70 puntos | 7 días | Alta |
| **ALTO** | 40-69 puntos | 30 días | Alta |
| **MEDIO** | 20-39 puntos | 90 días | Media |

> **Nota:** Equipos con menos de 20 puntos NO se consideran críticos.

## 🚀 Uso

### Sincronización Manual

1. **Desde la interfaz web:**
   - Ir a **Equipos Críticos** (`/equipos-criticos`)
   - Click en el botón **"🔄 Sincronizar desde Inventario"**
   - El sistema mostrará un resumen de cambios realizados

2. **Desde la API:**
   ```bash
   POST /api/equipos-criticos/sincronizar
   ```

   **Respuesta:**
   ```json
   {
     "success": true,
     "message": "Sincronización completada exitosamente",
     "stats": {
       "totalCriticos": 15,
       "insertados": 5,
       "actualizados": 8,
       "eliminados": 2,
       "sinCambios": 3,
       "breakdown": {
         "criticos": 4,
         "altos": 7,
         "medios": 4
       }
     }
   }
   ```

### Sincronización Automática

La sincronización se ejecuta automáticamente cuando:

1. **Al generar el Reporte Maestro**
   - POST `/api/reportes/maestro`
   - Se sincroniza antes de analizar los datos
   - Asegura que el reporte incluya equipos críticos actualizados

## 📊 Operaciones de Sincronización

### Inserción
- Se crea un nuevo registro en `equipos_criticos`
- Se marca el equipo como `es_critico = true` en `inventario_general`
- Se asigna prioridad según nivel de criticidad
- Se calcula fecha límite de acción

### Actualización
- Solo se actualizan equipos **NO resueltos**
- Se actualizan: prioridad, acción requerida, fecha límite
- Equipos marcados como "resueltos" se mantienen intactos

### Eliminación
- Equipos que ya no cumplen criterios se eliminan (si NO están resueltos)
- Se desmarca `es_critico = false` en inventario
- Equipos resueltos se preservan como histórico

## 🔧 Estructura de Datos

### Tabla: equipos_criticos

```sql
CREATE TABLE equipos_criticos (
  id UUID PRIMARY KEY,
  id_equipo UUID REFERENCES inventario_general(id),
  nivel_prioridad_id UUID REFERENCES prioridades(id),
  accion_requerida TEXT,
  fecha_limite_accion TIMESTAMP,
  resuelto BOOLEAN DEFAULT false,
  costo_estimado DECIMAL(10,2),
  imagenes TEXT[],
  notas_resolucion TEXT,
  fecha_resolucion TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Campos Generados Automáticamente

- **accion_requerida:** Lista de razones por las cuales el equipo es crítico
- **nivel_prioridad_id:** Prioridad según puntuación (Alta/Media/Baja)
- **fecha_limite_accion:** Calculada según nivel de criticidad
- **resuelto:** Siempre `false` al insertar

## 📝 Ejemplos

### Ejemplo 1: Equipo Crítico por Antigüedad y Estado

```
Equipo: Servidor Dell PowerEdge R710
Antigüedad: 8 años (+24 puntos)
Estado: Fuera de Servicio (+40 puntos)
Costo: $8,500,000 (+20 puntos)
---
Puntuación Total: 84 puntos
Nivel: CRÍTICO
Acción: Evaluación técnica inmediata
Plazo: 7 días
```

### Ejemplo 2: Equipo Alto por Mantenimientos Pendientes

```
Equipo: UPS APC Smart 3000
Mantenimientos Pendientes: 3 (+30 puntos)
Mantenimientos Vencidos: 1 (+15 puntos)
---
Puntuación Total: 45 puntos
Nivel: ALTO
Acción: Programar mantenimiento
Plazo: 30 días
```

## 🔍 Logs y Depuración

El sistema genera logs detallados en la consola del servidor:

```
🔄 Iniciando sincronización de equipos críticos...
📋 Prioridades cargadas: { CRÍTICO: 'uuid...', ALTO: 'uuid...', MEDIO: 'uuid...' }
📊 Analizando 150 equipos...
🎯 Identificados 15 equipos críticos
✅ Insertado: Servidor Principal (CRÍTICO)
🔄 Actualizado: UPS Sala Servidores (ALTO)
✅ Sincronización completada:
   - Insertados: 5
   - Actualizados: 8
   - Eliminados: 2
   - Sin cambios: 3
```

## ⚠️ Consideraciones

1. **Equipos Resueltos:** NO se modifican ni eliminan automáticamente. Se preservan como histórico.

2. **Prioridades:** El sistema usa las prioridades definidas en la tabla `prioridades`:
   - Nivel 1 = Alta (CRÍTICO y ALTO)
   - Nivel 2 = Media (MEDIO)
   - Nivel 3 = Baja (no usada actualmente)

3. **Umbral Mínimo:** Solo equipos con ≥20 puntos se consideran críticos.

4. **Actualización de Inventario:** El campo `es_critico` en `inventario_general` se mantiene sincronizado automáticamente.

## 🛠️ Archivos Relacionados

- **Endpoint de sincronización:** `/app/api/equipos-criticos/sincronizar/route.ts`
- **Interfaz web:** `/app/(protected)/equipos-criticos/page.tsx`
- **Reporte maestro:** `/app/api/reportes/maestro/route.ts`
- **Lógica de análisis:** Función `identificarEquiposCriticos()`

## 📈 Mejoras Futuras

- [ ] Sincronización programada (cron job)
- [ ] Notificaciones por email para equipos críticos nuevos
- [ ] Dashboard de tendencias de criticidad
- [ ] Exportar historial de cambios
- [ ] Configuración personalizable de criterios y puntuaciones
