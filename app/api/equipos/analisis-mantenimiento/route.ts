// API Route: Análisis Inteligente de Mantenimiento con Gemini AI
import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { generarAnalisisMantenimientoGemini, buscarPreciosConGemini } from '@/lib/gemini';

interface AnalisisRequest {
  equipoId: string;
  pais?: string;
  moneda?: string;
  usarIA?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalisisRequest = await request.json();
    const { equipoId, pais = 'Colombia', moneda = 'COP', usarIA = true } = body;

    // Obtener información completa del equipo
    const { data: equipo, error } = await supabase
      .from('inventario_general')
      .select(`
        *,
        categoria:categorias(nombre),
        estado:estados(nombre),
        sede:sedes(nombre),
        equipoCritico:equipos_criticos(
          *,
          prioridad:prioridades(nombre)
        )
      `)
      .eq('id', equipoId)
      .single();

    if (error || !equipo) {
      return NextResponse.json(
        { error: 'Equipo no encontrado' },
        { status: 404 }
      );
    }

    // Calcular antigüedad (estimado basado en fecha de registro)
    const fechaRegistro = new Date(equipo.fecha_registro || equipo.created_at);
    const antiguedadAnios = ((Date.now() - fechaRegistro.getTime()) / (365.25 * 24 * 60 * 60 * 1000)).toFixed(1);

    console.log(`\n🔵 [ANÁLISIS] Equipo: ${equipo.serial}, Método: ${usarIA ? 'Gemini AI' : 'Reglas'}\n`);

    let analisis;

    // Si usarIA es true y hay API key, usar Gemini
    if (usarIA && process.env.GEMINI_API_KEY) {
      console.log('🤖 Usando Gemini AI para análisis inteligente...');
      
      try {
        const equipoData = {
          tipo: equipo.categoria?.nombre || 'Desconocido',
          marca: equipo.marca,
          modelo: equipo.modelo,
          antiguedad_anios: parseFloat(antiguedadAnios),
          estado: equipo.estado?.nombre || 'Desconocido',
          observaciones: equipo.observaciones || '',
          ubicacion: equipo.ubicacion_detallada || '',
          responsable: equipo.responsable || '',
          es_critico: equipo.es_critico || false
        };

        const analisisGemini = await generarAnalisisMantenimientoGemini(equipoData, pais, moneda);
        
        // Buscar precios reales si hay componentes identificados
        if (analisisGemini.componentes_requeridos?.length > 0) {
          console.log('🛒 Buscando precios en tiendas online...');
          
          for (let i = 0; i < Math.min(analisisGemini.componentes_requeridos.length, 3); i++) {
            const comp = analisisGemini.componentes_requeridos[i];
            const busquedaPrecios = await buscarPreciosConGemini(
              comp.componente,
              equipo.marca,
              equipo.modelo,
              pais,
              moneda
            );
            analisisGemini.componentes_requeridos[i].busqueda_precios = busquedaPrecios;
          }
        }

        analisis = {
          ...analisisGemini,
          metodo_analisis: 'Gemini AI',
          fecha_analisis: new Date().toISOString()
        };

        console.log('✅ Análisis con Gemini completado\n');
      } catch (errorGemini) {
        console.error('❌ Error con Gemini, usando sistema de reglas:', errorGemini);
        analisis = {
          ...generarAnalisis(equipo, parseFloat(antiguedadAnios), pais, moneda),
          metodo_analisis: 'Reglas (Gemini falló)',
          error_gemini: errorGemini instanceof Error ? errorGemini.message : 'Error'
        };
      }
    } else {
      // Usar sistema de reglas original
      console.log('⚙️ Usando sistema de reglas...');
      analisis = {
        ...generarAnalisis(equipo, parseFloat(antiguedadAnios), pais, moneda),
        metodo_analisis: 'Sistema de reglas',
        ...((!process.env.GEMINI_API_KEY) && { nota_gemini: 'Configure GEMINI_API_KEY en .env para usar IA' })
      };
      console.log('✅ Análisis con reglas completado\n');
    }

    return NextResponse.json(analisis);
  } catch (error) {
    console.error('Error generating maintenance analysis:', error);
    return NextResponse.json(
      { error: 'Error al generar análisis de mantenimiento' },
      { status: 500 }
    );
  }
}

function generarAnalisis(equipo: any, antiguedadAnios: number, pais: string, moneda: string) {
  const categoria = equipo.categoria?.nombre || 'Desconocido';
  const estado = equipo.estado?.nombre || 'Desconocido';
  const marca = equipo.marca;
  const modelo = equipo.modelo;
  const esCritico = equipo.es_critico;
  const observaciones = equipo.observaciones || '';

  // Determinar nivel de urgencia
  let nivelUrgencia = 'BAJO';
  if (esCritico || estado === 'Dañado') nivelUrgencia = 'ALTO';
  else if (estado === 'Baja capacidad' || antiguedadAnios > 5) nivelUrgencia = 'MEDIO';

  // Plan de mantenimiento según categoría
  const planMantenimiento = generarPlanPorCategoria(categoria, antiguedadAnios, estado);

  // Identificar reparaciones necesarias
  const reparaciones = identificarReparaciones(categoria, estado, observaciones, marca, modelo);

  // Estimación de costos (valores de referencia - en producción buscar en APIs de tiendas)
  const costosEstimados = estimarCostos(reparaciones, pais, moneda);

  return {
    equipo: {
      serial: equipo.serial,
      marca,
      modelo,
      categoria,
      estado,
      antiguedad_anios: antiguedadAnios,
      es_critico: esCritico,
      ubicacion: equipo.ubicacion_detallada,
      responsable: equipo.responsable,
      observaciones
    },
    diagnostico: {
      nivel_urgencia: nivelUrgencia,
      estado_general: analizarEstadoGeneral(estado, antiguedadAnios, esCritico),
      recomendacion_inmediata: obtenerRecomendacionInmediata(estado, esCritico, observaciones)
    },
    plan_mantenimiento: planMantenimiento,
    reparaciones_necesarias: reparaciones,
    analisis_costos: costosEstimados,
    tiendas_recomendadas: obtenerTiendasPorPais(pais, categoria),
    fecha_analisis: new Date().toISOString(),
    proxima_revision: calcularProximaRevision(estado, antiguedadAnios)
  };
}

function generarPlanPorCategoria(categoria: string, antiguedad: number, estado: string) {
  const planes: any = {
    'PC/Portátil': [
      { tipo: 'Preventivo', accion: 'Limpieza interna de polvo', frecuencia: '3 meses', prioridad: 'Alta' },
      { tipo: 'Preventivo', accion: 'Actualización de sistema operativo y drivers', frecuencia: '1 mes', prioridad: 'Alta' },
      { tipo: 'Preventivo', accion: 'Verificación de temperatura y ventiladores', frecuencia: '2 meses', prioridad: 'Media' },
      { tipo: 'Preventivo', accion: 'Limpieza de disco y desfragmentación (HDD)', frecuencia: '6 meses', prioridad: 'Media' },
      { tipo: 'Correctivo', accion: 'Reemplazo de pasta térmica', frecuencia: antiguedad > 2 ? '1 año' : '2 años', prioridad: 'Media' },
    ],
    'Monitor': [
      { tipo: 'Preventivo', accion: 'Limpieza de pantalla y carcasa', frecuencia: '2 meses', prioridad: 'Baja' },
      { tipo: 'Preventivo', accion: 'Verificación de cables y conexiones', frecuencia: '6 meses', prioridad: 'Media' },
      { tipo: 'Correctivo', accion: 'Calibración de colores', frecuencia: '1 año', prioridad: 'Baja' },
    ],
    'Impresora': [
      { tipo: 'Preventivo', accion: 'Limpieza de cabezales', frecuencia: '1 mes', prioridad: 'Alta' },
      { tipo: 'Preventivo', accion: 'Verificación de niveles de tinta/tóner', frecuencia: '2 semanas', prioridad: 'Alta' },
      { tipo: 'Preventivo', accion: 'Limpieza de rodillos', frecuencia: '3 meses', prioridad: 'Media' },
      { tipo: 'Correctivo', accion: 'Alineación y calibración', frecuencia: '6 meses', prioridad: 'Media' },
    ],
    'Drones': [
      { tipo: 'Preventivo', accion: 'Inspección de hélices', frecuencia: 'Antes de cada vuelo', prioridad: 'Alta' },
      { tipo: 'Preventivo', accion: 'Actualización de firmware', frecuencia: '1 mes', prioridad: 'Alta' },
      { tipo: 'Preventivo', accion: 'Limpieza de sensores y cámara', frecuencia: '2 semanas', prioridad: 'Media' },
      { tipo: 'Correctivo', accion: 'Calibración de GPS y brújula', frecuencia: '3 meses', prioridad: 'Alta' },
    ],
    'UPS': [
      { tipo: 'Preventivo', accion: 'Prueba de batería', frecuencia: '1 mes', prioridad: 'Alta' },
      { tipo: 'Preventivo', accion: 'Verificación de conexiones', frecuencia: '3 meses', prioridad: 'Media' },
      { tipo: 'Correctivo', accion: 'Reemplazo de batería', frecuencia: antiguedad > 3 ? '6 meses' : '2 años', prioridad: 'Alta' },
    ]
  };

  let plan = planes[categoria] || [
    { tipo: 'Preventivo', accion: 'Inspección visual general', frecuencia: '3 meses', prioridad: 'Media' },
    { tipo: 'Preventivo', accion: 'Limpieza externa', frecuencia: '1 mes', prioridad: 'Baja' },
  ];

  // Agregar acciones correctivas si está dañado
  if (estado === 'Dañado' || estado === 'Baja capacidad') {
    plan.unshift({
      tipo: 'Correctivo',
      accion: 'Diagnóstico técnico profesional URGENTE',
      frecuencia: 'Inmediato',
      prioridad: 'Crítica'
    });
  }

  return plan;
}

function identificarReparaciones(categoria: string, estado: string, observaciones: string, marca: string, modelo: string) {
  const reparaciones: any[] = [];

  // Análisis de observaciones
  const obs = observaciones.toLowerCase();

  if (obs.includes('bateria') || obs.includes('batería')) {
    reparaciones.push({
      componente: 'Batería',
      descripcion: `Batería para ${marca} ${modelo}`,
      urgencia: 'Alta',
      categoria_repuesto: 'Batería original o compatible',
      buscar_en: ['Amazon', 'MercadoLibre', 'Tiendas oficiales']
    });
  }

  if (obs.includes('disco duro') || obs.includes('ssd') || obs.includes('almacenamiento')) {
    reparaciones.push({
      componente: 'Disco Duro/SSD',
      descripcion: estado.includes('Baja capacidad') ? 'Upgrade a SSD 480GB-1TB' : 'Reemplazo de disco',
      urgencia: 'Media',
      categoria_repuesto: 'SSD SATA/NVMe',
      buscar_en: ['Amazon', 'Alkosto', 'Ktronix']
    });
  }

  if (obs.includes('ram') || obs.includes('memoria')) {
    reparaciones.push({
      componente: 'Memoria RAM',
      descripcion: 'Upgrade o reemplazo de RAM',
      urgencia: 'Media',
      categoria_repuesto: 'Memoria RAM DDR3/DDR4',
      buscar_en: ['Amazon', 'CompuDemano', 'MercadoLibre']
    });
  }

  if (obs.includes('teclado')) {
    reparaciones.push({
      componente: 'Teclado',
      descripcion: `Teclado para ${marca} ${modelo}`,
      urgencia: 'Media',
      categoria_repuesto: 'Teclado original',
      buscar_en: ['Amazon', 'Repuestos oficiales', 'AliExpress']
    });
  }

  if (obs.includes('pantalla') || obs.includes('display')) {
    reparaciones.push({
      componente: 'Pantalla',
      descripcion: `Pantalla LCD para ${marca} ${modelo}`,
      urgencia: 'Alta',
      categoria_repuesto: 'Pantalla original',
      buscar_en: ['Servicios técnicos autorizados', 'Amazon']
    });
  }

  if (obs.includes('encendido') || obs.includes('boton') || obs.includes('botón')) {
    reparaciones.push({
      componente: 'Sistema de encendido',
      descripcion: 'Revisión y reparación de botón de encendido',
      urgencia: 'Alta',
      categoria_repuesto: 'Servicio técnico especializado',
      buscar_en: ['Centros de servicio autorizados']
    });
  }

  if (obs.includes('visagra') || obs.includes('bisagra') || obs.includes('carcasa')) {
    reparaciones.push({
      componente: 'Carcasa/Bisagras',
      descripcion: 'Reparación o reemplazo de bisagras y carcasa',
      urgencia: 'Media',
      categoria_repuesto: 'Piezas de repuesto',
      buscar_en: ['Repuestos genéricos', 'AliExpress', 'MercadoLibre']
    });
  }

  // Si no hay observaciones específicas pero está dañado
  if (reparaciones.length === 0 && estado === 'Dañado') {
    reparaciones.push({
      componente: 'Diagnóstico general',
      descripcion: 'Se requiere diagnóstico técnico profesional',
      urgencia: 'Alta',
      categoria_repuesto: 'Servicio técnico',
      buscar_en: ['Centros de servicio autorizados', marca]
    });
  }

  // Mantenimientos preventivos estándar por categoría
  if (categoria === 'PC/Portátil' && !reparaciones.some(r => r.componente.includes('Limpieza'))) {
    reparaciones.push({
      componente: 'Mantenimiento preventivo',
      descripcion: 'Limpieza interna, cambio pasta térmica, limpieza ventiladores',
      urgencia: 'Media',
      categoria_repuesto: 'Servicio de mantenimiento',
      buscar_en: ['Técnicos locales certificados']
    });
  }

  return reparaciones;
}

function estimarCostos(reparaciones: any[], pais: string, moneda: string) {
  // Precios de referencia en COP (Colombia) - En producción, buscar en APIs reales
  const preciosReferencia: any = {
    'Batería': { min: 80000, max: 250000, promedio: 150000 },
    'Disco Duro/SSD': { min: 150000, max: 450000, promedio: 280000 },
    'Memoria RAM': { min: 100000, max: 300000, promedio: 180000 },
    'Teclado': { min: 120000, max: 280000, promedio: 180000 },
    'Pantalla': { min: 300000, max: 800000, promedio: 500000 },
    'Sistema de encendido': { min: 50000, max: 150000, promedio: 90000 },
    'Carcasa/Bisagras': { min: 80000, max: 200000, promedio: 120000 },
    'Diagnóstico general': { min: 30000, max: 80000, promedio: 50000 },
    'Mantenimiento preventivo': { min: 40000, max: 100000, promedio: 60000 }
  };

  return reparaciones.map(rep => {
    const precios = preciosReferencia[rep.componente] || { min: 50000, max: 200000, promedio: 100000 };
    
    return {
      componente: rep.componente,
      descripcion: rep.descripcion,
      costo_estimado_min: precios.min,
      costo_estimado_max: precios.max,
      costo_promedio: precios.promedio,
      moneda,
      nota: 'Precio estimado de referencia. Verificar en tiendas actuales.',
      tiendas_sugeridas: rep.buscar_en,
      enlaces_busqueda: generarEnlacesBusqueda(rep.descripcion, pais)
    };
  });
}

function generarEnlacesBusqueda(descripcion: string, pais: string) {
  const busqueda = encodeURIComponent(descripcion);
  
  const enlaces: any = {
    Colombia: [
      { tienda: 'MercadoLibre', url: `https://listado.mercadolibre.com.co/${busqueda}` },
      { tienda: 'Amazon', url: `https://www.amazon.com/s?k=${busqueda}` },
      { tienda: 'Alkosto', url: `https://www.alkosto.com/search?q=${busqueda}` },
      { tienda: 'Ktronix', url: `https://www.ktronix.com/search?q=${busqueda}` }
    ],
    Mexico: [
      { tienda: 'MercadoLibre', url: `https://listado.mercadolibre.com.mx/${busqueda}` },
      { tienda: 'Amazon MX', url: `https://www.amazon.com.mx/s?k=${busqueda}` }
    ]
  };

  return enlaces[pais] || enlaces['Colombia'];
}

function obtenerTiendasPorPais(pais: string, categoria: string) {
  const tiendas: any = {
    Colombia: [
      { nombre: 'MercadoLibre Colombia', url: 'https://www.mercadolibre.com.co', especialidad: 'General' },
      { nombre: 'Amazon', url: 'https://www.amazon.com', especialidad: 'Electrónica' },
      { nombre: 'Alkosto', url: 'https://www.alkosto.com', especialidad: 'Tecnología' },
      { nombre: 'Ktronix', url: 'https://www.ktronix.com', especialidad: 'Computadores' },
      { nombre: 'CompuDemano', url: 'https://www.compudemano.com', especialidad: 'Repuestos PC' }
    ]
  };

  return tiendas[pais] || tiendas['Colombia'];
}

function analizarEstadoGeneral(estado: string, antiguedad: number, esCritico: boolean): string {
  if (estado === 'Dañado') return '🔴 CRÍTICO - Requiere atención inmediata';
  if (esCritico) return '🟠 URGENTE - Equipo crítico necesita revisión prioritaria';
  if (estado === 'Baja capacidad') return '🟡 ATENCIÓN - Rendimiento degradado, planear upgrade';
  if (antiguedad > 5) return '🟡 ENVEJECIMIENTO - Considerar reemplazo o upgrade significativo';
  if (estado === 'En mantenimiento') return '🔵 EN PROCESO - Bajo mantenimiento actualmente';
  return '🟢 ESTABLE - Funcionamiento normal';
}

function obtenerRecomendacionInmediata(estado: string, esCritico: boolean, observaciones: string): string {
  if (estado === 'Dañado' && esCritico) {
    return '⚠️ ACCIÓN URGENTE: Equipo crítico fuera de servicio. Priorizar reparación o reemplazo temporal inmediato.';
  }
  if (estado === 'Dañado') {
    return '⚠️ Reparar o reemplazar en los próximos 7 días. Evaluar costo-beneficio de reparación vs compra nueva.';
  }
  if (esCritico && observaciones.includes('bateria')) {
    return '⚠️ Equipo crítico con problema de batería. Mantener conectado a corriente y programar reemplazo.';
  }
  if (estado === 'Baja capacidad') {
    return '💡 Planificar upgrade de componentes (RAM, SSD) o considerar renovación en próximo presupuesto.';
  }
  return '✅ Continuar con plan de mantenimiento preventivo regular.';
}

function calcularProximaRevision(estado: string, antiguedad: number): string {
  if (estado === 'Dañado') return 'Inmediato';
  if (estado === 'Baja capacidad') return '1 mes';
  if (antiguedad > 4) return '2 meses';
  return '3 meses';
}
