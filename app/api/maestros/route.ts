// API Route: GET maestros (categorías, estados, sedes, prioridades, acciones)
import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET() {
  console.log('\n🔵 [API] GET /api/maestros - Iniciando consulta...');
  const startTime = Date.now();
  
  try {
    console.log('📊 Consultando datos maestros (categorías, estados, sedes, prioridades, acciones)...');
    
    const [categoriasRes, estadosRes, sedesRes, prioridadesRes, accionesRes] = await Promise.all([
      supabase.from('categorias').select('*').eq('activo', true).order('nombre'),
      supabase.from('estados').select('*').eq('activo', true).order('nombre'),
      supabase.from('sedes').select('*').eq('activo', true).order('nombre'),
      supabase.from('prioridades').select('*').order('orden'),
      supabase.from('acciones_mantenimiento').select('*').order('nombre'),
    ]);

    const categorias = categoriasRes.data || [];
    const estados = estadosRes.data || [];
    const sedes = sedesRes.data || [];
    const prioridades = prioridadesRes.data || [];
    const acciones = accionesRes.data || [];

    const duration = Date.now() - startTime;
    console.log(`✅ Maestros obtenidos - Categorías: ${categorias.length}, Estados: ${estados.length}, Sedes: ${sedes.length}`);
    console.log(`✅ [API] Maestros completado en ${duration}ms\n`);

    return NextResponse.json({
      categorias,
      estados,
      sedes,
      prioridades,
      acciones,
    });
  } catch (error) {
    console.error('Error fetching maestros:', error);
    return NextResponse.json(
      { error: 'Error al cargar datos maestros' },
      { status: 500 }
    );
  }
}
