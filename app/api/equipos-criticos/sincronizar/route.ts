import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface EquipoCritico {
  equipo_id: string;
  nombre_equipo: string;
  categoria: string;
  estado: string;
  puntuacion: number;
  nivel_criticidad: 'CRÍTICO' | 'ALTO' | 'MEDIO';
  razon: string[];
  recomendacion: string;
}

/**
 * POST /api/equipos-criticos/sincronizar
 * Analiza todos los equipos del inventario y sincroniza automáticamente
 * los equipos críticos a la tabla equipos_criticos
 */
export async function POST(request: Request) {
  try {
    console.log('🔄 Iniciando sincronización de equipos críticos...');

    // 0. Obtener las prioridades de la base de datos
    const { data: prioridadesData } = await supabase
      .from('prioridades')
      .select('id, nombre, nivel')
      .order('nivel', { ascending: true });

    const prioridades = new Map<string, string>();
    if (prioridadesData && prioridadesData.length > 0) {
      // Nivel 1 = Alta, 2 = Media, 3 = Baja
      const alta = prioridadesData.find(p => p.nivel === 1);
      const media = prioridadesData.find(p => p.nivel === 2);
      const baja = prioridadesData.find(p => p.nivel === 3);
      
      if (alta) prioridades.set('CRÍTICO', alta.id);
      if (alta) prioridades.set('ALTO', alta.id); // ALTO también usa prioridad alta
      if (media) prioridades.set('MEDIO', media.id);
      
      console.log('📋 Prioridades cargadas:', {
        CRÍTICO: prioridades.get('CRÍTICO'),
        ALTO: prioridades.get('ALTO'),
        MEDIO: prioridades.get('MEDIO')
      });
    } else {
      console.error('⚠️ No se encontraron prioridades en la base de datos');
      return NextResponse.json(
        { error: 'No se encontraron prioridades en la base de datos' },
        { status: 500 }
      );
    }

    // 1. Obtener todos los equipos y mantenimientos
    const [equiposRes, mantenimientosRes] = await Promise.all([
      supabase.from('inventario_general').select('*'),
      supabase.from('plan_mantenimiento').select('*')
    ]);

    if (equiposRes.error) throw equiposRes.error;
    if (mantenimientosRes.error) throw mantenimientosRes.error;

    const equipos = equiposRes.data || [];
    const mantenimientos = mantenimientosRes.data || [];

    console.log(`📊 Analizando ${equipos.length} equipos...`);

    // 2. Identificar equipos críticos
    const equiposCriticos = identificarEquiposCriticos(equipos, mantenimientos);

    console.log(`🎯 Identificados ${equiposCriticos.length} equipos críticos`);

    // 3. Obtener equipos críticos actuales en la BD
    const { data: criticosActuales } = await supabase
      .from('equipos_criticos')
      .select('id_equipo, id, resuelto');

    const criticosActualesMap = new Map(
      (criticosActuales || []).map(ec => [ec.id_equipo, ec])
    );

    // 4. Sincronizar equipos críticos
    let insertados = 0;
    let actualizados = 0;
    let eliminados = 0;
    let sinCambios = 0;

    // Insertar o actualizar equipos que son críticos
    for (const critico of equiposCriticos) {
      const existente = criticosActualesMap.get(critico.equipo_id);
      const prioridadId = prioridades.get(critico.nivel_criticidad);

      if (!prioridadId) {
        console.warn(`⚠️ No se encontró prioridad para nivel ${critico.nivel_criticidad}`);
        continue;
      }

      if (!existente) {
        // Obtener imágenes del equipo de inventario
        const equipoCompleto = equipos.find(e => e.id === critico.equipo_id);
        const imagenes = equipoCompleto?.imagenes || [];
        
        // Insertar nuevo equipo crítico
        const { error } = await supabase
          .from('equipos_criticos')
          .insert({
            id_equipo: critico.equipo_id,
            nivel_prioridad_id: prioridadId,
            accion_requerida: critico.razon.join('\n'),
            imagenes: imagenes,
            resuelto: false,
            costo_estimado: null,
            fecha_limite_accion: calcularFechaLimite(critico.nivel_criticidad),
          });

        if (!error) {
          insertados++;
          console.log(`✅ Insertado: ${critico.nombre_equipo} (${critico.nivel_criticidad})`);
        } else {
          console.error(`❌ Error insertando ${critico.nombre_equipo}:`, error);
        }
      } else if (!existente.resuelto) {
        // Obtener imágenes actualizadas del equipo de inventario
        const equipoCompleto = equipos.find(e => e.id === critico.equipo_id);
        const imagenes = equipoCompleto?.imagenes || [];
        
        // Actualizar equipo crítico existente (solo si no está resuelto)
        const { error } = await supabase
          .from('equipos_criticos')
          .update({
            nivel_prioridad_id: prioridadId,
            accion_requerida: critico.razon.join('\n'),
            imagenes: imagenes,
            fecha_limite_accion: calcularFechaLimite(critico.nivel_criticidad),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existente.id);

        if (!error) {
          actualizados++;
          console.log(`🔄 Actualizado: ${critico.nombre_equipo}`);
        }
      } else {
        sinCambios++;
      }

      // Marcar equipo como crítico en inventario
      await supabase
        .from('inventario_general')
        .update({ 
          es_critico: true,
          updated_at: new Date().toISOString() 
        })
        .eq('id', critico.equipo_id);
    }

    // 5. Eliminar equipos que ya no son críticos (solo los no resueltos)
    const equiposCriticosIds = new Set(equiposCriticos.map(ec => ec.equipo_id));
    
    for (const [equipoId, critico] of criticosActualesMap) {
      if (!equiposCriticosIds.has(equipoId) && !critico.resuelto) {
        const { error } = await supabase
          .from('equipos_criticos')
          .delete()
          .eq('id', critico.id);

        if (!error) {
          eliminados++;
          
          // Desmarcar en inventario
          await supabase
            .from('inventario_general')
            .update({ 
              es_critico: false,
              updated_at: new Date().toISOString() 
            })
            .eq('id', equipoId);
        }
      }
    }

    console.log('✅ Sincronización completada:');
    console.log(`   - Insertados: ${insertados}`);
    console.log(`   - Actualizados: ${actualizados}`);
    console.log(`   - Eliminados: ${eliminados}`);
    console.log(`   - Sin cambios: ${sinCambios}`);

    return NextResponse.json({
      success: true,
      message: 'Sincronización completada exitosamente',
      stats: {
        totalCriticos: equiposCriticos.length,
        insertados,
        actualizados,
        eliminados,
        sinCambios,
        breakdown: {
          criticos: equiposCriticos.filter(ec => ec.nivel_criticidad === 'CRÍTICO').length,
          altos: equiposCriticos.filter(ec => ec.nivel_criticidad === 'ALTO').length,
          medios: equiposCriticos.filter(ec => ec.nivel_criticidad === 'MEDIO').length,
        }
      }
    });

  } catch (error) {
    console.error('❌ Error en sincronización:', error);
    return NextResponse.json(
      { 
        error: 'Error al sincronizar equipos críticos',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * Identifica equipos críticos basándose en múltiples criterios
 */
function identificarEquiposCriticos(equipos: any[], mantenimientos: any[]): EquipoCritico[] {
  const equiposCriticos: EquipoCritico[] = [];
  const ahora = new Date();

  equipos.forEach(equipo => {
    const razones: string[] = [];
    let puntuacion = 0;

    // CRITERIO 1: Marcado como crítico
    if (equipo.es_critico) {
      razones.push('Marcado como equipo crítico para la operación');
      puntuacion += 30;
    }

    // CRITERIO 2: Estado No Operativo
    if (equipo.estado === 'Fuera de Servicio' || equipo.estado_id === 'fuera_servicio') {
      razones.push('Equipo fuera de servicio - impacto inmediato en operación');
      puntuacion += 40;
    } else if (equipo.estado === 'En Reparación' || equipo.estado_id === 'en_reparacion') {
      razones.push('Equipo en reparación - operatividad limitada');
      puntuacion += 25;
    }

    // CRITERIO 3: Antigüedad
    const antiguedad = parseInt(equipo.antiguedad_anios) || 0;
    if (antiguedad >= 5) {
      razones.push(`Antigüedad elevada (${antiguedad} años) - riesgo de fallas`);
      puntuacion += Math.min(antiguedad * 3, 30);
    }

    // CRITERIO 4: Alto Costo
    const costo = parseFloat(equipo.costo_estimado) || 0;
    if (costo >= 5000000) {
      razones.push(`Alto valor económico ($${costo.toLocaleString('es-CO')}) - impacto financiero`);
      puntuacion += 20;
    }

    // CRITERIO 5: Mantenimientos Pendientes
    const mantsPendientes = mantenimientos.filter(
      m => m.equipo_id === equipo.id && 
           (m.estado === 'Pendiente' || m.estado_ejecucion === 'Pendiente')
    );
    if (mantsPendientes.length >= 2) {
      razones.push(`${mantsPendientes.length} mantenimientos pendientes - riesgo acumulado`);
      puntuacion += mantsPendientes.length * 10;
    }

    // CRITERIO 6: Mantenimientos Vencidos
    const mantsVencidos = mantenimientos.filter(
      m => m.equipo_id === equipo.id && 
           (m.estado === 'Pendiente' || m.estado_ejecucion === 'Pendiente') &&
           new Date(m.fecha_programada) < ahora
    );
    if (mantsVencidos.length > 0) {
      razones.push(`${mantsVencidos.length} mantenimientos vencidos - atención urgente requerida`);
      puntuacion += mantsVencidos.length * 15;
    }

    // CRITERIO 7: Sin Mantenimiento Reciente
    const ultimoMant = mantenimientos
      .filter(m => m.equipo_id === equipo.id && 
                  (m.estado === 'Completado' || m.estado_ejecucion === 'Completado'))
      .sort((a, b) => {
        const fechaA = new Date(a.fecha_ejecucion || a.fecha_completado || 0);
        const fechaB = new Date(b.fecha_ejecucion || b.fecha_completado || 0);
        return fechaB.getTime() - fechaA.getTime();
      })[0];
    
    const seismesesAtras = 180 * 24 * 60 * 60 * 1000;
    if (!ultimoMant || (ahora.getTime() - new Date(ultimoMant.fecha_ejecucion || ultimoMant.fecha_completado).getTime()) > seismesesAtras) {
      razones.push('Sin mantenimiento en los últimos 6 meses - riesgo de deterioro');
      puntuacion += 15;
    }

    // Solo incluir si tiene al menos una razón para ser crítico
    if (razones.length > 0 && puntuacion >= 20) { // Umbral mínimo de 20 puntos
      let nivelCriticidad: 'CRÍTICO' | 'ALTO' | 'MEDIO' = 'MEDIO';
      if (puntuacion >= 70) nivelCriticidad = 'CRÍTICO';
      else if (puntuacion >= 40) nivelCriticidad = 'ALTO';

      let recomendacion = '';
      if (nivelCriticidad === 'CRÍTICO') {
        recomendacion = 'Requiere evaluación técnica inmediata y decisión de reparación o reemplazo';
      } else if (nivelCriticidad === 'ALTO') {
        recomendacion = 'Programar mantenimiento preventivo en próximos 30 días';
      } else {
        recomendacion = 'Incluir en plan de mantenimiento trimestral';
      }

      equiposCriticos.push({
        equipo_id: equipo.id,
        nombre_equipo: equipo.nombre,
        categoria: equipo.categoria || 'Sin categoría',
        estado: equipo.estado || equipo.estado_id || 'Desconocido',
        puntuacion,
        nivel_criticidad: nivelCriticidad,
        razon: razones,
        recomendacion,
      });
    }
  });

  return equiposCriticos.sort((a, b) => b.puntuacion - a.puntuacion);
}

/**
 * Calcula la fecha límite de acción según criticidad
 */
function calcularFechaLimite(nivel: 'CRÍTICO' | 'ALTO' | 'MEDIO'): string {
  const ahora = new Date();
  let dias = 90; // Por defecto 3 meses

  if (nivel === 'CRÍTICO') {
    dias = 7; // 1 semana
  } else if (nivel === 'ALTO') {
    dias = 30; // 1 mes
  }

  ahora.setDate(ahora.getDate() + dias);
  return ahora.toISOString();
}
