// Página Dashboard - Vista ejecutiva con KPIs y gráficos
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorAlert from '@/components/ui/ErrorAlert';
import { DashboardKPIs, EquiposPorSede, EquiposPorCategoria, EquiposPorEstado } from '@/types';
import { 
  LayoutDashboard, 
  CheckCircle2, 
  AlertTriangle, 
  Search,
  TrendingUp,
  Package
} from 'lucide-react';

interface DashboardData {
  kpis: DashboardKPIs;
  equiposPorSede: EquiposPorSede[];
  equiposPorCategoria: EquiposPorCategoria[];
  equiposPorEstado: EquiposPorEstado[];
}

// Función helper para formatear porcentajes
function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    console.log('\n\ud83d\udd35 [DASHBOARD] Iniciando carga de datos...');
    const startTime = Date.now();
    setError(null);
    
    try {
      console.log('\ud83d\udd0d Consultando API /api/dashboard...');
      const response = await fetch('/api/dashboard');
      
      console.log(`\ud83d\udcca Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      const duration = Date.now() - startTime;
      
      console.log(`\u2705 Dashboard data recibida en ${duration}ms:`, result);
      console.log(`\ud83d\udcca KPIs - Total: ${result.kpis?.totalEquipos}, Operativos: ${result.kpis?.equiposOperativos}, Cr\u00edticos: ${result.kpis?.equiposCriticos}\n`);
      
      setData(result);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      console.error('\u274c [ERROR] Error fetching dashboard data:', error);
      console.error('\u274c Stack:', error instanceof Error ? error.stack : 'No stack available\n');
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LoadingSpinner 
        fullScreen 
        size="lg"
        message="Cargando dashboard..." 
        submessage="Conectando con la base de datos"
      />
    );
  }

  if (error || !data) {
    return (
      <ErrorAlert
        title="Error al cargar el dashboard"
        message={error || "No se pudo conectar con la base de datos. Verifica la conexi\u00f3n a MongoDB Atlas."}
        onRetry={fetchDashboardData}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6 sm:space-y-8">
        {/* Header Section - Jerarquía visual mejorada */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="space-y-2 w-full sm:w-auto">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg shadow-blue-500/30">
                <LayoutDashboard className="h-6 w-6 sm:h-7 sm:w-7 text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
                Dashboard Ejecutivo
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium sm:ml-14">
              Resumen general del inventario tecnológico en tiempo real
            </p>
          </div>
          
          {/* Badge de total con diseño mejorado */}
          <div className="flex items-center gap-2.5 bg-white px-4 sm:px-5 py-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 w-full sm:w-auto">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex-shrink-0">
              <TrendingUp className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total</span>
              <span className="text-lg font-bold text-slate-900">{data.kpis.totalEquipos}</span>
            </div>
          </div>
        </div>

        {/* KPIs Grid - Cards unificados con mejor diseño */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Total de Equipos */}
          <Card className="group relative overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-500 to-blue-600"></div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  Total Equipos
                </CardTitle>
                <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <Package className="h-5 w-5 text-blue-600" strokeWidth={2.5} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-4xl font-bold text-slate-900 tracking-tight">
                {data.kpis.totalEquipos}
              </div>
              <p className="text-xs text-slate-500 font-medium">Inventario completo</p>
            </CardContent>
          </Card>

          {/* Equipos Operativos */}
          <Card className="group relative overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-emerald-500 to-emerald-600"></div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  Operativos
                </CardTitle>
                <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" strokeWidth={2.5} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-4xl font-bold text-emerald-700 tracking-tight">
                {formatPercent(data.kpis.porcentajeOperativos)}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {data.kpis.equiposOperativos} equipos funcionando
              </p>
            </CardContent>
          </Card>

          {/* Equipos Críticos */}
          <Card className="group relative overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-rose-500 to-rose-600"></div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  Críticos
                </CardTitle>
                <div className="p-2 bg-rose-50 rounded-lg group-hover:bg-rose-100 transition-colors">
                  <AlertTriangle className="h-5 w-5 text-rose-600" strokeWidth={2.5} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-4xl font-bold text-rose-700 tracking-tight">
                {data.kpis.equiposCriticos}
              </div>
              <p className="text-xs text-slate-500 font-medium">Requieren atención urgente</p>
            </CardContent>
          </Card>

          {/* Equipos Faltantes */}
          <Card className="group relative overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-500 to-amber-600"></div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  Faltantes
                </CardTitle>
                <div className="p-2 bg-amber-50 rounded-lg group-hover:bg-amber-100 transition-colors">
                  <Search className="h-5 w-5 text-amber-600" strokeWidth={2.5} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-4xl font-bold text-amber-700 tracking-tight">
                {data.kpis.equiposFaltantes}
              </div>
              <p className="text-xs text-slate-500 font-medium">No localizados</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid - Sección unificada */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Equipos por Sede */}
          <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-xl font-bold text-slate-900">Equipos por Sede</CardTitle>
              <CardDescription className="text-sm text-slate-500 font-medium mt-1">
                Distribución geográfica del inventario
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-5">
                {data.equiposPorSede.map((item, idx) => (
                  <div key={idx} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-700">{item.sede}</span>
                      <span className="inline-flex items-center justify-center min-w-[44px] h-7 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 rounded-lg border border-blue-100">
                        {item.cantidad}
                      </span>
                    </div>
                    <div className="relative w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out shadow-sm"
                        style={{
                          width: `${(item.cantidad / data.kpis.totalEquipos) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Equipos por Categoría */}
          <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-xl font-bold text-slate-900">Equipos por Categoría</CardTitle>
              <CardDescription className="text-sm text-slate-500 font-medium mt-1">
                Clasificación por tipo de equipo
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-2.5">
                {data.equiposPorCategoria.slice(0, 8).map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                      {item.categoria}
                    </span>
                    <span className="inline-flex items-center justify-center min-w-[44px] h-7 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 rounded-lg border border-blue-100 group-hover:bg-blue-100 transition-colors">
                      {item.cantidad}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Equipos por Estado - Diseño mejorado */}
        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-xl font-bold text-slate-900">Distribución por Estado</CardTitle>
            <CardDescription className="text-sm text-slate-500 font-medium mt-1">
              Estado operativo actual del inventario
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {data.equiposPorEstado.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center group cursor-pointer">
                  <div
                    className="relative w-24 h-24 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl mb-3"
                    style={{ backgroundColor: item.color }}
                  >
                    <span className="relative z-10">{item.cantidad}</span>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity"></div>
                  </div>
                  <p className="text-sm font-bold text-slate-700 mb-1 text-center">{item.estado}</p>
                  <p className="text-xs font-semibold text-slate-500">
                    {formatPercent(item.cantidad / data.kpis.totalEquipos)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
