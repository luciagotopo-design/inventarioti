// API Route: Categoría individual (GET, PUT, DELETE)
import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { mapSupabaseToFrontend } from '@/lib/utils';

// GET - Obtener categoría por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data: categoria, error } = await supabase
      .from('categorias')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !categoria) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(mapSupabaseToFrontend(categoria));
  } catch (error) {
    console.error('Error fetching categoria:', error);
    return NextResponse.json(
      { error: 'Error al cargar categoría' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar categoría
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nombre, descripcion, activo } = body;

    if (!nombre) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    // Verificar si existe
    const { data: existente } = await supabase
      .from('categorias')
      .select('id, nombre')
      .eq('id', id)
      .single();

    if (!existente) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      );
    }

    // Validar nombre único (excepto la actual)
    if (nombre !== existente.nombre) {
      const { data: duplicado } = await supabase
        .from('categorias')
        .select('id')
        .eq('nombre', nombre)
        .neq('id', id)
        .single();

      if (duplicado) {
        return NextResponse.json(
          { error: 'Ya existe una categoría con ese nombre' },
          { status: 400 }
        );
      }
    }

    const { data: categoria, error } = await supabase
      .from('categorias')
      .update({
        nombre,
        descripcion: descripcion || null,
        activo: activo !== undefined ? activo : true
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(mapSupabaseToFrontend(categoria));
  } catch (error) {
    console.error('Error updating categoria:', error);
    return NextResponse.json(
      { error: 'Error al actualizar categoría' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar categoría (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Verificar si tiene equipos asociados
    const { count } = await supabase
      .from('inventario_general')
      .select('*', { count: 'exact', head: true })
      .eq('categoria_id', id);

    if (count && count > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar. Hay ${count} equipos usando esta categoría` },
        { status: 400 }
      );
    }

    // Soft delete (marcar como inactivo)
    const { error } = await supabase
      .from('categorias')
      .update({ activo: false })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting categoria:', error);
    return NextResponse.json(
      { error: 'Error al eliminar categoría' },
      { status: 500 }
    );
  }
}
