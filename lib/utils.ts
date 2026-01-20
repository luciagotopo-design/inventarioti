import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | undefined): string {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatCurrency(amount: number | undefined): string {
  if (amount === undefined || amount === null) return 'N/A';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Mapea campos snake_case de Supabase a camelCase del frontend
export function mapSupabaseToFrontend(data: any): any {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => mapSupabaseToFrontend(item));
  }
  
  if (typeof data !== 'object') return data;
  
  const mapped: any = {};
  
  for (const [key, value] of Object.entries(data)) {
    // Convertir snake_case a camelCase
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    
    // Recursivamente mapear objetos anidados
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      mapped[camelKey] = mapSupabaseToFrontend(value);
    } else if (Array.isArray(value)) {
      mapped[camelKey] = value.map(item => 
        typeof item === 'object' ? mapSupabaseToFrontend(item) : item
      );
    } else {
      mapped[camelKey] = value;
    }
  }
  
  return mapped;
}

// Sincroniza el estado de equipo crítico
export async function syncEquipoCritico(
  supabaseClient: any,
  equipoId: string,
  esCritico: boolean
): Promise<void> {
  try {
    if (esCritico) {
      // Verificar si ya existe en equipos_criticos
      const { data: existente } = await supabaseClient
        .from('equipos_criticos')
        .select('id')
        .eq('equipo_id', equipoId)
        .single();
      
      if (!existente) {
        // Crear registro en equipos_criticos
        await supabaseClient
          .from('equipos_criticos')
          .insert({
            equipo_id: equipoId,
            resuelto: false,
          });
      }
    } else {
      // Si no es crítico, eliminar de equipos_criticos si existe
      await supabaseClient
        .from('equipos_criticos')
        .delete()
        .eq('equipo_id', equipoId);
    }
  } catch (error) {
    console.error('Error syncing equipo critico:', error);
    // No lanzar error para no bloquear la operación principal
  }
}
