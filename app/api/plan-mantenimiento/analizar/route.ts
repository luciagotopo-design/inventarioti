// API Route: Análisis Inteligente de Trabajo de Mantenimiento
import { NextRequest, NextResponse } from 'next/server';
import { generarContenidoGemini } from '@/lib/gemini';
import supabase from '@/lib/supabase';

// POST - Analizar trabajo de mantenimiento planificado
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      planId, // ID opcional del plan para guardar el resultado
      equipoData,
      accionMantenimiento,
      descripcionTrabajo,
      presupuesto,
    } = body;

    console.log('🤖 Analizando trabajo de mantenimiento con Gemini AI...');

    const prompt = `
Eres un experto en mantenimiento técnico TI.
Tu tarea es generar un plan de ejecución para el siguiente trabajo.

DATOS:
- Equipo: ${equipoData.tipo} ${equipoData.marca} ${equipoData.modelo}
- Acción: ${accionMantenimiento}
- Trabajo a realizar: ${descripcionTrabajo}

INSTRUCCIONES:
Analiza el "Trabajo a realizar" y genera SOLO la información estrictamente necesaria para ejecutarlo.
NO inventes problemas adicionales. NO hagas análisis financieros ni búsquedas de precios.

GENERAR JSON CON ESTA ESTRUCTURA EXACTA:
{
  "evaluacion_plan": {
    "adecuacion": "EXCELENTE|BUENA|REGULAR|INSUFICIENTE",
    "observaciones": "Breve validación de si el trabajo coincide con la acción"
  },
  "procedimiento_optimizado": [
    {
      "paso": 1,
      "descripcion": "Instrucción técnica precisa",
      "herramientas_requeridas": ["lista corta de herramientas/software"]
    }
  ],
  "componentes_necesarios": [
    {
      "componente": "Nombre del software/hardware necesario",
      "cantidad": 1,
      "prioridad": "CRÍTICO|OPCIONAL",
      "razon_uso": "Para qué se necesita",
      "opciones_compra": [
        {
          "tienda": "Nombre tienda",
          "precio_total": 0,
          "disponibilidad": "En Stock",
          "url": "URL Búsqueda o Producto"
        }
      ],
      "recomendacion_compra": "Mejor opción calidad/precio"
    }
  ]
}

IMPORTANTE: Si se requieren repuestos, BUSCA PRECIOS REALES en Colombia.
Para la 'url', SI NO ENCUENTRAS un link directo, GENERA UN LINK DE BÚSQUEDA para que el usuario pueda comprarlo.
Ejemplos obligatorios de formato:
- MercadoLibre: 'https://listado.mercadolibre.com.co/terminos-busqueda'
- Amazon: 'https://www.amazon.com/s?k=terminos-busqueda'
- Alkosto: 'https://www.alkosto.com/search/?text=terminos-busqueda'

ASEGURA que todos los items con precio tengan una URL funcional. Si no hay repuestos, deja la lista vacía.

Sé conciso y directo.
`;

    const resultado = await generarContenidoGemini(prompt);

    // Intentar extraer JSON de la respuesta
    const jsonMatch = resultado.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analisis = JSON.parse(jsonMatch[0]);

      // Si nos pasaron un ID de plan, guardamos el análisis en Supabase
      let guardado = false;
      let errorGuardado = null;

      if (planId) {
        console.log(`💾 Guardando análisis para el plan ${planId}...`);
        const { error } = await supabase
          .from('plan_mantenimiento')
          .update({
            analisis_ia: analisis,
            updated_at: new Date().toISOString()
          })
          .eq('id', planId);

        if (error) {
          console.error('❌ Error al guardar en Supabase:', error);
          errorGuardado = error.message;
        } else {
          console.log('✅ Análisis guardado correctamente en la BD');
          guardado = true;
        }
      }

      return NextResponse.json({
        success: true,
        analisis,
        guardado,
        errorGuardado,
        raw_response: resultado,
      });
    }

    return NextResponse.json({
      success: false,
      error: 'No se pudo parsear la respuesta como JSON',
      raw_response: resultado,
    });

  } catch (error: any) {
    console.error('❌ Error en análisis de mantenimiento:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error al analizar trabajo de mantenimiento',
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
