// Cliente de Supabase con Service Role (para operaciones de servidor)
// ⚠️ NUNCA usar este cliente en el navegador - solo en API routes
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ CONFIGURACIÓN CRÍTICA FALTANTE (Admin):');
  console.error(`   NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅' : '❌ FALTA'}`);
  console.error(`   SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✅' : '❌ FALTA'}`);
  console.error('   Verifica que el archivo .env tenga SUPABASE_SERVICE_ROLE_KEY');
  throw new Error('Supabase admin configuration missing. Check .env file.');
}

console.log('✅ Supabase Admin configurado (Service Role)');

// Cliente con privilegios de administrador (bypasea RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export default supabaseAdmin
