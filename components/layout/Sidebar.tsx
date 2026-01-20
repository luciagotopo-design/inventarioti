// Componente Sidebar - Navegación lateral
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useClerk, useUser } from '@clerk/nextjs';
import { 
  LayoutDashboard, 
  Package, 
  Wrench, 
  FileText, 
  Users, 
  LogOut,
  Phone,
  Shield,
  AlertTriangle,
  Menu,
  X
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Verificar rol desde Clerk metadata
  const isAdmin = user?.publicMetadata?.role === 'admin';

  const handleLogout = async () => {
    console.log('🚪 Cerrando sesión...');
    await signOut();
    console.log('✅ Sesión cerrada');
  };

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
    { href: '/inventario', label: 'Inventario', icon: Package, adminOnly: false },
    { href: '/equipos-criticos', label: 'Equipos Críticos', icon: AlertTriangle, adminOnly: false },
    { href: '/plan-mantenimiento', label: 'Mantenimiento', icon: Wrench, adminOnly: false },
    { href: '/reportes', label: 'Reportes', icon: FileText, adminOnly: false },
    { href: '/admin', label: 'Admin', icon: Shield, adminOnly: true },
    { href: '/admin/roles', label: 'Roles', icon: Users, adminOnly: true },
    { href: '/admin/usuarios', label: 'Usuarios', icon: Users, adminOnly: true },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-lg shadow-lg hover:bg-gray-800 transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay para móvil */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white shadow-2xl 
        flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center p-1.5 border border-blue-500/20">
              <img src="/logo-ti.jpg" alt="Inventario TI" className="w-full h-full object-contain rounded-lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Inventario TI</h1>
              <p className="text-xs text-gray-400">Sistema de Gestión</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems
              .filter(item => !item.adminOnly || isAdmin)
              .map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50 scale-105'
                          : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                      }`}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
          </ul>
        </nav>

        {/* Usuario y Logout */}
        <div className="p-4 border-t border-gray-700 bg-gray-800/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center ring-2 ring-blue-400/50 flex-shrink-0">
              <span className="text-white font-bold text-lg">
                {user?.firstName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || user?.primaryEmailAddress?.emailAddress?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.fullName || user?.username || user?.primaryEmailAddress?.emailAddress}
              </p>
              {user?.primaryPhoneNumber?.phoneNumber && (
                <p className="text-xs text-gray-400 flex items-center gap-1 truncate">
                  <Phone className="h-3 w-3 flex-shrink-0" />
                  {user.primaryPhoneNumber.phoneNumber}
                </p>
              )}
              {isAdmin && (
                <p className="text-xs text-blue-400 font-semibold mt-1">⭐ Administrador</p>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-red-500/50"
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}
