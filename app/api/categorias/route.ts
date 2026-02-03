// API Route: CRUD de Categorías
import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { mapSupabaseToFrontend } from '@/lib/utils';

// GET - Listar todas las categorías
export async function GET() {
  try {
    const { data: categorias, error } = await supabase
      .from('categorias')
      .select('*')
      .order('nombre');

    if (error) throw error;

    return NextResponse.json(mapSupabaseToFrontend(categorias || []));
  } catch (error) {
    console.error('Error fetching categorias:', error);
    return NextResponse.json(
      { error: 'Error al cargar categorías' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva categoría
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, descripcion } = body;

    if (!nombre) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    // Verificar que no exista
    const { data: existente } = await supabase
      .from('categorias')
      .select('id')
      .eq('nombre', nombre)
      .single();

    if (existente) {
      return NextResponse.json(
        { error: 'Ya existe una categoría con ese nombre' },
        { status: 400 }
      );
    }

    const { data: categoria, error } = await supabase
      .from('categorias')
      .insert({
        nombre,
        descripcion: descripcion || null,
        activo: true
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(mapSupabaseToFrontend(categoria), { status: 201 });
  } catch (error) {
    console.error('Error creating categoria:', error);
    return NextResponse.json(
      { error: 'Error al crear categoría' },
      { status: 500 }
    );
  }
}
