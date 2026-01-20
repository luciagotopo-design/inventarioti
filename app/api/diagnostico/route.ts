// API Route: Diagnóstico de Conexión Supabase
import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET() {
  console.log('\n🔍 [DIAGNÓSTICO] Iniciando diagnóstico de Supabase...\n');
  
  const results: any = {
    timestamp: new Date().toISOString(),
    env_vars: {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      url_value: process.env.NEXT_PUBLIC_SUPABASE_URL,
      key_length: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
    },
    tests: {}
  };

  // Test 1: Ping básico
  console.log('1️⃣ Test: Ping a Supabase...');
  try {
    const { data, error } = await supabase
      .from('categorias')
      .select('count', { count: 'exact', head: true });
    
    results.tests.ping = {
      success: !error,
      error: error?.message || null,
      count: data
    };
    console.log(`   ✅ Ping exitoso - Count: ${data}`);
  } catch (e: any) {
    results.tests.ping = {
      success: false,
      error: e.message
    };
    console.error(`   ❌ Ping falló:`, e.message);
  }

  // Test 2: Listar tablas accesibles
  console.log('2️⃣ Test: Listar categorías...');
  try {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .limit(5);
    
    results.tests.list_categorias = {
      success: !error,
      error: error?.message || null,
      count: data?.length || 0,
      sample: data || []
    };
    console.log(`   ✅ Categorías: ${data?.length || 0} registros`);
  } catch (e: any) {
    results.tests.list_categorias = {
      success: false,
      error: e.message
    };
    console.error(`   ❌ Listar categorías falló:`, e.message);
  }

  // Test 3: Estados
  console.log('3️⃣ Test: Listar estados...');
  try {
    const { data, error } = await supabase
      .from('estados')
      .select('*')
      .limit(5);
    
    results.tests.list_estados = {
      success: !error,
      error: error?.message || null,
      count: data?.length || 0,
      sample: data || []
    };
    console.log(`   ✅ Estados: ${data?.length || 0} registros`);
  } catch (e: any) {
    results.tests.list_estados = {
      success: false,
      error: e.message
    };
    console.error(`   ❌ Listar estados falló:`, e.message);
  }

  // Test 4: Sedes
  console.log('4️⃣ Test: Listar sedes...');
  try {
    const { data, error } = await supabase
      .from('sedes')
      .select('*')
      .limit(5);
    
    results.tests.list_sedes = {
      success: !error,
      error: error?.message || null,
      count: data?.length || 0,
      sample: data || []
    };
    console.log(`   ✅ Sedes: ${data?.length || 0} registros`);
  } catch (e: any) {
    results.tests.list_sedes = {
      success: false,
      error: e.message
    };
    console.error(`   ❌ Listar sedes falló:`, e.message);
  }

  // Test 5: Inventario
  console.log('5️⃣ Test: Contar inventario...');
  try {
    const { count, error } = await supabase
      .from('inventario_general')
      .select('*', { count: 'exact', head: true });
    
    results.tests.count_inventario = {
      success: !error,
      error: error?.message || null,
      count: count || 0
    };
    console.log(`   ✅ Inventario: ${count || 0} equipos`);
  } catch (e: any) {
    results.tests.count_inventario = {
      success: false,
      error: e.message
    };
    console.error(`   ❌ Contar inventario falló:`, e.message);
  }

  // Test 6: Equipos críticos
  console.log('6️⃣ Test: Contar equipos críticos...');
  try {
    const { count, error } = await supabase
      .from('equipos_criticos')
      .select('*', { count: 'exact', head: true });
    
    results.tests.count_criticos = {
      success: !error,
      error: error?.message || null,
      count: count || 0
    };
    console.log(`   ✅ Críticos: ${count || 0} equipos`);
  } catch (e: any) {
    results.tests.count_criticos = {
      success: false,
      error: e.message
    };
    console.error(`   ❌ Contar críticos falló:`, e.message);
  }

  // Resumen
  const totalTests = Object.keys(results.tests).length;
  const passedTests = Object.values(results.tests).filter((t: any) => t.success).length;
  const failedTests = totalTests - passedTests;

  results.summary = {
    total: totalTests,
    passed: passedTests,
    failed: failedTests,
    success_rate: `${((passedTests / totalTests) * 100).toFixed(1)}%`
  };

  console.log(`\n📊 RESUMEN:`);
  console.log(`   Total tests: ${totalTests}`);
  console.log(`   ✅ Pasados: ${passedTests}`);
  console.log(`   ❌ Fallados: ${failedTests}`);
  console.log(`   📈 Tasa de éxito: ${results.summary.success_rate}\n`);

  return NextResponse.json(results, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
