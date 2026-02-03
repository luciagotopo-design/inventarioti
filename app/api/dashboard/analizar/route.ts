import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { generarContenidoGemini } from '@/lib/gemini';

export async function GET() {
  try {
    console.log('🤖 Iniciando Análisis IA Profundo del Dashboard...');

    // 1. Obtener datos completos
    const { data: equipos } = await supabase
      .from('inventario_general')
      .select(`
        *,
        categoria:categorias(nombre),
        estado:estados(nombre),
        sede:sedes(nombre)
      `);

    const { data: mantenimientos } = await supabase
      .from('plan_mantenimiento')
      .select('*');

    const { count: equiposCriticos } = await supabase
      .from('equipos_criticos')
      .select('*', { count: 'exact', head: true })
      .eq('resuelto', false);

    const totalEquipos = equipos?.length || 0;

    // 2. Calcular métricas agregadas
    const valorTotal = equipos?.reduce((sum, eq: any) => sum + (parseFloat(eq.costo_estimado) || 0), 0) || 0;
    const antiguedadPromedio = (equipos?.reduce((sum, eq: any) => sum + (parseInt(eq.antiguedad_anios) || 0), 0) || 0) / (totalEquipos || 1);

    const aforoEstados = equipos?.reduce((acc: any, curr: any) => {
      const nombre = curr.estado?.nombre || 'Desconocido';
      acc[nombre] = (acc[nombre] || 0) + 1;
      return acc;
    }, {});

    const aforoCategorias = equipos?.reduce((acc: any, curr: any) => {
      const nombre = curr.categoria?.nombre || 'Desconocido';
      acc[nombre] = (acc[nombre] || 0) + 1;
      return acc;
    }, {});

    const metricsMantenimiento = {
      total: mantenimientos?.length || 0,
      pendientes: mantenimientos?.filter(m => m.estado === 'Pendiente').length || 0,
      vencidos: mantenimientos?.filter(m =>
        m.estado === 'Pendiente' && new Date(m.fecha_programada) < new Date()
      ).length || 0,
      completados: mantenimientos?.filter(m => m.estado === 'Completado').length || 0
    };

    // 3. Preparar el prompt enriquecido
    const prompt = `
Actúa como un Consultor Senior de Operaciones TI y Especialista en Gestión de Activos.

DATOS DEL INVENTARIO TI:
- Total Equipos: ${totalEquipos}
- Valor Estimado del Inventario: $${valorTotal.toLocaleString('es-CO')}
- Antigüedad Promedio: ${antiguedadPromedio.toFixed(1)} años
- Equipos Críticos (Requieren acción): ${equiposCriticos}

DISTRIBUCIÓN:
- Por Estado: ${JSON.stringify(aforoEstados)}
- Por Categoría: ${JSON.stringify(aforoCategorias)}

MANTENIMIENTO:
- Total Programados: ${metricsMantenimiento.total}
- Pendientes: ${metricsMantenimiento.pendientes}
- Mantenimientos VENCIDOS: ${metricsMantenimiento.vencidos}
- Completados: ${metricsMantenimiento.completados}

TAREA: Genera un Informe Ejecutivo de Inteligencia de Activos.
REQUISITOS DE FORMATO (Markdown):

### 💎 Estado de la Inversión Tecnológica
(Analiza el valor del inventario y la antigüedad. ¿Estamos ante una obsolescencia tecnológica?)

### 🚨 Alerta de Continuidad Operativa
(Enfócate en los equipos críticos y mantenimientos vencidos. Evalúa el riesgo de interrupción del servicio).

### 📊 Eficiencia de Mantenimiento
(Analiza si el equipo técnico está cumpliendo con los planes o si hay un cuello de botella).

### 🎯 Hoja de Ruta Sugerida
1. **Acción 24h**: (Lo más urgente)
2. **Estrategia Trimestral**: (Renovación o preventivos)
3. **Optimización Financiera**: (Dónde ahorrar o dónde invertir mejor)

### 🔮 Predicción IA
(Basado en la antigüedad y estados, predice cuántas fallas podríamos ver el próximo trimestre si no se actúa).

TONO: Ejecutivo, perspicaz, orientado a la toma de decisiones basada en datos. Usa emojis para visualización.
`;

    const analisis = await generarContenidoGemini(prompt);

    return NextResponse.json({
      success: true,
      analisis,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Error en el análisis IA:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Error al generar el análisis'
    }, { status: 500 });
  }
}
