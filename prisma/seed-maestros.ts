// Script para inicializar datos maestros
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creando datos maestros...\n');

  // Categorías detectadas del Excel
  const categorias = [
    { nombre: 'PC/Portátil', descripcion: 'Computadores portátiles y de escritorio' },
    { nombre: 'Monitor', descripcion: 'Monitores y pantallas' },
    { nombre: 'Impresora', descripcion: 'Impresoras y multifuncionales' },
    { nombre: 'UPS', descripcion: 'Sistemas de alimentación ininterrumpida' },
    { nombre: 'Drones', descripcion: 'Drones y vehículos aéreos' },
    { nombre: 'Cables HDMI', descripcion: 'Cables y accesorios' },
  ];

  console.log('📁 Creando categorías...');
  for (const cat of categorias) {
    const existe = await prisma.categoria.findFirst({
      where: { nombre: cat.nombre }
    });
    
    if (!existe) {
      await prisma.categoria.create({ data: cat });
      console.log(`  ✅ ${cat.nombre}`);
    } else {
      console.log(`  ⏭️  ${cat.nombre} (ya existe)`);
    }
  }

  // Estados detectados del Excel
  const estados = [
    { nombre: 'Operativo', color: 'green', descripcion: 'Equipo funcionando correctamente' },
    { nombre: 'Dañado', color: 'red', descripcion: 'Equipo con fallas' },
    { nombre: 'Baja capacidad', color: 'yellow', descripcion: 'Equipo con capacidad reducida' },
    { nombre: 'En mantenimiento', color: 'blue', descripcion: 'Equipo en proceso de reparación' },
  ];

  console.log('\n📊 Creando estados...');
  for (const est of estados) {
    const existe = await prisma.estado.findFirst({
      where: { nombre: est.nombre }
    });
    
    if (!existe) {
      await prisma.estado.create({ data: est });
      console.log(`  ✅ ${est.nombre}`);
    } else {
      console.log(`  ⏭️  ${est.nombre} (ya existe)`);
    }
  }

  // Sedes
  const sedes = [
    { nombre: 'Cali', direccion: 'Oficina Principal', ciudad: 'Cali' },
    { nombre: 'Bogotá', direccion: 'Oficina Bogotá', ciudad: 'Bogotá' },
    { nombre: 'Medellín', direccion: 'Oficina Medellín', ciudad: 'Medellín' },
  ];

  console.log('\n🏢 Creando sedes...');
  for (const sede of sedes) {
    const existe = await prisma.sede.findFirst({
      where: { nombre: sede.nombre }
    });
    
    if (!existe) {
      await prisma.sede.create({ data: sede });
      console.log(`  ✅ ${sede.nombre}`);
    } else {
      console.log(`  ⏭️  ${sede.nombre} (ya existe)`);
    }
  }

  // Prioridades
  const prioridades = [
    { nombre: 'Alta', nivel: 1, descripcion: 'Prioridad alta', color: 'red', orden: 1 },
    { nombre: 'Media', nivel: 2, descripcion: 'Prioridad media', color: 'yellow', orden: 2 },
    { nombre: 'Baja', nivel: 3, descripcion: 'Prioridad baja', color: 'green', orden: 3 },
  ];

  console.log('\n⚡ Creando prioridades...');
  for (const prior of prioridades) {
    const existe = await prisma.prioridad.findFirst({
      where: { nombre: prior.nombre }
    });
    
    if (!existe) {
      await prisma.prioridad.create({ data: prior });
      console.log(`  ✅ ${prior.nombre}`);
    } else {
      console.log(`  ⏭️  ${prior.nombre} (ya existe)`);
    }
  }

  // Acciones de mantenimiento
  const acciones = [
    { nombre: 'Mantenimiento Preventivo', descripcion: 'Mantenimiento programado' },
    { nombre: 'Reparación', descripcion: 'Reparación de fallas' },
    { nombre: 'Actualización', descripcion: 'Actualización de software/hardware' },
    { nombre: 'Limpieza', descripcion: 'Limpieza física del equipo' },
  ];

  console.log('\n🔧 Creando acciones de mantenimiento...');
  for (const accion of acciones) {
    const existe = await prisma.accionMantenimiento.findFirst({
      where: { nombre: accion.nombre }
    });
    
    if (!existe) {
      await prisma.accionMantenimiento.create({ data: accion });
      console.log(`  ✅ ${accion.nombre}`);
    } else {
      console.log(`  ⏭️  ${accion.nombre} (ya existe)`);
    }
  }

  console.log('\n✅ ¡Datos maestros creados exitosamente!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
