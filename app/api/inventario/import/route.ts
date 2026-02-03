// API para importar datos desde Excel
import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  console.log('\n📤 [API] POST /api/inventario/import - Importando desde Excel...');
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    // Leer el archivo Excel
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Parsear el Excel
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    
    // Buscar pestaña "Inventario_General" o usar la primera
    let sheetName = workbook.SheetNames.find(name => 
      name.toLowerCase().includes('inventario') || 
      name.toLowerCase().includes('general')
    ) || workbook.SheetNames[0];
    
    console.log(`📋 Pestañas disponibles: ${workbook.SheetNames.join(', ')}`);
    console.log(`📄 Usando pestaña: ${sheetName}`);
    
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { 
      raw: false, // Convertir todo a string
      defval: '' // Valor por defecto para celdas vacías
    });

    console.log(`📊 Total de filas en Excel: ${data.length}`);

    // Obtener maestros necesarios
    const { data: categorias } = await supabase.from('categorias').select('*');
    const { data: estados } = await supabase.from('estados').select('*');
    const { data: sedes } = await supabase.from('sedes').select('*');

    if (!categorias || !estados || !sedes) {
      return NextResponse.json(
        { error: 'Error al cargar datos maestros. Verifica que las tablas existan en Supabase.' },
        { status: 500 }
      );
    }

    console.log(`📚 Maestros cargados:`);
    console.log(`  - Categorías: ${categorias?.map((c: any) => c.nombre).join(', ')}`);
    console.log(`  - Estados: ${estados?.map((e: any) => e.nombre).join(', ')}`);
    console.log(`  - Sedes: ${sedes?.map((s: any) => s.nombre).join(', ')}`);

    const catMap: Record<string, string> = {};
    categorias?.forEach((cat: any) => {
      catMap[cat.nombre.toLowerCase()] = cat.id;
    });

    const estMap: Record<string, string> = {};
    estados?.forEach((est: any) => {
      estMap[est.nombre.toLowerCase()] = est.id;
    });

    const sedeMap: Record<string, string> = {};
    sedes?.forEach((sede: any) => {
      sedeMap[sede.nombre.toLowerCase()] = sede.id;
    });

    let creados = 0;
    let actualizados = 0;
    let errores = 0;
    const detalles: any[] = [];

    // Procesar cada fila
    for (const row of data as any[]) {
      try {
        const filaNum = data.indexOf(row) + 2;
        console.log(`\n🔄 Procesando fila ${filaNum}...`);
        
        // Mapear columnas del Excel con múltiples variantes
        const serialRaw = (
          row['Serial/Etiqueta'] || 
          row['Serial'] || 
          row['serial'] || 
          row['Numero de Serie'] || 
          row['serialEtiqueta']
        )?.toString().trim();
        
        // Ignorar valores inválidos como "x" o vacíos
        const serial = (serialRaw && serialRaw.toLowerCase() !== 'x') ? serialRaw : null;
        
        const marcaRaw = (row['Marca'] || row['marca'])?.toString().trim();
        const marca = (marcaRaw && marcaRaw.toLowerCase() !== 'x') ? marcaRaw : 'Sin Marca';
        
        const modeloRaw = (row['Modelo'] || row['modelo'])?.toString().trim();
        const modelo = (modeloRaw && modeloRaw.toLowerCase() !== 'x') ? modeloRaw : 'Sin Modelo';
        
        const categoria = (row['Categoría'] || row['Categoria'] || row['categoria'])?.toString().trim();
        const estado = (row['Estado'] || row['estado'])?.toString().trim();
        const sede = (row['Sede'] || row['sede'])?.toString().trim();
        const ubicacion = (row['Ubicación_Detallada'] || row['Ubicacion'] || row['ubicacion'])?.toString().trim();
        const responsable = (row['Responsable'] || row['responsable'])?.toString().trim();
        
        // Detectar si es crítico
        const criticoRaw = (row['Crítico'] || row['Critico'] || row['critico'])?.toString().toLowerCase().trim();
        const critico = criticoRaw === 'si' || criticoRaw === 'sí' || criticoRaw === 'yes' || criticoRaw === 'true';
        
        const observaciones = (row['Observaciones'] || row['observaciones'] || '')?.toString().trim();

        console.log(`  📋 Datos leídos: Serial=${serial}, Marca=${marca}, Modelo=${modelo}`);
        console.log(`  📋 Maestros: Cat=${categoria}, Est=${estado}, Sede=${sede}, Crítico=${criticoRaw}`);

        // Si el serial es inválido, generar uno automático
        let serialFinal = serial;
        if (!serial) {
          // Generar serial automático: CAT-MARCA-TIMESTAMP
          const timestamp = Date.now().toString().slice(-6);
          const catPrefix = categoria ? categoria.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '') : 'GEN';
          const marcaPrefix = marca !== 'Sin Marca' ? marca.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '') : 'XXX';
          serialFinal = `${catPrefix}-${marcaPrefix}-${timestamp}`;
          console.log(`  🔧 Serial generado automáticamente: ${serialFinal}`);
        }

        // Buscar IDs de maestros con valores por defecto
        let categoriaId = categoria ? catMap[categoria.toLowerCase()] : null;
        let estadoId = estado ? estMap[estado.toLowerCase()] : null;
        let sedeId = sede ? sedeMap[sede.toLowerCase()] : null;

        console.log(`  🔍 Buscando maestros: Cat="${categoria}" => ${categoriaId}, Est="${estado}" => ${estadoId}, Sede="${sede}" => ${sedeId}`);

        // Valores por defecto si no se encuentra
        if (!categoriaId) {
          categoriaId = categorias.find(c => 
            c.nombre.toLowerCase().includes('pc') || 
            c.nombre.toLowerCase().includes('portátil')
          )?.id || categorias[0]?.id;
          const categoriaDefault = categorias.find(c => c.id === categoriaId);
          console.log(`  ⚙️ Usando categoría por defecto: ${categoriaDefault?.nombre}`);
        }
        
        if (!estadoId) {
          estadoId = estados.find(e => 
            e.nombre.toLowerCase().includes('operativo')
          )?.id || estados[0]?.id;
          const estadoDefault = estados.find(e => e.id === estadoId);
          console.log(`  ⚙️ Usando estado por defecto: ${estadoDefault?.nombre}`);
        }
        
        if (!sedeId) {
          sedeId = sedes.find(s => 
            s.nombre.toLowerCase().includes('cali')
          )?.id || sedes[0]?.id;
          const sedeDefault = sedes.find(s => s.id === sedeId);
          console.log(`  ⚙️ Usando sede por defecto: ${sedeDefault?.nombre}`);
        }

        if (!categoriaId || !estadoId || !sedeId) {
          console.log(`  ❌ No se pudieron obtener todos los maestros necesarios`);
          errores++;
          detalles.push({ 
            fila: filaNum,
            serial, 
            error: `Maestros no encontrados (Cat: ${categoria}, Est: ${estado}, Sede: ${sede})` 
          });
          continue;
        }

        // Usar upsert de Supabase (insert con on_conflict)
        const { data: equipoData, error } = await supabase
          .from('inventario_general')
          .upsert({
            serial: serialFinal,
            marca,
            modelo,
            categoria_id: categoriaId,
            estado_id: estadoId,
            sede_id: sedeId,
            ubicacion_detallada: ubicacion || null,
            responsable: responsable || null,
            es_critico: critico,
            observaciones: observaciones || null,
            cantidad: 1
          }, {
            onConflict: 'serial'
          })
          .select();

        if (error) {
          console.error(`  ❌ Error en fila ${data.indexOf(row) + 2}:`, error.message);
          errores++;
          detalles.push({ 
            fila: data.indexOf(row) + 2,
            serial: serialFinal, 
            error: error.message 
          });
        } else {
          const isNew = equipoData && equipoData.length > 0;
          if (isNew) {
            creados++;
            console.log(`  ✅ Creado: ${serialFinal}`);
            detalles.push({ fila: data.indexOf(row) + 2, serial: serialFinal, estado: 'creado' });
          } else {
            actualizados++;
            console.log(`  ✅ Actualizado: ${serialFinal}`);
            detalles.push({ fila: data.indexOf(row) + 2, serial: serialFinal, estado: 'actualizado' });
          }
        }
      } catch (error: any) {
        console.error(`  ❌ Error en fila ${data.indexOf(row as any) + 2}:`, error.message);
        errores++;
        detalles.push({ 
          fila: data.indexOf(row as any) + 2,
          serial: (row as any)['Serial/Etiqueta'] || (row as any)['Serial'] || 'desconocido', 
          error: error.message 
        });
      }
    }

    console.log(`✅ Importación completada - Creados: ${creados}, Actualizados: ${actualizados}, Errores: ${errores}`);

    return NextResponse.json({
      success: true,
      mensaje: `Importados ${creados + actualizados} de ${data.length} registros`,
      creados,
      actualizados,
      errores,
      total: data.length,
      pestaña: sheetName,
      detalles: errores > 0 ? detalles.filter(d => d.error).slice(0, 10) : detalles.slice(0, 5),
    });

  } catch (error: any) {
    console.error('❌ Error importando Excel:', error);
    return NextResponse.json(
      { error: 'Error al procesar el archivo Excel', details: error.message },
      { status: 500 }
    );
  }
}
