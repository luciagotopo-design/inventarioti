// API Route: Equipos Críticos
import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { mapSupabaseToFrontend } from '@/lib/utils';

// GET - Listar equipos críticos
export async function GET(request: NextRequest) {
  console.log('\n🔵 [API] GET /api/equipos-criticos - Iniciando consulta...');
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const resueltos = searchParams.get('resueltos') === 'true';
    const prioridadId = searchParams.get('prioridadId') || '';

    let query = supabase
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
      .eq('resuelto', resueltos)
      .order('fecha_limite_accion', { ascending: true })
      .limit(1000); // 🔧 Traer hasta 1000 equipos (sin límite por defecto)

    if (prioridadId) {
      query = query.eq('nivel_prioridad_id', prioridadId);
    }

    const { data: equiposCriticos, error } = await query;

    if (error) throw error;

    const duration = Date.now() - startTime;
    console.log(`✅ Equipos críticos obtenidos: ${equiposCriticos?.length || 0}`);
    console.log(`✅ [API] Equipos críticos completado en ${duration}ms\n`);

    return NextResponse.json((equiposCriticos || []).map(mapSupabaseToFrontend));
  } catch (error) {
    console.error('Error fetching equipos críticos:', error);
    return NextResponse.json(
      { error: 'Error al cargar equipos críticos' },
      { status: 500 }
    );
  }
}

// POST - Crear equipo crítico (Nota: Ahora se crea automáticamente con syncEquipoCritico)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      idEquipo,
      nivelPrioridadId,
      accionRequerida,
      imagenes,
      costoEstimado,
      fechaLimiteAccion,
    } = body;

    // Verificar que no exista ya
    const { data: existente } = await supabase
      .from('equipos_criticos')
      .select('id')
      .eq('id_equipo', idEquipo)
      .single();

    if (existente) {
      return NextResponse.json(
        { error: 'Este equipo ya está marcado como crítico' },
        { status: 400 }
      );
    }

    const { data: equipoCritico, error } = await supabase
      .from('equipos_criticos')
      .insert({
        id_equipo: idEquipo,
        nivel_prioridad_id: nivelPrioridadId,
        accion_requerida: accionRequerida,
        imagenes: imagenes || [],
        costo_estimado: costoEstimado ? parseFloat(costoEstimado) : null,
        fecha_limite_accion: fechaLimiteAccion ? new Date(fechaLimiteAccion).toISOString() : null,
        resuelto: false,
      })
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
      .single();

    if (error) throw error;

    // Marcar equipo como crítico en inventario
    await supabase
      .from('inventario_general')
      .update({ es_critico: true, updated_at: new Date().toISOString() })
      .eq('id', idEquipo);

    return NextResponse.json(mapSupabaseToFrontend(equipoCritico), { status: 201 });
  } catch (error) {
    console.error('Error creating equipo crítico:', error);
    return NextResponse.json(
      { error: 'Error al crear equipo crítico' },
      { status: 500 }
    );
  }
}
