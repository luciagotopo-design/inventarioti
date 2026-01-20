import ExcelJS from 'exceljs';
import { writeFileSync } from 'fs';
import path from 'path';

async function crearPlantillaReporteMaestro() {
  const workbook = new ExcelJS.Workbook();
  
  // Estilos comunes
  const headerStyle = {
    font: { bold: true, size: 12, color: { argb: 'FFFFFFFF' } },
    fill: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FF1e40af' } },
    alignment: { vertical: 'middle' as const, horizontal: 'center' as const },
    border: {
      top: { style: 'thin' as const },
      left: { style: 'thin' as const },
      bottom: { style: 'thin' as const },
      right: { style: 'thin' as const }
    }
  };

  // =====================
  // HOJA 1: RESUMEN EJECUTIVO
  // =====================
  const resumenSheet = workbook.addWorksheet('Resumen Ejecutivo');
  resumenSheet.columns = [
    { width: 30 },
    { width: 20 },
    { width: 20 },
  ];

  resumenSheet.mergeCells('A1:C1');
  resumenSheet.getCell('A1').value = 'REPORTE MAESTRO DE INVENTARIO TI';
  resumenSheet.getCell('A1').style = {
    font: { bold: true, size: 16, color: { argb: 'FF1e40af' } },
    alignment: { vertical: 'middle', horizontal: 'center' }
  };
  resumenSheet.getRow(1).height = 30;

  resumenSheet.getCell('A2').value = 'Fecha: [AUTO]';
  
  resumenSheet.getCell('A4').value = 'INDICADORES CLAVE';
  resumenSheet.getCell('A4').style = headerStyle;
  resumenSheet.mergeCells('A4:C4');
  
  resumenSheet.getCell('A5').value = 'Indicador';
  resumenSheet.getCell('B5').value = 'Valor';
  resumenSheet.getCell('C5').value = 'Detalle';
  resumenSheet.getRow(5).eachCell(cell => {
    cell.style = headerStyle;
  });

  // =====================
  // HOJA 2: INVENTARIO COMPLETO
  // =====================
  const inventarioSheet = workbook.addWorksheet('Inventario Completo');
  
  const inventarioHeaders = [
    'ID_Equipo', 'Cantidad', 'Categoría', 'Marca', 'Modelo', 'Serial/Etiqueta',
    'Estado', 'Sede', 'Ubicación_Detallada', 'Responsable', 'Crítico', 'Observaciones'
  ];
  
  inventarioSheet.addRow(inventarioHeaders);
  inventarioSheet.getRow(1).eachCell(cell => {
    cell.style = headerStyle;
  });
  
  inventarioSheet.columns = [
    { width: 15 },  // ID_Equipo
    { width: 10 },  // Cantidad
    { width: 20 },  // Categoría
    { width: 15 },  // Marca
    { width: 15 },  // Modelo
    { width: 20 },  // Serial/Etiqueta
    { width: 15 },  // Estado
    { width: 20 },  // Sede
    { width: 25 },  // Ubicación_Detallada
    { width: 25 },  // Responsable
    { width: 10 },  // Crítico
    { width: 40 },  // Observaciones
  ];

  // =====================
  // HOJA 3: MANTENIMIENTOS
  // =====================
  const mantenimientoSheet = workbook.addWorksheet('Plan de Mantenimiento');
  
  const mantenimientoHeaders = [
    'Equipo', 'Acción', 'Responsable_Ejecución', 'Fecha_Programada', 
    'Estado_Ejecución', 'Presupuesto'
  ];
  
  mantenimientoSheet.addRow(mantenimientoHeaders);
  mantenimientoSheet.getRow(1).eachCell(cell => {
    cell.style = headerStyle;
  });
  
  mantenimientoSheet.columns = [
    { width: 40 },  // Equipo
    { width: 30 },  // Acción
    { width: 25 },  // Responsable_Ejecución
    { width: 18 },  // Fecha_Programada
    { width: 18 },  // Estado_Ejecución
    { width: 15 },  // Presupuesto
  ];

  // =====================
  // HOJA 4: EQUIPOS CRÍTICOS
  // =====================
  const criticosSheet = workbook.addWorksheet('Equipos Críticos');
  
  const criticosHeaders = [
    'ID_Equipo', 'Categoría', 'Serial/Etiqueta', 'Estado', 
    'Nivel_Prioridad', 'Acción_Requerida', 'Costo_Estimado', 'Fecha_Límite_Acción'
  ];
  
  criticosSheet.addRow(criticosHeaders);
  criticosSheet.getRow(1).eachCell(cell => {
    cell.style = headerStyle;
  });
  
  criticosSheet.columns = [
    { width: 15 },  // ID_Equipo
    { width: 20 },  // Categoría
    { width: 20 },  // Serial/Etiqueta
    { width: 18 },  // Estado
    { width: 18 },  // Nivel_Prioridad
    { width: 40 },  // Acción_Requerida
    { width: 18 },  // Costo_Estimado
    { width: 18 },  // Fecha_Límite_Acción
  ];

  // =====================
  // HOJA 5: ANÁLISIS Y RECOMENDACIONES
  // =====================
  const analisisSheet = workbook.addWorksheet('Análisis y Recomendaciones');
  analisisSheet.columns = [{ width: 80 }];
  
  analisisSheet.getCell('A1').value = 'PLAN DE MEJORAMIENTO';
  analisisSheet.getCell('A1').style = {
    font: { bold: true, size: 14, color: { argb: 'FF1e40af' } }
  };
  
  analisisSheet.getCell('A3').value = '[Se generará automáticamente]';
  analisisSheet.getCell('A3').font = { italic: true, color: { argb: 'FF64748b' } };

  // Guardar plantilla
  const plantillaPath = path.join(process.cwd(), 'app', 'plantillas-excel', 'Reporte_maestro.xlsx');
  const buffer = await workbook.xlsx.writeBuffer();
  writeFileSync(plantillaPath, Buffer.from(buffer));
  
  console.log('✅ Plantilla creada en:', plantillaPath);
}

crearPlantillaReporteMaestro().catch(console.error);
