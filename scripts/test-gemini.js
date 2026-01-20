// Script para probar modelos de Gemini disponibles
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Leer .env manualmente
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');
let GEMINI_API_KEY = '';

for (const line of envLines) {
  if (line.startsWith('GEMINI_API_KEY=')) {
    GEMINI_API_KEY = line.split('=')[1].trim();
    break;
  }
}

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY no encontrada en .env');
  process.exit(1);
}

console.log('🔑 API Key encontrada:', GEMINI_API_KEY.substring(0, 20) + '...');
console.log('\n🧪 Probando modelos de Gemini...\n');

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const modelsToTest = [
  'gemini-2.0-flash-exp',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash',
  'gemini-1.5-pro-latest',
  'gemini-1.5-pro',
  'gemini-pro',
  'gemini-1.0-pro',
];

async function testModel(modelName) {
  try {
    console.log(`📝 Probando: ${modelName}...`);
    const model = genAI.getGenerativeModel({ model: modelName });
    
    const result = await model.generateContent('Responde solo con: OK');
    const response = await result.response;
    const text = response.text();
    
    console.log(`✅ ${modelName}: FUNCIONA - Respuesta: ${text.substring(0, 50)}`);
    return true;
  } catch (error) {
    console.log(`❌ ${modelName}: NO DISPONIBLE - ${error.message.substring(0, 100)}`);
    return false;
  }
}

async function testAllModels() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const results = [];
  
  for (const modelName of modelsToTest) {
    const works = await testModel(modelName);
    results.push({ model: modelName, works });
    console.log(''); // Línea en blanco
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📊 RESUMEN:\n');
  
  const working = results.filter(r => r.works);
  const notWorking = results.filter(r => !r.works);
  
  if (working.length > 0) {
    console.log('✅ Modelos disponibles:');
    working.forEach(r => console.log(`   - ${r.model}`));
    console.log('\n💡 RECOMENDACIÓN: Usa el primer modelo de la lista en lib/gemini.ts');
  } else {
    console.log('❌ Ningún modelo disponible');
    console.log('\n🔧 SOLUCIONES:');
    console.log('   1. Verifica tu API key en: https://aistudio.google.com/apikey');
    console.log('   2. Crea una nueva API key si la tuya expiró');
    console.log('   3. Actualiza el paquete: npm install @google/generative-ai@latest');
  }
  
  if (notWorking.length > 0) {
    console.log('\n❌ Modelos NO disponibles:');
    notWorking.forEach(r => console.log(`   - ${r.model}`));
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

testAllModels().catch(console.error);
