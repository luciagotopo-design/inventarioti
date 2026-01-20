import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface EquipoCritico {
  equipo: any;
  razon: string[];
  nivelCriticidad: 'CRÍTICO' | 'ALTO' | 'MEDIO';
  puntuacion: number;
}

export async function POST(request: Request) {
  try {
    const { formato = 'excel' } = await request.json();

    console.log('📊 Iniciando generación de reporte maestro...');

    // SINCRONIZAR EQUIPOS CRÍTICOS AUTOMÁTICAMENTE
    console.log('🔄 Sincronizando equipos críticos...');
    try {
      // Llamar al endpoint de sincronización usando la URL base actual
      const protocol = request.url.includes('localhost') ? 'http' : 'https';
      const host = request.headers.get('host') || 'localhost:3000';
      const baseUrl = `${protocol}://${host}`;
      
      const syncResponse = await fetch(`${baseUrl}/api/equipos-criticos/sincronizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (syncResponse.ok) {
        const syncResult = await syncResponse.json();
        console.log('✅ Sincronización completada:', syncResult.stats);
      }
    } catch (syncError) {
      console.warn('⚠️ No se pudo sincronizar equipos críticos:', syncError);
      // Continuar con el reporte aunque falle la sincronización
    }

    // OBTENER TODOS LOS DATOS CON RELACIONES
    const equiposRes = await supabase
      .from('inventario_general')
      .select(`
        *,
        categoria:categorias(id, nombre),
        estado:estados(id, nombre, color),
        sede:sedes(id, nombre)
      `)
      .order('created_at', { ascending: false });
    console.log('Equipos response:', equiposRes.error ? equiposRes.error : `${equiposRes.data?.length} equipos`);
    
    const mantenimientosRes = await supabase
      .from('plan_mantenimiento')
      .select(`
        *,
        equipo:inventario_general(id, serial, marca, modelo),
        accion:acciones_mantenimiento(id, nombre)
      `)
      .order('fecha_programada', { ascending: true });
    console.log('Mantenimientos response:', mantenimientosRes.error ? mantenimientosRes.error : `${mantenimientosRes.data?.length} mantenimientos`);
    
    const criticosRes = await supabase
      .from('equipos_criticos')
      .select(`
        *,
        equipo:inventario_general(
          *,
          categoria:categorias(id, nombre),
          estado:estados(id, nombre, color),
          sede:sedes(id, nombre)
        ),
        nivelPrioridad:prioridades(id, nombre, color, orden)
      `)
      .eq('resuelto', false)
      .order('fecha_limite_accion', { ascending: true });
    console.log('Críticos response:', criticosRes.error ? criticosRes.error : `${criticosRes.data?.length} críticos`);

    const equipos = equiposRes.data || [];
    const mantenimientos = mantenimientosRes.data || [];
    const criticos = criticosRes.data || [];

    console.log('✅ Datos obtenidos:');
    console.log(`   - Equipos: ${equipos.length}`);
    console.log(`   - Mantenimientos: ${mantenimientos.length}`);
    console.log(`   - Críticos: ${criticos.length}`);

    if (equipos.length === 0) {
      console.warn('⚠️ No hay equipos en la base de datos');
    }

    // ANÁLISIS MAESTRO
    const analisisMaestro = generarAnalisisMaestro(equipos, mantenimientos, criticos);

    if (formato === 'excel') {
      console.log('📝 Generando archivo Excel...');
      const excelBuffer = await generarReporteMaestroExcel(equipos, mantenimientos, criticos, analisisMaestro);
      console.log('✅ Excel generado, tamaño:', excelBuffer.length, 'bytes');
      
      return new NextResponse(excelBuffer as BodyInit, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="reporte-maestro-${new Date().toISOString().split('T')[0]}.xlsx"`
        }
      });
    }

    return NextResponse.json(analisisMaestro);
  } catch (error) {
    console.error('❌ Error generando reporte maestro:', error);
    return NextResponse.json({ 
      error: 'Error al generar reporte',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

function generarAnalisisMaestro(equipos: any[], mantenimientos: any[], criticos: any[]) {
  const ahora = new Date();

  // 1. RESUMEN EJECUTIVO
  const resumenEjecutivo = {
    totalEquipos: equipos.length,
    porCategoria: agruparPor(equipos, 'categoria'),
    porSede: agruparPor(equipos, 'sede'),
    porEstado: agruparPor(equipos, 'estado'),
    valorTotal: equipos.reduce((sum, eq) => sum + (parseFloat(eq.costo_estimado) || 0), 0),
    antiguedadPromedio: equipos.reduce((sum, eq) => sum + (parseInt(eq.antiguedad_anios) || 0), 0) / (equipos.length || 1),
  };

  // 2. IDENTIFICACIÓN DE EQUIPOS CRÍTICOS
  const equiposCriticos = identificarEquiposCriticos(equipos, mantenimientos);

  // 3. ANÁLISIS DE MANTENIMIENTO
  const analisisMantenimiento = {
    totalProgramados: mantenimientos.length,
    pendientes: mantenimientos.filter(m => m.estado === 'Pendiente').length,
    vencidos: mantenimientos.filter(m => 
      m.estado === 'Pendiente' && new Date(m.fecha_programada) < ahora
    ).length,
    enProgreso: mantenimientos.filter(m => m.estado === 'En Progreso').length,
    completados: mantenimientos.filter(m => m.estado === 'Completado').length,
    proximasSemana: mantenimientos.filter(m => {
      const fecha = new Date(m.fecha_programada);
      const diff = (fecha.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 7;
    }).length,
  };

  // 4. PLAN DE MEJORAMIENTO
  const planMejoramiento = generarPlanMejoramiento(equipos, equiposCriticos, mantenimientos);

  // 5. ANÁLISIS FINANCIERO
  const analisisFinanciero = {
    costoMantenimientoPendiente: mantenimientos
      .filter(m => m.estado !== 'Completado')
      .reduce((sum, m) => sum + (m.costo_estimado || 0), 0),
    costoReemplazosCriticos: equiposCriticos
      .reduce((sum, ec) => sum + (ec.equipo.costo_estimado || 0), 0),
    inversionRecomendada: 0, // Se calcula en el plan
  };

  // 6. INDICADORES CLAVE (KPIs)
  const kpis = calcularKPIs(equipos, mantenimientos, equiposCriticos);

  return {
    fechaGeneracion: ahora.toISOString(),
    resumenEjecutivo,
    equiposCriticos: equiposCriticos.slice(0, 20), // Top 20
    analisisMantenimiento,
    planMejoramiento,
    analisisFinanciero,
    kpis,
    recomendacionesEstrategicas: generarRecomendacionesEstrategicas(
      resumenEjecutivo,
      equiposCriticos,
      analisisMantenimiento
    ),
  };
}

function identificarEquiposCriticos(equipos: any[], mantenimientos: any[]): EquipoCritico[] {
  const equiposCriticos: EquipoCritico[] = [];

  equipos.forEach(equipo => {
    const razones: string[] = [];
    let puntuacion = 0;

    // CRITERIO 1: Prioridad Alta
    if (equipo.es_critico) {
      razones.push('Marcado como equipo crítico para la operación');
      puntuacion += 30;
    }

    // CRITERIO 2: Estado No Operativo
    if (equipo.estado === 'Fuera de Servicio') {
      razones.push('Equipo fuera de servicio - impacto inmediato en operación');
      puntuacion += 40;
    } else if (equipo.estado === 'En Reparación') {
      razones.push('Equipo en reparación - operatividad limitada');
      puntuacion += 25;
    }

    // CRITERIO 3: Antigüedad
    if (equipo.antiguedad_anios >= 5) {
      razones.push(`Antigüedad elevada (${equipo.antiguedad_anios} años) - riesgo de fallas`);
      puntuacion += Math.min(equipo.antiguedad_anios * 3, 30);
    }

    // CRITERIO 4: Alto Costo
    if (equipo.costo_estimado >= 5000000) {
      razones.push(`Alto valor económico ($${equipo.costo_estimado.toLocaleString()}) - impacto financiero`);
      puntuacion += 20;
    }

    // CRITERIO 5: Mantenimientos Pendientes
    const mantsPendientes = mantenimientos.filter(
      m => m.equipo_id === equipo.id && m.estado === 'Pendiente'
    );
    if (mantsPendientes.length >= 2) {
      razones.push(`${mantsPendientes.length} mantenimientos pendientes - riesgo acumulado`);
      puntuacion += mantsPendientes.length * 10;
    }

    // CRITERIO 6: Mantenimientos Vencidos
    const mantsVencidos = mantenimientos.filter(
      m => m.equipo_id === equipo.id && 
           m.estado === 'Pendiente' && 
           new Date(m.fecha_programada) < new Date()
    );
    if (mantsVencidos.length > 0) {
      razones.push(`${mantsVencidos.length} mantenimientos vencidos - atención urgente requerida`);
      puntuacion += mantsVencidos.length * 15;
    }

    // CRITERIO 7: Sin Mantenimiento Reciente
    const ultimoMant = mantenimientos
      .filter(m => m.equipo_id === equipo.id && m.estado === 'Completado')
      .sort((a, b) => new Date(b.fecha_completado || 0).getTime() - new Date(a.fecha_completado || 0).getTime())[0];
    
    if (!ultimoMant || (new Date().getTime() - new Date(ultimoMant.fecha_completado).getTime()) > 180 * 24 * 60 * 60 * 1000) {
      razones.push('Sin mantenimiento en los últimos 6 meses - riesgo de deterioro');
      puntuacion += 15;
    }

    // Solo incluir si tiene al menos una razón para ser crítico
    if (razones.length > 0) {
      let nivelCriticidad: 'CRÍTICO' | 'ALTO' | 'MEDIO' = 'MEDIO';
      if (puntuacion >= 70) nivelCriticidad = 'CRÍTICO';
      else if (puntuacion >= 40) nivelCriticidad = 'ALTO';

      equiposCriticos.push({
        equipo,
        razon: razones,
        nivelCriticidad,
        puntuacion,
      });
    }
  });

  return equiposCriticos.sort((a, b) => b.puntuacion - a.puntuacion);
}

function generarPlanMejoramiento(equipos: any[], criticos: EquipoCritico[], mantenimientos: any[]) {
  const acciones: any[] = [];

  // ACCIONES INMEDIATAS (0-30 días)
  criticos.filter(ec => ec.nivelCriticidad === 'CRÍTICO').forEach(ec => {
    if (ec.equipo.estado === 'Fuera de Servicio') {
      acciones.push({
        prioridad: 'URGENTE',
        plazo: 'Inmediato (0-7 días)',
        equipo: ec.equipo.nombre,
        accion: 'Evaluación técnica y decisión de reparación o reemplazo',
        costoEstimado: ec.equipo.costo_estimado * 0.3,
        impacto: 'Alto - Equipo crítico fuera de servicio',
        tipo: 'Correctivo',
      });
    }
  });

  // ACCIONES A CORTO PLAZO (1-3 meses)
  const equiposSinMantenimiento = equipos.filter(eq => {
    const mants = mantenimientos.filter(m => m.equipo_id === eq.id);
    return mants.length === 0 || mants.every(m => m.estado !== 'Completado');
  });

  if (equiposSinMantenimiento.length > 0) {
    acciones.push({
      prioridad: 'ALTA',
      plazo: 'Corto plazo (1-3 meses)',
      equipo: `${equiposSinMantenimiento.length} equipos`,
      accion: 'Implementar programa de mantenimiento preventivo',
      costoEstimado: equiposSinMantenimiento.length * 200000,
      impacto: 'Medio-Alto - Prevención de fallas futuras',
      tipo: 'Preventivo',
    });
  }

  // ACCIONES A MEDIANO PLAZO (3-6 meses)
  const equiposAntiguos = equipos.filter(eq => eq.antiguedad_anios >= 7);
  if (equiposAntiguos.length > 0) {
    acciones.push({
      prioridad: 'MEDIA',
      plazo: 'Mediano plazo (3-6 meses)',
      equipo: `${equiposAntiguos.length} equipos antiguos`,
      accion: 'Evaluación para renovación tecnológica',
      costoEstimado: equiposAntiguos.reduce((sum, eq) => sum + (eq.costo_estimado || 0), 0) * 0.8,
      impacto: 'Medio - Modernización de infraestructura',
      tipo: 'Estratégico',
    });
  }

  // ACCIONES PREVENTIVAS GENERALES
  acciones.push({
    prioridad: 'MEDIA',
    plazo: 'Continuo',
    equipo: 'Todos los equipos',
    accion: 'Implementar sistema de monitoreo y alertas tempranas',
    costoEstimado: 1500000,
    impacto: 'Alto - Reducción de fallas inesperadas',
    tipo: 'Preventivo',
  });

  const costoTotal = acciones.reduce((sum, a) => sum + a.costoEstimado, 0);

  return {
    acciones: acciones.sort((a, b) => {
      const prioridades = { 'URGENTE': 3, 'ALTA': 2, 'MEDIA': 1 };
      return (prioridades[b.prioridad as keyof typeof prioridades] || 0) - 
             (prioridades[a.prioridad as keyof typeof prioridades] || 0);
    }),
    resumen: {
      totalAcciones: acciones.length,
      accionesUrgentes: acciones.filter(a => a.prioridad === 'URGENTE').length,
      accionesAltas: acciones.filter(a => a.prioridad === 'ALTA').length,
      inversionTotal: costoTotal,
      beneficioEsperado: 'Reducción del 40% en fallas no programadas y 30% en costos de mantenimiento correctivo',
    },
  };
}

function calcularKPIs(equipos: any[], mantenimientos: any[], criticos: EquipoCritico[]) {
  const totalEquipos = equipos.length || 1; // Evitar división por 0
  
  // Contar equipos operativos usando la relación anidada
  const equiposOperativos = equipos.filter(eq => 
    eq.estado?.nombre === 'Operativo' || eq.estado === 'Operativo'
  ).length;
  
  // Mantenimientos pendientes y vencidos
  const mantsPendientes = mantenimientos.filter(m => 
    m.estado_ejecucion === 'Pendiente' || m.estado === 'Pendiente'
  ).length;
  const mantsVencidos = mantenimientos.filter(m => {
    const isPendiente = m.estado_ejecucion === 'Pendiente' || m.estado === 'Pendiente';
    return isPendiente && new Date(m.fecha_programada) < new Date();
  }).length;

  // Calcular costos totales
  const costoTotal = equipos.reduce((sum, eq) => {
    const costo = parseFloat(eq.costo_estimado) || 0;
    return sum + costo;
  }, 0);

  return {
    disponibilidad: ((equiposOperativos / totalEquipos) * 100).toFixed(1) + '%',
    criticidad: ((criticos.length / totalEquipos) * 100).toFixed(1) + '%',
    cumplimientoMantenimiento: mantenimientos.length > 0 
      ? (((mantenimientos.length - mantsVencidos) / mantenimientos.length) * 100).toFixed(1) + '%' 
      : '100.0%',
    edadPromedio: (equipos.reduce((sum, eq) => sum + (parseInt(eq.antiguedad_anios) || 0), 0) / totalEquipos).toFixed(1) + ' años',
    tasaFallas: ((equipos.filter(eq => 
      (eq.estado?.nombre !== 'Operativo' && eq.estado?.nombre) || 
      (eq.estado !== 'Operativo' && eq.estado)
    ).length / totalEquipos) * 100).toFixed(1) + '%',
    costoPromedioPorEquipo: (costoTotal / totalEquipos).toLocaleString('es-CO', { style: 'currency', currency: 'COP' }),
  };
}

function generarRecomendacionesEstrategicas(resumen: any, criticos: EquipoCritico[], mantenimiento: any) {
  const recomendaciones: string[] = [];

  // Análisis de criticidad
  if (criticos.length > resumen.totalEquipos * 0.3) {
    recomendaciones.push(
      `🔴 CRÍTICO: ${criticos.length} equipos (${((criticos.length/resumen.totalEquipos)*100).toFixed(1)}%) requieren atención prioritaria. Se recomienda implementar un plan de acción inmediato para reducir riesgos operativos.`
    );
  }

  // Análisis de mantenimiento
  if (mantenimiento.vencidos > 0) {
    recomendaciones.push(
      `⚠️ URGENTE: ${mantenimiento.vencidos} mantenimientos vencidos. Programar intervenciones inmediatas para prevenir fallas mayores.`
    );
  }

  // Análisis de disponibilidad
  const disponibilidad = (resumen.porEstado['Operativo'] || 0) / resumen.totalEquipos;
  if (disponibilidad < 0.85) {
    recomendaciones.push(
      `📊 La disponibilidad operativa es del ${(disponibilidad*100).toFixed(1)}%. Meta recomendada: 95%. Implementar acciones correctivas inmediatas.`
    );
  }

  // Análisis de antigüedad
  if (resumen.antiguedadPromedio > 5) {
    recomendaciones.push(
      `🔄 La antigüedad promedio del inventario es de ${resumen.antiguedadPromedio.toFixed(1)} años. Evaluar plan de renovación tecnológica gradual.`
    );
  }

  // Recomendación de sistema
  recomendaciones.push(
    `✅ Implementar sistema de gestión de mantenimiento predictivo basado en datos históricos y monitoreo continuo.`
  );

  recomendaciones.push(
    `💰 Establecer presupuesto anual de mantenimiento preventivo equivalente al 10-15% del valor total del inventario para maximizar vida útil.`
  );

  return recomendaciones;
}

function agruparPor(array: any[], campo: string): Record<string, number> {
  return array.reduce((acc, item) => {
    let valor;
    
    // Manejar relaciones anidadas
    if (campo === 'categoria' || campo === 'estado' || campo === 'sede') {
      valor = item[campo]?.nombre || item[campo] || 'Sin especificar';
    } else {
      valor = item[campo] || 'Sin especificar';
    }
    
    acc[valor] = (acc[valor] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

// ============================================
// GENERACIÓN DE EXCEL MEJORADO
// ============================================

async function generarReporteMaestroExcel(
  equipos: any[],
  mantenimientos: any[],
  criticos: any[],
  analisis: any
): Promise<Buffer> {
  try {
    const workbook = new ExcelJS.Workbook();
    
    // Leer plantilla
    const plantillaPath = path.join(process.cwd(), 'app', 'plantillas-excel', 'Reporte_maestro.xlsx');
    
    console.log('📂 Leyendo plantilla maestro desde:', plantillaPath);
    
    if (!fs.existsSync(plantillaPath)) {
      throw new Error(`No se encontró la plantilla en: ${plantillaPath}`);
    }
    
    await workbook.xlsx.readFile(plantillaPath);
    console.log('✅ Plantilla maestro cargada correctamente');

    // =====================
    // HOJA 1: RESUMEN EJECUTIVO
    // =====================
    const resumenSheet = workbook.getWorksheet('Resumen Ejecutivo');
    if (resumenSheet) {
      // Actualizar fecha
      resumenSheet.getCell('A2').value = `Fecha: ${new Date().toLocaleDateString('es-ES')}`;
      
      // KPIs principales (empezar en fila 6)
      let row = 6;
      const kpisData = [
        ['Total de Equipos', analisis.resumenEjecutivo.totalEquipos, ''],
        ['Disponibilidad', analisis.kpis.disponibilidad, ''],
        ['Equipos Críticos', criticos.length, `${analisis.kpis.criticidad}`],
        ['Valor Total Inventario', '', `$${analisis.resumenEjecutivo.valorTotal.toLocaleString('es-CO')}`],
        ['Antigüedad Promedio', analisis.kpis.edadPromedio, ''],
        ['Cumplimiento Mantenimiento', analisis.kpis.cumplimientoMantenimiento, ''],
      ];

      kpisData.forEach(([indicador, valor, extra]) => {
        const fila = resumenSheet.getRow(row);
        fila.getCell(1).value = indicador;
        fila.getCell(2).value = valor;
        fila.getCell(3).value = extra;
        fila.commit();
        row++;
      });
      
      console.log('✅ Hoja Resumen Ejecutivo completada');
    }

    // =====================
    // HOJA 2: INVENTARIO COMPLETO (usar consulta con relaciones)
    // =====================
    const inventarioSheet = workbook.getWorksheet('Inventario Completo');
    if (inventarioSheet) {
      let filaInicio = 2;
      
      // Obtener equipos con relaciones completas
      const { data: equiposCompletos } = await supabase
        .from('inventario_general')
        .select(`
          *,
          categoria:categorias(id, nombre),
          estado:estados(id, nombre, color),
          sede:sedes(id, nombre)
        `)
        .order('created_at', { ascending: false });
      
      const equiposData = equiposCompletos || equipos;
      
      equiposData.forEach((eq, index) => {
        const fila = inventarioSheet.getRow(filaInicio + index);
        
        fila.getCell(1).value = eq.id || '';
        fila.getCell(2).value = eq.cantidad || 1;
        fila.getCell(3).value = eq.categoria?.nombre || '';
        fila.getCell(4).value = eq.marca || '';
        fila.getCell(5).value = eq.modelo || '';
        fila.getCell(6).value = eq.serial || '';
        fila.getCell(7).value = eq.estado?.nombre || 'Operativo';
        fila.getCell(8).value = eq.sede?.nombre || '';
        fila.getCell(9).value = eq.ubicacion_detallada || '';
        fila.getCell(10).value = eq.responsable || '';
        fila.getCell(11).value = eq.es_critico ? 'Sí' : 'No';
        fila.getCell(12).value = eq.observaciones || '';
        
        fila.commit();
      });
      
      console.log(`✅ Hoja Inventario Completo: ${equiposData.length} equipos`);
    }

    // =====================
    // HOJA 3: MANTENIMIENTOS (usar consulta con relaciones)
    // =====================
    const mantenimientoSheet = workbook.getWorksheet('Plan de Mantenimiento');
    if (mantenimientoSheet) {
      let filaInicio = 2;
      
      // Obtener mantenimientos con relaciones completas
      const { data: mantenimientosCompletos } = await supabase
        .from('plan_mantenimiento')
        .select(`
          *,
          equipo:inventario_general(
            id,
            serial,
            marca,
            modelo
          ),
          accion:acciones_mantenimiento(id, nombre)
        `)
        .order('fecha_programada', { ascending: true });
      
      const mantenimientosData = mantenimientosCompletos || mantenimientos;
      
      mantenimientosData.forEach((m, index) => {
        const fila = mantenimientoSheet.getRow(filaInicio + index);
        
        const fecha = m.fecha_programada ? new Date(m.fecha_programada) : null;
        const fechaStr = fecha ? 
          `${String(fecha.getDate()).padStart(2, '0')}/${String(fecha.getMonth() + 1).padStart(2, '0')}/${fecha.getFullYear()}` : 
          '';
        
        const nombreEquipo = m.equipo 
          ? `${m.equipo.serial || ''} ${m.equipo.marca || ''} ${m.equipo.modelo || ''}`.trim() 
          : '';
        
        fila.getCell(1).value = nombreEquipo;
        fila.getCell(2).value = m.accion?.nombre || 'Mantenimiento';
        fila.getCell(3).value = m.responsable_ejecucion || '';
        fila.getCell(4).value = fechaStr;
        fila.getCell(5).value = m.estado_ejecucion || 'Pendiente';
        fila.getCell(6).value = m.presupuesto ? `$${m.presupuesto.toLocaleString()}` : '';
        
        fila.commit();
      });
      
      console.log(`✅ Hoja Mantenimientos: ${mantenimientosData.length} actividades`);
    }

    // =====================
    // HOJA 4: EQUIPOS CRÍTICOS (usar consulta con relaciones)
    // =====================
    const criticosSheet = workbook.getWorksheet('Equipos Críticos');
    if (criticosSheet) {
      let filaInicio = 2;
      
      // Obtener equipos críticos con relaciones completas
      const { data: criticosCompletos } = await supabase
        .from('equipos_criticos')
        .select(`
          *,
          equipo:inventario_general(
            *,
            categoria:categorias(id, nombre),
            estado:estados(id, nombre, color),
            sede:sedes(id, nombre)
          ),
          nivelPrioridad:prioridades(id, nombre, color, orden)
        `)
        .eq('resuelto', false)
        .order('fecha_limite_accion', { ascending: true });
      
      const criticosData = criticosCompletos || criticos;
      
      criticosData.forEach((critico, index) => {
        const fila = criticosSheet.getRow(filaInicio + index);
        const equipo = critico.equipo || {};
        
        const fechaLimite = critico.fecha_limite_accion 
          ? new Date(critico.fecha_limite_accion).toLocaleDateString('es-ES')
          : '';
        
        fila.getCell(1).value = equipo.id || '';
        fila.getCell(2).value = equipo.categoria?.nombre || '';
        fila.getCell(3).value = equipo.serial || '';
        fila.getCell(4).value = equipo.estado?.nombre || 'Operativo';
        fila.getCell(5).value = critico.nivelPrioridad?.nombre || 'Media';
        fila.getCell(6).value = critico.accion_requerida || 'Mantenimiento preventivo';
        fila.getCell(7).value = critico.costo_estimado ? `$${critico.costo_estimado}` : 'Pendiente';
        fila.getCell(8).value = fechaLimite;
        
        fila.commit();
      });
      
      console.log(`✅ Hoja Equipos Críticos: ${criticosData.length} equipos`);
    }

    // =====================
    // HOJA 5: ANÁLISIS Y RECOMENDACIONES
    // =====================
    const analisisSheet = workbook.getWorksheet('Análisis y Recomendaciones');
    if (analisisSheet) {
      let row = 3;
      
      if (analisis.planMejoramiento?.acciones) {
        analisis.planMejoramiento.acciones.forEach((accion: any, index: number) => {
          analisisSheet.getCell(`A${row}`).value = `${index + 1}. ${accion.accion}`;
          analisisSheet.getCell(`A${row}`).font = { bold: true };
          row++;
          
          analisisSheet.getCell(`A${row}`).value = `   Prioridad: ${accion.prioridad} | Plazo: ${accion.plazo}`;
          row++;
          
          analisisSheet.getCell(`A${row}`).value = `   Costo Estimado: $${accion.costoEstimado?.toLocaleString('es-CO') || '0'}`;
          row++;
          
          analisisSheet.getCell(`A${row}`).value = `   Impacto: ${accion.impacto}`;
          row += 2;
        });
      }

      row += 2;
      analisisSheet.getCell(`A${row}`).value = 'RECOMENDACIONES ESTRATÉGICAS';
      analisisSheet.getCell(`A${row}`).style = {
        font: { bold: true, size: 14, color: { argb: 'FF1e40af' } }
      };
      row += 2;

      if (analisis.recomendacionesEstrategicas) {
        analisis.recomendacionesEstrategicas.forEach((rec: string) => {
          analisisSheet.getCell(`A${row}`).value = `• ${rec}`;
          analisisSheet.getCell(`A${row}`).alignment = { wrapText: true };
          row++;
        });
      }
      
      console.log('✅ Hoja Análisis y Recomendaciones completada');
    }

    console.log('💾 Generando archivo Excel maestro...');
    const buffer = await workbook.xlsx.writeBuffer();
    console.log('✅ Excel maestro generado correctamente');
    
    return Buffer.from(buffer);
  } catch (error) {
    console.error('❌ Error generando Excel maestro:', error);
    throw error;
  }
}
