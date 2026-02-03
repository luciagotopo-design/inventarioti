// Configuración de Gemini Vision para análisis de imágenes de equipos
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
    console.error('❌ GEMINI_API_KEY no está configurada para Vision');
}

let genAI: GoogleGenerativeAI | null = null;
let visionModel: any = null;

if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
    // Usando gemini-flash-latest (mismo modelo que usa el dashboard exitosamente)
    visionModel = genAI.getGenerativeModel({
        model: 'gemini-flash-latest'
    });
}

/**
 * Analiza una imagen de equipo y extrae información estructurada
 */
export async function analizarImagenEquipo(imageBase64: string, mimeType: string): Promise<any> {
    if (!apiKey || !visionModel) {
        throw new Error('Gemini Vision no está configurado. Verifica GEMINI_API_KEY en .env.local');
    }

    try {
        console.log('📸 Analizando imagen de equipo con Gemini Vision...');

        const prompt = `
Actúa como un ESPECIALISTA EN IDENTIFICACIÓN DE EQUIPOS TI.

TAREA: Analiza la imagen del equipo y extrae TODA la información visible.

INSTRUCCIONES:
1. Identifica el tipo de equipo (computador, monitor, impresora, router, switch, servidor, laptop, tablet, teléfono, etc.)
2. Lee TODAS las etiquetas, seriales, placas y textos visibles
3. Identifica marca y modelo si es visible
4. **CUENTA cuántos equipos iguales hay en la imagen** (importante para cantidad)
5. Estima el estado visual del equipo (Excelente, Bueno, Regular, Malo, Crítico)
6. Describe características físicas relevantes (tamaño, color, puertos visibles, RAM, almacenamiento, etc.)
7. Identifica cualquier daño visible o signos de desgaste
8. Busca números de serie, etiquetas de activos, códigos de barras o QR

IMPORTANTE:
- Si no puedes identificar algo, usa "No identificado" 
- Sé muy específico con los textos que veas en la imagen
- Si ves múltiples equipos IDÉNTICOS, indica la cantidad exacta
- Si ves UN solo equipo, la cantidad es 1
- Presta especial atención a textos pequeños o etiquetas
- Detecta especificaciones técnicas (RAM, disco duro, procesador) si son visibles

FORMATO DE RESPUESTA (JSON estricto, sin comentarios):
{
  "identificacion_exitosa": true/false,
  "confianza_analisis": "alta/media/baja",
  "equipo": {
    "tipo": "Tipo de equipo identificado",
    "categoria_sugerida": "Computadores/Periféricos/Redes/Servidores/Móviles",
    "marca": "Marca identificada o 'No identificado'",
    "modelo": "Modelo identificado o 'No identificado'",
    "serial": "Número de serie visible o 'No visible'",
    "etiqueta_activo": "Código de activo si es visible o 'No visible'",
    "cantidad": 1,
    "especificaciones": {
      "ram": "Ej: 8GB, 16GB o 'No visible'",
      "almacenamiento": "Ej: 256GB SSD, 1TB HDD o 'No visible'",
      "procesador": "Ej: Intel i5, AMD Ryzen 5 o 'No visible'"
    }
  },
  "estado_visual": {
    "estado_general": "Excelente/Bueno/Regular/Malo/Crítico",
    "descripcion": "Descripción del estado físico",
    "danos_visibles": [],
    "observaciones": []
  },
  "caracteristicas_fisicas": {
    "color_predominante": "Color principal",
    "puertos_visibles": [],
    "tamano_estimado": "Pequeño/Mediano/Grande",
    "otros_detalles": []
  },
  "textos_identificados": {
    "etiquetas": [],
    "numeros": [],
    "codigos": [],
    "otros": []
  },
  "recomendaciones": {
    "informacion_adicional_necesaria": [],
    "verificar_manualmente": [],
    "sugerencias_inventario": []
  },
  "metadatos": {
    "precisa_revision_manual": true/false,
    "nivel_detalle_obtenido": "alto/medio/bajo",
    "imagen_clara": true/false
  }
}`;

        // Preparar la imagen para el modelo
        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType: mimeType
            }
        };

        const result = await visionModel.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        console.log('✅ Análisis completado');
        console.log('Respuesta raw:', text.substring(0, 200) + '...');

        // Extraer JSON de la respuesta
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const analisisData = JSON.parse(jsonMatch[0]);
            return analisisData;
        }

        // Si no se puede parsear como JSON, devolver respuesta raw
        return {
            identificacion_exitosa: false,
            error: 'No se pudo parsear la respuesta como JSON',
            respuesta_texto: text
        };

    } catch (error: any) {
        console.error('❌ Error en análisis de imagen:', error);

        // Manejar límite de cuota
        if (error?.message?.includes('quota') || error?.status === 429) {
            throw new Error('⏱️ Has alcanzado el límite de solicitudes. Espera unos minutos.');
        }

        if (error?.message?.includes('API_KEY_INVALID')) {
            throw new Error('API key inválida. Verifica tu clave en Google AI Studio.');
        }

        throw new Error(error?.message || 'Error al analizar la imagen con Gemini Vision');
    }
}

/**
 * Convierte un File a base64
 */
export async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64String = reader.result as string;
            // Remover el prefijo "data:image/xxx;base64,"
            const base64 = base64String.split(',')[1];
            resolve(base64);
        };
        reader.onerror = (error) => reject(error);
    });
}
