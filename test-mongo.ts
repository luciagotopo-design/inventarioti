// Script simple para verificar conexión a MongoDB
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testConnection() {
  console.log('🔌 Probando conexión a MongoDB...\n');

  try {
    // Intenta conectar y hacer una consulta simple
    console.log('📡 Conectando a la base de datos...');
    await prisma.$connect();
    console.log('✅ Conexión exitosa!\n');

    // Verificar categorías
    console.log('📁 Verificando categorías...');
    const categorias = await prisma.categoria.findMany();
    console.log(`   Total: ${categorias.length}`);
    if (categorias.length > 0) {
      categorias.forEach(c => console.log(`   - ${c.nombre}`));
    }

    // Verificar estados
    console.log('\n📊 Verificando estados...');
    const estados = await prisma.estado.findMany();
    console.log(`   Total: ${estados.length}`);
    if (estados.length > 0) {
      estados.forEach(e => console.log(`   - ${e.nombre} (${e.color})`));
    }

    // Verificar sedes
    console.log('\n🏢 Verificando sedes...');
    const sedes = await prisma.sede.findMany();
    console.log(`   Total: ${sedes.length}`);
    if (sedes.length > 0) {
      sedes.forEach(s => console.log(`   - ${s.nombre} - ${s.ciudad}`));
    }

    // Verificar equipos
    console.log('\n💻 Verificando inventario...');
    const equipos = await prisma.inventarioGeneral.count();
    console.log(`   Total equipos: ${equipos}`);

    console.log('\n✅ Todas las verificaciones completadas exitosamente!\n');

  } catch (error: any) {
    console.error('\n❌ Error de conexión:', error.message);
    console.error('\n💡 Posibles causas:');
    console.error('   1. MongoDB no está corriendo o no tiene nodo primario');
    console.error('   2. La URL de conexión en .env es incorrecta');
    console.error('   3. Problemas de red o firewall');
    console.error('   4. Credenciales incorrectas\n');
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

testConnection();
