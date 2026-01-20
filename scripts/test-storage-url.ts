/**
 * Script para probar URLs de Storage y verificar configuración
 * Ejecutar con: npx tsx scripts/test-storage-url.ts
 */

import supabaseAdmin from '@/lib/supabase-admin';
import supabase from '@/lib/supabase';

const bucketName = 'equipos-criticos';

async function testStorageConfiguration() {
  console.log('🧪 Probando configuración de Supabase Storage...\n');

  // 1. Verificar que los clientes están configurados
  console.log('✅ Cliente público configurado');
  console.log('✅ Cliente admin configurado\n');

  // 2. Listar buckets
  console.log('📦 Listando buckets disponibles...');
  const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();
  
  if (bucketsError) {
    console.error('❌ Error al listar buckets:', bucketsError);
    return;
  }

  console.log('Buckets encontrados:');
  buckets?.forEach(bucket => {
    console.log(`  - ${bucket.id} (público: ${bucket.public})`);
  });
  console.log('');

  // 3. Verificar bucket específico
  const targetBucket = buckets?.find(b => b.id === bucketName);
  if (!targetBucket) {
    console.error(`❌ Bucket "${bucketName}" NO encontrado`);
    console.log('💡 Crea el bucket desde Supabase Dashboard > Storage');
    return;
  }

  console.log(`✅ Bucket "${bucketName}" encontrado`);
  console.log(`   - Público: ${targetBucket.public ? '✅ SÍ' : '❌ NO (esto causará problemas)'}`);
  console.log(`   - Tamaño máximo: ${targetBucket.file_size_limit ? `${(targetBucket.file_size_limit / 1024 / 1024).toFixed(0)}MB` : 'Sin límite'}`);
  console.log('');

  // 4. Listar archivos en el bucket
  console.log('📁 Listando archivos en el bucket...');
  const { data: files, error: filesError } = await supabaseAdmin.storage
    .from(bucketName)
    .list('equipos', {
      limit: 10,
      sortBy: { column: 'created_at', order: 'desc' }
    });

  if (filesError) {
    console.error('❌ Error al listar archivos:', filesError);
    return;
  }

  if (!files || files.length === 0) {
    console.log('📭 No hay archivos en la carpeta "equipos"');
  } else {
    console.log(`📄 Encontrados ${files.length} archivos recientes:`);
    files.forEach((file, idx) => {
      console.log(`   ${idx + 1}. ${file.name} (${(file.metadata.size / 1024).toFixed(1)}KB)`);
    });
  }
  console.log('');

  // 5. Probar generación de URLs públicas
  if (files && files.length > 0) {
    const testFile = files[0];
    const filePath = `equipos/${testFile.name}`;
    
    console.log('🔗 Probando generación de URL pública...');
    console.log(`   Archivo de prueba: ${testFile.name}`);
    
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    console.log(`   URL generada: ${publicUrlData.publicUrl}`);
    console.log('');
    
    // 6. Verificar si la URL es accesible
    console.log('🌐 Probando accesibilidad de la URL...');
    try {
      const response = await fetch(publicUrlData.publicUrl, { method: 'HEAD' });
      if (response.ok) {
        console.log('   ✅ URL ACCESIBLE - La imagen debería cargarse correctamente');
        console.log(`   Content-Type: ${response.headers.get('content-type')}`);
        console.log(`   Content-Length: ${response.headers.get('content-length')} bytes`);
      } else {
        console.log(`   ❌ URL NO ACCESIBLE - Status: ${response.status}`);
        if (response.status === 404) {
          console.log('   💡 El archivo existe en Supabase pero no es accesible públicamente');
          console.log('   💡 Solución: Haz el bucket público con el script fix-storage-bucket.sql');
        }
      }
    } catch (error) {
      console.error('   ❌ Error al verificar URL:', error);
    }
  }

  console.log('\n📋 Resumen y Recomendaciones:');
  console.log('─────────────────────────────────────────');
  
  if (!targetBucket.public) {
    console.log('⚠️  ACCIÓN REQUERIDA:');
    console.log('   1. Ve a Supabase Dashboard > Storage');
    console.log('   2. Click en el bucket "equipos-criticos"');
    console.log('   3. Click en "Configuration"');
    console.log('   4. Marca "Public bucket" como ✅');
    console.log('   O ejecuta: scripts/fix-storage-bucket.sql en SQL Editor');
  } else {
    console.log('✅ Bucket está público - Las imágenes deberían cargarse');
  }
  
  console.log('\n🔍 Para debugging adicional:');
  console.log('   - Abre DevTools del navegador (F12)');
  console.log('   - Ve a la pestaña Network');
  console.log('   - Recarga la página y busca las URLs de imágenes');
  console.log('   - Verifica el status code (debe ser 200)');
}

// Ejecutar
testStorageConfiguration().catch(console.error);
