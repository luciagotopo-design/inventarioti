// API Route: Gestión de Roles (Hardcoded - No usa Supabase)
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Roles predefinidos en el código
const ROLES_PREDEFINIDOS = [
  {
    id: 'super-admin',
    nombre: 'Super Admin',
    descripcion: 'Acceso completo al sistema',
    permisos: { all: true },
    activo: true,
  },
  {
    id: 'administrador',
    nombre: 'Administrador',
    descripcion: 'Gestión de inventario y usuarios',
    permisos: { usuarios: true, inventario: true, reportes: true, mantenimiento: true },
    activo: true,
  },
  {
    id: 'tecnico',
    nombre: 'Técnico',
    descripcion: 'Gestión de mantenimiento y equipos',
    permisos: { inventario: true, mantenimiento: true, reportes: false },
    activo: true,
  },
  {
    id: 'consulta',
    nombre: 'Consulta',
    descripcion: 'Solo lectura',
    permisos: { inventario: false, mantenimiento: false, reportes: true },
    activo: true,
  },
];

// GET - Listar roles (desde constantes)
export async function GET() {
  try {
    console.log('📋 Roles disponibles:', ROLES_PREDEFINIDOS.length);
    return NextResponse.json(ROLES_PREDEFINIDOS);
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { error: 'Error al cargar roles' },
      { status: 500 }
    );
  }
}

// POST, PUT, DELETE - No soportados (roles son constantes)
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Los roles son predefinidos y no se pueden crear' },
    { status: 400 }
  );
}

export async function PUT(request: NextRequest) {
  return NextResponse.json(
    { error: 'Los roles son predefinidos y no se pueden modificar' },
    { status: 400 }
  );
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    { error: 'Los roles son predefinidos y no se pueden eliminar' },
    { status: 400 }
  );
}
