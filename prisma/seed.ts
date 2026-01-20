// Script de seed para poblar datos maestros del Sistema de Inventario TI
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de datos maestros...');

  // Limpiar datos existentes (opcional - comentar si no deseas limpiar)
  // await prisma.planMantenimiento.deleteMany();
  // await prisma.equipoCritico.deleteMany();
  // await prisma.inventarioGeneral.deleteMany();
  // await prisma.categoria.deleteMany();
  // await prisma.estado.deleteMany();
  // await prisma.sede.deleteMany();
  // await prisma.prioridad.deleteMany();
  // await prisma.accionMantenimiento.deleteMany();

  // ========================================
  // 1. CATEGORÍAS
  // ========================================
  console.log('📦 Creando Categorías...');
  const categorias = await Promise.all([
    prisma.categoria.upsert({
      where: { nombre: 'Computador Portátil' },
      update: {},
      create: {
        nombre: 'Computador Portátil',
        descripcion: 'Laptops y notebooks corporativas',
        activo: true,
      },
    }),
    prisma.categoria.upsert({
      where: { nombre: 'Computador de Escritorio' },
      update: {},
      create: {
        nombre: 'Computador de Escritorio',
        descripcion: 'Desktop y estaciones de trabajo',
        activo: true,
      },
    }),
    prisma.categoria.upsert({
      where: { nombre: 'Monitor' },
      update: {},
      create: {
        nombre: 'Monitor',
        descripcion: 'Pantallas y displays',
        activo: true,
      },
    }),
    prisma.categoria.upsert({
      where: { nombre: 'Impresora' },
      update: {},
      create: {
        nombre: 'Impresora',
        descripcion: 'Impresoras láser, inyección y multifuncionales',
        activo: true,
      },
    }),
    prisma.categoria.upsert({
      where: { nombre: 'Router/Switch' },
      update: {},
      create: {
        nombre: 'Router/Switch',
        descripcion: 'Equipos de red y comunicaciones',
        activo: true,
      },
    }),
    prisma.categoria.upsert({
      where: { nombre: 'Servidor' },
      update: {},
      create: {
        nombre: 'Servidor',
        descripcion: 'Servidores físicos y virtuales',
        activo: true,
      },
    }),
    prisma.categoria.upsert({
      where: { nombre: 'UPS' },
      update: {},
      create: {
        nombre: 'UPS',
        descripcion: 'Sistemas de alimentación ininterrumpida',
        activo: true,
      },
    }),
    prisma.categoria.upsert({
      where: { nombre: 'Teléfono IP' },
      update: {},
      create: {
        nombre: 'Teléfono IP',
        descripcion: 'Teléfonos VoIP corporativos',
        activo: true,
      },
    }),
    prisma.categoria.upsert({
      where: { nombre: 'Scanner' },
      update: {},
      create: {
        nombre: 'Scanner',
        descripcion: 'Escáneres documentales',
        activo: true,
      },
    }),
  ]);
  console.log(`✅ ${categorias.length} categorías creadas`);

  // ========================================
  // 2. ESTADOS
  // ========================================
  console.log('🔧 Creando Estados...');
  const estados = await Promise.all([
    prisma.estado.upsert({
      where: { nombre: 'Operativo' },
      update: {},
      create: {
        nombre: 'Operativo',
        color: '#10b981', // verde
        activo: true,
      },
    }),
    prisma.estado.upsert({
      where: { nombre: 'Dañado' },
      update: {},
      create: {
        nombre: 'Dañado',
        color: '#ef4444', // rojo
        activo: true,
      },
    }),
    prisma.estado.upsert({
      where: { nombre: 'En Mantenimiento' },
      update: {},
      create: {
        nombre: 'En Mantenimiento',
        color: '#f59e0b', // amarillo/naranja
        activo: true,
      },
    }),
    prisma.estado.upsert({
      where: { nombre: 'Faltante' },
      update: {},
      create: {
        nombre: 'Faltante',
        color: '#6b7280', // gris
        activo: true,
      },
    }),
    prisma.estado.upsert({
      where: { nombre: 'Baja Capacidad' },
      update: {},
      create: {
        nombre: 'Baja Capacidad',
        color: '#f97316', // naranja
        activo: true,
      },
    }),
    prisma.estado.upsert({
      where: { nombre: 'Dado de Baja' },
      update: {},
      create: {
        nombre: 'Dado de Baja',
        color: '#374151', // gris oscuro
        activo: true,
      },
    }),
  ]);
  console.log(`✅ ${estados.length} estados creados`);

  // ========================================
  // 3. SEDES
  // ========================================
  console.log('🏢 Creando Sedes...');
  const sedes = await Promise.all([
    prisma.sede.upsert({
      where: { nombre: 'Sede Principal' },
      update: {},
      create: {
        nombre: 'Sede Principal',
        direccion: 'Calle 100 #15-20',
        ciudad: 'Bogotá',
        activo: true,
      },
    }),
    prisma.sede.upsert({
      where: { nombre: 'Sede Norte' },
      update: {},
      create: {
        nombre: 'Sede Norte',
        direccion: 'Av. Caracas #170-50',
        ciudad: 'Bogotá',
        activo: true,
      },
    }),
    prisma.sede.upsert({
      where: { nombre: 'Sede Medellín' },
      update: {},
      create: {
        nombre: 'Sede Medellín',
        direccion: 'Carrera 43A #1-50',
        ciudad: 'Medellín',
        activo: true,
      },
    }),
    prisma.sede.upsert({
      where: { nombre: 'Sede Cali' },
      update: {},
      create: {
        nombre: 'Sede Cali',
        direccion: 'Av. 6 Norte #25-40',
        ciudad: 'Cali',
        activo: true,
      },
    }),
    prisma.sede.upsert({
      where: { nombre: 'Sede Barranquilla' },
      update: {},
      create: {
        nombre: 'Sede Barranquilla',
        direccion: 'Calle 85 #52-100',
        ciudad: 'Barranquilla',
        activo: true,
      },
    }),
  ]);
  console.log(`✅ ${sedes.length} sedes creadas`);

  // ========================================
  // 4. PRIORIDADES
  // ========================================
  console.log('⚠️ Creando Prioridades...');
  const prioridades = await Promise.all([
    prisma.prioridad.upsert({
      where: { nombre: 'Alta' },
      update: {},
      create: {
        nombre: 'Alta',
        color: '#ef4444', // rojo
        orden: 1,
      },
    }),
    prisma.prioridad.upsert({
      where: { nombre: 'Media' },
      update: {},
      create: {
        nombre: 'Media',
        color: '#f59e0b', // amarillo
        orden: 2,
      },
    }),
    prisma.prioridad.upsert({
      where: { nombre: 'Baja' },
      update: {},
      create: {
        nombre: 'Baja',
        color: '#10b981', // verde
        orden: 3,
      },
    }),
  ]);
  console.log(`✅ ${prioridades.length} prioridades creadas`);

  // ========================================
  // 5. ACCIONES DE MANTENIMIENTO
  // ========================================
  console.log('🔨 Creando Acciones de Mantenimiento...');
  const acciones = await Promise.all([
    prisma.accionMantenimiento.upsert({
      where: { nombre: 'Mantenimiento Preventivo' },
      update: {},
      create: {
        nombre: 'Mantenimiento Preventivo',
        descripcion: 'Revisión general, limpieza y optimización',
      },
    }),
    prisma.accionMantenimiento.upsert({
      where: { nombre: 'Actualización de Software' },
      update: {},
      create: {
        nombre: 'Actualización de Software',
        descripcion: 'Instalación de parches y actualizaciones',
      },
    }),
    prisma.accionMantenimiento.upsert({
      where: { nombre: 'Reemplazo de Componentes' },
      update: {},
      create: {
        nombre: 'Reemplazo de Componentes',
        descripcion: 'Cambio de partes o piezas defectuosas',
      },
    }),
    prisma.accionMantenimiento.upsert({
      where: { nombre: 'Calibración' },
      update: {},
      create: {
        nombre: 'Calibración',
        descripcion: 'Ajuste y calibración de equipos',
      },
    }),
    prisma.accionMantenimiento.upsert({
      where: { nombre: 'Formateo y Reinstalación' },
      update: {},
      create: {
        nombre: 'Formateo y Reinstalación',
        descripcion: 'Instalación limpia del sistema operativo',
      },
    }),
    prisma.accionMantenimiento.upsert({
      where: { nombre: 'Backup de Datos' },
      update: {},
      create: {
        nombre: 'Backup de Datos',
        descripcion: 'Respaldo de información crítica',
      },
    }),
    prisma.accionMantenimiento.upsert({
      where: { nombre: 'Reparación General' },
      update: {},
      create: {
        nombre: 'Reparación General',
        descripcion: 'Diagnóstico y reparación de fallas',
      },
    }),
  ]);
  console.log(`✅ ${acciones.length} acciones de mantenimiento creadas`);

  console.log('');
  console.log('🎉 Seed completado exitosamente!');
  console.log('');
  console.log('📊 Resumen:');
  console.log(`   - ${categorias.length} Categorías`);
  console.log(`   - ${estados.length} Estados`);
  console.log(`   - ${sedes.length} Sedes`);
  console.log(`   - ${prioridades.length} Prioridades`);
  console.log(`   - ${acciones.length} Acciones de Mantenimiento`);
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
