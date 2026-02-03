# 🤖 Configuración de Gemini AI para Análisis Inteligente

## ¿Qué es Gemini AI?

Google Gemini es un modelo de inteligencia artificial avanzado que mejora el sistema de análisis de mantenimiento:

- **Análisis más preciso**: Evaluaciones técnicas profesionales basadas en IA
- **Búsqueda real de precios**: Consulta precios actuales en tiendas online
- **Recomendaciones inteligentes**: Sugerencias basadas en análisis del mercado
- **Comparativas automáticas**: Analiza múltiples opciones y recomienda la mejor

## Obtener API Key de Gemini (GRATIS)

### Paso 1: Acceder a Google AI Studio
Ir a: https://makersuite.google.com/app/apikey

### Paso 2: Iniciar Sesión
- Usar tu cuenta de Google (Gmail)
- Aceptar términos y condiciones

### Paso 3: Crear API Key
1. Click en **"Get API Key"** o **"Create API Key"**
2. Seleccionar o crear un proyecto de Google Cloud
3. Click en **"Create API key in new project"** (más fácil)
4. Copiar la API Key generada (empieza con `AIza...`)

### Paso 4: Configurar en el Proyecto

1. Abrir el archivo `.env.local` en la raíz del proyecto
2. Agregar la línea:
```env
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

3. Guardar el archivo

4. Reiniciar el servidor:
```bash
# Detener el servidor (Ctrl+C)
npm run dev
```

## Límites Gratuitos de Gemini

✅ **Gratis para siempre:**
- 60 consultas por minuto
- 1,500 consultas por día
- 1,000,000 tokens por mes

Más que suficiente para el sistema de inventario.

## Funcionamiento

### Con GEMINI_API_KEY configurado:
```
Usuario hace clic en "🔍 Analizar"
    ↓
Sistema consulta Gemini AI
    ↓
Gemini analiza el equipo profesionalmente
    ↓
Gemini busca precios REALES en tiendas online
    ↓
Gemini compara opciones y recomienda la mejor
    ↓
Usuario ve análisis completo con precios actuales
```

### Sin GEMINI_API_KEY:
```
Usuario hace clic en "🔍 Analizar"
    ↓
Sistema usa reglas predefinidas
    ↓
Muestra precios de REFERENCIA
    ↓
Enlaces a tiendas (sin búsqueda automática)
```

## Ejemplo de Diferencia

### Análisis con IA (Gemini):
```
🤖 Análisis Inteligente:
Componente: Batería Lenovo ThinkPad E14
Búsqueda realizada el: 14/01/2026

📊 Opciones Encontradas:
1. MercadoLibre - Vendedor: TechParts Colombia
   Precio: $142,900 COP + envío $8,000
   Total: $150,900 COP
   Entrega: 2-3 días
   Calificación: 4.8/5 ⭐
   ✅ MEJOR OPCIÓN - Precio competitivo y entrega rápida

2. Amazon - Vendedor: Amazon International
   Precio: $187,500 COP (envío incluido)
   Entrega: 15-20 días
   Calificación: 4.9/5 ⭐

3. Alkosto - Producto original Lenovo
   Precio: $215,000 COP
   Entrega: Retiro en tienda o 1-2 días
   Garantía: 12 meses
```

### Análisis sin IA (Reglas):
```
⚙️ Análisis Básico:
Componente: Batería
Costo estimado: $80,000 - $250,000 COP
Promedio: $150,000 COP

🔗 Buscar en:
- MercadoLibre Colombia
- Amazon
- Alkosto
```

## Verificar Configuración

Después de configurar `GEMINI_API_KEY`:

1. Ir a Inventario General
2. Click en "🔍 Analizar" en cualquier equipo
3. Verificar que aparezca el checkbox "✨ Usar Gemini AI"
4. Generar análisis
5. Revisar en consola del navegador (F12) para ver:
   ```
   🤖 Usando Gemini AI para análisis inteligente...
   🛒 Buscando precios en tiendas online...
   ✅ Análisis con Gemini completado
   ```

## Solución de Problemas

### Error: "Invalid API Key"
- Verificar que copiaste la key completa
- La key debe empezar con `AIza`
- No debe tener espacios al inicio o final

### Error: "Quota exceeded"
- Esperar 1 minuto (límite de 60 consultas/minuto)
- O usar modo sin IA desmarcando el checkbox

### No ve el checkbox de Gemini
- Verificar que reiniciaste el servidor después de agregar la key
- Revisar que el archivo `.env.local` está en la raíz del proyecto
- Verificar que la variable se llama exactamente `GEMINI_API_KEY`

### Análisis muy lento
- Normal: Gemini puede tomar 10-30 segundos
- Está consultando múltiples tiendas online
- Puedes desactivar Gemini para análisis instantáneo

## Seguridad

🔒 **NUNCA** compartir tu `GEMINI_API_KEY` en:
- GitHub / repositorios públicos
- Screenshots
- Mensajes públicos

✅ El archivo `.env.local` está en `.gitignore` (no se sube a GitHub)

## Alternativas

Si no quieres usar Gemini AI:
1. Desmarcar checkbox "✨ Usar Gemini AI" en el modal
2. El sistema funcionará con análisis basado en reglas
3. Usará precios de referencia en lugar de búsquedas reales

## Soporte

Para más información sobre Gemini:
- Documentación: https://ai.google.dev/docs
- Precios: https://ai.google.dev/pricing
- Límites: https://ai.google.dev/docs/quota

---

**Recomendación**: Configurar GEMINI_API_KEY para obtener el máximo valor del sistema de análisis inteligente. ¡Es gratis y toma solo 2 minutos!
