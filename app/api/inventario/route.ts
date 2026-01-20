// API Route: Inventario General CRUD
import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { mapSupabaseToFrontend, syncEquipoCritico } from '@/lib/utils';

// GET - Listar equipos con filtros, búsqueda y paginación
export async function GET(request: NextRequest) {
  console.log('\n🔵 [API] GET /api/inventario - Iniciando consulta...');
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sedeId = searchParams.get('sedeId') || '';
    const estadoId = searchParams.get('estadoId') || '';
    const categoriaId = searchParams.get('categoriaId') || '';

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};

    if (search) {
      where.OR = [
        { serial: { contains: search, mode: 'insensitive' } },
        { marca: { contains: search, mode: 'insensitive' } },
        { modelo: { contains: search, mode: 'insensitive' } },
        { responsable: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (sedeId) where.sedeId = sedeId;
    if (estadoId) where.estadoId = estadoId;
    if (categoriaId) where.categoriaId = categoriaId;

    console.log(`📊 Parámetros - Página: ${page}, Límite: ${limit}, Búsqueda: "${search}"`);
    console.log(`📊 Filtros - Sede: ${sedeId || 'Todas'}, Estado: ${estadoId || 'Todos'}, Categoría: ${categoriaId || 'Todas'}`);

    // Construir query de Supabase
    let query = supabase
      .from('inventario_general')
      .select(`
        *,
        categoria:categorias(*),
        estado:estados(*),
        sede:sedes(*),
        equipoCritico:equipos_criticos(
          *,
          nivelPrioridad:prioridades(*)
        )
      `, { count: 'exact' });

    // Aplicar filtros
    if (search) {
      query = query.or(`serial.ilike.%${search}%,marca.ilike.%${search}%,modelo.ilike.%${search}%,responsable.ilike.%${search}%`);
    }
    if (sedeId) query = query.eq('sede_id', sedeId);
    if (estadoId) query = query.eq('estado_id', estadoId);
    if (categoriaId) query = query.eq('categoria_id', categoriaId);

    // Paginación y orden
    query = query
      .order('fecha_registro', { ascending: false })
      .range(skip, skip + limit - 1);

    const { data: equipos, error, count: total } = await query;

    if (error) throw error;

    const duration = Date.now() - startTime;
    console.log(`✅ Equipos obtenidos: ${equipos?.length || 0} de ${total || 0} totales`);
    console.log(`✅ [API] Inventario completado en ${duration}ms\n`);

    return NextResponse.json({
      equipos: mapSupabaseToFrontend(equipos || []),
      total: total || 0,
      page,
      totalPages: Math.ceil((total || 0) / limit),
    });
  } catch (error) {
    console.error('Error fetching equipos:', error);
    return NextResponse.json(
      { error: 'Error al cargar equipos' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo equipo
export async function POST(request: NextRequest) {
  console.log('\n🔵 [API] POST /api/inventario - Creando equipo...');
  
  try {
    const body = await request.json();
    console.log('📝 Datos recibidos:', { serial: body.serial, marca: body.marca, modelo: body.modelo });
    
    const {
      serial,
      marca,
      modelo,
      categoriaId,
      estadoId,
      sedeId,
      ubicacionDetallada,
      responsable,
      imagenes,
      esCritico,
      observaciones,
    } = body;

    // Validar campos requeridos
    if (!serial || !marca || !modelo || !categoriaId || !estadoId || !sedeId) {
      return NextResponse.json(
        { 
          error: 'Campos requeridos faltantes',
          details: {
            serial: !serial ? 'requerido' : 'ok',
            marca: !marca ? 'requerido' : 'ok',
            modelo: !modelo ? 'requerido' : 'ok',
            categoriaId: !categoriaId ? 'requerido' : 'ok',
            estadoId: !estadoId ? 'requerido' : 'ok',
            sedeId: !sedeId ? 'requerido' : 'ok',
          }
        },
        { status: 400 }
      );
    }

    // Validar serial único
    const { data: existente } = await supabase
      .from('inventario_general')
      .select('id')
      .eq('serial', serial)
      .single();

    if (existente) {
      return NextResponse.json(
        { error: 'El número de serie ya existe' },
        { status: 400 }
      );
    }

    const { data: equipo, error } = await supabase
      .from('inventario_general')
      .insert({
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
      .select(`
        *,
        categoria:categorias(*),
        estado:estados(*),
        sede:sedes(*)
      `)
      .single();

    if (error) throw error;

    // Sincronizar con equipos_criticos si es necesario
    if (equipo?.id) {
      await syncEquipoCritico(supabase, equipo.id, esCritico || false);
    }

    console.log(`✅ Equipo creado exitosamente: ${equipo?.serial}`);
    return NextResponse.json(mapSupabaseToFrontend(equipo), { status: 201 });
  } catch (error) {
    console.error('Error creating equipo:', error);
    return NextResponse.json(
      { error: 'Error al crear equipo' },
      { status: 500 }
    );
  }
}
