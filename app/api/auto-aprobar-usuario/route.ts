import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 AUTO-APROBAR USUARIO');
    console.log('🆔 User ID:', userId);
    console.log('🔑 Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configurado' : '❌ No configurado');

    if (!userId) {
      console.error('❌ userId no proporcionado');
      return NextResponse.json({ 
        success: false, 
        error: 'userId es requerido' 
      }, { status: 400 });
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ SUPABASE_SERVICE_ROLE_KEY no configurado');
      return NextResponse.json({ 
        success: false, 
        error: 'Service Role Key no configurado' 
      }, { status: 500 });
    }

    // Primero verificar que el usuario existe
    console.log('🔍 Verificando existencia del usuario...');
    const { data: existingUser, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (fetchError) {
      console.error('❌ Error al buscar usuario:', fetchError.message);
      return NextResponse.json({ 
        success: false, 
        error: `Usuario no encontrado: ${fetchError.message}` 
      }, { status: 404 });
    }

    console.log('✅ Usuario encontrado:', existingUser.user?.email);

    // Confirmar email automáticamente usando Service Role
    let data, error;
    const maxRetries = 5;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`🔄 Intento ${attempt}/${maxRetries} de confirmar email...`);
      
      const result = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { email_confirm: true }
      );
      
      data = result.data;
      error = result.error;
      
      if (!error) {
        console.log(`✅ Éxito en intento ${attempt}`);
        break;
      }
      
      console.warn(`⚠️ Intento ${attempt} falló:`, error.message);
      
      if (attempt < maxRetries) {
        console.log('⏳ Esperando 500ms antes de reintentar...');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    if (error) {
      console.error('❌ Error de Supabase después de todos los intentos:', error);
      throw error;
    }

    console.log('✅ Usuario auto-aprobado exitosamente');
    console.log('📧 Email confirmado:', data?.user?.email_confirmed_at ?? 'No disponible');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return NextResponse.json({ 
      success: true, 
      user: {
        id: data?.user?.id ?? null,
        email: data?.user?.email ?? null,
        email_confirmed_at: data?.user?.email_confirmed_at ?? null
      }
    });
  } catch (error: any) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ ERROR EN AUTO-APROBAR');
    console.error('💬 Mensaje:', error.message);
    console.error('📄 Error completo:', error);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Error al auto-aprobar usuario' 
    }, { status: 500 });
  }
}
