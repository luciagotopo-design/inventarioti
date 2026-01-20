// API Route: Análisis Inteligente de Trabajo de Mantenimiento
import { NextRequest, NextResponse } from 'next/server';
import { generarContenidoGemini } from '@/lib/gemini';

// POST - Analizar trabajo de mantenimiento planificado
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      equipoData,
      accionMantenimiento,
      descripcionTrabajo,
      presupuesto,
    } = body;

    console.log('🤖 Analizando trabajo de mantenimiento con Gemini AI...');

    const prompt = `
Eres un experto en mantenimiento de equipos tecnológicos e industriales con amplia experiencia en análisis técnico y optimización de procedimientos.

INFORMACIÓN DEL EQUIPO:
- Tipo/Categoría: ${equipoData.categoria}
- Marca: ${equipoData.marca}
- Modelo: ${equipoData.modelo}
- Serial: ${equipoData.serial}
- Estado Actual: ${equipoData.estado}
- Ubicación: ${equipoData.ubicacion}

TRABAJO PLANIFICADO:
- Tipo de Acción: ${accionMantenimiento}
- Descripción del Trabajo: ${descripcionTrabajo}
- Presupuesto Asignado: ${presupuesto ? `$${presupuesto}` : 'No especificado'}

TU TAREA:
Analiza el trabajo de mantenimiento planificado y proporciona una evaluación detallada con sugerencias de mejora.

DEBE INCLUIR:

1. **EVALUACIÓN DEL PLAN**:
   - ¿Es adecuado el trabajo planificado para el equipo y su estado?
   - ¿La descripción del trabajo es completa y detallada?
   - ¿Falta considerar algún aspecto importante?
   - Nivel de complejidad: Alta/Media/Baja

2. **SUGERENCIAS DE MEJORA**:
   - Pasos adicionales que deberían incluirse
   - Verificaciones o inspecciones recomendadas
   - Precauciones especiales a tomar
   - Herramientas o equipos especiales necesarios

3. **COMPONENTES Y REPUESTOS**:
   - Lista COMPLETA de repuestos/componentes necesarios
   - Especificaciones técnicas de cada componente
   - Cantidades necesarias
   - Alternativas compatibles
   - Prioridad de cada componente (Crítico/Importante/Opcional)

4. **BÚSQUEDA DE PRECIOS**:
   Para cada componente identificado, buscar precios actuales en:
   - MercadoLibre Colombia
   - Amazon con envío a Colombia
   - Alkosto, Ktronix, CompuDemano
   - Distribuidores oficiales de la marca
   
   Formato por componente:
   {
     "componente": "nombre",
     "especificaciones": "detalles técnicos",
     "opciones_compra": [
       {
         "tienda": "nombre",
         "producto": "nombre exacto",
         "precio": número,
         "envio": número,
         "total": número,
         "tiempo_entrega": "X días",
         "disponibilidad": "En stock/Por pedido",
         "url": "link o N/A"
       }
     ],
     "mejor_opcion": "justificación"
   }

5. **ANÁLISIS DE PRESUPUESTO**:
   - Desglose de costos estimados (mano de obra + repuestos)
   - Comparación con el presupuesto asignado
   - ¿Es suficiente el presupuesto? ¿Sobra o falta?
   - Recomendación de presupuesto óptimo
   - Alertas si hay riesgo de sobrecostos

6. **PROCEDIMIENTO MEJORADO**:
   - Paso a paso detallado y optimizado del trabajo
   - Tiempo estimado por cada paso
   - Personal requerido (1 persona / equipo de 2-3)
   - Certificaciones o especialización necesaria

7. **RIESGOS Y CONTINGENCIAS**:
   - Problemas adicionales que podrían encontrarse
   - Plan B para cada riesgo identificado
   - Componentes adicionales que se recomienda tener disponibles
   - Tiempo de contingencia a considerar

8. **RECOMENDACIONES POST-MANTENIMIENTO**:
   - Pruebas que deben realizarse después del trabajo
   - Documentación que debe generarse
   - Próxima revisión sugerida
   - Indicadores para monitorear

RESTRICCIONES:
- NO inventar información técnica
- Basar análisis en estándares reales de la industria
- Precios deben ser realistas para el mercado colombiano actual
- Usar terminología técnica pero comprensible
- Proporcionar justificación para cada sugerencia

FORMATO DE RESPUESTA (JSON):
{
  "fecha_analisis": "fecha actual",
  "equipo": {
    "marca": "${equipoData.marca}",
    "modelo": "${equipoData.modelo}",
    "categoria": "${equipoData.categoria}"
  },
  "evaluacion_plan": {
    "adecuacion": "EXCELENTE|BUENA|REGULAR|INSUFICIENTE",
    "completitud": "COMPLETA|ACEPTABLE|INCOMPLETA",
    "complejidad": "ALTA|MEDIA|BAJA",
    "observaciones": "análisis detallado",
    "aspectos_faltantes": ["lista de cosas que faltan considerar"]
  },
  "sugerencias_mejora": [
    {
      "categoria": "Procedimiento|Seguridad|Verificación|Otro",
      "sugerencia": "descripción",
      "prioridad": "Alta|Media|Baja",
      "impacto": "descripción del beneficio"
    }
  ],
  "componentes_necesarios": [
    {
      "componente": "nombre completo",
      "especificaciones": "detalles técnicos",
      "cantidad": número,
      "prioridad": "CRÍTICO|IMPORTANTE|OPCIONAL",
      "razon_uso": "para qué se necesita",
      "alternativas": ["lista de alternativas compatibles"],
      "opciones_compra": [
        {
          "tienda": "nombre",
          "producto": "descripción",
          "precio_producto": número,
          "precio_envio": número,
          "precio_total": número,
          "moneda": "COP",
          "tiempo_entrega": "X días",
          "disponibilidad": "estado",
          "calificacion": "X/5 o N/A",
          "garantia": "descripción",
          "url": "link"
        }
      ],
      "recomendacion_compra": "cuál opción y por qué"
    }
  ],
  "analisis_presupuesto": {
    "presupuesto_asignado": número,
    "costo_mano_obra_estimado": número,
    "costo_repuestos_estimado": número,
    "costo_herramientas_especiales": número,
    "costo_total_estimado": número,
    "diferencia": número,
    "evaluacion": "SUFICIENTE|AJUSTADO|INSUFICIENTE",
    "presupuesto_recomendado": número,
    "justificacion": "explicación detallada",
    "riesgo_sobrecosto": "ALTO|MEDIO|BAJO",
    "contingencia_sugerida": "porcentaje adicional recomendado"
  },
  "procedimiento_optimizado": [
    {
      "paso": número,
      "descripcion": "qué hacer",
      "duracion_estimada": "X minutos/horas",
      "personal_necesario": número,
      "herramientas_requeridas": ["lista"],
      "precauciones": ["lista de precauciones"],
      "verificacion": "qué verificar al completar este paso"
    }
  ],
  "riesgos_contingencias": [
    {
      "riesgo": "descripción del problema potencial",
      "probabilidad": "Alta|Media|Baja",
      "impacto": "Crítico|Alto|Medio|Bajo",
      "plan_contingencia": "qué hacer si ocurre",
      "repuestos_contingencia": ["componentes adicionales a tener listos"],
      "tiempo_adicional": "X horas/días"
    }
  ],
  "post_mantenimiento": {
    "pruebas_requeridas": ["lista de pruebas"],
    "documentacion": ["qué documentar"],
    "proxima_revision": "en X meses/días",
    "indicadores_monitorear": ["qué vigilar después"],
    "capacitacion_usuario": ["qué explicar al usuario final"]
  },
  "resumen_ejecutivo": {
    "nivel_aprobacion": "APROBADO|APROBADO_CON_CAMBIOS|REQUIERE_REVISION",
    "cambios_criticos": ["lista de cambios obligatorios"],
    "cambios_recomendados": ["lista de cambios opcionales pero beneficiosos"],
    "tiempo_total_estimado": "X horas/días",
    "requerimientos_especiales": ["certificaciones, permisos, etc."],
    "recomendacion_final": "resumen en 2-3 líneas"
  }
}

Proporciona un análisis completo, preciso y accionable.
`;

    const resultado = await generarContenidoGemini(prompt);
    
    // Intentar extraer JSON de la respuesta
    const jsonMatch = resultado.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analisis = JSON.parse(jsonMatch[0]);
      return NextResponse.json({
        success: true,
        analisis,
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
