// API Route: Reporte de Acciones de Mantenimiento
import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const formato = searchParams.get('formato') || 'json';
    const estado = searchParams.get('estado'); // Pendiente, Completado, etc.
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');

    // Construir query
    let query = supabase
      .from('plan_mantenimiento')
      .select(`
        *,
        equipo:inventario_general (
          serial,
          marca,
          modelo,
          categoria:categorias(nombre),
          sede:sedes(nombre),
          responsable
        ),
        accion:acciones_mantenimiento(nombre, descripcion)
      `)
      .order('fecha_programada', { ascending: false });

    // Aplicar filtros
    if (estado) {
      query = query.eq('estado_ejecucion', estado);
    }
    if (fechaInicio) {
      query = query.gte('fecha_programada', fechaInicio);
    }
    if (fechaFin) {
      query = query.lte('fecha_programada', fechaFin);
    }

    const { data: mantenimientos, error } = await query;

    if (error) throw error;

    const acciones = mantenimientos?.map((m: any) => ({
      serial_equipo: m.equipo?.serial || 'N/A',
      marca: m.equipo?.marca || 'N/A',
      modelo: m.equipo?.modelo || 'N/A',
      categoria: m.equipo?.categoria?.nombre || 'N/A',
      sede: m.equipo?.sede?.nombre || 'N/A',
      responsable_equipo: m.equipo?.responsable || 'N/A',
      accion: m.accion?.nombre || 'N/A',
      descripcion_accion: m.accion?.descripcion || 'N/A',
      responsable_ejecucion: m.responsable_ejecucion || 'No asignado',
      fecha_programada: new Date(m.fecha_programada).toLocaleDateString('es-ES'),
      fecha_ejecucion: m.fecha_ejecucion 
        ? new Date(m.fecha_ejecucion).toLocaleDateString('es-ES')
        : 'Pendiente',
      estado: m.estado_ejecucion || 'Pendiente',
      presupuesto: m.presupuesto || 0,
      costo_real: m.costo_real || 0,
      observaciones: m.observaciones || 'N/A'
    })) || [];

    if (formato === 'csv') {
      const headers = [
        'Serial Equipo',
        'Marca',
        'Modelo',
        'Categoría',
        'Sede',
        'Responsable Equipo',
        'Acción',
        'Descripción',
        'Responsable Ejecución',
        'Fecha Programada',
        'Fecha Ejecución',
        'Estado',
        'Presupuesto',
        'Costo Real',
        'Observaciones'
      ];

      const rows = acciones.map((a: any) => [
        a.serial_equipo,
        a.marca,
        a.modelo,
        a.categoria,
        a.sede,
        a.responsable_equipo,
        a.accion,
        a.descripcion_accion,
        a.responsable_ejecucion,
        a.fecha_programada,
        a.fecha_ejecucion,
        a.estado,
        a.presupuesto,
        a.costo_real,
        a.observaciones
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="mantenimientos_${Date.now()}.csv"`
        }
      });
    }

    return NextResponse.json({
      total: acciones.length,
      fecha_generacion: new Date().toISOString(),
      filtros: { estado, fechaInicio, fechaFin },
      acciones
    });
  } catch (error) {
    console.error('Error generating mantenimientos report:', error);
    return NextResponse.json(
      { error: 'Error al generar reporte de mantenimientos' },
      { status: 500 }
    );
  }
}
