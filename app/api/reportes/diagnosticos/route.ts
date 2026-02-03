// API Route: Reporte de Diagnósticos
import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const formato = searchParams.get('formato') || 'json'; // json o csv

    // Obtener equipos críticos con toda la información
    const { data: equiposCriticos, error } = await supabase
      .from('equipos_criticos')
      .select(`
        *,
        equipo:inventario_general (
          serial,
          marca,
          modelo,
          categoria:categorias(nombre),
          estado:estados(nombre),
          sede:sedes(nombre),
          ubicacion_detallada,
          responsable,
          observaciones
        ),
        prioridad:prioridades(nombre, color)
      `)
      .eq('resuelto', false)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const diagnosticos = equiposCriticos?.map((ec: any) => ({
      serial: ec.equipo?.serial || 'N/A',
      marca: ec.equipo?.marca || 'N/A',
      modelo: ec.equipo?.modelo || 'N/A',
      categoria: ec.equipo?.categoria?.nombre || 'N/A',
      estado: ec.equipo?.estado?.nombre || 'N/A',
      sede: ec.equipo?.sede?.nombre || 'N/A',
      ubicacion: ec.equipo?.ubicacion_detallada || 'N/A',
      responsable: ec.equipo?.responsable || 'N/A',
      prioridad: ec.prioridad?.nombre || 'N/A',
      accion_requerida: ec.accion_requerida || 'N/A',
      costo_estimado: ec.costo_estimado || 0,
      fecha_limite: ec.fecha_limite_accion 
        ? new Date(ec.fecha_limite_accion).toLocaleDateString('es-ES')
        : 'Sin fecha',
      observaciones: ec.equipo?.observaciones || 'N/A',
      fecha_registro: new Date(ec.created_at).toLocaleDateString('es-ES')
    })) || [];

    if (formato === 'csv') {
      // Generar CSV
      const headers = [
        'Serial',
        'Marca',
        'Modelo',
        'Categoría',
        'Estado',
        'Sede',
        'Ubicación',
        'Responsable',
        'Prioridad',
        'Acción Requerida',
        'Costo Estimado',
        'Fecha Límite',
        'Observaciones',
        'Fecha Registro'
      ];

      const rows = diagnosticos.map((d: any) => [
        d.serial,
        d.marca,
        d.modelo,
        d.categoria,
        d.estado,
        d.sede,
        d.ubicacion,
        d.responsable,
        d.prioridad,
        d.accion_requerida,
        d.costo_estimado,
        d.fecha_limite,
        d.observaciones,
        d.fecha_registro
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="diagnosticos_${Date.now()}.csv"`
        }
      });
    }

    return NextResponse.json({
      total: diagnosticos.length,
      fecha_generacion: new Date().toISOString(),
      diagnosticos
    });
  } catch (error) {
    console.error('Error generating diagnosticos report:', error);
    return NextResponse.json(
      { error: 'Error al generar reporte de diagnósticos' },
      { status: 500 }
    );
  }
}
