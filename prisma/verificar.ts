// Script para verificar datos en MongoDB
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verificar() {
  console.log('🔍 Verificando datos en la base de datos...\n');

  try {
    const categorias = await prisma.categoria.findMany();
    console.log(`📁 Categorías encontradas: ${categorias.length}`);
    categorias.forEach(c => console.log(`   - ${c.nombre}`));

    const estados = await prisma.estado.findMany();
    console.log(`\n📊 Estados encontrados: ${estados.length}`);
    estados.forEach(e => console.log(`   - ${e.nombre} (${e.color})`));

    const sedes = await prisma.sede.findMany();
    console.log(`\n🏢 Sedes encontradas: ${sedes.length}`);
    sedes.forEach(s => console.log(`   - ${s.nombre}`));

    const prioridades = await prisma.prioridad.findMany();
    console.log(`\n⚡ Prioridades encontradas: ${prioridades.length}`);
    prioridades.forEach(p => console.log(`   - ${p.nombre}`));

    const acciones = await prisma.accionMantenimiento.findMany();
    console.log(`\n🔧 Acciones encontradas: ${acciones.length}`);
    acciones.forEach(a => console.log(`   - ${a.nombre}`));

    const equipos = await prisma.inventarioGeneral.findMany();
    console.log(`\n💻 Equipos en inventario: ${equipos.length}`);

    console.log('\n✅ Verificación completada\n');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificar();
