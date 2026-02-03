// API Route: Dashboard KPIs y estadísticas
import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET() {
  console.log('\n🔵 [API] GET /api/dashboard - Iniciando consulta...');
  const startTime = Date.now();
  
  // Verificar configuración
  console.log('🔍 Verificando configuración de Supabase...');
  console.log(`   URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurada' : '❌ FALTA'}`);
  console.log(`   Key: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ FALTA'}`);
  console.log(`   Key length: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0} caracteres`);
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('❌ Variables de entorno NO configuradas');
    return NextResponse.json(
      { error: 'Supabase no configurado. Verifica .env' },
      { status: 500 }
    );
  }
  
  try {
    // KPIs principales
    console.log('📊 Consultando total de equipos...');
    console.log('📡 Ejecutando query: supabase.from("inventario_general").select("*", { count: "exact", head: true })');
    
    const queryResult = await supabase
      .from('inventario_general')
      .select('*', { count: 'exact', head: true });
    
    console.log('📦 Resultado completo:', JSON.stringify(queryResult, null, 2));
    
    const { count: totalEquipos, error: errorTotal, status, statusText } = queryResult;
    
    console.log(`   Status: ${status}`);
    console.log(`   Status Text: ${statusText}`);
    console.log(`   Count: ${totalEquipos}`);
    console.log(`   Error:`, errorTotal);
    
    if (errorTotal) {
      console.error('❌ Error consultando total equipos:', errorTotal);
      console.error('❌ Error completo:', JSON.stringify(errorTotal, null, 2));
      console.error('❌ Error type:', typeof errorTotal);
      console.error('❌ Error keys:', Object.keys(errorTotal || {}));
      
      return NextResponse.json(
        { 
          error: 'Error al consultar Supabase',
          details: errorTotal,
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          keyPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...'
        },
        { status: 500 }
      );
    }
    console.log(`✅ Total equipos: ${totalEquipos}`);
    
    console.log('📊 Buscando estado "Operativo"...');
    const { data: estadoOperativo } = await supabase
      .from('estados')
      .select('id')
      .eq('nombre', 'Operativo')
      .single();
    
    console.log(`✅ Estado Operativo encontrado:`, estadoOperativo?.id);
    
    const equiposOperativos = estadoOperativo 
      ? (await supabase
          .from('inventario_general')
          .select('*', { count: 'exact', head: true })
          .eq('estado_id', estadoOperativo.id)).count || 0
      : 0;

    const { count: equiposCriticos } = await supabase
      .from('equipos_criticos')
      .select('*', { count: 'exact', head: true })
      .eq('resuelto', false);

    const { data: estadoFaltante } = await supabase
      .from('estados')
      .select('id')
      .eq('nombre', 'Faltante')
      .single();

    const equiposFaltantes = estadoFaltante
      ? (await supabase
          .from('inventario_general')
          .select('*', { count: 'exact', head: true })
          .eq('estado_id', estadoFaltante.id)).count || 0
      : 0;

    const { data: estadoDanado } = await supabase
      .from('estados')
      .select('id')
      .eq('nombre', 'Dañado')
      .single();

    const equiposDanados = estadoDanado
      ? (await supabase
          .from('inventario_general')
          .select('*', { count: 'exact', head: true })
          .eq('estado_id', estadoDanado.id)).count || 0
      : 0;

    // Equipos por sede
    const { data: equiposPorSede } = await supabase
      .from('inventario_general')
      .select('sede_id, sede:sedes(nombre)');

    const equiposPorSedeMap = new Map<string, { sede: string; cantidad: number }>();
    
    equiposPorSede?.forEach((equipo: any) => {
      const sedeNombre = equipo.sede?.nombre || 'Desconocido';
      const existing = equiposPorSedeMap.get(sedeNombre);
      if (existing) {
        existing.cantidad++;
      } else {
        equiposPorSedeMap.set(sedeNombre, { sede: sedeNombre, cantidad: 1 });
      }
    });

    const equiposPorSedeDetalle = Array.from(equiposPorSedeMap.values());

    // Equipos por categoría
    const { data: equiposPorCategoria } = await supabase
      .from('inventario_general')
      .select('categoria_id, categoria:categorias(nombre)');

    const equiposPorCategoriaMap = new Map<string, { categoria: string; cantidad: number }>();
    
    equiposPorCategoria?.forEach((equipo: any) => {
      const categoriaNombre = equipo.categoria?.nombre || 'Desconocido';
      const existing = equiposPorCategoriaMap.get(categoriaNombre);
      if (existing) {
        existing.cantidad++;
      } else {
        equiposPorCategoriaMap.set(categoriaNombre, { categoria: categoriaNombre, cantidad: 1 });
      }
    });

    const equiposPorCategoriaDetalle = Array.from(equiposPorCategoriaMap.values());

    // Equipos por estado
    const { data: equiposPorEstado } = await supabase
      .from('inventario_general')
      .select('estado_id, estado:estados(nombre, color)');

    const equiposPorEstadoMap = new Map<string, { estado: string; cantidad: number; color: string }>();
    
    equiposPorEstado?.forEach((equipo: any) => {
      const estadoNombre = equipo.estado?.nombre || 'Desconocido';
      const estadoColor = equipo.estado?.color || '#6b7280';
      const existing = equiposPorEstadoMap.get(estadoNombre);
      if (existing) {
        existing.cantidad++;
      } else {
        equiposPorEstadoMap.set(estadoNombre, { estado: estadoNombre, cantidad: 1, color: estadoColor });
      }
    });

    const equiposPorEstadoDetalle = Array.from(equiposPorEstadoMap.values());

    const duration = Date.now() - startTime;
    console.log(`✅ [API] Dashboard completado en ${duration}ms`);
    console.log('📤 Enviando respuesta con KPIs\n');

    return NextResponse.json({
      kpis: {
        totalEquipos: totalEquipos || 0,
        equiposOperativos,
        porcentajeOperativos: (totalEquipos || 0) > 0 ? (equiposOperativos / (totalEquipos || 1)) * 100 : 0,
        equiposCriticos: equiposCriticos || 0,
        equiposFaltantes,
        equiposDanados,
      },
      equiposPorSede: equiposPorSedeDetalle,
      equiposPorCategoria: equiposPorCategoriaDetalle,
      equiposPorEstado: equiposPorEstadoDetalle,
    });
  } catch (error) {
    console.error('❌ [ERROR] Error fetching dashboard data:', error);
    console.error('❌ Error details:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      { 
        error: 'Error al cargar datos del dashboard',
        details: error instanceof Error ? error.message : 'Error desconocido',
        fullError: error
      },
      { status: 500 }
    );
  }
}
