# 🤖 Integración de IA para Agregar Equipos mediante Imagen

## 📋 Descripción

Esta funcionalidad permite agregar equipos al inventario usando **Gemini Vision AI** de Google para analizar imágenes y extraer información automáticamente.

## ✨ Características

- 📸 **Análisis de imágenes** con Gemini Vision AI
- 🎯 **Extracción automática** de marca, modelo, serial y estado
- 🔍 **Identificación de textos** en etiquetas y códigos
- 📊 **Evaluación visual** del estado del equipo
- ✅ **Autocompletado inteligente** del formulario
- 🎨 **Interfaz moderna** con diseño paso a paso

## 🚀 Cómo Usar

### 1. Importar el Componente

```tsx
import AgregarEquipoConIA from '@/components/equipos/AgregarEquipoConIA';
```

### 2. Uso en tu Página

```tsx
'use client';

import { useState } from 'react';
import AgregarEquipoConIA from '@/components/equipos/AgregarEquipoConIA';

export default function InventarioPage() {
  const [modalAbierto, setModalAbierto] = useState(false);

  // Cargar datos maestros (categorías, estados, sedes)
  const [categorias, setCategorias] = useState([]);
  const [estados, setEstados] = useState([]);
  const [sedes, setSedes] = useState([]);

  useEffect(() => {
    // Cargar datos maestros desde tu API
    fetch('/api/maestros')
      .then(res => res.json())
      .then(data => {
        setCategorias(data.categorias);
        setEstados(data.estados);
        setSedes(data.sedes);
      });
  }, []);

  return (
    <div>
      <button onClick={() => setModalAbierto(true)}>
        ✨ Agregar Equipo con IA
      </button>

      <AgregarEquipoConIA
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onEquipoCreado={() => {
          // Recargar inventario
          console.log('Equipo creado exitosamente');
        }}
        categorias={categorias}
        estados={estados}
        sedes={sedes}
      />
    </div>
  );
}
```

## 📁 Estructura de Archivos

```
lib/
├── gemini-vision.ts          # Funciones de análisis con Gemini Vision

app/api/
├── equipos/
│   └── analizar-imagen/
│       └── route.ts          # API endpoint para analizar imágenes

components/
├── equipos/
│   ├── ImagenEquipoUploader.tsx     # Componente de upload y análisis
│   └── AgregarEquipoConIA.tsx       # Modal completo con wizard
```

## 🔧 Configuración Requerida

Asegúrate de tener configurada la API key de Gemini en tu archivo `.env.local`:

```bash
GEMINI_API_KEY=tu-api-key-aqui
NEXT_PUBLIC_GEMINI_API_KEY=tu-api-key-aqui
```

Obtén tu API key en: https://aistudio.google.com/apikey

## 📊 Datos Extraídos por IA

El análisis de imagen extrae:

### ✅ Información del Equipo
- Tipo de equipo (computador, monitor, impresora, etc.)
- Marca identificada
- Modelo identificado
- Número de serial (si es visible)
- Etiqueta de activo (si existe)

### 🔍 Estado Visual
- Estado general (Excelente, Bueno, Regular, Malo, Crítico)
- Descripción del estado físico
- Daños visibles
- Observaciones

### 📦 Características Físicas
- Color predominante
- Puertos visibles
- Tamaño estimado

### 📝 Textos Identificados
- Etiquetas
- Números de serie
- Códigos de barras/QR
- Otros textos relevantes

## 🎯 Flujo de Usuario

1. **Paso 1: Análisis de Imagen**
   - Usuario sube o toma foto del equipo
   - Click en "Analizar Equipo con IA"
   - IA procesa la imagen (5-10 segundos)
   - Muestra resultados detallados
   - Click en "Continuar"

2. **Paso 2: Completar Datos**
   - Formulario autocompletado con datos de IA
   - Usuario revisa y completa campos faltantes
   - Selecciona categoría, estado y sede
   - Click en "Agregar al Inventario"

## 🎨 Diseño UI

### Modal de dos pasos con:
- ✅ Indicador de progreso
- 📸 Preview de imagen
- 📊 Visualización de resultados de IA
- 🎯 Autocompletado inteligente
- ⚠️ Validaciones y errores claros
- 🎭 Animaciones suaves

## 🔐 Validaciones

### Archivo de Imagen:
- ✅ Formatos: JPG, PNG, WEBP
- ✅ Tamaño máximo: 10MB
- ✅ Validación de tipo MIME

### Formulario:
- ✅ Serial (requerido)
- ✅ Marca (requerido)
- ✅ Modelo (requerido)
- ✅ Categoría (requerido)
- ✅ Estado (requerido)
- ✅ Sede (requerido)

## 🚨 Manejo de Errores

El sistema maneja:
- ❌ Límite de cuota de API (429)
- ❌ API key inválida
- ❌ Formato de imagen no válido
- ❌ Imagen muy grande
- ❌ Error en análisis de IA
- ❌ Error al guardar en base de datos

## 💡 Recomendaciones

### Para mejores resultados:
1. 📸 Toma fotos claras y bien iluminadas
2. 🔍 Enfoca las etiquetas y seriales
3. 📏 Acerca la cámara a textos pequeños
4. 🌞 Evita reflejos y sombras
5. 📱 Usa buena resolución (pero < 10MB)

### Ejemplos de equipos que funciona bien:
- ✅ Computadores (Desktop/Laptop)
- ✅ Monitores
- ✅ Impresoras
- ✅ Switches y Routers
- ✅ Servidores
- ✅ Tablets y Teléfonos

## 📈 Métricas de IA

El análisis incluye:
- **Confianza**: Alta / Media / Baja
- **Nivel de detalle**: Alto / Medio / Bajo
- **Imagen clara**: Sí / No
- **Requiere revisión manual**: Sí / No

## 🔄 Integración con Inventario

Una vez creado el equipo:
1. Se guarda en `inventario_general`
2. Se pueden agregar imágenes de evidencia
3. Se puede marcar como crítico si necesita atención
4. Se puede asignar plan de mantenimiento

## 🎓 Próximos Pasos

Después de integrar esta funcionalidad:
1. Prueba con diferentes tipos de equipos
2. Ajusta los prompts de IA si es necesario
3. Personaliza los campos del formulario
4. Agrega validaciones adicionales
5. Implementa análisis batch de múltiples imágenes

## 📚 Referencias

- [Google Gemini Vision](https://ai.google.dev/gemini-api/docs/vision)
- [Next.js File Upload](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Componentes UI](../components/ui/README.md)

---

**¿Preguntas?** Revisa los logs en la consola del navegador y del servidor para debugging.
