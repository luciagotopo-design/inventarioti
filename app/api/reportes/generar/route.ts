import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    // Evitar problemas de autenticación - endpoint público
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const body = await request.json();
    const tipo = body.tipo;
    const formato = body.formato || 'pdf';
    const filtros = body.filtros;

    console.log('📊 Generando reporte:', { tipo, formato });

    let data: any[] = [];
    let titulo = '';
    let subtitulo = '';

    // Obtener datos según el tipo de reporte
    switch (tipo) {
      case 'inventario-completo':
        const { data: equipos, error: errorEquipos } = await supabase
          .from('inventario_general')
          .select(`
            *,
            categoria:categorias(id, nombre),
            estado:estados(id, nombre, color),
            sede:sedes(id, nombre)
          `)
          .order('created_at', { ascending: false });
        
        if (errorEquipos) {
          console.error('❌ Error obteniendo inventario:', errorEquipos);
        }
        
        data = equipos || [];
        titulo = 'REPORTE DE INVENTARIO COMPLETO';
        subtitulo = `Total de equipos: ${data.length}`;
        console.log('📦 Datos inventario:', data.length, 'equipos');
        console.log('📊 Primer equipo:', JSON.stringify(data[0], null, 2));
        break;

      case 'mantenimientos-pendientes':
        const { data: pendientes, error: errorPendientes } = await supabase
          .from('plan_mantenimiento')
          .select(`
            *,
            equipo:inventario_general(
              id,
              serial,
              marca,
              modelo,
              categoria:categorias(nombre)
            ),
            accion:acciones_mantenimiento(id, nombre)
          `)
          .in('estado_ejecucion', ['Pendiente', 'En Proceso'])
          .order('fecha_programada', { ascending: true });
        
        if (errorPendientes) {
          console.error('❌ Error obteniendo mantenimientos:', errorPendientes);
        }
        
        data = pendientes || [];
        titulo = 'MANTENIMIENTOS PENDIENTES';
        subtitulo = `${data.length} actividades programadas`;
        console.log('🔧 Datos mantenimiento:', data.length, 'actividades');
        console.log('📊 Primer mantenimiento:', JSON.stringify(data[0], null, 2));
        break;

      case 'equipos-criticos':
        const { data: criticos, error } = await supabase
          .from('equipos_criticos')
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
          .eq('resuelto', false)
          .order('fecha_limite_accion', { ascending: true });
        
        if (error) {
          console.error('❌ Error obteniendo datos críticos:', error);
        }
        
        data = criticos || [];
        titulo = 'DIAGNÓSTICO DE EQUIPOS CRÍTICOS';
        subtitulo = `${data.length} equipos requieren atención prioritaria`;
        console.log('⚠️ Datos críticos:', data.length, 'equipos');
        console.log('📊 Primer registro:', JSON.stringify(data[0], null, 2));
        break;

      default:
        return NextResponse.json({ error: 'Tipo de reporte no válido' }, { status: 400 });
    }

    if (formato === 'pdf') {
      const pdfBuffer = await generarPDFMejorado(data, tipo, titulo, subtitulo);
      return new NextResponse(pdfBuffer as BodyInit, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="reporte-${tipo}-${new Date().toISOString().split('T')[0]}.pdf"`
        }
      });
    } else if (formato === 'xlsx' || formato === 'excel') {
      console.log('📁 Generando Excel con plantilla...');
      // Usar plantilla Excel
      const excelBuffer = await generarExcelDesdePlantilla(data, tipo);
      
      const nombreArchivo = `${tipo}-${new Date().toISOString().split('T')[0]}.xlsx`;
      console.log('✅ Excel generado:', nombreArchivo);
      
      return new NextResponse(new Uint8Array(excelBuffer), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${nombreArchivo}"`
        }
      });
    } else if (formato === 'csv') {
      const csvContent = generarCSV(data, tipo);
      const buffer = Buffer.from('\uFEFF' + csvContent, 'utf-8');
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${tipo}-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    console.error('❌ Formato no soportado:', formato);
    return NextResponse.json({ error: `Formato no soportado: ${formato}` }, { status: 400 });
  } catch (error) {
    console.error('Error generando reporte:', error);
    return NextResponse.json({ error: 'Error al generar reporte' }, { status: 500 });
  }
}

async function generarPDFMejorado(data: any[], tipo: string, titulo: string, subtitulo: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'LETTER',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        bufferPages: true,
        font: 'Helvetica' // Usar fuente por defecto
      });
      
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // ENCABEZADO MEJORADO
      doc.fillColor('#1e40af')
         .fontSize(24)
         .font('Helvetica-Bold')
         .text(titulo, { align: 'center' });
      
      doc.fillColor('#64748b')
         .fontSize(12)
         .font('Helvetica')
         .text(subtitulo, { align: 'center' });
      
      doc.fillColor('#94a3b8')
         .fontSize(10)
         .text(`Generado: ${new Date().toLocaleString('es-ES')}`, { align: 'center' });
      
      doc.moveDown(1);
      
      // LÍNEA DECORATIVA
      doc.strokeColor('#e2e8f0')
         .lineWidth(2)
         .moveTo(50, doc.y)
         .lineTo(562, doc.y)
         .stroke();
      
      doc.moveDown(1.5);

      // ESTADÍSTICAS RESUMIDAS
      agregarEstadisticas(doc, data, tipo);
      
      doc.moveDown(1);

      // CONTENIDO SEGÚN TIPO DE REPORTE
      switch (tipo) {
        case 'inventario-completo':
          generarTablaInventario(doc, data);
          break;
        case 'mantenimientos-pendientes':
          generarTablaMantenimientos(doc, data);
          break;
        case 'equipos-criticos':
          generarTablaEquiposCriticos(doc, data);
          break;
      }

      // PIE DE PÁGINA EN TODAS LAS PÁGINAS
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        
        doc.fontSize(8)
           .fillColor('#94a3b8')
           .text(
             `Página ${i + 1} de ${range.count}`,
             50,
             doc.page.height - 50,
             { align: 'center' }
           );
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

function agregarEstadisticas(doc: typeof PDFDocument.prototype, data: any[], tipo: string) {
  const stats = calcularEstadisticas(data, tipo);
  
  const startY = doc.y;
  const boxWidth = 120;
  const boxHeight = 60;
  const spacing = 15;
  const startX = 50;

  stats.forEach((stat, index) => {
    const x = startX + (index * (boxWidth + spacing));
    
    // Caja con sombra
    doc.fillColor('#f1f5f9')
       .rect(x + 2, startY + 2, boxWidth, boxHeight)
       .fill();
    
    doc.fillColor('#ffffff')
       .rect(x, startY, boxWidth, boxHeight)
       .fill();
    
    doc.strokeColor('#e2e8f0')
       .rect(x, startY, boxWidth, boxHeight)
       .stroke();
    
    // Icono/Color
    doc.fillColor(stat.color)
       .circle(x + 15, startY + 20, 8)
       .fill();
    
    // Valor
    doc.fillColor('#0f172a')
       .fontSize(20)
       .font('Helvetica-Bold')
       .text(stat.valor, x + 30, startY + 12, { width: boxWidth - 35 });
    
    // Etiqueta
    doc.fillColor('#64748b')
       .fontSize(9)
       .font('Helvetica')
       .text(stat.etiqueta, x + 10, startY + 40, { width: boxWidth - 20, align: 'center' });
  });
  
  doc.y = startY + boxHeight + 20;
}

function calcularEstadisticas(data: any[], tipo: string): Array<{valor: string, etiqueta: string, color: string}> {
  switch (tipo) {
    case 'inventario-completo':
      const porEstado = data.reduce((acc, eq) => {
        acc[eq.estado] = (acc[eq.estado] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return [
        { valor: data.length.toString(), etiqueta: 'Total Equipos', color: '#3b82f6' },
        { valor: (porEstado['Operativo'] || 0).toString(), etiqueta: 'Operativos', color: '#22c55e' },
        { valor: (porEstado['En Reparación'] || 0).toString(), etiqueta: 'En Reparación', color: '#f59e0b' },
        { valor: (porEstado['Fuera de Servicio'] || 0).toString(), etiqueta: 'Fuera de Servicio', color: '#ef4444' }
      ];

    case 'mantenimientos-pendientes':
      const hoy = new Date();
      const vencidos = data.filter(m => new Date(m.fecha_programada) < hoy && m.estado === 'Pendiente').length;
      const estaSemana = data.filter(m => {
        const fecha = new Date(m.fecha_programada);
        const diff = (fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 7;
      }).length;
      
      return [
        { valor: data.length.toString(), etiqueta: 'Total Pendientes', color: '#3b82f6' },
        { valor: vencidos.toString(), etiqueta: 'Vencidos', color: '#ef4444' },
        { valor: estaSemana.toString(), etiqueta: 'Esta Semana', color: '#f59e0b' },
        { valor: data.filter(m => m.estado === 'En Progreso').length.toString(), etiqueta: 'En Progreso', color: '#8b5cf6' }
      ];

    case 'equipos-criticos':
      const antiguedad = data.reduce((sum, eq) => {
        const years = eq.antiguedad_anios || 0;
        return sum + years;
      }, 0) / (data.length || 1);
      
      return [
        { valor: data.length.toString(), etiqueta: 'Equipos Críticos', color: '#ef4444' },
        { valor: antiguedad.toFixed(1), etiqueta: 'Años Promedio', color: '#f59e0b' },
        { valor: data.filter(eq => eq.estado !== 'Operativo').length.toString(), etiqueta: 'No Operativos', color: '#dc2626' },
        { valor: data.filter(eq => eq.requiere_mantenimiento).length.toString(), etiqueta: 'Req. Mantenim.', color: '#f97316' }
      ];

    default:
      return [];
  }
}

function generarTablaInventario(doc: typeof PDFDocument.prototype, data: any[]) {
  const tableTop = doc.y;
  const col1X = 50;
  const col2X = 150;
  const col3X = 250;
  const col4X = 350;
  const col5X = 450;
  const rowHeight = 25;

  // Encabezados de tabla
  doc.fillColor('#1e40af')
     .fontSize(10)
     .font('Helvetica-Bold');
  
  ['Equipo', 'Marca/Modelo', 'Estado', 'Ubicación', 'Responsable'].forEach((header, i) => {
    const x = [col1X, col2X, col3X, col4X, col5X][i];
    doc.text(header, x, tableTop, { width: 90 });
  });

  // Línea separadora
  doc.strokeColor('#cbd5e1')
     .lineWidth(1)
     .moveTo(col1X, tableTop + 15)
     .lineTo(col5X + 90, tableTop + 15)
     .stroke();

  let currentY = tableTop + 20;

  data.forEach((equipo, index) => {
    if (currentY > 700) {
      doc.addPage();
      currentY = 50;
    }

    // Alternar color de fondo
    if (index % 2 === 0) {
      doc.fillColor('#f8fafc')
         .rect(col1X - 5, currentY - 5, col5X + 95 - col1X, rowHeight)
         .fill();
    }

    doc.fillColor('#0f172a')
       .fontSize(9)
       .font('Helvetica');

    doc.text(equipo.nombre || 'N/A', col1X, currentY, { width: 90, ellipsis: true });
    doc.text(`${equipo.marca || ''} ${equipo.modelo || ''}`, col2X, currentY, { width: 90, ellipsis: true });
    
    // Estado con color
    const estadoColors: Record<string, string> = {
      'Operativo': '#22c55e',
      'En Reparación': '#f59e0b',
      'Fuera de Servicio': '#ef4444'
    };
    const estadoColor = estadoColors[equipo.estado] || '#64748b';
    
    doc.fillColor(estadoColor)
       .text(equipo.estado || 'N/A', col3X, currentY, { width: 90 });
    
    doc.fillColor('#0f172a')
       .text(equipo.ubicacion || 'N/A', col4X, currentY, { width: 90, ellipsis: true })
       .text(equipo.responsable || 'N/A', col5X, currentY, { width: 90, ellipsis: true });

    currentY += rowHeight;
  });
}

function generarTablaMantenimientos(doc: typeof PDFDocument.prototype, data: any[]) {
  const tableTop = doc.y;
  const col1X = 50;
  const col2X = 140;
  const col3X = 260;
  const col4X = 360;
  const col5X = 460;
  const rowHeight = 25;

  doc.fillColor('#1e40af')
     .fontSize(10)
     .font('Helvetica-Bold');
  
  ['Equipo', 'Tipo Mantenim.', 'Fecha Prog.', 'Estado', 'Prioridad'].forEach((header, i) => {
    const x = [col1X, col2X, col3X, col4X, col5X][i];
    doc.text(header, x, tableTop, { width: 90 });
  });

  doc.strokeColor('#cbd5e1')
     .lineWidth(1)
     .moveTo(col1X, tableTop + 15)
     .lineTo(col5X + 90, tableTop + 15)
     .stroke();

  let currentY = tableTop + 20;

  data.forEach((mant, index) => {
    if (currentY > 700) {
      doc.addPage();
      currentY = 50;
    }

    if (index % 2 === 0) {
      doc.fillColor('#f8fafc')
         .rect(col1X - 5, currentY - 5, col5X + 95 - col1X, rowHeight)
         .fill();
    }

    doc.fillColor('#0f172a')
       .fontSize(9)
       .font('Helvetica');

    doc.text(mant.equipos?.nombre || 'N/A', col1X, currentY, { width: 80, ellipsis: true });
    doc.text(mant.tipo || 'N/A', col2X, currentY, { width: 110, ellipsis: true });
    doc.text(new Date(mant.fecha_programada).toLocaleDateString('es-ES'), col3X, currentY);
    
    const estadoColors: Record<string, string> = {
      'Pendiente': '#f59e0b',
      'En Progreso': '#8b5cf6',
      'Completado': '#22c55e'
    };
    const estadoColor = estadoColors[mant.estado] || '#64748b';
    
    doc.fillColor(estadoColor)
       .text(mant.estado || 'N/A', col4X, currentY);
    
    const prioridadColors: Record<string, string> = {
      'Alta': '#ef4444',
      'Media': '#f59e0b',
      'Baja': '#22c55e'
    };
    const prioridadColor = prioridadColors[mant.prioridad] || '#64748b';
    
    doc.fillColor(prioridadColor)
       .text(mant.prioridad || 'N/A', col5X, currentY);

    currentY += rowHeight;
  });
}

function generarTablaEquiposCriticos(doc: typeof PDFDocument.prototype, data: any[]) {
  generarTablaInventario(doc, data);
}

function generarCSV(data: any[], tipo: string): string {
  // Función para normalizar texto - UTF-8 sin corrupción
  const normalizar = (valor: any): string => {
    if (valor === null || valor === undefined || valor === '') return 'x';
    
    return String(valor)
      .normalize('NFC') // Normalización Unicode
      .trim()
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remover control chars
      .replace(/\r?\n/g, ' ') // Saltos de línea → espacio
      .replace(/\s+/g, ' ') // Múltiples espacios → uno
      .trim();
  };

  // Escapar valores para CSV (encerrar en comillas si contiene coma o comillas)
  const escapar = (valor: string): string => {
    if (valor.includes(',') || valor.includes('"') || valor.includes('\n')) {
      return `"${valor.replace(/"/g, '""')}"`;
    }
    return valor;
  };

  let csvLines: string[] = [];

  switch (tipo) {
    case 'inventario-completo':
      csvLines.push('ID_Equipo,Cantidad,Categoría,Marca,Modelo,Serial/Etiqueta,Estado,Sede,Ubicación_Detallada,Responsable,Crítico,Observaciones');
      
      data.forEach((eq, index) => {
        const fila = [
          escapar(normalizar(eq.id || index + 1)),
          '1',
          escapar(normalizar(eq.tipo || eq.categoria || 'PC/Portátil')),
          escapar(normalizar(eq.marca || 'x')),
          escapar(normalizar(eq.modelo || 'x')),
          escapar(normalizar(eq.numero_serie || eq.serial || 'x')),
          escapar(normalizar(eq.estado || 'Operativo')),
          escapar(normalizar(eq.sede || 'x')),
          escapar(normalizar(eq.ubicacion_detallada || eq.ubicacion || 'x')),
          escapar(normalizar(eq.responsable || 'x')),
          eq.es_critico ? 'Sí' : 'No',
          escapar(normalizar(eq.observaciones || eq.notas || 'x'))
        ];
        
        csvLines.push(fila.join(','));
      });
      break;

    case 'mantenimientos-pendientes':
      csvLines.push('Equipo,Tipo_Mantenimiento,Fecha_Programada,Estado,Prioridad,Descripción');
      
      data.forEach(m => {
        const fecha = m.fecha_programada ? new Date(m.fecha_programada) : null;
        const fechaStr = fecha ? 
          `${String(fecha.getDate()).padStart(2, '0')}/${String(fecha.getMonth() + 1).padStart(2, '0')}/${fecha.getFullYear()}` : 
          'x';
        
        const fila = [
          escapar(normalizar(m.equipos?.nombre || 'x')),
          escapar(normalizar(m.tipo || 'Preventivo')),
          fechaStr,
          escapar(normalizar(m.estado || 'Pendiente')),
          escapar(normalizar(m.prioridad || 'Media')),
          escapar(normalizar(m.descripcion || 'x'))
        ];
        
        csvLines.push(fila.join(','));
      });
      break;

    case 'equipos-criticos':
      csvLines.push('Serial,Marca,Modelo,Categoría,Estado,Sede,Ubicación,Responsable,Prioridad,Acción_Requerida,Costo_Estimado,Fecha_Límite,Observaciones,Fecha_Registro');
      
      data.forEach(critico => {
        const equipo = critico.equipo || {};
        
        // Fecha límite
        let fechaLimite = 'x';
        if (critico.fecha_limite_accion) {
          const fecha = new Date(critico.fecha_limite_accion);
          fechaLimite = `${String(fecha.getDate()).padStart(2, '0')}/${String(fecha.getMonth() + 1).padStart(2, '0')}/${fecha.getFullYear()}`;
        }
        
        // Fecha registro
        let fechaRegistro = 'x';
        if (critico.created_at) {
          const fecha = new Date(critico.created_at);
          fechaRegistro = `${String(fecha.getDate()).padStart(2, '0')}/${String(fecha.getMonth() + 1).padStart(2, '0')}/${fecha.getFullYear()}`;
        }
        
        // Observaciones
        let obs = normalizar(critico.notas_resolucion || critico.observaciones || '');
        const ultimoMant = equipo.fecha_ultimo_mantenimiento;
        if (ultimoMant) {
          const meses = Math.floor((Date.now() - new Date(ultimoMant).getTime()) / (1000 * 60 * 60 * 24 * 30));
          if (meses > 6) {
            obs = `Sin mantenimiento ${meses} meses`;
          }
        }
        if (!obs) obs = 'x';

        const fila = [
          escapar(normalizar(equipo.serial || equipo.numero_serie || 'x')),
          escapar(normalizar(equipo.marca || 'x')),
          escapar(normalizar(equipo.modelo || 'x')),
          escapar(normalizar(equipo.categoria?.nombre || 'x')),
          escapar(normalizar(equipo.estado?.nombre || 'Operativo')),
          escapar(normalizar(equipo.sede?.nombre || 'x')),
          escapar(normalizar(equipo.ubicacion_detallada || equipo.ubicacion || 'x')),
          escapar(normalizar(equipo.responsable || 'x')),
          escapar(normalizar(critico.nivelPrioridad?.nombre || 'Media')),
          escapar(normalizar(critico.accion_requerida || 'Mantenimiento preventivo')),
          escapar(critico.costo_estimado ? `$${critico.costo_estimado}` : 'Pendiente'),
          fechaLimite,
          escapar(obs),
          fechaRegistro
        ];
        
        csvLines.push(fila.join(','));
      });
      break;
  }

  return csvLines.join('\n');
}

async function generarExcelDesdePlantilla(data: any[], tipo: string): Promise<Buffer> {
  try {
    const workbook = new ExcelJS.Workbook();
    
    // Ruta a la plantilla según el tipo de reporte
    let plantillaPath = '';
    let nombreArchivo = '';
    
    switch (tipo) {
      case 'equipos-criticos':
        plantillaPath = path.join(process.cwd(), 'app', 'plantillas-excel', 'Equipos_criticos.xlsx');
        nombreArchivo = 'Equipos_criticos.xlsx';
        break;
      case 'inventario-completo':
        plantillaPath = path.join(process.cwd(), 'app', 'plantillas-excel', 'Invnetario_general.xlsx');
        nombreArchivo = 'Inventario_general.xlsx';
        break;
      case 'mantenimientos-pendientes':
        plantillaPath = path.join(process.cwd(), 'app', 'plantillas-excel', 'Mantenimiento.xlsx');
        nombreArchivo = 'Mantenimiento.xlsx';
        break;
      default:
        throw new Error('Tipo de reporte no soportado para Excel');
    }

    console.log('📂 Leyendo plantilla desde:', plantillaPath);
    
    // Verificar que existe el archivo
    if (!fs.existsSync(plantillaPath)) {
      throw new Error(`No se encontró la plantilla en: ${plantillaPath}`);
    }

    // Leer plantilla
    await workbook.xlsx.readFile(plantillaPath);
    console.log('✅ Plantilla cargada correctamente');
    
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) throw new Error('No se encontró la hoja de cálculo');

    console.log(`📝 Rellenando ${data.length} registros en la plantilla`);

    // Rellenar datos según el tipo
    if (tipo === 'equipos-criticos') {
      // Encontrar la fila donde empiezan los datos (después de encabezados)
      let filaInicio = 2;
      
      console.log('🔍 Estructura del primer registro:', JSON.stringify(data[0], null, 2));
      
      data.forEach((critico, index) => {
        const equipo = critico.equipo || {};
        
        console.log(`📝 Fila ${index + filaInicio}: Serial=${equipo.serial || equipo.numero_serie}, Marca=${equipo.marca}`);
        
        const fila = worksheet.getRow(filaInicio + index);
        
        // Fecha límite
        let fechaLimite = '';
        if (critico.fecha_limite_accion) {
          const fecha = new Date(critico.fecha_limite_accion);
          fechaLimite = `${String(fecha.getDate()).padStart(2, '0')}/${String(fecha.getMonth() + 1).padStart(2, '0')}/${fecha.getFullYear()}`;
        }
        
        // Fecha registro
        let fechaRegistro = '';
        if (critico.created_at) {
          const fecha = new Date(critico.created_at);
          fechaRegistro = `${String(fecha.getDate()).padStart(2, '0')}/${String(fecha.getMonth() + 1).padStart(2, '0')}/${fecha.getFullYear()}`;
        }
        
        // Observaciones
        let obs = critico.notas_resolucion || critico.observaciones || '';
        const ultimoMant = equipo.fecha_ultimo_mantenimiento;
        if (ultimoMant) {
          const meses = Math.floor((Date.now() - new Date(ultimoMant).getTime()) / (1000 * 60 * 60 * 24 * 30));
          if (meses > 6) {
            obs = `Sin mantenimiento ${meses} meses`;
          }
        }
        
        // Asignar valores a columnas (8 columnas según plantilla)
        // Columnas: ID_Equipo, Categoría, Serial/Etiqueta, Estado, Nivel_Prioridad, Acción_Requerida, Costo_Estimado, Fecha_Límite_Acción
        const valores = [
          equipo.id || '',
          equipo.categoria?.nombre || '',
          equipo.serial || equipo.numero_serie || '',
          equipo.estado?.nombre || 'Operativo',
          critico.nivelPrioridad?.nombre || 'Media',
          critico.accion_requerida || 'Mantenimiento preventivo',
          critico.costo_estimado ? `$${critico.costo_estimado}` : 'Pendiente',
          fechaLimite
        ];
        
        console.log(`  Valores: [${valores.join(', ')}]`);
        
        fila.getCell(1).value = valores[0];
        fila.getCell(2).value = valores[1];
        fila.getCell(3).value = valores[2];
        fila.getCell(4).value = valores[3];
        fila.getCell(5).value = valores[4];
        fila.getCell(6).value = valores[5];
        fila.getCell(7).value = valores[6];
        fila.getCell(8).value = valores[7];
        
        fila.commit();
        console.log(`  ✅ Fila ${index + filaInicio} guardada`);
      });
    } else if (tipo === 'inventario-completo') {
      // Plantilla: ID_Equipo, Cantidad, Categoría, Marca, Modelo, Serial/Etiqueta, Estado, Sede, Ubicación_Detallada, Responsable, Crítico, Observaciones
      let filaInicio = 2;
      
      console.log('🔍 Estructura del primer equipo:', JSON.stringify(data[0], null, 2));
      
      data.forEach((eq, index) => {
        const fila = worksheet.getRow(filaInicio + index);
        
        const valores = [
          eq.id || '',                                    // ID_Equipo
          eq.cantidad || 1,                               // Cantidad
          eq.categoria?.nombre || '',                     // Categoría
          eq.marca || '',                                 // Marca
          eq.modelo || '',                                // Modelo
          eq.serial || '',                                // Serial/Etiqueta
          eq.estado?.nombre || 'Operativo',              // Estado
          eq.sede?.nombre || '',                         // Sede
          eq.ubicacion_detallada || '',                  // Ubicación_Detallada
          eq.responsable || '',                          // Responsable
          eq.es_critico ? 'Sí' : 'No',                  // Crítico
          eq.observaciones || ''                         // Observaciones
        ];
        
        console.log(`📝 Fila ${index + filaInicio}:`, valores);
        
        fila.getCell(1).value = valores[0];
        fila.getCell(2).value = valores[1];
        fila.getCell(3).value = valores[2];
        fila.getCell(4).value = valores[3];
        fila.getCell(5).value = valores[4];
        fila.getCell(6).value = valores[5];
        fila.getCell(7).value = valores[6];
        fila.getCell(8).value = valores[7];
        fila.getCell(9).value = valores[8];
        fila.getCell(10).value = valores[9];
        fila.getCell(11).value = valores[10];
        fila.getCell(12).value = valores[11];
        
        fila.commit();
        console.log(`  ✅ Fila ${index + filaInicio} guardada`);
      });
  } else if (tipo === 'mantenimientos-pendientes') {
      // Plantilla: Equipo, Acción, Responsable_Ejecución, Fecha_Programada, Estado_Ejecución, Presupuesto
      let filaInicio = 2;
      
      console.log('🔍 Estructura del primer mantenimiento:', JSON.stringify(data[0], null, 2));
      
      data.forEach((m, index) => {
        const fila = worksheet.getRow(filaInicio + index);
        
        const fecha = m.fecha_programada ? new Date(m.fecha_programada) : null;
        const fechaStr = fecha ? 
          `${String(fecha.getDate()).padStart(2, '0')}/${String(fecha.getMonth() + 1).padStart(2, '0')}/${fecha.getFullYear()}` : 
          '';
        
        // Nombre del equipo: serial + marca + modelo
        const nombreEquipo = m.equipo 
          ? `${m.equipo.serial || ''} ${m.equipo.marca || ''} ${m.equipo.modelo || ''}`.trim() 
          : '';
        
        const valores = [
          nombreEquipo,                                              // Equipo
          m.accion?.nombre || 'Mantenimiento',                      // Acción
          m.responsable_ejecucion || '',                            // Responsable_Ejecución
          fechaStr,                                                  // Fecha_Programada
          m.estado_ejecucion || 'Pendiente',                        // Estado_Ejecución
          m.presupuesto ? `$${m.presupuesto.toLocaleString()}` : '' // Presupuesto
        ];
        
        console.log(`📝 Fila ${index + filaInicio}:`, valores);
        
        fila.getCell(1).value = valores[0];
        fila.getCell(2).value = valores[1];
        fila.getCell(3).value = valores[2];
        fila.getCell(4).value = valores[3];
        fila.getCell(5).value = valores[4];
        fila.getCell(6).value = valores[5];
        
        fila.commit();
        console.log(`  ✅ Fila ${index + filaInicio} guardada`);
      });
  }

  console.log('💾 Generando archivo Excel...');
  
  // Generar buffer
  const buffer = await workbook.xlsx.writeBuffer();
  console.log('✅ Excel generado correctamente');
  
  return Buffer.from(buffer);
  } catch (error) {
    console.error('❌ Error generando Excel:', error);
    throw error;
  }
}