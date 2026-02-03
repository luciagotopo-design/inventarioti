// Configuración de tema personalizado para Clerk
// Estilo: Dark mode con glassmorphism, integrado al diseño del sistema
import { Appearance } from '@clerk/types';

export const clerkAppearance: Appearance = {
  layout: {
    socialButtonsPlacement: 'bottom',
    socialButtonsVariant: 'iconButton',
  },
  
  variables: {
    // === COLORES PRINCIPALES ===
    colorPrimary: '#3b82f6', // Azul principal para botones y links
    colorDanger: '#ef4444',
    colorSuccess: '#22c55e',
    colorWarning: '#f59e0b',
    
    // === COLORES DE FONDO (Dark mode) ===
    colorBackground: 'rgba(30, 41, 59, 0.6)', // Slate-800 con transparencia
    colorInputBackground: 'rgba(51, 65, 85, 0.5)', // Slate-700 transparente
    
    // === COLORES DE TEXTO (Light on dark) ===
    colorText: '#f1f5f9', // Blanco/slate claro
    colorTextSecondary: '#cbd5e1', // Gris claro para subtítulos
    
    // === BORDES ===
    borderRadius: '1rem', // 2xl (16px)
    
    // === TIPOGRAFÍA ===
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontSize: '0.875rem',
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },

  elements: {
    // === CONTENEDOR PRINCIPAL ===
    rootBox: 'w-full',
    
    // === CARD - Glassmorphism oscuro ===
    card: [
      'bg-slate-800/60',        // Fondo oscuro semi-transparente
      'backdrop-blur-2xl',      // Efecto blur
      'shadow-2xl',             // Sombra suave
      'shadow-black/50',        // Sombra oscura
      'rounded-2xl',            // Bordes redondeados
      'border',
      'border-slate-700/50',    // Borde sutil
      'p-8',
    ].join(' '),

    // === ENCABEZADOS ===
    headerTitle: [
      'text-2xl',
      'font-bold',
      'text-white',
      'mb-2',
    ].join(' '),
    
    headerSubtitle: [
      'text-sm',
      'text-slate-300',
      'mb-6',
    ].join(' '),
    
    // === BOTONES SOCIALES (Google, Facebook, etc.) ===
    socialButtonsBlockButton: [
      'bg-slate-700/50',        // Fondo oscuro transparente
      'border',
      'border-slate-600/50',
      'hover:bg-slate-600/60',  // Hover más claro
      'hover:border-blue-500/50',
      'rounded-xl',
      'transition-all',
      'duration-300',
      'text-white',
      'font-medium',
      'h-11',
      'backdrop-blur-sm',
    ].join(' '),

    socialButtonsBlockButtonText: 'text-white font-medium text-sm',

    // === DIVISOR ===
    dividerLine: 'bg-slate-600/50 h-px',
    dividerText: 'text-slate-400 text-xs font-medium px-4',

    // === FORMULARIO - Labels ===
    formFieldLabel: [
      'text-sm',
      'font-semibold',
      'text-slate-200',
      'mb-2',
    ].join(' '),
    
    // === FORMULARIO - Inputs ===
    formFieldInput: [
      'bg-slate-700/40',        // Fondo oscuro transparente
      'backdrop-blur-sm',
      'border',
      'border-slate-600/50',
      'rounded-xl',
      'px-4',
      'py-3',
      'text-white',
      'placeholder:text-slate-400',
      'focus:bg-slate-700/60',
      'focus:border-blue-500',
      'focus:ring-2',
      'focus:ring-blue-500/20',
      'transition-all',
      'duration-200',
    ].join(' '),

    formFieldInputShowPasswordButton: [
      'text-slate-400',
      'hover:text-slate-200',
      'transition-colors',
    ].join(' '),

    // === BOTÓN PRINCIPAL - Gradiente azul ===
    formButtonPrimary: [
      'bg-gradient-to-r',
      'from-blue-600',
      'to-blue-500',
      'hover:from-blue-500',
      'hover:to-blue-400',
      'text-white',
      'font-semibold',
      'rounded-xl',
      'h-12',
      'transition-all',
      'duration-300',
      'shadow-lg',
      'shadow-blue-500/30',
      'hover:shadow-xl',
      'hover:shadow-blue-500/50',
      'hover:scale-[1.02]',
      'active:scale-[0.98]',
    ].join(' '),

    // === FOOTER LINKS ===
    footerActionLink: [
      'text-blue-400',
      'hover:text-blue-300',
      'font-semibold',
      'hover:underline',
      'transition-colors',
    ].join(' '),

    footerActionText: 'text-slate-400 text-sm',

    // === ALTERNATIVAS (cambiar email/username) ===
    identityPreviewEditButton: [
      'text-blue-400',
      'hover:text-blue-300',
      'font-medium',
      'text-sm',
      'transition-colors',
    ].join(' '),

    // === MENSAJES DE ERROR ===
    formFieldErrorText: [
      'text-red-400',
      'text-xs',
      'font-medium',
      'mt-1',
    ].join(' '),
    
    // === ALERTAS ===
    alertText: 'text-sm text-slate-300',

    // === INPUTS OTP (Códigos de verificación) ===
    formFieldInputGroup: 'gap-3',
    
    formFieldInput__OTP: [
      'bg-slate-700/40',
      'backdrop-blur-sm',
      'border',
      'border-slate-600/50',
      'rounded-xl',
      'text-white',
      'text-center',
      'text-lg',
      'font-semibold',
      'focus:border-blue-500',
      'focus:ring-2',
      'focus:ring-blue-500/20',
    ].join(' '),

    // === BADGES ===
    badge: [
      'bg-slate-700/50',
      'text-blue-400',
      'px-3',
      'py-1.5',
      'rounded-lg',
      'text-xs',
      'font-medium',
      'border',
      'border-slate-600/50',
    ].join(' '),

    // === OCULTAR BRANDING DE CLERK ===
    footer: 'hidden !important',
    footerPages: 'hidden !important',
    footerAction: 'hidden !important',
    footerActionText__signIn: 'text-slate-400 text-sm',
    footerActionLink__signIn: 'text-blue-400 hover:text-blue-300 font-semibold',
    footerActionText__signUp: 'text-slate-400 text-sm',
    footerActionLink__signUp: 'text-blue-400 hover:text-blue-300 font-semibold',
    
    logoBox: 'hidden !important',
    logoImage: 'hidden !important',
    card__footer: 'hidden !important',
    cardFooter: 'hidden !important',
    footerPagesLink: 'hidden !important',
    footerPagesText: 'hidden !important',
    
    // === USER BUTTON (para navbar) ===
    userButtonBox: 'rounded-full',
    userButtonTrigger: [
      'rounded-full',
      'ring-2',
      'ring-slate-700',
      'hover:ring-blue-500',
      'transition-all',
      'duration-200',
    ].join(' '),
    
    userButtonPopoverCard: [
      'rounded-2xl',
      'bg-slate-800/95',
      'backdrop-blur-xl',
      'shadow-2xl',
      'border',
      'border-slate-700/50',
      'p-3',
    ].join(' '),

    userButtonPopoverActionButton: [
      'hover:bg-slate-700/60',
      'rounded-xl',
      'text-slate-200',
      'font-medium',
      'transition-all',
    ].join(' '),

    userButtonPopoverActionButtonText: 'text-sm',
    userButtonPopoverFooter: 'hidden',
  },
};

// === CONFIGURACIÓN ALTERNATIVA: DARK MODE THEME ===
// (Opcional - para usar con tema oscuro intenso)
export const clerkDarkAppearance: Appearance = {
  ...clerkAppearance,
  
  variables: {
    ...clerkAppearance.variables,
    colorBackground: 'rgba(15, 23, 42, 0.7)', // Slate-900 más oscuro
    colorInputBackground: 'rgba(30, 41, 59, 0.6)',
  },

  elements: {
    ...clerkAppearance.elements,
    
    card: [
      'bg-slate-900/70',
      'backdrop-blur-2xl',
      'shadow-2xl',
      'shadow-black/60',
      'rounded-2xl',
      'border',
      'border-slate-800/50',
      'p-8',
    ].join(' '),
  },
};
