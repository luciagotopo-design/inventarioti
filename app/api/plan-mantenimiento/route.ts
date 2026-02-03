// API Route: Plan de Mantenimiento
import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { mapSupabaseToFrontend } from '@/lib/utils';

// GET - Listar planes de mantenimiento
export async function GET(request: NextRequest) {
  console.log('\n🔵 [API] GET /api/plan-mantenimiento - Iniciando consulta...');
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const equipoId = searchParams.get('equipoId') || '';
    const estadoEjecucion = searchParams.get('estadoEjecucion') || '';

    let query = supabase
      .from('plan_mantenimiento')
      .select(`
        *,
        equipo:inventario_general(
          *,
          categoria:categorias(id, nombre),
          estado:estados(id, nombre, color),
          sede:sedes(id, nombre)
        ),
        accion:acciones_mantenimiento(id, nombre, descripcion)
      `)
      .order('fecha_programada', { ascending: false });

    if (equipoId) query = query.eq('id_equipo', equipoId);
    if (estadoEjecucion) query = query.eq('estado_ejecucion', estadoEjecucion);

    const { data: planes, error } = await query;

    if (error) throw error;

    const duration = Date.now() - startTime;
    console.log(`✅ Planes de mantenimiento obtenidos: ${planes?.length || 0}`);
    console.log(`✅ [API] Plan mantenimiento completado en ${duration}ms\n`);

    return NextResponse.json((planes || []).map(mapSupabaseToFrontend));
  } catch (error) {
    console.error('Error fetching planes:', error);
    return NextResponse.json(
      { error: 'Error al cargar planes de mantenimiento' },
      { status: 500 }
    );
  }
}

// POST - Crear plan de mantenimiento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      idEquipo,
      accionId,
      descripcionTrabajo,
      responsableEjecucion,
      fechaProgramada,
      presupuesto,
      imagenes,
      observaciones,
    } = body;

    const { data: plan, error } = await supabase
      .from('plan_mantenimiento')
      .insert({
        id_equipo: idEquipo,
        accion_id: accionId,
        descripcion_trabajo: descripcionTrabajo,
        responsable_ejecucion: responsableEjecucion,
        fecha_programada: new Date(fechaProgramada).toISOString(),
        presupuesto: presupuesto ? parseFloat(presupuesto) : null,
        imagenes: imagenes || [],
        observaciones,
        estado_ejecucion: 'Pendiente',
      })
      .select(`
        *,
        equipo:inventario_general(
          *,
          categoria:categorias(id, nombre),
          estado:estados(id, nombre, color),
          sede:sedes(id, nombre)
        ),
        accion:acciones_mantenimiento(id, nombre, descripcion)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json(mapSupabaseToFrontend(plan), { status: 201 });
  } catch (error) {
    console.error('Error creating plan:', error);
    return NextResponse.json(
      { error: 'Error al crear plan de mantenimiento' },
      { status: 500 }
    );
  }
}
