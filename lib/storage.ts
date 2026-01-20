// Servicio de almacenamiento para Supabase Storage
import supabase from './supabase';

const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'equipos-criticos';

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

/**
 * Sube un archivo al bucket de Supabase Storage usando API route
 * @param file - Archivo a subir (imagen o video)
 * @param folder - Carpeta dentro del bucket (opcional)
 * @returns URL pública del archivo subido
 */
export async function uploadFile(
  file: File,
  folder: string = 'equipos'
): Promise<UploadResult> {
  try {
    console.log('📤 Subiendo archivo:', file.name, 'Tamaño:', file.size);

    // Validar tipo de archivo
    const validTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/heic',
      'video/mp4',
      'video/quicktime',
      'video/webm'
    ];

    if (!validTypes.includes(file.type)) {
      return {
        success: false,
        error: `Tipo de archivo no soportado: ${file.type}. Solo se permiten imágenes (JPG, PNG, WEBP, HEIC) y videos (MP4, MOV, WEBM).`
      };
    }

    // Validar tamaño (50MB máximo)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: `El archivo es demasiado grande (${(file.size / 1024 / 1024).toFixed(2)}MB). Tamaño máximo: 50MB.`
      };
    }

    console.log('📁 Enviando a API route...');

    // Usar API route para subir desde el servidor
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await fetch('/api/storage/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error de API:', errorData);
      return {
        success: false,
        error: errorData.error || 'Error al subir archivo'
      };
    }

    const result = await response.json();
    console.log('✅ Archivo subido exitosamente:', result.url);

    return result;
  } catch (error) {
    console.error('❌ Error inesperado al subir archivo:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

/**
 * Sube múltiples archivos al bucket
 * @param files - Array de archivos a subir
 * @param folder - Carpeta dentro del bucket (opcional)
 * @returns Array de URLs públicas de los archivos subidos
 */
export async function uploadMultipleFiles(
  files: File[],
  folder: string = 'equipos'
): Promise<UploadResult[]> {
  console.log(`📤 Subiendo ${files.length} archivos...`);

  const uploadPromises = files.map(file => uploadFile(file, folder));
  const results = await Promise.all(uploadPromises);

  const successCount = results.filter(r => r.success).length;
  console.log(`✅ ${successCount}/${files.length} archivos subidos exitosamente`);

  return results;
}

/**
 * Elimina un archivo del bucket
 * @param filePath - Ruta del archivo en el bucket
 * @returns True si se eliminó exitosamente
 */
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    console.log('🗑️ Eliminando archivo:', filePath);

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error('❌ Error al eliminar archivo:', error);
      return false;
    }

    console.log('✅ Archivo eliminado exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error inesperado al eliminar archivo:', error);
    return false;
  }
}

/**
 * Elimina múltiples archivos del bucket
 * @param filePaths - Array de rutas de archivos a eliminar
 * @returns Número de archivos eliminados exitosamente
 */
export async function deleteMultipleFiles(filePaths: string[]): Promise<number> {
  try {
    console.log(`🗑️ Eliminando ${filePaths.length} archivos...`);

    const { data, error } = await supabase.storage
      .from(bucketName)
      .remove(filePaths);

    if (error) {
      console.error('❌ Error al eliminar archivos:', error);
      return 0;
    }

    const deletedCount = data?.length || 0;
    console.log(`✅ ${deletedCount} archivos eliminados exitosamente`);
    return deletedCount;
  } catch (error) {
    console.error('❌ Error inesperado al eliminar archivos:', error);
    return 0;
  }
}

/**
 * Obtiene la URL pública de un archivo
 * @param filePath - Ruta del archivo en el bucket
 * @returns URL pública del archivo
 */
export function getPublicUrl(filePath: string): string {
  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

/**
 * Comprime una imagen antes de subirla
 * @param file - Archivo de imagen a comprimir
 * @param maxWidth - Ancho máximo en píxeles (default: 1920)
 * @param quality - Calidad de compresión 0-1 (default: 0.8)
 * @returns Archivo comprimido
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              console.log(
                `🗜️ Imagen comprimida: ${(file.size / 1024).toFixed(2)}KB → ${(compressedFile.size / 1024).toFixed(2)}KB`
              );
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };
    };
  });
}
