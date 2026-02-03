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

export async function GET() {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 LISTANDO USUARIOS DE AUTH.USERS');

    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error('❌ Error:', error);
      throw error;
    }

    console.log('✅ Total usuarios encontrados:', data.users.length);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return NextResponse.json({
      success: true,
      users: data.users,
      total: data.users.length
    });

  } catch (error: any) {
    console.error('❌ Error listando usuarios:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      users: []
    }, { status: 500 });
  }
}
