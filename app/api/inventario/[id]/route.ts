// API Route: Inventario Individual (GET, PUT, DELETE)
import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { mapSupabaseToFrontend, syncEquipoCritico } from '@/lib/utils';

// GET - Obtener equipo por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data: equipo, error } = await supabase
      .from('inventario_general')
      .select(`
        *,
        categoria:categorias(*),
        estado:estados(*),
        sede:sedes(*),
        equipoCritico:equipos_criticos(
          *,
          nivelPrioridad:prioridades(*)
        ),
        planesMantenimiento:plan_mantenimiento(
          *,
          accion:acciones_mantenimiento(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error || !equipo) {
      return NextResponse.json(
        { error: 'Equipo no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(mapSupabaseToFrontend(equipo));
  } catch (error) {
    console.error('Error fetching equipo:', error);
    return NextResponse.json(
      { error: 'Error al cargar equipo' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar equipo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const {
      serial,
      marca,
      modelo,
      categoriaId,
      estadoId,
      sedeId,
      ubicacionDetallada,
      responsable,
      fechaUltimoMantenimiento,
      especificacionesTecnicas,
      imagenes,
      esCritico,
      observaciones,
    } = body;

    // Verificar si existe
    const { data: existente } = await supabase
      .from('inventario_general')
      .select('id, serial')
      .eq('id', id)
      .single();

    if (!existente) {
      return NextResponse.json(
        { error: 'Equipo no encontrado' },
        { status: 404 }
      );
    }

    // Validar serial único (excepto el actual)
    if (serial !== existente.serial) {
      const { data: duplicado } = await supabase
        .from('inventario_general')
        .select('id')
        .eq('serial', serial)
        .neq('id', id)
        .single();

      if (duplicado) {
        return NextResponse.json(
          { error: 'El número de serie ya existe' },
          { status: 400 }
        );
      }
    }

    const { data: equipo, error } = await supabase
      .from('inventario_general')
      .update({
        serial,
        marca,
        modelo,
        categoria_id: categoriaId,
        estado_id: estadoId,
        sede_id: sedeId,
        ubicacion_detallada: ubicacionDetallada,
        responsable,
        imagenes: imagenes || [],
        es_critico: esCritico || false,
        observaciones,
      })
      .eq('id', id)
      .select(`
        *,
        categoria:categorias(*),
        estado:estados(*),
        sede:sedes(*)
      `)
      .single();

    if (error) throw error;

    // Sincronizar con equipos_criticos si es necesario
    await syncEquipoCritico(supabase, id, esCritico || false);

    return NextResponse.json(mapSupabaseToFrontend(equipo));
  } catch (error) {
    console.error('Error updating equipo:', error);
    return NextResponse.json(
      { error: 'Error al actualizar equipo' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar equipo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = await supabase
      .from('inventario_general')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting equipo:', error);
    return NextResponse.json(
      { error: 'Error al eliminar equipo' },
      { status: 500 }
    );
  }
}
