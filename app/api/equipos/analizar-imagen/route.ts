import { NextRequest, NextResponse } from 'next/server';
import { analizarImagenEquipo } from '@/lib/gemini-vision';

export async function POST(request: NextRequest) {
    try {
        console.log('🔍 Recibiendo solicitud de análisis de imagen...');

        const formData = await request.formData();
        const imageFile = formData.get('image') as File;

        if (!imageFile) {
            return NextResponse.json(
                { success: false, error: 'No se proporcionó ninguna imagen' },
                { status: 400 }
            );
        }

        // Validar tipo de archivo
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(imageFile.type)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Formato de imagen no válido. Use JPG, PNG o WEBP'
                },
                { status: 400 }
            );
        }

        // Validar tamaño (máximo 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (imageFile.size > maxSize) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'La imagen es demasiado grande. Máximo 10MB'
                },
                { status: 400 }
            );
        }

        console.log(`📸 Procesando imagen: ${imageFile.name} (${imageFile.type}, ${(imageFile.size / 1024).toFixed(2)}KB)`);

        // Convertir a base64
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString('base64');

        // Analizar con Gemini Vision
        const analisis = await analizarImagenEquipo(base64, imageFile.type);

        console.log('✅ Análisis completado exitosamente');

        return NextResponse.json({
            success: true,
            analisis,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('❌ Error en análisis de imagen:', error);

        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Error al analizar la imagen'
            },
            { status: 500 }
        );
    }
}

// Configuración para permitir archivos grandes
export const config = {
    api: {
        bodyParser: false,
    },
};
