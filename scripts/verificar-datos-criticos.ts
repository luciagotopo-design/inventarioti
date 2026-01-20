import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// Cargar variables de entorno
const envPath = join(process.cwd(), '.env.local');
try {
  const envConfig = dotenv.parse(readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
} catch (e) {
  console.warn('No se pudo cargar .env.local, usando variables de entorno del sistema');
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function verificarDatos() {
  console.log('🔍 Verificando datos de equipos críticos...\n');
  
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
    .limit(3);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`📊 Total de equipos críticos: ${criticos?.length || 0}\n`);
  
  if (criticos && criticos.length > 0) {
    console.log('✅ Primer registro:');
    console.log(JSON.stringify(criticos[0], null, 2));
  }
}

verificarDatos();
