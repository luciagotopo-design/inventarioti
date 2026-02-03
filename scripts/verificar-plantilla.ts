import ExcelJS from 'exceljs';
import path from 'path';

async function verificarPlantilla(nombreArchivo: string) {
  const workbook = new ExcelJS.Workbook();
  const plantillaPath = path.join(process.cwd(), 'app', 'plantillas-excel', nombreArchivo);
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📂 Verificando: ${nombreArchivo}`);
  console.log(`${'='.repeat(60)}`);
  console.log('Ruta completa:', plantillaPath);
  
  await workbook.xlsx.readFile(plantillaPath);
  
  const worksheet = workbook.getWorksheet(1);
  
  if (!worksheet) {
    console.error('❌ No se encontró la hoja de cálculo');
    return;
  }
  
  console.log('✅ Hoja encontrada:', worksheet.name);
  console.log('📊 Total de filas:', worksheet.rowCount);
  console.log('📊 Total de columnas:', worksheet.columnCount);
  
  // Leer encabezados (fila 1)
  const headerRow = worksheet.getRow(1);
  console.log('\n🔤 Encabezados:');
  
  let columnsWithData = 0;
  for (let col = 1; col <= 20; col++) {
    const cell = headerRow.getCell(col);
    if (cell.value) {
      columnsWithData++;
      console.log(`  Columna ${col}: "${cell.value}"`);
    }
  }
  
  console.log(`\nTotal de columnas con encabezados: ${columnsWithData}`);
}

async function main() {
  await verificarPlantilla('Equipos_criticos.xlsx');
  await verificarPlantilla('Invnetario_general.xlsx');
  await verificarPlantilla('Mantenimiento.xlsx');
}

main().catch(console.error);
