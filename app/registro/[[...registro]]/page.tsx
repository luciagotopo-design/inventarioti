'use client';

import { SignUp } from '@clerk/nextjs';
import { clerkAppearance } from '@/lib/clerk-theme';

export default function RegistroPage() {
  return (
    <>
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-900 to-slate-900 flex overflow-hidden relative">
        {/* Efectos de fondo animados */}
        <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl top-10 -left-20 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl bottom-10 -right-20 animate-pulse delay-1000"></div>
        
        {/* Líneas geométricas decorativas */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grid-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          <path d="M 0 300 L 300 0 L 600 300 L 300 600 Z" stroke="url(#grid-gradient)" strokeWidth="2" fill="none" className="animate-float" />
          <path d="M 900 200 L 1200 0 L 1500 200" stroke="url(#grid-gradient)" strokeWidth="2" fill="none" className="animate-float-delayed" />
          <circle cx="1400" cy="600" r="150" stroke="url(#grid-gradient)" strokeWidth="2" fill="none" className="animate-spin-slow" />
        </svg>
      </div>

      {/* Contenedor principal con split */}
      <div className="flex w-full items-center justify-between px-8 lg:px-16 relative z-10">
        
        {/* Lado izquierdo - Branding */}
        <div className="flex-1 hidden lg:flex flex-col justify-center pr-16">
          {/* Logo animado */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl shadow-2xl shadow-blue-500/50 mb-6 animate-float p-3 border border-blue-500/20">
              <img src="/logo-ti.jpg" alt="Inventario TI" className="w-full h-full object-contain rounded-xl" />
            </div>
          </div>

          {/* Título con animación de letras */}
          <h1 className="text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="inline-block animate-text-shimmer bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent bg-[length:200%_auto]">
              Únete a
            </span>
            <br />
            <span className="inline-block animate-text-shimmer-delayed bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 bg-clip-text text-transparent bg-[length:200%_auto]">
              Inventario TI
            </span>
          </h1>

          <p className="text-xl text-blue-200 mb-8 max-w-lg leading-relaxed">
            Comienza a gestionar tu infraestructura tecnológica de forma profesional
          </p>

          {/* Benefits */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-300 group hover:text-white transition-colors">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-medium">Configuración rápida</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300 group hover:text-white transition-colors">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="font-medium">Datos seguros</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300 group hover:text-white transition-colors">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="font-medium">Colaboración en equipo</span>
            </div>
          </div>
        </div>

        {/* Lado derecho - Formulario */}
        <div className="w-full lg:w-auto lg:max-w-md">
          <div className="mb-8 lg:hidden text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl shadow-2xl shadow-blue-500/50 mb-4 p-2.5 border border-blue-500/20">
              <img src="/logo-ti.jpg" alt="Inventario TI" className="w-full h-full object-contain rounded-xl" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
              Sistema de Inventario TI
            </h1>
            <p className="text-blue-200">Crea tu cuenta para comenzar</p>
          </div>

          <SignUp 
            appearance={clerkAppearance}
            path="/registro"
            routing="path"
            signInUrl="/login"
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes text-shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .animate-text-shimmer {
          animation: text-shimmer 3s linear infinite;
        }
        
        .animate-text-shimmer-delayed {
          animation: text-shimmer 3s linear infinite;
          animation-delay: 0.5s;
        }
        
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
      </div>
    </>
  );
}
