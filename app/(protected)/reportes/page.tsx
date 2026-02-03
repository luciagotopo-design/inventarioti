// Página de Reportes
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Iconos simples en SVG (reemplazando lucide-react)
const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const FileTextIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const LoaderIcon = () => (
  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default function ReportesPage() {
  const [loading, setLoading] = useState(false);
  const [loadingMaestro, setLoadingMaestro] = useState(false);
  const [tipoReporte, setTipoReporte] = useState('diagnosticos');

  // Filtros para mantenimientos
  const [estadoMantenimiento, setEstadoMantenimiento] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const descargarReporte = async (formato: 'json' | 'csv') => {
    setLoading(true);
    try {
      let url = '';
      let filename = '';

      if (tipoReporte === 'diagnosticos') {
        url = `/api/reportes/diagnosticos?formato=${formato}`;
        filename = `diagnosticos_${new Date().toISOString().split('T')[0]}`;
      } else {
        const params = new URLSearchParams({ formato });
        if (estadoMantenimiento) params.append('estado', estadoMantenimiento);
        if (fechaInicio) params.append('fechaInicio', fechaInicio);
        if (fechaFin) params.append('fechaFin', fechaFin);

        url = `/api/reportes/mantenimientos?${params}`;
        filename = `mantenimientos_${new Date().toISOString().split('T')[0]}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Error al generar reporte');
      }

      if (formato === 'csv') {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${filename}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
      } else {
        const data = await response.json();
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${filename}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
      }

      alert(`✅ Reporte descargado exitosamente`);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('❌ Error al descargar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const generarReporte = async (tipo: string, formato: string) => {
    try {
      setLoading(true);

      // La autenticación la maneja Clerk mediante middleware

      const response = await fetch('/api/reportes/generar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tipo, formato }),
      });

      if (!response.ok) {
        throw new Error('Error al generar reporte');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      // Determinar extensión correcta
      const extension = formato === 'excel' ? 'xlsx' : formato;
      a.download = `reporte-${tipo}-${new Date().toISOString().split('T')[0]}.${extension}`;

      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const generarReporteMaestro = async (formato: string) => {
    try {
      setLoadingMaestro(true);

      // La autenticación la maneja Clerk mediante middleware, no necesitamos verificar sesión aquí

      const response = await fetch('/api/reportes/maestro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formato }),
      });

      if (!response.ok) {
        throw new Error('Error al generar reporte maestro');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      // Determinar extensión correcta
      const extension = formato === 'excel' ? 'xlsx' : formato;
      a.download = `reporte-maestro-${new Date().toISOString().split('T')[0]}.${extension}`;

      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al generar el reporte maestro');
    } finally {
      setLoadingMaestro(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 Generador de Reportes</h1>
        <p className="text-lg text-gray-700 font-medium">
          Exporta reportes de diagnósticos y acciones de mantenimiento en formato CSV o JSON
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reporte de Diagnósticos */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Diagnósticos de Equipos Críticos</h2>
                <p className="text-sm text-gray-600 font-medium">Equipos que requieren atención inmediata</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 text-base">📋 Incluye:</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="font-medium">Información completa del equipo (serial, marca, modelo)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="font-medium">Estado actual y ubicación</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="font-medium">Prioridad y acciones requeridas</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="font-medium">Costos estimados y fechas límite</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="font-medium">Observaciones y responsables</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setTipoReporte('diagnosticos');
                  descargarReporte('csv');
                }}
                disabled={loading}
                className="flex-1"
                size="lg"
              >
                <span className="text-base font-semibold">📥 Descargar CSV</span>
              </Button>
              <Button
                onClick={() => {
                  setTipoReporte('diagnosticos');
                  descargarReporte('json');
                }}
                disabled={loading}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                <span className="text-base font-semibold">📥 Descargar JSON</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Reporte de Mantenimientos */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Acciones de Mantenimiento</h2>
                <p className="text-sm text-gray-600 font-medium">Plan completo de mantenimientos programados</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 text-base">📋 Incluye:</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="font-medium">Datos del equipo y ubicación</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="font-medium">Tipo de acción de mantenimiento</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="font-medium">Fechas programadas y ejecutadas</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="font-medium">Estado de ejecución</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="font-medium">Presupuesto vs costo real</span>
                </li>
              </ul>
            </div>

            {/* Filtros */}
            <div className="space-y-3 mb-6 bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 text-base">🔍 Filtros:</h3>

              <Select
                label="Estado"
                value={estadoMantenimiento}
                onChange={(e) => setEstadoMantenimiento(e.target.value)}
                options={[
                  { value: '', label: 'Todos los estados' },
                  { value: 'Pendiente', label: 'Pendiente' },
                  { value: 'En Proceso', label: 'En Proceso' },
                  { value: 'Completado', label: 'Completado' },
                  { value: 'Cancelado', label: 'Cancelado' },
                ]}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Fecha Inicio"
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
                <Input
                  label="Fecha Fin"
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setTipoReporte('mantenimientos');
                  descargarReporte('csv');
                }}
                disabled={loading}
                className="flex-1"
                size="lg"
              >
                <span className="text-base font-semibold">📥 Descargar CSV</span>
              </Button>
              <Button
                onClick={() => {
                  setTipoReporte('mantenimientos');
                  descargarReporte('json');
                }}
                disabled={loading}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                <span className="text-base font-semibold">📥 Descargar JSON</span>
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Reporte Maestro - Destacado */}
      <div className="mb-8 bg-linear-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUpIcon />
              <h2 className="text-2xl font-bold">Reporte Maestro de Inventario</h2>
            </div>
            <p className="text-blue-100 mb-4 max-w-3xl">
              Análisis ejecutivo completo con identificación de equipos críticos, plan de mejoramiento,
              KPIs estratégicos y recomendaciones para la toma de decisiones gerenciales.
            </p>
            <div className="bg-white/10 rounded-lg p-4 mb-4">
              <h3 className="font-semibold mb-2">Incluye:</h3>
              <ul className="text-sm text-blue-100 space-y-1">
                <li>✓ Resumen ejecutivo del inventario general</li>
                <li>✓ Análisis de equipos críticos con criterios de priorización</li>
                <li>✓ Plan de mejoramiento con acciones correctivas y preventivas</li>
                <li>✓ Indicadores clave de desempeño (KPIs)</li>
                <li>✓ Análisis financiero y recomendaciones estratégicas</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => generarReporteMaestro('pdf')}
            disabled={loadingMaestro}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loadingMaestro ? (
              <>
                <LoaderIcon />
                Generando...
              </>
            ) : (
              <>
                <DownloadIcon />
                PDF
              </>
            )}
          </button>
          <button
            onClick={() => generarReporteMaestro('excel')}
            disabled={loadingMaestro}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loadingMaestro ? (
              <>
                <LoaderIcon />
                Generando...
              </>
            ) : (
              <>
                <DownloadIcon />
                Excel
              </>
            )}
          </button>
        </div>
      </div>

      {/* Reportes Estándar */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Inventario Completo */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
          <div className="flex items-center gap-3 mb-4">
            <FileTextIcon />
            <h3 className="text-lg font-semibold text-gray-900">Inventario Completo</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Listado completo de todos los equipos registrados con su información detallada.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => generarReporte('inventario-completo', 'pdf')}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm"
            >
              {loading ? <LoaderIcon /> : <DownloadIcon />}
              PDF
            </button>
            <button
              onClick={() => generarReporte('inventario-completo', 'excel')}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 text-sm"
            >
              {loading ? <LoaderIcon /> : <DownloadIcon />}
              Excel
            </button>
          </div>
        </div>

        {/* Mantenimientos Pendientes */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
          <div className="flex items-center gap-3 mb-4">
            <FileTextIcon />
            <h3 className="text-lg font-semibold text-gray-900">Mantenimientos Pendientes</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Lista de actividades de mantenimiento programadas y pendientes de ejecución.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => generarReporte('mantenimientos-pendientes', 'pdf')}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50 text-sm"
            >
              {loading ? <LoaderIcon /> : <DownloadIcon />}
              PDF
            </button>
            <button
              onClick={() => generarReporte('mantenimientos-pendientes', 'excel')}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 text-sm"
            >
              {loading ? <LoaderIcon /> : <DownloadIcon />}
              Excel
            </button>
          </div>
        </div>

        {/* Equipos Críticos */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
          <div className="flex items-center gap-3 mb-4">
            <FileTextIcon />
            <h3 className="text-lg font-semibold text-gray-900">Equipos Críticos</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Reporte de equipos marcados como críticos que requieren atención prioritaria.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => generarReporte('equipos-criticos', 'pdf')}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 text-sm"
            >
              {loading ? <LoaderIcon /> : <DownloadIcon />}
              PDF
            </button>
            <button
              onClick={() => generarReporte('equipos-criticos', 'excel')}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 text-sm"
            >
              {loading ? <LoaderIcon /> : <DownloadIcon />}
              Excel
            </button>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <Card className="mt-6">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">💡 Cómo usar los reportes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 text-base">📄 Formato CSV</h4>
              <p className="text-gray-700 text-sm font-medium mb-2">
                Compatible con Excel, Google Sheets y otras hojas de cálculo.
              </p>
              <ul className="space-y-1 text-gray-600 text-sm">
                <li className="flex items-center gap-2">
                  <span>→</span>
                  <span>Abre directamente en Excel</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>→</span>
                  <span>Importa a Google Sheets</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>→</span>
                  <span>Analiza datos con tablas dinámicas</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 text-base">🔧 Formato JSON</h4>
              <p className="text-gray-700 text-sm font-medium mb-2">
                Para integraciones técnicas y procesamiento automatizado.
              </p>
              <ul className="space-y-1 text-gray-600 text-sm">
                <li className="flex items-center gap-2">
                  <span>→</span>
                  <span>APIs y sistemas externos</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>→</span>
                  <span>Scripts de análisis de datos</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>→</span>
                  <span>Respaldos estructurados</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <LoadingSpinner size="lg" message="Generando reporte..." />
        </div>
      )}
    </div>
  );
}
