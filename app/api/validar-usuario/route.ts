import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cliente con Service Role para acceder a auth.users
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 VALIDANDO USUARIO EN AUTH.USERS');
    console.log('📧 Email a validar:', email);

    // Buscar en auth.users usando Admin API
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.log('❌ Error consultando usuarios:', error.message);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      return NextResponse.json({
        exists: false,
        confirmed: false,
        message: 'Error al consultar base de datos de usuarios',
        error: error.message
      });
    }

    // Buscar usuario por email
    const user = data.users.find(u => u.email === email);

    if (user) {
      const isConfirmed = !!user.email_confirmed_at;
      
      console.log('✅ Usuario encontrado en auth.users');
      console.log('📧 Email confirmado:', isConfirmed ? 'Sí' : 'No');
      console.log('📅 Fecha de registro:', user.created_at);
      console.log('🆔 User ID:', user.id);
      console.log('👤 Metadata:', user.user_metadata);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      return NextResponse.json({
        exists: true,
        confirmed: isConfirmed,
        userId: user.id,
        email: user.email,
        nombre: user.user_metadata?.nombre || user.email,
        createdAt: user.created_at,
        message: isConfirmed 
          ? 'Usuario válido y aprobado' 
          : 'Usuario pendiente de aprobación por el administrador',
      });
    }

    console.log('❌ Usuario no encontrado');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return NextResponse.json({
      exists: false,
      confirmed: false,
      message: 'Usuario no encontrado en el sistema',
    });

  } catch (error: any) {
    console.error('❌ Error en validación:', error);
    return NextResponse.json({
      exists: false,
      confirmed: false,
      error: error.message,
    }, { status: 500 });
  }
}
