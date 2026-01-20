'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      console.log('✅ Usuario autenticado - Redirigiendo a dashboard');
      router.push('/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">🔐</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Bienvenido</h2>
        <p className="text-gray-600 mb-6">Por favor inicia sesión para continuar</p>
        <a 
          href="/login" 
          className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          Iniciar Sesión
        </a>
        <p className="text-sm text-gray-500 mt-4">
          ¿No tienes cuenta? <a href="/registro" className="text-blue-600 hover:underline">Regístrate</a>
        </p>
      </div>
    </div>
  );
}
