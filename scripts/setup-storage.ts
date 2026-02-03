// Script para configurar Supabase Storage
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan variables de entorno');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupStorage() {
  console.log('🚀 Configurando Supabase Storage...\n');

  try {
    // 1. Crear bucket si no existe
    console.log('📦 Creando bucket "equipos-criticos"...');
    const { data: bucket, error: bucketError } = await supabase
      .storage
      .createBucket('equipos-criticos', {
        public: true,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
          'image/heic',
          'video/mp4',
          'video/quicktime',
          'video/webm'
        ]
      });

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✅ Bucket ya existe');
      } else {
        console.error('❌ Error creando bucket:', bucketError);
        return;
      }
    } else {
      console.log('✅ Bucket creado exitosamente');
    }

    // 2. Verificar bucket
    console.log('\n🔍 Verificando bucket...');
    const { data: buckets, error: listError } = await supabase
      .storage
      .listBuckets();

    if (listError) {
      console.error('❌ Error listando buckets:', listError);
      return;
    }

    const equiposBucket = buckets.find(b => b.id === 'equipos-criticos');
    if (equiposBucket) {
      console.log('✅ Bucket encontrado:', {
        id: equiposBucket.id,
        name: equiposBucket.name,
        public: equiposBucket.public,
        file_size_limit: equiposBucket.file_size_limit,
        allowed_mime_types: equiposBucket.allowed_mime_types
      });
    } else {
      console.log('❌ Bucket no encontrado');
      return;
    }

    // 3. Probar subida de archivo
    console.log('\n🧪 Probando subida de archivo de prueba...');
    const testFile = new Blob(['Test file content'], { type: 'text/plain' });
    const testPath = `test/${Date.now()}-test.txt`;

    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('equipos-criticos')
      .upload(testPath, testFile);

    if (uploadError) {
      console.error('❌ Error subiendo archivo de prueba:', uploadError);
      console.log('\n⚠️  Necesitas configurar las políticas RLS manualmente:');
      console.log('1. Ve a Supabase Dashboard → Storage → equipos-criticos');
      console.log('2. Haz clic en "Policies"');
      console.log('3. Crea estas políticas:');
      console.log('   - INSERT: authenticated users can upload');
      console.log('   - SELECT: public can view');
      console.log('   - UPDATE: authenticated users can update');
      console.log('   - DELETE: authenticated users can delete');
    } else {
      console.log('✅ Archivo de prueba subido:', uploadData.path);

      // Eliminar archivo de prueba
      const { error: deleteError } = await supabase
        .storage
        .from('equipos-criticos')
        .remove([testPath]);

      if (deleteError) {
        console.log('⚠️  No se pudo eliminar archivo de prueba:', deleteError);
      } else {
        console.log('✅ Archivo de prueba eliminado');
      }
    }

    // 4. Obtener URL pública de prueba
    console.log('\n🔗 Probando generación de URL pública...');
    const { data: urlData } = supabase
      .storage
      .from('equipos-criticos')
      .getPublicUrl('test/ejemplo.jpg');

    console.log('✅ Formato de URL pública:', urlData.publicUrl);

    console.log('\n\n✨ ¡Configuración completada!');
    console.log('📝 Puedes comenzar a subir imágenes desde la aplicación.\n');

  } catch (error) {
    console.error('\n❌ Error durante la configuración:', error);
  }
}

setupStorage();
