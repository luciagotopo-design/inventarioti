import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ CONFIGURACIÓN CRÍTICA FALTANTE:');
  console.error(`   NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅' : '❌ FALTA'}`);
  console.error(`   NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅' : '❌ FALTA'}`);
  console.error('   Verifica que el archivo .env esté en la raíz del proyecto');
  console.error('   y que tenga las variables correctas.');
  throw new Error('Supabase configuration missing. Check .env file.');
}

console.log('✅ Supabase configurado correctamente');
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Key: ${supabaseAnonKey.substring(0, 20)}...`);

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase
