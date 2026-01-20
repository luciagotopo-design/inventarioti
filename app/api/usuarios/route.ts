// API Route: Gestión de Usuarios
import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { auth, clerkClient } from '@clerk/nextjs/server';

// GET - Listar usuarios desde Clerk únicamente
export async function GET() {
  try {
    // 1. Obtener usuarios de Clerk
    console.log('🔍 Obteniendo usuarios de Clerk...');
    const client = await clerkClient();
    const clerkUsers = await client.users.getUserList({ limit: 100 });
    
    console.log('✅ Usuarios en Clerk:', clerkUsers.data.length);
    console.log('📋 Detalles de usuarios Clerk:', clerkUsers.data.map(u => ({
      id: u.id,
      email: u.emailAddresses[0]?.emailAddress,
      nombre: u.firstName ? `${u.firstName} ${u.lastName}`.trim() : u.username,
      metadata: u.publicMetadata
    })));

    // 2. Roles predefinidos
    const ROLES = {
      'super-admin': { id: 'super-admin', nombre: 'Super Admin' },
      'administrador': { id: 'administrador', nombre: 'Administrador' },
      'tecnico': { id: 'tecnico', nombre: 'Técnico' },
      'consulta': { id: 'consulta', nombre: 'Consulta' },
    };

    // 3. Mapear usuarios de Clerk con su rol desde metadata
    const usuarios = clerkUsers.data.map(clerkUser => {
      const rolId = clerkUser.publicMetadata?.rol_id as string | undefined;
      const rol = rolId ? ROLES[rolId as keyof typeof ROLES] : null;
      
      return {
        id: clerkUser.id,
        clerk_user_id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        nombre: clerkUser.firstName && clerkUser.lastName 
          ? `${clerkUser.firstName} ${clerkUser.lastName}`.trim()
          : clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress || 'Sin nombre',
        rol_id: rolId || null,
        rol: rol || null,
        activo: (clerkUser.publicMetadata?.activo as boolean) ?? true,
        ultimo_acceso: clerkUser.lastSignInAt ? new Date(clerkUser.lastSignInAt).toISOString() : undefined,
        created_at: clerkUser.createdAt ? new Date(clerkUser.createdAt).toISOString() : undefined,
        // Metadata de Clerk
        metadata: clerkUser.publicMetadata,
      };
    });

    console.log('✅ Usuarios mapeados:', usuarios.length);
    console.log('📤 Enviando respuesta:', usuarios);

    return NextResponse.json(usuarios || []);
  } catch (error) {
    console.error('❌ Error fetching usuarios:', error);
    return NextResponse.json(
      { error: 'Error al cargar usuarios' },
      { status: 500 }
    );
  }
}

// POST - Crear usuario en Clerk con metadata
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, nombre, rolId } = body;

    // Crear usuario en Clerk con metadata
    const client = await clerkClient();
    const newUser = await client.users.createUser({
      emailAddress: [email],
      firstName: nombre.split(' ')[0],
      lastName: nombre.split(' ').slice(1).join(' ') || undefined,
      publicMetadata: {
        rol_id: rolId,
        activo: true,
      },
    });

    console.log('✅ Usuario creado en Clerk:', newUser.id);

    return NextResponse.json({
      id: newUser.id,
      clerk_user_id: newUser.id,
      email: newUser.emailAddresses[0]?.emailAddress,
      nombre: nombre,
      rol_id: rolId,
      activo: true,
    }, { status: 201 });
  } catch (error: any) {
    console.error('❌ Error creating usuario:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear usuario' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar metadata del usuario en Clerk
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, rolId, activo } = body;

    console.log('🔄 Actualizando usuario:', id, 'Rol:', rolId, 'Activo:', activo);

    // Actualizar metadata en Clerk
    const client = await clerkClient();
    const updatedUser = await client.users.updateUserMetadata(id, {
      publicMetadata: {
        rol_id: rolId,
        activo: activo,
      },
    });

    console.log('✅ Usuario actualizado en Clerk:', id);

    return NextResponse.json({
      id: updatedUser.id,
      clerk_user_id: updatedUser.id,
      email: updatedUser.emailAddresses[0]?.emailAddress,
      rol_id: rolId,
      activo: activo,
    });
  } catch (error: any) {
    console.error('❌ Error updating usuario:', error);
    return NextResponse.json(
      { error: error.message || 'Error al actualizar usuario' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar usuario de Clerk
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clerkUserId = searchParams.get('clerkUserId');

    if (!clerkUserId) {
      return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 400 });
    }

    // Eliminar de Clerk
    const client = await clerkClient();
    await client.users.deleteUser(clerkUserId);

    console.log('✅ Usuario eliminado de Clerk:', clerkUserId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Error deleting usuario:', error);
    return NextResponse.json(
      { error: error.message || 'Error al eliminar usuario' },
      { status: 500 }
    );
  }
}
