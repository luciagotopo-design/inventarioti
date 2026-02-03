import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Cargar variables de entorno manualmente
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    console.log('⚠️ No se encontró .env.local, intentando con .env');
    dotenv.config();
}

async function main() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
        console.error('❌ ERROR: No se encontró la variable GEMINI_API_KEY');
        process.exit(1);
    }

    console.log(`🔑 Usando API Key: ${apiKey.substring(0, 10)}...`);
    console.log('🔄 Consultando modelos disponibles en la API de Google Gemini...');

    try {
        // Usamos fetch directo a la API REST para obtener la lista completa
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const models = data.models || [];

        console.log(`\n✅ Se encontraron ${models.length} modelos disponibles.`);
        console.log('---------------------------------------------------');

        // Filtrar modelos que sirven para generar contenido (chat/texto)
        const contentModels = models.filter((m: any) =>
            m.supportedGenerationMethods.includes('generateContent')
        );

        console.log(`📋 Modelos compatibles con generación de contenido (${contentModels.length}):\n`);

        contentModels.forEach((model: any) => {
            const isFlash = model.name.toLowerCase().includes('flash');
            const isPro = model.name.toLowerCase().includes('pro');

            const icon = isFlash ? '⚡' : (isPro ? '🧠' : '🤖');
            const tag = isFlash ? '(Recomendado: Rápido y Económico)' : (isPro ? '(Más potente, mayor costo)' : '');

            console.log(`${icon} ID: ${model.name.replace('models/', '')} ${tag}`);
            console.log(`   📝 Descripción: ${model.description}`);
            console.log(`   📊 Límite de entrada: ${model.inputTokenLimit} tokens`);
            console.log(`   📤 Límite de salida: ${model.outputTokenLimit} tokens`);
            console.log('');
        });

        console.log('---------------------------------------------------');
        console.log('💡 RECOMENDACIÓN:');
        console.log('   - Para tareas rápidas y económicas usa: gemini-1.5-flash');
        console.log('   - Para razonamiento complejo usa: gemini-1.5-pro');

    } catch (error) {
        console.error('❌ Error al listar modelos:', error);
    }
}

main();
