// API Route: Plan de Mantenimiento Individual
import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { mapSupabaseToFrontend } from '@/lib/utils';

// PUT - Actualizar plan de mantenimiento (ejecutar, completar, etc.)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const {
      estadoEjecucion,
      fechaEjecucion,
      costoReal,
      descripcionTrabajo,
      observaciones,
    } = body;

    const { data: plan, error } = await supabase
      .from('plan_mantenimiento')
      .update({
        estado_ejecucion: estadoEjecucion,
        fecha_ejecucion: fechaEjecucion ? new Date(fechaEjecucion).toISOString() : null,
        costo_real: costoReal ? parseFloat(costoReal) : null,
        descripcion_trabajo: descripcionTrabajo,
        observaciones,
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
        accion:acciones_mantenimiento(id, nombre, descripcion)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json(mapSupabaseToFrontend(plan));
  } catch (error) {
    console.error('Error updating plan:', error);
    return NextResponse.json(
      { error: 'Error al actualizar plan de mantenimiento' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar plan de mantenimiento
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = await supabase
      .from('plan_mantenimiento')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting plan:', error);
    return NextResponse.json(
      { error: 'Error al eliminar plan de mantenimiento' },
      { status: 500 }
    );
  }
}
