// Dashboard de Administración
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  Users, 
  Settings, 
  Activity,
  ArrowRight,
  UserCog,
  Database
} from 'lucide-react';

interface Stats {
  totalUsuarios: number;
  usuariosActivos: number;
  totalRoles: number;
  rolesActivos: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalUsuarios: 0,
    usuariosActivos: 0,
    totalRoles: 0,
    rolesActivos: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      const [usuariosRes, rolesRes] = await Promise.all([
        fetch('/api/usuarios'),
        fetch('/api/roles'),
      ]);

      const usuarios = await usuariosRes.json();
      const roles = await rolesRes.json();

      // Asegurar que sean arrays
      const usuariosArray = Array.isArray(usuarios) ? usuarios : [];
      const rolesArray = Array.isArray(roles) ? roles : [];

      setStats({
        totalUsuarios: usuariosArray.length,
        usuariosActivos: usuariosArray.filter((u: any) => u.activo).length,
        totalRoles: rolesArray.length,
        rolesActivos: rolesArray.filter((r: any) => r.activo).length,
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const adminModules = [
    {
      title: 'Gestión de Roles',
      description: 'Administra roles y permisos del sistema',
      icon: Shield,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      href: '/admin/roles',
      stats: `${stats.totalRoles} roles configurados`,
    },
    {
      title: 'Gestión de Usuarios',
      description: 'Administra usuarios y asigna roles',
      icon: Users,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      href: '/admin/usuarios',
      stats: `${stats.totalUsuarios} usuarios en el sistema`,
    },
    {
      title: 'Configuración del Sistema',
      description: 'Ajustes generales y preferencias',
      icon: Settings,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      href: '#',
      stats: 'Próximamente',
      disabled: true,
    },
    {
      title: 'Logs de Actividad',
      description: 'Revisa auditoría y actividad del sistema',
      icon: Activity,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      href: '#',
      stats: 'Próximamente',
      disabled: true,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <UserCog className="h-10 w-10 text-blue-600" />
          Panel de Administración
        </h1>
        <p className="text-lg text-gray-600">
          Gestiona usuarios, roles y configuración del sistema
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Total Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.totalUsuarios}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.usuariosActivos} activos
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Usuarios Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.usuariosActivos}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.totalUsuarios - stats.usuariosActivos} inactivos
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Total Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.totalRoles}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.rolesActivos} activos
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Roles Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.rolesActivos}</div>
            <p className="text-xs text-gray-500 mt-1">
              Configurados y funcionando
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Cards */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Database className="h-6 w-6 text-gray-600" />
          Acceso Rápido
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adminModules.map((module, index) => {
            const Icon = module.icon;
            return (
              <Card
                key={index}
                className={`group cursor-pointer transition-all duration-300 hover:shadow-xl border-2 ${
                  module.disabled
                    ? 'opacity-60 cursor-not-allowed'
                    : 'hover:scale-105 ' + module.borderColor
                }`}
                onClick={() => !module.disabled && router.push(module.href)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`p-3 rounded-xl ${module.bgColor} ${
                        !module.disabled && 'group-hover:scale-110'
                      } transition-transform`}
                    >
                      <Icon className={`h-8 w-8 ${module.iconColor}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center justify-between">
                        {module.title}
                        {!module.disabled && (
                          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                        )}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">{module.description}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {module.stats}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Sistema de Control de Acceso
              </h3>
              <p className="text-sm text-gray-700 mb-3">
                Gestiona quién tiene acceso a qué partes del sistema mediante roles y permisos granulares.
              </p>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Asigna roles específicos a cada usuario
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Configura permisos detallados por módulo
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Activa o desactiva usuarios según sea necesario
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
