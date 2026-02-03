// Script para importar datos del inventario
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Importando datos del inventario...\n');

  // Crear o actualizar categorías
  console.log('📁 Categorías...');
  const cat1 = await prisma.categoria.upsert({ where: { nombre: 'PC/Portátil' }, update: {}, create: { nombre: 'PC/Portátil', descripcion: 'Computadoras' } });
  const cat2 = await prisma.categoria.upsert({ where: { nombre: 'Monitor' }, update: {}, create: { nombre: 'Monitor', descripcion: 'Pantallas' } });
  const cat3 = await prisma.categoria.upsert({ where: { nombre: 'Impresora' }, update: {}, create: { nombre: 'Impresora', descripcion: 'Impresoras' } });
  const cat4 = await prisma.categoria.upsert({ where: { nombre: 'UPS' }, update: {}, create: { nombre: 'UPS', descripcion: 'UPS' } });
  const cat5 = await prisma.categoria.upsert({ where: { nombre: 'Cables HDMI' }, update: {}, create: { nombre: 'Cables HDMI', descripcion: 'Cables' } });
  const cat6 = await prisma.categoria.upsert({ where: { nombre: 'Drones' }, update: {}, create: { nombre: 'Drones', descripcion: 'Drones' } });
  console.log('✅ Categorías listas\n');

  // Crear o actualizar estados
  console.log('📊 Estados...');
  const est1 = await prisma.estado.upsert({ where: { nombre: 'Operativo' }, update: {}, create: { nombre: 'Operativo', color: '#10B981' } });
  const est2 = await prisma.estado.upsert({ where: { nombre: 'Dañado' }, update: {}, create: { nombre: 'Dañado', color: '#EF4444' } });
  const est3 = await prisma.estado.upsert({ where: { nombre: 'Baja capacidad' }, update: {}, create: { nombre: 'Baja capacidad', color: '#F97316' } });
  console.log('✅ Estados listos\n');

  // Crear o actualizar sedes
  console.log('🏢 Sedes...');
  const sede1 = await prisma.sede.upsert({ where: { nombre: 'Cali' }, update: {}, create: { nombre: 'Cali', direccion: 'Oficina Principal', ciudad: 'Cali' } });
  console.log('✅ Sedes listas\n');

  // Crear o actualizar prioridades
  console.log('⚡ Prioridades...');
  await prisma.prioridad.upsert({ where: { nombre: 'Alta' }, update: {}, create: { nombre: 'Alta', color: '#EF4444', orden: 1 } });
  await prisma.prioridad.upsert({ where: { nombre: 'Media' }, update: {}, create: { nombre: 'Media', color: '#F59E0B', orden: 2 } });
  await prisma.prioridad.upsert({ where: { nombre: 'Baja' }, update: {}, create: { nombre: 'Baja', color: '#10B981', orden: 3 } });
  console.log('✅ Prioridades listas\n');

  // Crear o actualizar acciones
  console.log('🔧 Acciones...');
  await prisma.accionMantenimiento.upsert({ where: { nombre: 'Reparación' }, update: {}, create: { nombre: 'Reparación', descripcion: 'Reparación' } });
  await prisma.accionMantenimiento.upsert({ where: { nombre: 'Reposición' }, update: {}, create: { nombre: 'Reposición', descripcion: 'Reposición' } });
  console.log('✅ Acciones listas\n');

  // Crear equipos
  console.log('💻 Creando equipos...\n');
  
  const equipos = [
    { serial: 'CDN24440PBB', marca: 'Hp', modelo: 'Ultrabook', cat: cat1.id, est: est1.id, obs: 'Presenta fallo en bateria, por lo cual solo funciona si esta conectado a la corriente' },
    { serial: '4535', marca: 'Apple', modelo: 'Apple', cat: cat1.id, est: est1.id, obs: 'NINGUNA' },
    { serial: 'PL8DWR', marca: 'Lenovo', modelo: 'V510', cat: cat1.id, est: est1.id, obs: 'NINGUNA' },
    { serial: 'LRNBJ2D4009', marca: 'Lenovo', modelo: 'V510', cat: cat1.id, est: est1.id, obs: 'NINGUNA' },
    { serial: 'LR0BSCJV', marca: 'Lenovo', modelo: 'V510', cat: cat1.id, est: est1.id, obs: 'NINGUNA' },
    { serial: 'LR0BSBDS', marca: 'Lenovo', modelo: 'V510', cat: cat1.id, est: est1.id, obs: 'Daños fisicos en carcasa' },
    { serial: 'LR0BSRB1', marca: 'Lenovo', modelo: 'V510', cat: cat1.id, est: est1.id, obs: 'NINGUNA' },
    { serial: 'LR0B8H17C', marca: 'Lenovo', modelo: 'V510', cat: cat1.id, est: est1.id, obs: 'NINGUNA' },
    { serial: 'LR094F3K', marca: 'Lenovo', modelo: 'V510', cat: cat1.id, est: est1.id, obs: 'NINGUNA' },
    { serial: 'LRNXB712', marca: 'Lenovo', modelo: 'V510', cat: cat1.id, est: est1.id, obs: 'NINGUNA' },
    { serial: 'LR0B4DX3', marca: 'Lenovo', modelo: 'V510', cat: cat1.id, est: est1.id, obs: 'NINGUNA' },
    { serial: 'LR0B4EWS', marca: 'Lenovo', modelo: 'V510', cat: cat1.id, est: est1.id, obs: 'NINGUNA' },
    { serial: 'LR0B4EJR', marca: 'Lenovo', modelo: 'V510', cat: cat1.id, est: est1.id, obs: 'NINGUNA' },
    { serial: 'LR0B4ER3', marca: 'Lenovo', modelo: 'V510', cat: cat1.id, est: est1.id, obs: 'NINGUNA' },
    { serial: 'LR0BSCSL', marca: 'Lenovo', modelo: 'V510', cat: cat1.id, est: est2.id, obs: 'Presenta fallas con el boton de encendido, estara en revision-07', critico: true },
    { serial: 'LR0B4EA1', marca: 'Lenovo', modelo: 'V510', cat: cat1.id, est: est1.id, obs: 'NINGUNA' },
    { serial: '4293JA3', marca: 'Lenovo', modelo: 'X220', cat: cat1.id, est: est3.id, obs: 'Se debera cambiar, teclado, ram y disco duro para mejor rendimiento', critico: true },
    { serial: 'LR0BXW10', marca: 'Lenovo', modelo: 'V510', cat: cat1.id, est: est2.id, obs: 'Presenta fallas con el boton de encendido, estara en revision', critico: true },
    { serial: 'LR0B4FX4', marca: 'Lenovo', modelo: 'V510', cat: cat1.id, est: est2.id, obs: 'Al encender solo muestra pantalla negra', critico: true },
    { serial: 'LR0BSBWL', marca: 'Lenovo', modelo: 'V510', cat: cat1.id, est: est2.id, obs: 'Al encender solo muestra pantalla negra', critico: true },
    { serial: 'LRO3S6V2', marca: 'Lenovo', modelo: 'V510', cat: cat1.id, est: est2.id, obs: 'Daño en vidrio de pantalla', critico: true },
    { serial: 'LR0BSC49', marca: 'Lenovo', modelo: 'V510', cat: cat1.id, est: est2.id, obs: 'Cambio de disco duro', critico: true },
    { serial: 'CABLE-001', marca: 'x', modelo: 'x', cat: cat5.id, est: est1.id, obs: 'NINGUNA' },
    { serial: 'ESCR-001', marca: 'Lenovo', modelo: 'Escr/Hoto', cat: cat1.id, est: est1.id, obs: 'NINGUNA' },
    { serial: 'VOC-001', marca: 'Voc', modelo: 'E950SW', cat: cat2.id, est: est1.id, obs: 'NINGUNA' },
    { serial: 'EPSON-001', marca: 'Epson', modelo: 'L495', cat: cat3.id, est: est1.id, obs: 'Mantenimiento preventivo' },
    { serial: 'UPS-001', marca: 'DJI', modelo: 'x', cat: cat4.id, est: est1.id, obs: 'NINGUNA' },
    { serial: '2842A57', marca: 'Lenovo', modelo: 'SL410', cat: cat1.id, est: est2.id, obs: 'Cambio de disco duro a ssd', critico: true },
    { serial: 'DJI-MAVIC', marca: 'DJI', modelo: 'Mavic Air 2', cat: cat6.id, est: est1.id, obs: 'NINGUNA' },
    { serial: 'DRONE-AV', marca: 'x', modelo: 'Aviodance', cat: cat6.id, est: est1.id, obs: 'NINGUNA' },
    { serial: 'DRONE-3M', marca: 'x', modelo: '3 Mini', cat: cat6.id, est: est1.id, obs: 'NINGUNA' },
    { serial: 'DJI-MINISE', marca: 'DJI', modelo: 'Mini SE', cat: cat6.id, est: est1.id, obs: 'NINGUNA' },
  ];

  let creados = 0;
  let actualizados = 0;

  for (const eq of equipos) {
    try {
      const existe = await prisma.inventarioGeneral.findUnique({ where: { serialEtiqueta: eq.serial } });
      
      if (existe) {
        await prisma.inventarioGeneral.update({
          where: { serialEtiqueta: eq.serial },
          data: {
            marca: eq.marca,
            modelo: eq.modelo,
            categoriaId: eq.cat,
            estadoId: eq.est,
            sedeId: sede1.id,
            ubicacionDetallada: 'Oficina Principal',
            responsable: 'Diana Gonzalez',
            critico: eq.critico || false,
            observaciones: eq.obs,
          },
        });
        actualizados++;
        console.log(`  ↻ ${eq.serial}`);
      } else {
        await prisma.inventarioGeneral.create({
          data: {
            serialEtiqueta: eq.serial,
            marca: eq.marca,
            modelo: eq.modelo,
            categoriaId: eq.cat,
            estadoId: eq.est,
            sedeId: sede1.id,
            ubicacionDetallada: 'Oficina Principal',
            responsable: 'Diana Gonzalez',
            critico: eq.critico || false,
            observaciones: eq.obs,
          },
        });
        creados++;
        console.log(`  ✓ ${eq.serial}`);
      }
    } catch (error: any) {
      console.error(`  ✗ Error ${eq.serial}:`, error.message);
    }
  }

  console.log(`\n✅ ${creados} creados, ${actualizados} actualizados`);
  console.log('\n✨ Importación completada!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
