// Configuración de Google Gemini AI
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY no está configurada');
  console.error('📝 Crea un archivo .env.local en la raíz del proyecto con:');
  console.error('   GEMINI_API_KEY=tu-api-key-aqui');
  console.error('   NEXT_PUBLIC_GEMINI_API_KEY=tu-api-key-aqui');
} else {
  console.log('✅ API Key encontrada:', apiKey.substring(0, 10) + '...');
}

let genAI: GoogleGenerativeAI | null = null;
let geminiModel: any = null;

if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
  // Usar gemini-1.5-flash que tiene más cuota gratuita disponible
  geminiModel = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash'
  });
  console.log('✅ Modelo Gemini 1.5 Flash inicializado');
}

export { geminiModel };

/**
 * Genera contenido usando Gemini AI
 * TEMPORALMENTE DESHABILITADO - Cuota excedida
 */
export async function generarContenidoGemini(prompt: string): Promise<string> {
  // DESHABILITADO TEMPORALMENTE - Descomentar cuando se restablezca la cuota
  throw new Error('⚠️ Análisis con IA temporalmente deshabilitado. La funcionalidad estará disponible próximamente.');
  
  /* CÓDIGO COMENTADO - DESCOMENTAR CUANDO SE RESTABLEZCA LA CUOTA
  if (!apiKey) {
    throw new Error('Gemini AI no está configurado. Agrega GEMINI_API_KEY y NEXT_PUBLIC_GEMINI_API_KEY en .env.local');
  }

  if (!geminiModel) {
    throw new Error('El modelo Gemini no está disponible. Verifica tu API key.');
  }

  try {
    console.log('🤖 Generando contenido...');
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('✅ Contenido generado');
    return text;
  } catch (error: any) {
    console.error('❌ Error completo:', error);
    
    // Manejar límite de cuota
    if (error?.message?.includes('quota') || error?.status === 429) {
      throw new Error('⏱️ Has alcanzado el límite de solicitudes gratuitas. Espera unos minutos o actualiza tu plan en https://ai.google.dev/pricing');
    }
    
    if (error?.message?.includes('API_KEY_INVALID')) {
      throw new Error('API key inválida. Verifica tu clave en https://aistudio.google.com/apikey');
    }
    
    throw new Error(error?.message || 'Error al generar contenido con Gemini');
  }
  */
}

/**
 * Busca precios de repuestos en tiendas online usando Gemini
 * TEMPORALMENTE DESHABILITADO - Cuota excedida
 */
export async function buscarPreciosConGemini(
  componente: string,
  marca: string,
  modelo: string,
  pais: string,
  moneda: string
): Promise<any> {
  // DESHABILITADO TEMPORALMENTE
  return {
    componente,
    busqueda_exitosa: false,
    error: '⚠️ Búsqueda de precios con IA temporalmente deshabilitada. La funcionalidad estará disponible próximamente.',
    notas_adicionales: 'Funcionalidad deshabilitada temporalmente por límite de cuota de API.'
  };
  
  /* CÓDIGO COMENTADO - DESCOMENTAR CUANDO SE RESTABLEZCA LA CUOTA
  const prompt = `
Actúa como un experto en búsqueda de precios y análisis de mercado tecnológico.

TAREA: Buscar precios actuales de repuestos/componentes en tiendas online de ${pais}.

COMPONENTE A BUSCAR: ${componente}
MARCA DEL EQUIPO: ${marca}
MODELO DEL EQUIPO: ${modelo}
PAÍS: ${pais}
MONEDA: ${moneda}

INSTRUCCIONES:
1. Buscar en las principales tiendas online de ${pais}:
   - MercadoLibre ${pais}
   - Amazon (con envío a ${pais})
   - Tiendas especializadas locales (Alkosto, Ktronix, CompuDemano, etc.)
   - Distribuidores oficiales de la marca

2. Para cada opción encontrada, proporcionar:
   - Nombre exacto del producto
   - Tienda/vendedor
   - Precio en ${moneda}
   - Costo de envío (si aplica)
   - Tiempo de entrega estimado
   - Calificación del vendedor (si está disponible)
   - Garantía ofrecida
   - URL del producto (si es posible)
   - Disponibilidad (en stock / agotado / por pedido)

3. Analizar y comparar las opciones considerando:
   - Precio total (producto + envío)
   - Relación precio-calidad
   - Confiabilidad del vendedor
   - Tiempo de entrega
   - Garantía

4. Recomendar la MEJOR OPCIÓN con justificación clara.

IMPORTANTE:
- Usar SOLO información actualizada a la fecha de hoy: ${new Date().toLocaleDateString('es-ES')}
- NO inventar precios ni información
- Si no encuentras el componente exacto, sugerir alternativas compatibles
- Indicar claramente si algo no está disponible
- Todos los precios deben estar en ${moneda}

FORMATO DE RESPUESTA (JSON):
{
  "componente": "${componente}",
  "busqueda_exitosa": true/false,
  "fecha_consulta": "fecha actual",
  "opciones_encontradas": [],
  "mejor_opcion": {},
  "alternativas_compatibles": [],
  "notas_adicionales": ""
}
`;

  try {
    const resultado = await generarContenidoGemini(prompt);
    const jsonMatch = resultado.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return {
      componente,
      busqueda_exitosa: false,
      respuesta_texto: resultado,
      error: 'No se pudo parsear la respuesta como JSON'
    };
  } catch (error) {
    console.error('Error en búsqueda de precios con Gemini:', error);
    return {
      componente,
      busqueda_exitosa: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
  */
}

/**
 * Genera un análisis completo de mantenimiento usando Gemini
 * TEMPORALMENTE DESHABILITADO - Cuota excedida
 */
export async function generarAnalisisMantenimientoGemini(
  equipoData: {
    tipo: string;
    marca: string;
    modelo: string;
    antiguedad_anios: number;
    estado: string;
    observaciones: string;
    ubicacion: string;
    responsable: string;
    es_critico: boolean;
  },
  pais: string,
  moneda: string
): Promise<any> {
  // DESHABILITADO TEMPORALMENTE
  return {
    error: '⚠️ Análisis de mantenimiento con IA temporalmente deshabilitado. La funcionalidad estará disponible próximamente.',
    equipo: {
      tipo: equipoData.tipo,
      marca: equipoData.marca,
      modelo: equipoData.modelo,
      antiguedad_anios: equipoData.antiguedad_anios,
      estado: equipoData.estado
    },
    notas_adicionales: 'Funcionalidad deshabilitada temporalmente por límite de cuota de API.'
  };
  
  /* CÓDIGO COMENTADO - DESCOMENTAR CUANDO SE RESTABLEZCA LA CUOTA
  const prompt = `Actúa como un SISTEMA EXPERTO EN MANTENIMIENTO DE EQUIPOS TI.

INFORMACIÓN DEL EQUIPO:
- Tipo: ${equipoData.tipo}
- Marca: ${equipoData.marca}
- Modelo: ${equipoData.modelo}
- Antigüedad: ${equipoData.antiguedad_anios} años
- Estado: ${equipoData.estado}
- Observaciones: ${equipoData.observaciones || 'Ninguna'}

Genera un análisis completo en formato JSON con diagnóstico, planes de mantenimiento, componentes requeridos, análisis financiero y cronograma.`;

  try {
    const resultado = await generarContenidoGemini(prompt);
    const jsonMatch = resultado.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return {
      error: 'No se pudo parsear la respuesta como JSON',
      respuesta_texto: resultado
    };
  } catch (error) {
    console.error('Error en análisis con Gemini:', error);
    throw error;
  }
  */
}
