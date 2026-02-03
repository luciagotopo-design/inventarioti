// Página Dashboard - Vista ejecutiva con KPIs y gráficos
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorAlert from '@/components/ui/ErrorAlert';
import { DashboardKPIs, EquiposPorSede, EquiposPorCategoria, EquiposPorEstado } from '@/types';
import AIAnalysisView from '@/components/dashboard/AIAnalysisView';
import {
  LayoutDashboard,
  CheckCircle2,
  AlertTriangle,
  Search,
  TrendingUp,
  Package,
  Sparkles
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
  const [activeTab, setActiveTab] = useState<'general' | 'ai'>('general');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    console.log('\n🔵 [DASHBOARD] Iniciando carga de datos...');
    const startTime = Date.now();
    setError(null);

    try {
      console.log('🔍 Consultando API /api/dashboard...');
      const response = await fetch('/api/dashboard');

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const duration = Date.now() - startTime;

      console.log(`✅ Dashboard data recibida en ${duration}ms`);
      setData(result);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ [ERROR] Error fetching dashboard data:', error);
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
        message={error || "No se pudo conectar con la base de datos. Verifica la conexión a Supabase."}
        onRetry={fetchDashboardData}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6 sm:space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
                <LayoutDashboard className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Dashboard Ejecutivo
              </h1>
            </div>
            <p className="text-sm text-slate-500 font-medium ml-12">
              Gestión inteligente del ecosistema tecnológico
            </p>
          </div>

          {/* Tab System */}
          <div className="flex p-1 bg-slate-200/50 rounded-xl backdrop-blur-sm self-stretch md:self-auto">
            <button
              onClick={() => setActiveTab('general')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${activeTab === 'general'
                  ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                }`}
            >
              <LayoutDashboard size={18} />
              Vista General
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${activeTab === 'ai'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                }`}
            >
              <Sparkles size={18} className={activeTab === 'ai' ? 'animate-pulse' : ''} />
              Análisis IA
            </button>
          </div>
        </div>

        {activeTab === 'general' ? (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
            {/* KPIs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Total de Equipos */}
              <Card className="hover:shadow-lg transition-shadow border-0 shadow-sm overflow-hidden group">
                <div className="p-1 bg-blue-600"></div>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Equipos</CardTitle>
                    <Package className="h-5 w-5 text-blue-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-slate-900">{data.kpis.totalEquipos}</div>
                  <p className="text-xs text-slate-400 mt-1 font-medium">Activos registrados</p>
                </CardContent>
              </Card>

              {/* Equipos Operativos */}
              <Card className="hover:shadow-lg transition-shadow border-0 shadow-sm overflow-hidden group">
                <div className="p-1 bg-emerald-500"></div>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Operativos</CardTitle>
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-emerald-600">{formatPercent(data.kpis.porcentajeOperativos)}</div>
                  <p className="text-xs text-slate-400 mt-1 font-medium">{data.kpis.equiposOperativos} equipos activos</p>
                </CardContent>
              </Card>

              {/* Equipos Críticos */}
              <Card className="hover:shadow-lg transition-shadow border-0 shadow-sm overflow-hidden group">
                <div className="p-1 bg-rose-500"></div>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Críticos</CardTitle>
                    <AlertTriangle className="h-5 w-5 text-rose-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-rose-600">{data.kpis.equiposCriticos}</div>
                  <p className="text-xs text-slate-400 mt-1 font-medium">Requieren reemplazo</p>
                </CardContent>
              </Card>

              {/* Equipos Faltantes */}
              <Card className="hover:shadow-lg transition-shadow border-0 shadow-sm overflow-hidden group">
                <div className="p-1 bg-amber-500"></div>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Faltantes</CardTitle>
                    <Search className="h-5 w-5 text-amber-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-amber-600">{data.kpis.equiposFaltantes}</div>
                  <p className="text-xs text-slate-400 mt-1 font-medium">Por localizar</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm bg-white overflow-hidden">
                <CardHeader className="border-b border-slate-50 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-800">Equipos por Sede</CardTitle>
                      <CardDescription>Ubicación física actual</CardDescription>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                      <TrendingUp size={20} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-5">
                    {data.equiposPorSede.map((item, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-600">{item.sede}</span>
                          <span className="text-xs font-black px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md ring-1 ring-blue-100">
                            {item.cantidad}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${(item.cantidad / data.kpis.totalEquipos) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white overflow-hidden">
                <CardHeader className="border-b border-slate-50 pb-4">
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-800">Equipos por Categoría</CardTitle>
                    <CardDescription>Tipología de activos</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 px-0">
                  <div className="divide-y divide-slate-50">
                    {data.equiposPorCategoria.slice(0, 7).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition-colors group cursor-default">
                        <span className="text-sm font-bold text-slate-600 group-hover:text-blue-600 transition-colors">{item.categoria}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                            <div
                              className="h-full bg-blue-200 transition-all duration-700"
                              style={{ width: `${(item.cantidad / data.kpis.totalEquipos) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-black w-8 text-right text-slate-400 group-hover:text-blue-600">
                            {item.cantidad}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Distribution by Status */}
            <Card className="border-0 shadow-sm bg-white overflow-hidden">
              <CardHeader className="border-b border-slate-50 mb-4">
                <CardTitle className="text-lg font-bold text-slate-800">Estado Operativo</CardTitle>
                <CardDescription>Panorama actual del inventario</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 py-4">
                  {data.equiposPorEstado.map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-slate-50 transition-all duration-300 transform hover:-translate-y-1">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg ring-4 ring-white"
                        style={{ backgroundColor: item.color }}
                      >
                        {item.cantidad}
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold text-slate-800 uppercase tracking-tighter">{item.estado}</p>
                        <p className="text-[10px] font-black text-slate-400">{formatPercent(item.cantidad / data.kpis.totalEquipos)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <AIAnalysisView />
        )}
      </div>
    </div>
  );
}
