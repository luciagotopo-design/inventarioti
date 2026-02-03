import { writeFileSync } from 'fs';
import path from 'path';

async function testReporteMaestro() {
  console.log('🧪 Probando generación de reporte maestro con plantilla...\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/reportes/maestro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ formato: 'excel' }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const buffer = await response.arrayBuffer();
    const testPath = path.join(process.cwd(), 'test-reporte-maestro.xlsx');
    writeFileSync(testPath, Buffer.from(buffer));
    
    console.log('✅ Reporte maestro generado exitosamente');
    console.log('📁 Archivo guardado en:', testPath);
    console.log(`📊 Tamaño: ${buffer.byteLength} bytes`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testReporteMaestro();
