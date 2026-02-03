# 🤖 Sistema de Análisis Inteligente de Mantenimiento

## Descripción General

El Sistema de Análisis Inteligente de Mantenimiento es una funcionalidad avanzada que actúa como un **experto virtual en mantenimiento de equipos TI**. Analiza cada equipo de manera integral y genera:

- 📋 **Diagnóstico completo** del estado del equipo
- 🗓️ **Plan de mantenimiento** preventivo y correctivo personalizado
- 🔧 **Identificación automática** de reparaciones necesarias
- 💰 **Estimación de costos** con rangos de precios
- 🛒 **Enlaces directos** a tiendas online para búsqueda de repuestos
- ⏰ **Programación automática** de próxima revisión

## ✨ Características Principales

### 1. Diagnóstico Inteligente por Categoría

El sistema analiza el equipo considerando:
- **Tipo de equipo** (PC/Portátil, Monitor, Impresora, Drone, UPS)
- **Antigüedad** (calculada desde fecha de registro)
- **Estado actual** (Operativo, Baja Capacidad, Dañado, etc.)
- **Criticidad** (marcado como crítico o no)
- **Observaciones** registradas en el sistema

### 2. Planes de Mantenimiento Personalizados

#### PC/Portátil
- **Preventivo:**
  - Limpieza interna cada 3 meses
  - Actualizaciones de sistema cada 1 mes
  - Cambio de pasta térmica cada 1-2 años
  - Verificación de batería cada 6 meses
  
- **Correctivo (según antigüedad):**
  - < 3 años: Optimización de software
  - 3-5 años: Upgrade de RAM/SSD
  - > 5 años: Evaluación para reemplazo

#### Monitor
- Limpieza de pantalla cada 2 meses
- Verificación de cables cada 6 meses
- Revisión de píxeles muertos cada 3 meses

#### Impresora
- Limpieza de cabezales cada 1 mes
- Revisión de tinta/tóner cada 2 semanas
- Limpieza de rodillos cada 3 meses
- Calibración cada 6 meses

#### Drones
- Inspección de hélices antes de cada vuelo
- Actualización de firmware cada 1 mes
- Calibración de GPS cada 3 meses
- Revisión de batería cada 1 mes

#### UPS
- Prueba de batería cada 1 mes
- Reemplazo de batería según antigüedad (6 meses a 2 años)
- Limpieza de ventilación cada 3 meses

### 3. Detección Automática de Reparaciones

El sistema analiza el campo **"Observaciones"** del equipo utilizando inteligencia de procesamiento de texto para identificar problemas específicos:

#### Palabras Clave Detectadas:
- 🔋 **"bateria"** → Recomienda reemplazo de batería
- 💾 **"disco duro"/"hdd"** → Sugiere upgrade a SSD
- 🧠 **"ram"/"memoria"** → Propone ampliación de RAM
- ⌨️ **"teclado"** → Indica reemplazo de teclado
- 🖥️ **"pantalla"/"screen"** → Sugiere reparación de display
- ⚡ **"encendido"/"power"** → Recomienda revisión del botón de encendido
- 🔩 **"visagra"/"bisagra"** → Indica reparación de bisagras
- 🎯 **"carcasa"** → Sugiere reemplazo de carcasa

#### Ejemplo:
```
Observaciones: "Equipo con batería inflada y disco duro lento"

El sistema detectará automáticamente:
1. ✅ Batería para reemplazo → Costo: $80,000 - $250,000 COP
2. ✅ Disco SSD para upgrade → Costo: $150,000 - $450,000 COP
```

### 4. Análisis de Costos Inteligente

Para cada reparación identificada, el sistema proporciona:

```
📦 Componente: Batería
💰 Costo Promedio: $150,000 COP
📊 Rango: $80,000 - $250,000 COP

🛒 Tiendas Sugeridas:
- MercadoLibre
- Amazon
- Tiendas oficiales

🔗 Enlaces de Búsqueda:
→ MercadoLibre: [búsqueda automática para "Batería Lenovo ThinkPad E14"]
→ Amazon: [búsqueda automática]
→ Alkosto: [búsqueda automática]
→ Ktronix: [búsqueda automática]
```

### 5. Niveles de Urgencia

El sistema clasifica cada equipo en uno de cuatro niveles:

- 🔴 **CRÍTICO (ALTO)**: Equipo dañado o con falla grave → Revisión inmediata
- 🟠 **URGENTE (ALTO)**: Equipo marcado como crítico → Revisión en 1 mes
- 🟡 **ATENCIÓN (MEDIO)**: Baja capacidad o > 5 años → Revisión en 2 meses
- 🟢 **ESTABLE (BAJO)**: Operativo y < 5 años → Revisión en 3 meses

### 6. Tiendas Recomendadas

El sistema proporciona enlaces a las principales tiendas online de Colombia:

1. **MercadoLibre Colombia** - Mayor variedad de productos
2. **Amazon** - Envíos internacionales, productos originales
3. **Alkosto** - Precios competitivos, garantía local
4. **Ktronix** - Especialista en tecnología
5. **CompuDemano** - Repuestos y componentes

## 🚀 Cómo Usar el Sistema

### Paso 1: Acceder al Análisis
1. Ir a **Inventario General**
2. Localizar el equipo que deseas analizar
3. Hacer clic en el botón **"🔍 Analizar"**

### Paso 2: Configurar el Análisis
En el modal que aparece:
- **País**: Seleccionar país (Colombia, México, Argentina, Chile)
- **Moneda**: Seleccionar moneda (COP, MXN, ARS, CLP, USD)
- Hacer clic en **"🚀 Generar Análisis Completo"**

### Paso 3: Revisar Resultados

El sistema mostrará:

#### 📋 Diagnóstico
- Marca/Modelo del equipo
- Categoría y antigüedad
- Estado actual
- Nivel de urgencia
- Recomendación inmediata

#### 🗓️ Plan de Mantenimiento
Tabla con acciones preventivas y correctivas:
- Tipo (Preventivo/Correctivo)
- Acción específica
- Frecuencia recomendada
- Prioridad (Crítica/Alta/Media/Baja)

#### 💰 Análisis de Costos
Para cada reparación necesaria:
- Componente identificado
- Descripción detallada
- Costo promedio estimado
- Rango de precios (mínimo - máximo)
- Tiendas donde buscar
- Enlaces directos a búsquedas en cada tienda

#### 🏪 Tiendas Recomendadas
Lista de tiendas con:
- Nombre de la tienda
- Especialidad
- Enlace directo al sitio web

#### 📅 Próxima Revisión
Fecha calculada automáticamente según urgencia

### Paso 4: Acciones Disponibles

- **📄 Descargar Análisis Completo**: Genera archivo .txt con todo el análisis
- **🔄 Generar Nuevo Análisis**: Permite cambiar país/moneda y regenerar
- **🔗 Clic en enlaces de tiendas**: Abre búsquedas automáticas en nueva pestaña

## 🔧 API Backend

### Endpoint: POST `/api/equipos/analisis-mantenimiento`

#### Request Body:
```json
{
  "equipoId": "uuid-del-equipo",
  "pais": "Colombia",      // Opcional, default: "Colombia"
  "moneda": "COP"          // Opcional, default: "COP"
}
```

#### Response:
```json
{
  "equipo": {
    "serial": "LRO85C9L",
    "marca": "Lenovo",
    "modelo": "ThinkPad E14",
    "categoria": "PC/Portátil",
    "estado": "Baja Capacidad",
    "antiguedad_anios": 3.2,
    "ubicacion": "Oficina Principal - Piso 2",
    "responsable": "Juan Pérez",
    "observaciones": "Batería inflada, requiere cambio urgente"
  },
  "diagnostico": {
    "nivel_urgencia": "ALTO",
    "estado_general": "🟠 URGENTE: Equipo requiere atención prioritaria",
    "recomendacion_inmediata": "Reemplazo de batería requerido urgentemente. Programar mantenimiento preventivo."
  },
  "plan_mantenimiento": [
    {
      "tipo": "Correctivo",
      "accion": "Reemplazo inmediato de batería",
      "frecuencia": "Inmediato",
      "prioridad": "Crítica"
    },
    {
      "tipo": "Preventivo",
      "accion": "Limpieza interna completa",
      "frecuencia": "Cada 3 meses",
      "prioridad": "Media"
    }
  ],
  "reparaciones_necesarias": [
    {
      "componente": "Batería",
      "descripcion": "Batería para Lenovo ThinkPad E14",
      "urgencia": "Alta",
      "buscar_en": ["Amazon", "MercadoLibre", "Tiendas oficiales"]
    }
  ],
  "analisis_costos": [
    {
      "componente": "Batería",
      "descripcion": "Batería original Lenovo ThinkPad E14",
      "costo_estimado_min": 80000,
      "costo_estimado_max": 250000,
      "costo_promedio": 150000,
      "moneda": "COP",
      "tiendas_sugeridas": ["MercadoLibre", "Amazon", "Tiendas oficiales"],
      "enlaces_busqueda": [
        {
          "tienda": "MercadoLibre",
          "url": "https://listado.mercadolibre.com.co/Batería+Lenovo+ThinkPad+E14"
        },
        {
          "tienda": "Amazon",
          "url": "https://www.amazon.com/s?k=Lenovo+ThinkPad+E14+battery"
        }
      ],
      "nota": "Precios de referencia, pueden variar según disponibilidad"
    }
  ],
  "tiendas_recomendadas": [
    {
      "nombre": "MercadoLibre Colombia",
      "url": "https://mercadolibre.com.co",
      "especialidad": "Mayor variedad de productos"
    }
  ],
  "proxima_revision": "1 mes",
  "fecha_analisis": "2024-01-15T10:30:00Z"
}
```

## 💡 Casos de Uso

### Caso 1: Equipo con múltiples problemas
```
Serial: LRO85C9L
Observaciones: "Batería inflada, disco duro lento, pantalla con líneas"

Resultado:
✅ Detecta 3 reparaciones:
1. Batería → $150,000 COP promedio
2. Disco SSD → $280,000 COP promedio
3. Pantalla → $500,000 COP promedio

💰 Costo Total: $930,000 COP
📊 Recomendación: Evaluar reemplazo vs reparación (antigüedad > 5 años)
```

### Caso 2: Equipo preventivo
```
Serial: ABC123
Estado: Operativo
Antigüedad: 2 años

Resultado:
✅ Plan preventivo únicamente:
- Limpieza interna cada 3 meses
- Actualizaciones mensuales
- Verificación de batería cada 6 meses

📅 Próxima revisión: 3 meses
```

### Caso 3: Impresora con problemas
```
Categoría: Impresora
Observaciones: "Calidad de impresión baja"

Resultado:
✅ Plan correctivo:
1. Limpieza profunda de cabezales
2. Calibración de impresión
3. Verificación de nivel de tinta

💰 Costo estimado: $50,000 - $150,000 COP
```

## 📊 Precios de Referencia (Colombia - COP)

| Componente | Mínimo | Máximo | Promedio |
|------------|---------|---------|-----------|
| Batería Portátil | $80,000 | $250,000 | $150,000 |
| Disco SSD 256GB | $150,000 | $450,000 | $280,000 |
| RAM 8GB DDR4 | $100,000 | $300,000 | $180,000 |
| Pantalla 14-15" | $300,000 | $800,000 | $500,000 |
| Teclado | $80,000 | $200,000 | $120,000 |
| Bisagras | $30,000 | $100,000 | $60,000 |
| Botón de Encendido | $20,000 | $80,000 | $40,000 |
| Carcasa | $100,000 | $300,000 | $180,000 |

*Nota: Precios de referencia actualizados a 2024. Pueden variar según marca y modelo.*

## 🔮 Próximas Mejoras

### Fase 2 (Planificada):
- [ ] Integración con APIs de tiendas para precios en tiempo real
- [ ] Web scraping automático de precios
- [ ] Comparador de precios entre tiendas
- [ ] Alertas automáticas cuando bajan precios
- [ ] Historial de análisis por equipo
- [ ] Recomendaciones basadas en machine learning
- [ ] Integración con proveedores corporativos

### Fase 3 (Futura):
- [ ] Predicción de fallas usando IA
- [ ] Optimización de costos de mantenimiento
- [ ] Generación automática de órdenes de compra
- [ ] Integración con sistemas de tickets
- [ ] Dashboard de análisis de flota completa

## 🎯 Beneficios

1. **Ahorro de Tiempo**: Análisis automático vs investigación manual (5 min vs 2 horas)
2. **Decisiones Informadas**: Datos concretos para aprobar reparaciones
3. **Optimización de Costos**: Comparación de precios en múltiples tiendas
4. **Mantenimiento Proactivo**: Planes preventivos reducen fallas
5. **Trazabilidad**: Historial completo de análisis y decisiones
6. **Profesionalización**: Reportes técnicos descargables

## 📝 Notas Técnicas

- El sistema usa **procesamiento de texto** para detectar problemas en observaciones
- Los costos son **estimaciones de referencia**, no precios en tiempo real
- Los enlaces de búsqueda se generan automáticamente con los datos del equipo
- La programación de revisiones se calcula según urgencia y estado
- Compatible con **múltiples países y monedas**
- Los análisis se pueden descargar en formato texto plano

## 📞 Soporte

Para dudas o sugerencias sobre el Sistema de Análisis Inteligente:
- Revisar esta documentación
- Verificar logs en consola del navegador
- Consultar código fuente en `/app/api/equipos/analisis-mantenimiento/route.ts`
- Probar con diferentes equipos para validar funcionamiento

---

**Versión**: 1.0  
**Última actualización**: Enero 2024  
**Autor**: Sistema de Inventario TI
