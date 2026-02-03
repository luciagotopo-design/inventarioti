import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

// Cargar variables de entorno
const envPath = join(process.cwd(), '.env.local');
try {
  const envConfig = dotenv.parse(readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
} catch (e) {
  console.warn('No se pudo cargar .env.local');
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function testInventarioCompleto() {
  console.log('\n' + '='.repeat(60));
  console.log('📦 PROBANDO INVENTARIO COMPLETO');
  console.log('='.repeat(60));
  
  const { data: equipos, error } = await supabase
    .from('inventario_general')
    .select(`
      *,
      categoria:categorias(id, nombre),
      estado:estados(id, nombre, color),
      sede:sedes(id, nombre)
    `)
    .order('created_at', { ascending: false })
    .limit(1);
  
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  console.log(`✅ Total de equipos: ${equipos?.length || 0}`);
  
  if (equipos && equipos.length > 0) {
    const eq = equipos[0];
    console.log('\n📊 Primer equipo:');
    console.log('  ID_Equipo:', eq.id);
    console.log('  Cantidad:', eq.cantidad);
    console.log('  Categoría:', eq.categoria?.nombre);
    console.log('  Marca:', eq.marca);
    console.log('  Modelo:', eq.modelo);
    console.log('  Serial/Etiqueta:', eq.serial);
    console.log('  Estado:', eq.estado?.nombre);
    console.log('  Sede:', eq.sede?.nombre);
    console.log('  Ubicación_Detallada:', eq.ubicacion_detallada);
    console.log('  Responsable:', eq.responsable);
    console.log('  Crítico:', eq.es_critico ? 'Sí' : 'No');
    console.log('  Observaciones:', eq.observaciones);
  }
}

async function testMantenimientosPendientes() {
  console.log('\n' + '='.repeat(60));
  console.log('🔧 PROBANDO MANTENIMIENTOS PENDIENTES');
  console.log('='.repeat(60));
  
  const { data: pendientes, error } = await supabase
    .from('plan_mantenimiento')
    .select(`
      *,
      equipo:inventario_general(
        id,
        serial,
        marca,
        modelo,
        categoria:categorias(nombre)
      ),
      accion:acciones_mantenimiento(id, nombre)
    `)
    .in('estado_ejecucion', ['Pendiente', 'En Proceso'])
    .order('fecha_programada', { ascending: true })
    .limit(1);
  
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  console.log(`✅ Total de mantenimientos: ${pendientes?.length || 0}`);
  
  if (pendientes && pendientes.length > 0) {
    const m = pendientes[0];
    const fecha = m.fecha_programada ? new Date(m.fecha_programada) : null;
    const fechaStr = fecha ? 
      `${String(fecha.getDate()).padStart(2, '0')}/${String(fecha.getMonth() + 1).padStart(2, '0')}/${fecha.getFullYear()}` : 
      '';
    
    const nombreEquipo = m.equipo 
      ? `${m.equipo.serial || ''} ${m.equipo.marca || ''} ${m.equipo.modelo || ''}`.trim() 
      : '';
    
    console.log('\n📊 Primer mantenimiento:');
    console.log('  Equipo:', nombreEquipo);
    console.log('  Acción:', m.accion?.nombre);
    console.log('  Responsable_Ejecución:', m.responsable_ejecucion);
    console.log('  Fecha_Programada:', fechaStr);
    console.log('  Estado_Ejecución:', m.estado_ejecucion);
    console.log('  Presupuesto:', m.presupuesto ? `$${m.presupuesto.toLocaleString()}` : '');
  }
}

async function main() {
  await testInventarioCompleto();
  await testMantenimientosPendientes();
  console.log('\n✅ Pruebas completadas\n');
}

main().catch(console.error);
