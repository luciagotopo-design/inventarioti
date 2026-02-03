// Modal de Análisis Inteligente de Mantenimiento
'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Badge from '@/components/ui/Badge';
import Select from '@/components/ui/Select';

interface AnalisisMantenimientoModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipoId: string;
  equipoSerial: string;
}

export default function AnalisisMantenimientoModal({
  isOpen,
  onClose,
  equipoId,
  equipoSerial
}: AnalisisMantenimientoModalProps) {
  const [loading, setLoading] = useState(false);
  const [analisis, setAnalisis] = useState<any>(null);
  const [pais, setPais] = useState('Colombia');
  const [moneda, setMoneda] = useState('COP');
  const [usarIA, setUsarIA] = useState(true);

  const generarAnalisis = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/equipos/analisis-mantenimiento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equipoId, pais, moneda, usarIA })
      });

      if (!response.ok) {
        throw new Error('Error al generar análisis');
      }

      const data = await response.json();
      setAnalisis(data);
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al generar análisis de mantenimiento');
    } finally {
      setLoading(false);
    }
  };

  const descargarAnalisis = () => {
    if (!analisis) return;

    const texto = generarTextoAnalisis(analisis);
    const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analisis_${equipoSerial}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`🔧 Análisis Inteligente - ${equipoSerial}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Configuración inicial */}
        {!analisis && !loading && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-bold text-blue-900 mb-2">🤖 Sistema Experto en Mantenimiento</h3>
              <p className="text-blue-800 text-sm">
                Genera un análisis completo que incluye diagnóstico, plan de mantenimiento preventivo y correctivo, 
                identificación de repuestos necesarios y comparativa de precios en tiendas online.
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="usarIA"
                  checked={usarIA}
                  onChange={(e) => setUsarIA(e.target.checked)}
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="usarIA" className="flex-1">
                  <div className="font-bold text-purple-900">✨ Usar Gemini AI (Recomendado)</div>
                  <p className="text-sm text-purple-700">
                    Análisis inteligente con búsqueda real de precios en tiendas online
                  </p>
                </label>
              </div>
              {!usarIA && (
                <p className="text-xs text-purple-600 mt-2 ml-8">
                  ⚠️ Modo básico: usará precios de referencia en lugar de búsqueda en tiempo real
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="País"
                value={pais}
                onChange={(e) => setPais(e.target.value)}
                options={[
                  { value: 'Colombia', label: 'Colombia' },
                  { value: 'Mexico', label: 'México' },
                  { value: 'Argentina', label: 'Argentina' },
                  { value: 'Chile', label: 'Chile' }
                ]}
              />
              <Select
                label="Moneda"
                value={moneda}
                onChange={(e) => setMoneda(e.target.value)}
                options={[
                  { value: 'COP', label: 'COP (Peso Colombiano)' },
                  { value: 'MXN', label: 'MXN (Peso Mexicano)' },
                  { value: 'ARS', label: 'ARS (Peso Argentino)' },
                  { value: 'CLP', label: 'CLP (Peso Chileno)' },
                  { value: 'USD', label: 'USD (Dólar)' }
                ]}
              />
            </div>

            <Button onClick={generarAnalisis} className="w-full" size="lg">
              🚀 Generar Análisis Completo
            </Button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="py-12">
            <LoadingSpinner size="lg" message="Analizando equipo y buscando mejores precios..." />
          </div>
        )}

        {/* Resultados */}
        {analisis && !loading && (
          <div className="space-y-6 max-h-[600px] overflow-y-auto">
            {/* Diagnóstico */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">📋 Diagnóstico del Equipo</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-gray-600 font-medium">Marca/Modelo:</span>
                  <p className="text-gray-900 font-bold">{analisis.equipo.marca} {analisis.equipo.modelo}</p>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Categoría:</span>
                  <p className="text-gray-900 font-bold">{analisis.equipo.categoria}</p>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Antigüedad:</span>
                  <p className="text-gray-900 font-bold">{analisis.equipo.antiguedad_anios} años</p>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Estado:</span>
                  <Badge variant={analisis.equipo.estado === 'Operativo' ? 'success' : 'danger'}>
                    {analisis.equipo.estado}
                  </Badge>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="font-bold text-yellow-900 text-lg mb-2">{analisis.diagnostico.estado_general}</p>
                <p className="text-yellow-800 font-medium">{analisis.diagnostico.recomendacion_inmediata}</p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <span className="font-bold text-red-900">Nivel de Urgencia: </span>
                <Badge variant={
                  analisis.diagnostico.nivel_urgencia === 'ALTO' ? 'danger' :
                  analisis.diagnostico.nivel_urgencia === 'MEDIO' ? 'warning' : 'default'
                }>
                  {analisis.diagnostico.nivel_urgencia}
                </Badge>
              </div>
            </div>

            {/* Plan de Mantenimiento */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🗓️ Plan de Mantenimiento</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Tipo</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Acción</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Frecuencia</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Prioridad</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analisis.plan_mantenimiento.map((item: any, idx: number) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3">
                          <Badge variant={item.tipo === 'Correctivo' ? 'danger' : 'info'}>
                            {item.tipo}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-900 font-medium">{item.accion}</td>
                        <td className="px-4 py-3 text-gray-700">{item.frecuencia}</td>
                        <td className="px-4 py-3">
                          <Badge variant={
                            item.prioridad === 'Crítica' || item.prioridad === 'Alta' ? 'danger' :
                            item.prioridad === 'Media' ? 'warning' : 'default'
                          }>
                            {item.prioridad}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Reparaciones y Costos */}
            {analisis.reparaciones_necesarias.length > 0 && (
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">💰 Análisis de Costos y Repuestos</h3>
                
                {analisis.analisis_costos.map((costo: any, idx: number) => (
                  <div key={idx} className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{costo.componente}</h4>
                        <p className="text-gray-700 text-sm">{costo.descripcion}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Costo Estimado</p>
                        <p className="text-2xl font-bold text-green-600">
                          ${costo.costo_promedio.toLocaleString()} {costo.moneda}
                        </p>
                        <p className="text-xs text-gray-500">
                          Rango: ${costo.costo_estimado_min.toLocaleString()} - ${costo.costo_estimado_max.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded p-3 mb-3">
                      <p className="text-sm font-semibold text-gray-700 mb-2">🛒 Tiendas Sugeridas:</p>
                      <div className="flex flex-wrap gap-2">
                        {costo.tiendas_sugeridas.map((tienda: string, i: number) => (
                          <Badge key={i} variant="info">{tienda}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-gray-700">🔗 Enlaces de Búsqueda:</p>
                      {costo.enlaces_busqueda.map((enlace: any, i: number) => (
                        <a
                          key={i}
                          href={enlace.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-blue-600 hover:text-blue-800 text-sm hover:underline"
                        >
                          → {enlace.tienda}
                        </a>
                      ))}
                    </div>

                    <p className="text-xs text-gray-500 mt-2 italic">{costo.nota}</p>
                  </div>
                ))}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <p className="font-bold text-blue-900 mb-2">💡 Costo Total Estimado:</p>
                  <p className="text-3xl font-bold text-blue-900">
                    ${analisis.analisis_costos.reduce((sum: number, c: any) => sum + c.costo_promedio, 0).toLocaleString()} {moneda}
                  </p>
                </div>
              </div>
            )}

            {/* Tiendas Recomendadas */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🏪 Tiendas Recomendadas en {pais}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analisis.tiendas_recomendadas.map((tienda: any, idx: number) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h4 className="font-bold text-gray-900">{tienda.nombre}</h4>
                    <p className="text-sm text-gray-600 mb-2">Especialidad: {tienda.especialidad}</p>
                    <a
                      href={tienda.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Visitar tienda →
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Próxima Revisión */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="font-bold text-green-900">📅 Próxima Revisión Programada:</p>
              <p className="text-green-800 text-lg font-semibold">{analisis.proxima_revision}</p>
            </div>

            {/* Acciones */}
            <div className="flex gap-3">
              <Button onClick={descargarAnalisis} variant="outline" className="flex-1">
                📄 Descargar Análisis Completo
              </Button>
              <Button onClick={() => { setAnalisis(null); }} variant="outline" className="flex-1">
                🔄 Generar Nuevo Análisis
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function generarTextoAnalisis(analisis: any): string {
  let texto = `
=================================================================
ANÁLISIS INTELIGENTE DE MANTENIMIENTO
=================================================================

EQUIPO: ${analisis.equipo.serial}
Marca: ${analisis.equipo.marca}
Modelo: ${analisis.equipo.modelo}
Categoría: ${analisis.equipo.categoria}
Estado: ${analisis.equipo.estado}
Antigüedad: ${analisis.equipo.antiguedad_anios} años
Ubicación: ${analisis.equipo.ubicacion}
Responsable: ${analisis.equipo.responsable}

=================================================================
DIAGNÓSTICO
=================================================================

Estado General: ${analisis.diagnostico.estado_general}
Nivel de Urgencia: ${analisis.diagnostico.nivel_urgencia}

Recomendación Inmediata:
${analisis.diagnostico.recomendacion_inmediata}

Observaciones:
${analisis.equipo.observaciones}

=================================================================
PLAN DE MANTENIMIENTO
=================================================================

${analisis.plan_mantenimiento.map((item: any, idx: number) => `
${idx + 1}. [${item.tipo.toUpperCase()}] ${item.accion}
   Frecuencia: ${item.frecuencia}
   Prioridad: ${item.prioridad}
`).join('')}

=================================================================
REPARACIONES Y COSTOS
=================================================================

${analisis.analisis_costos.map((costo: any, idx: number) => `
${idx + 1}. ${costo.componente}
   Descripción: ${costo.descripcion}
   Costo Estimado: $${costo.costo_promedio.toLocaleString()} ${costo.moneda}
   Rango: $${costo.costo_estimado_min.toLocaleString()} - $${costo.costo_estimado_max.toLocaleString()}
   
   Tiendas Sugeridas: ${costo.tiendas_sugeridas.join(', ')}
   
   Enlaces de Búsqueda:
${costo.enlaces_busqueda.map((e: any) => `   - ${e.tienda}: ${e.url}`).join('\n')}
`).join('\n')}

COSTO TOTAL ESTIMADO: $${analisis.analisis_costos.reduce((sum: number, c: any) => sum + c.costo_promedio, 0).toLocaleString()} ${analisis.analisis_costos[0]?.moneda}

=================================================================
PRÓXIMA REVISIÓN: ${analisis.proxima_revision}
=================================================================

Fecha de Análisis: ${new Date(analisis.fecha_analisis).toLocaleString('es-ES')}

Generado por Sistema Experto de Mantenimiento - Inventario TI
`;

  return texto;
}
