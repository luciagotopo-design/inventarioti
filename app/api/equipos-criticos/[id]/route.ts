// API Route: Equipo Crítico Individual
import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { mapSupabaseToFrontend } from '@/lib/utils';

// PATCH - Actualizar evidencias/notas SIN marcar como resuelto
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { imagenes, accionRequerida, notasResolucion } = body;

    console.log('\n🔧 [PATCH] Actualizando equipo crítico:', id);
    console.log('📸 Imágenes recibidas:', imagenes);
    console.log('📝 Notas:', notasResolucion);

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (imagenes !== undefined) {
      updateData.imagenes = imagenes;
      console.log('✅ Guardando', imagenes.length, 'imágenes');
    }
    if (accionRequerida !== undefined) updateData.accion_requerida = accionRequerida;
    if (notasResolucion !== undefined) updateData.notas_resolucion = notasResolucion;

    const { data: equipoCritico, error } = await supabase
      .from('equipos_criticos')
      .update(updateData)
      .eq('id', id)
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

    if (error) {
      console.error('❌ Error de Supabase:', error);
      throw error;
    }

    console.log('✅ Equipo actualizado exitosamente');
    console.log('📸 Imágenes guardadas:', equipoCritico.imagenes);

    return NextResponse.json(mapSupabaseToFrontend(equipoCritico));
  } catch (error) {
    console.error('❌ Error updating equipo crítico:', error);
    return NextResponse.json(
      { error: 'Error al actualizar equipo crítico', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT - Marcar como resuelto
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { notasResolucion } = body;

    const { data: equipoCritico, error } = await supabase
      .from('equipos_criticos')
      .update({
        resuelto: true,
        notas_resolucion: notasResolucion,
        fecha_resolucion: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
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

    return NextResponse.json(mapSupabaseToFrontend(equipoCritico));
  } catch (error) {
    console.error('Error resolving equipo crítico:', error);
    return NextResponse.json(
      { error: 'Error al resolver equipo crítico' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar de críticos
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data: equipoCritico, error: fetchError } = await supabase
      .from('equipos_criticos')
      .select('id_equipo')
      .eq('id', id)
      .single();

    if (fetchError || !equipoCritico) {
      return NextResponse.json(
        { error: 'Equipo crítico no encontrado' },
        { status: 404 }
      );
    }

    const { error: deleteError } = await supabase
      .from('equipos_criticos')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // Desmarcar equipo como crítico
    await supabase
      .from('inventario_general')
      .update({ es_critico: false, updated_at: new Date().toISOString() })
      .eq('id', equipoCritico.id_equipo);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting equipo crítico:', error);
    return NextResponse.json(
      { error: 'Error al eliminar equipo crítico' },
      { status: 500 }
    );
  }
}
