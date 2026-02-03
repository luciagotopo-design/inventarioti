// Página Equipos Críticos - Gestión de equipos con prioridad
'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Textarea from '@/components/ui/Textarea';
import FileUpload from '@/components/ui/FileUpload';
import EquipoDetalleModal from '@/components/modals/EquipoDetalleModal';
import { EquipoCritico, Prioridad } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { uploadMultipleFiles } from '@/lib/storage';
import { ImageIcon, Video, Eye, CheckCircle, AlertCircle, Clock, DollarSign } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

// TODO: Implement or import formatDate from the correct location
const formatDate = (date: string | Date) => {
  const d = new Date(date);
  return d.toLocaleDateString();
};

// Función para calcular días restantes hasta la fecha límite
const getDiasRestantes = (fechaLimite: string | Date | null | undefined): number | null => {
  if (!fechaLimite) return null;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0); // Reset time to start of day

  const limite = new Date(fechaLimite);
  limite.setHours(0, 0, 0, 0); // Reset time to start of day

  const diffTime = limite.getTime() - hoy.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

export default function EquiposCriticosPage() {
  const { showToast, ToastComponent } = useToast();
  const [equiposCriticos, setEquiposCriticos] = useState<EquipoCritico[]>([]);
  const [prioridades, setPrioridades] = useState<Prioridad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResueltos, setShowResueltos] = useState(false);
  const [prioridadFilter, setPrioridadFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sincronizando, setSincronizando] = useState(false);

  // Modal de resolución
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolvingEquipo, setResolvingEquipo] = useState<EquipoCritico | null>(null);
  const [notasResolucion, setNotasResolucion] = useState('');

  // Modal de evidencias
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [currentEquipo, setCurrentEquipo] = useState<EquipoCritico | null>(null);
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);
  const [evidenceDescription, setEvidenceDescription] = useState('');

  // Modal de detalles
  const [isDetalleModalOpen, setIsDetalleModalOpen] = useState(false);
  const [equipoDetalleSeleccionado, setEquipoDetalleSeleccionado] = useState<any>(null);

  // Modal de vista expandida de equipo crítico
  const [isExpandedViewOpen, setIsExpandedViewOpen] = useState(false);
  const [expandedEquipo, setExpandedEquipo] = useState<EquipoCritico | null>(null);

  useEffect(() => {
    fetchPrioridades();
  }, []);

  useEffect(() => {
    fetchEquiposCriticos();
  }, [showResueltos, prioridadFilter]);

  const fetchPrioridades = async () => {
    console.log('\n🔵 [EQUIPOS CRÍTICOS] Cargando prioridades...');
    try {
      const response = await fetch('/api/maestros');
      console.log(`📊 Maestros response status: ${response.status}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Prioridades cargadas: ${data.prioridades?.length}\n`);
      setPrioridades(data.prioridades);
    } catch (error) {
      console.error('❌ [ERROR] Error fetching prioridades:', error);
    }
  };

  const fetchEquiposCriticos = async () => {
    console.log('\n🔵 [EQUIPOS CRÍTICOS] Cargando equipos críticos...');
    const startTime = Date.now();

    try {
      setLoading(true);
      const params = new URLSearchParams({
        resueltos: showResueltos.toString(),
        ...(prioridadFilter && { prioridadId: prioridadFilter }),
      });

      console.log(`🔍 Consultando /api/equipos-criticos?${params}`);
      const response = await fetch(`/api/equipos-criticos?${params}`);
      console.log(`📊 Response status: ${response.status}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const duration = Date.now() - startTime;

      console.log(`✅ Equipos críticos cargados en ${duration}ms - Total: ${data.length}\n`);
      setEquiposCriticos(data);
    } catch (error) {
      console.error('❌ [ERROR] Error fetching equipos críticos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!resolvingEquipo) return;

    try {
      const response = await fetch(`/api/equipos-criticos/${resolvingEquipo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notasResolucion }),
      });

      if (response.ok) {
        showToast(
          `✅ Equipo marcado como resuelto exitosamente\n${resolvingEquipo.equipo?.marca} ${resolvingEquipo.equipo?.modelo}`,
          'success'
        );
        setIsResolveModalOpen(false);
        setNotasResolucion('');
        setResolvingEquipo(null);
        fetchEquiposCriticos();
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (error) {
      console.error('Error resolving equipo:', error);
      showToast('❌ Error al marcar el equipo como resuelto. Intenta nuevamente.', 'error');
    }
  };

  const handleSincronizar = async () => {
    console.log('\n🔄 [EQUIPOS CRÍTICOS] Iniciando sincronización manual...');
    setSincronizando(true);

    try {
      const response = await fetch('/api/equipos-criticos/sincronizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Sincronización completada:', result);

      showToast(
        `✅ Sincronización completada\n• Insertados: ${result.stats.insertados}\n• Actualizados: ${result.stats.actualizados}\n• Eliminados: ${result.stats.eliminados}\n• Total críticos: ${result.stats.totalCriticos}`,
        'success',
        6000
      );

      // Recargar la lista
      fetchEquiposCriticos();
    } catch (error) {
      console.error('❌ Error en sincronización:', error);
      showToast('❌ Error al sincronizar equipos críticos. Intenta nuevamente.', 'error');
    } finally {
      setSincronizando(false);
    }
  };

  const handleUploadEvidence = async () => {
    if (!currentEquipo || evidenceFiles.length === 0) {
      alert('Por favor selecciona al menos un archivo');
      return;
    }

    setUploadingEvidence(true);

    try {
      console.log(`📤 Subiendo ${evidenceFiles.length} archivos para equipo ${currentEquipo.id}...`);

      // Subir archivos al bucket
      const uploadResults = await uploadMultipleFiles(
        evidenceFiles,
        `equipos-criticos/${currentEquipo.id}`
      );

      // Filtrar solo los exitosos
      const successfulUploads = uploadResults.filter(r => r.success);

      if (successfulUploads.length === 0) {
        throw new Error('No se pudo subir ningún archivo');
      }

      // Obtener las URLs de los archivos subidos
      const fileUrls = successfulUploads.map(r => r.url).filter(Boolean) as string[];

      console.log(`✅ ${successfulUploads.length}/${evidenceFiles.length} archivos subidos`);
      console.log('📁 URLs:', fileUrls);

      // Actualizar el equipo crítico con las nuevas evidencias (SIN marcar como resuelto)
      const currentImages = Array.isArray(currentEquipo.imagenes) ? currentEquipo.imagenes : [];
      const updatedImages = [...currentImages, ...fileUrls];

      // Agregar descripción a las notas si se proporcionó
      const notasActualizadas = evidenceDescription
        ? `${currentEquipo.notasResolucion || ''}\n\n📎 ${new Date().toLocaleDateString('es-ES')}: ${evidenceDescription}`.trim()
        : currentEquipo.notasResolucion;

      const response = await fetch(`/api/equipos-criticos/${currentEquipo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imagenes: updatedImages,
          notasResolucion: notasActualizadas
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar el equipo crítico');
      }

      const updatedEquipo = await response.json();
      console.log('✅ Equipo actualizado:', updatedEquipo);
      console.log('📸 Imágenes guardadas:', updatedEquipo.imagenes);

      showToast(
        `✅ ${successfulUploads.length} evidencia(s) agregada(s) exitosamente\n${currentEquipo.equipo?.marca} ${currentEquipo.equipo?.modelo}`,
        'success'
      );

      // Cerrar modal y limpiar
      setIsEvidenceModalOpen(false);
      setCurrentEquipo(null);
      setEvidenceFiles([]);
      setEvidenceDescription('');

      // Recargar datos
      fetchEquiposCriticos();

    } catch (error) {
      console.error('❌ Error al subir evidencias:', error);
      showToast(
        '❌ Error al subir evidencias: ' + (error instanceof Error ? error.message : 'Error desconocido'),
        'error',
        6000
      );
    } finally {
      setUploadingEvidence(false);
    }
  };

  const handleExpandEquipo = (equipo: EquipoCritico) => {
    setExpandedEquipo(equipo);
    setIsExpandedViewOpen(true);
  };

  // Calcular estadísticas
  const stats = {
    total: equiposCriticos.length,
    pendientes: equiposCriticos.filter(eq => !eq.resuelto).length,
    resueltos: equiposCriticos.filter(eq => eq.resuelto).length,
    urgentes: equiposCriticos.filter(eq => {
      if (eq.resuelto) return false;
      const dias = getDiasRestantes(eq.fechaLimiteAccion);
      return dias !== null && dias <= 3;
    }).length,
    conEvidencias: equiposCriticos.filter(eq => eq.imagenes && eq.imagenes.length > 0).length,
  };

  // Filtrar equipos por búsqueda
  const equiposFiltrados = equiposCriticos.filter(eq => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      eq.equipo?.serial?.toLowerCase().includes(term) ||
      eq.equipo?.marca?.toLowerCase().includes(term) ||
      eq.equipo?.modelo?.toLowerCase().includes(term) ||
      eq.equipo?.sede?.nombre?.toLowerCase().includes(term) ||
      eq.equipo?.responsable?.toLowerCase().includes(term) ||
      eq.accionRequerida?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {ToastComponent}
      {/* Header mejorado con estadísticas */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-red-600" />
              Equipos Críticos
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              Gestión de equipos que requieren atención prioritaria
            </p>
            {/* Estado general del sistema */}
            <div className="mt-3 flex items-center gap-2">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${stats.urgentes > 0
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : stats.pendientes > 0
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-green-100 text-green-800 border border-green-200'
                }`}>
                <div className={`w-2 h-2 rounded-full ${stats.urgentes > 0 ? 'bg-red-500' : stats.pendientes > 0 ? 'bg-amber-500' : 'bg-green-500'
                  }`} />
                {stats.urgentes > 0
                  ? 'Atención Urgente Requerida'
                  : stats.pendientes > 0
                    ? 'Monitoreo Activo'
                    : 'Sistema Estable'}
              </div>
            </div>
          </div>

          <Button
            onClick={handleSincronizar}
            disabled={sincronizando}
            variant="primary"
            className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all"
          >
            {sincronizando ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="animate-pulse">Sincronizando...</span>
              </>
            ) : (
              <>
                <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Sincronizar desde Inventario
              </>
            )}
          </Button>
        </div>

        {/* Panel de estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="p-4 bg-linear-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer group">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">TOTAL</p>
            </div>
            <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
          </div>
          <div className="p-4 bg-linear-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer group">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-amber-600" />
              <p className="text-xs font-medium text-amber-600 uppercase tracking-wide">PENDIENTES</p>
            </div>
            <p className="text-2xl font-bold text-amber-900">{stats.pendientes}</p>
          </div>
          <div className="p-4 bg-linear-to-br from-red-50 to-red-100 border border-red-200 rounded-lg hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer group">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-xs font-medium text-red-600 uppercase tracking-wide">URGENTES</p>
            </div>
            <p className="text-2xl font-bold text-red-900">{stats.urgentes}</p>
          </div>
          <div className="p-4 bg-linear-to-br from-green-50 to-green-100 border border-green-200 rounded-lg hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer group">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-xs font-medium text-green-600 uppercase tracking-wide">RESUELTOS</p>
            </div>
            <p className="text-2xl font-bold text-green-900">{stats.resueltos}</p>
          </div>
          <div className="p-4 bg-linear-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer group">
            <div className="flex items-center gap-2 mb-1">
              <ImageIcon className="h-4 w-4 text-purple-600" />
              <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">CON EVIDENCIAS</p>
            </div>
            <p className="text-2xl font-bold text-purple-900">{stats.conEvidencias}</p>
          </div>
        </div>
      </div>

      {/* Filtros mejorados */}
      <Card className="mb-6">
        <div className="space-y-4">
          {/* Búsqueda */}
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Buscar por serial, marca, modelo, sede o responsable..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filtros de prioridad y estado */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Prioridad</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={!prioridadFilter ? 'primary' : 'outline'}
                  onClick={() => setPrioridadFilter('')}
                >
                  Todas
                </Button>
                {prioridades.map((prioridad) => (
                  <Button
                    key={prioridad.id}
                    size="sm"
                    variant={prioridadFilter === prioridad.id ? 'primary' : 'outline'}
                    onClick={() => setPrioridadFilter(prioridadFilter === prioridad.id ? '' : prioridad.id)}
                  >
                    <span
                      className="inline-block w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: prioridad.color }}
                    />
                    {prioridad.nombre}
                  </Button>
                ))}
              </div>
            </div>

            <div className="lg:border-l lg:border-gray-200 lg:pl-4">
              <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Estado</p>
              <label className="flex items-center gap-3 cursor-pointer bg-gray-50 px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={showResueltos}
                  onChange={(e) => setShowResueltos(e.target.checked)}
                  className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Mostrar equipos resueltos
                </span>
              </label>
            </div>
          </div>
        </div>
      </Card>

      {/* Lista de equipos críticos */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Cargando equipos críticos...</p>
        </div>
      ) : equiposFiltrados.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            {searchTerm ? (
              <>
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-gray-600 mb-2">No se encontraron resultados para "{searchTerm}"</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Limpiar búsqueda
                </button>
              </>
            ) : (
              <>
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-600">No hay equipos críticos {showResueltos ? 'resueltos' : 'pendientes'}</p>
              </>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Contador de resultados */}
          {searchTerm && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">{equiposFiltrados.length}</span>
              resultado{equiposFiltrados.length !== 1 ? 's' : ''} encontrado{equiposFiltrados.length !== 1 ? 's' : ''}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            {equiposFiltrados.map((equipoCritico, index) => {
              const diasRestantes = getDiasRestantes(equipoCritico.fechaLimiteAccion);
              const isUrgente = diasRestantes !== null && diasRestantes <= 7;

              return (
                <Card
                  key={equipoCritico.id}
                  className={`
                  cursor-pointer transition-all duration-200 hover:shadow-lg
                  ${isUrgente && !equipoCritico.resuelto
                      ? 'border-l-4 border-l-red-400 bg-white hover:bg-red-50/30'
                      : equipoCritico.resuelto
                        ? 'border-l-4 border-l-green-400 bg-white hover:bg-green-50/30'
                        : 'border-l-4 border-l-blue-400 bg-white hover:bg-blue-50/30'}
                `}
                  style={{
                    animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                  }}
                  onClick={() => handleExpandEquipo(equipoCritico)}
                >
                  <div className="flex items-center gap-4 p-2">
                    {/* Indicador de criticidad minimalista */}
                    <div className="shrink-0">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: equipoCritico.nivelPrioridad?.color }}
                      />
                    </div>

                    {/* Información esencial */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-semibold text-gray-900 truncate">
                            {equipoCritico.equipo?.marca} {equipoCritico.equipo?.modelo}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">
                            {equipoCritico.equipo?.sede?.nombre} • ID: {equipoCritico.id.slice(-8)}
                          </p>
                        </div>

                        {/* Estado y badge de criticidad */}
                        <div className="flex items-center gap-3 shrink-0">
                          <Badge
                            color={equipoCritico.nivelPrioridad?.color}
                            className="text-xs px-2 py-1"
                          >
                            {equipoCritico.nivelPrioridad?.nombre}
                          </Badge>

                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${equipoCritico.resuelto ? 'bg-green-500' :
                                isUrgente ? 'bg-red-500' : 'bg-amber-500'
                              }`} />
                            <span className="text-sm font-medium text-gray-700">
                              {equipoCritico.resuelto ? 'Resuelto' :
                                isUrgente ? 'Urgente' : 'Pendiente'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Icono de expandir */}
                    <div className="shrink-0 text-gray-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de resolución - MEJORADO */}
      <Modal
        isOpen={isResolveModalOpen}
        onClose={() => {
          setIsResolveModalOpen(false);
          setNotasResolucion('');
          setResolvingEquipo(null);
        }}
        title="✅ Marcar como Resuelto"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => {
              setIsResolveModalOpen(false);
              setNotasResolucion('');
              setResolvingEquipo(null);
            }}>
              Cancelar
            </Button>
            <Button
              variant="success"
              onClick={handleResolve}
              disabled={!notasResolucion.trim()}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirmar Resolución
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Advertencia importante */}
          <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-r">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900 mb-1">
                  Resolución del Equipo Crítico
                </p>
                <p className="text-sm text-green-800">
                  Al confirmar, este equipo será marcado como resuelto y se registrará la fecha de resolución.
                  Esta acción indica que el problema ha sido completamente solucionado.
                </p>
              </div>
            </div>
          </div>

          {/* Info del equipo */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Equipo a Resolver</p>
            <p className="font-bold text-gray-900 text-lg">
              {resolvingEquipo?.equipo?.marca} {resolvingEquipo?.equipo?.modelo}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Serial: <span className="font-medium">{resolvingEquipo?.equipo?.serial}</span>
            </p>
            {resolvingEquipo?.accionRequerida && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Problema reportado:</p>
                <p className="text-sm text-gray-700 italic">"{resolvingEquipo.accionRequerida}"</p>
              </div>
            )}
          </div>

          <Textarea
            label="Notas de Resolución *"
            placeholder="Describe detalladamente las acciones tomadas para resolver el problema, repuestos utilizados, tiempo invertido, etc..."
            value={notasResolucion}
            onChange={(e) => setNotasResolucion(e.target.value)}
            required
            rows={5}
          />

          {notasResolucion.trim().length > 0 && (
            <p className="text-xs text-gray-500">
              {notasResolucion.trim().length} caracteres
            </p>
          )}
        </div>
      </Modal>

      {/* Modal de Evidencias - MEJORADO */}
      <Modal
        isOpen={isEvidenceModalOpen}
        onClose={() => {
          setIsEvidenceModalOpen(false);
          setCurrentEquipo(null);
          setEvidenceFiles([]);
          setEvidenceDescription('');
        }}
        title="📸 Agregar Evidencias"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsEvidenceModalOpen(false);
                setCurrentEquipo(null);
                setEvidenceFiles([]);
                setEvidenceDescription('');
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleUploadEvidence}
              disabled={uploadingEvidence || evidenceFiles.length === 0}
            >
              {uploadingEvidence ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Subiendo...
                </>
              ) : (
                <>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Subir {evidenceFiles.length} archivo{evidenceFiles.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          {/* Info del equipo */}
          <div className="p-4 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <ImageIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-blue-900">
                  {currentEquipo?.equipo?.marca} {currentEquipo?.equipo?.modelo}
                </p>
                <p className="text-sm text-blue-700">
                  Serial: {currentEquipo?.equipo?.serial}
                </p>
                {currentEquipo?.imagenes && currentEquipo.imagenes.length > 0 && (
                  <p className="text-xs text-blue-600 mt-1">
                    Ya tiene {currentEquipo.imagenes.length} evidencia{currentEquipo.imagenes.length !== 1 ? 's' : ''} adjunta{currentEquipo.imagenes.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Nota informativa */}
          <div className="p-3 bg-amber-50 border-l-4 border-amber-400 rounded-r">
            <p className="text-sm text-amber-800">
              <strong>ℹ️ Nota:</strong> Agregar evidencias NO marcará el equipo como resuelto.
              Podrás marcarlo como resuelto posteriormente cuando el problema esté completamente solucionado.
            </p>
          </div>

          <Textarea
            label="Descripción de las evidencias"
            placeholder="Describe brevemente qué muestran estas evidencias... (opcional)"
            value={evidenceDescription}
            onChange={(e) => setEvidenceDescription(e.target.value)}
            rows={3}
          />

          <FileUpload
            onFilesSelected={setEvidenceFiles}
            maxFiles={10}
            accept="image/*,video/*"
            allowCamera={true}
            allowVideo={true}
            disabled={uploadingEvidence}
            label="Archivos"
            hint="📸 Toma fotos o 🎥 videos, o sube archivos existentes. Máximo 10 archivos de 50MB cada uno."
          />
        </div>
      </Modal>

      {/* Modal de Detalles del Equipo */}
      <EquipoDetalleModal
        isOpen={isDetalleModalOpen}
        onClose={() => {
          setIsDetalleModalOpen(false);
          setEquipoDetalleSeleccionado(null);
        }}
        equipo={equipoDetalleSeleccionado}
      />

      {/* Modal de Vista Expandida */}
      <Modal
        isOpen={isExpandedViewOpen}
        onClose={() => {
          setIsExpandedViewOpen(false);
          setExpandedEquipo(null);
        }}
        title="Detalles del Equipo Crítico"
        size="xl"
      >
        {expandedEquipo && (() => {
          const diasRestantes = getDiasRestantes(expandedEquipo.fechaLimiteAccion);
          const isUrgente = diasRestantes !== null && diasRestantes <= 7;

          return (
            <div className="space-y-6">
              {/* Header con información esencial */}
              <div className="flex flex-col md:flex-row gap-6">
                {/* Indicador de criticidad */}
                <div className="flex flex-col items-center justify-center p-6 bg-linear-to-br from-gray-50 to-gray-100 rounded-lg min-w-40 border border-gray-200 shadow-sm">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-3 shadow-lg ring-4 ring-white"
                    style={{ backgroundColor: expandedEquipo.nivelPrioridad?.color }}
                  >
                    {expandedEquipo.nivelPrioridad?.nombre === 'Alta' ? '🚨' :
                      expandedEquipo.nivelPrioridad?.nombre === 'Media' ? '⚠️' : '✅'}
                  </div>
                  <Badge
                    color={expandedEquipo.nivelPrioridad?.color}
                    className="font-semibold text-sm px-3 py-1"
                  >
                    {expandedEquipo.nivelPrioridad?.nombre}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-2 text-center font-medium">Criticidad</p>
                </div>

                {/* Información principal */}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {expandedEquipo.equipo?.marca} {expandedEquipo.equipo?.modelo}
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Serial: <span className="font-mono text-gray-800">{expandedEquipo.equipo?.serial}</span>
                  </p>

                  {/* Estado y badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge color={expandedEquipo.equipo?.estado?.color}>
                      {expandedEquipo.equipo?.estado?.nombre}
                    </Badge>
                    <Badge variant="info">
                      {expandedEquipo.equipo?.categoria?.nombre}
                    </Badge>
                    <Badge variant="default">
                      {expandedEquipo.equipo?.sede?.nombre}
                    </Badge>
                  </div>

                  {/* Estado operativo */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-3 h-3 rounded-full ${expandedEquipo.resuelto ? 'bg-green-500' :
                        isUrgente ? 'bg-red-500' : 'bg-amber-500'
                      }`} />
                    <span className="text-lg font-medium text-gray-700">
                      {expandedEquipo.resuelto ? 'Resuelto' :
                        isUrgente ? 'Urgente' : 'Pendiente'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Acción Requerida */}
              <div className="p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900 mb-2">ACCIÓN REQUERIDA</p>
                    <p className="text-base text-amber-800 leading-relaxed">
                      {expandedEquipo.accionRequerida}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información en cuadrícula */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {expandedEquipo.costoEstimado && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <DollarSign className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Costo Estimado</p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(expandedEquipo.costoEstimado)}
                      </p>
                    </div>
                  </div>
                )}

                {expandedEquipo.fechaLimiteAccion && (
                  <div className={`flex items-start gap-3 p-4 rounded-lg border ${isUrgente ? 'bg-red-50 border-red-300' : 'bg-blue-50 border-blue-200'
                    }`}>
                    <Clock className={`h-6 w-6 shrink-0 mt-0.5 ${isUrgente ? 'text-red-600' : 'text-blue-600'
                      }`} />
                    <div>
                      <p className={`text-sm font-medium mb-1 ${isUrgente ? 'text-red-800' : 'text-blue-800'
                        }`}>
                        Fecha Límite
                      </p>
                      <p className={`text-xl font-bold ${isUrgente ? 'text-red-900' : 'text-blue-900'
                        }`}>
                        {formatDate(expandedEquipo.fechaLimiteAccion)}
                      </p>
                      {diasRestantes !== null && !expandedEquipo.resuelto && (
                        <p className={`text-sm mt-2 font-medium ${isUrgente ? 'text-red-700' : 'text-blue-700'
                          }`}>
                          {diasRestantes > 0
                            ? `⏱️ ${diasRestantes} días restantes`
                            : '⚠️ VENCIDO'}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {expandedEquipo.equipo?.responsable && (
                  <div className="md:col-span-2 flex items-center gap-2 text-base text-gray-700">
                    <span className="font-medium">👤 Responsable:</span>
                    <span className="font-semibold text-gray-900">{expandedEquipo.equipo.responsable}</span>
                  </div>
                )}
              </div>

              {/* Información adicional */}
              <div className="text-sm text-gray-500 space-y-1 border-t border-gray-200 pt-4">
                <p>ID: <span className="font-mono">{expandedEquipo.id}</span></p>
                <p>Última actividad: {formatDate(expandedEquipo.fechaResolucion || new Date())}</p>
              </div>

              {/* Notas de resolución si está resuelto */}
              {expandedEquipo.resuelto && expandedEquipo.notasResolucion && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 font-medium mb-2">
                    Resuelto el {expandedEquipo.fechaResolucion ? formatDate(expandedEquipo.fechaResolucion) : 'Fecha desconocida'}
                  </p>
                  <p className="text-base text-green-700">{expandedEquipo.notasResolucion}</p>
                </div>
              )}

              {/* Evidencias */}
              {expandedEquipo.imagenes && expandedEquipo.imagenes.length > 0 && (
                <div className="p-4 bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-blue-600" />
                      Evidencias Adjuntas
                      <Badge variant="info" className="ml-2">
                        {expandedEquipo.imagenes.length} archivo{expandedEquipo.imagenes.length !== 1 ? 's' : ''}
                      </Badge>
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {expandedEquipo.imagenes.map((url: string, idx: number) => {
                      const isVideo = url.includes('.mp4') || url.includes('.mov') || url.includes('.webm');
                      return (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative aspect-square rounded-lg overflow-hidden border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all bg-white"
                        >
                          {isVideo ? (
                            <>
                              <video
                                src={url}
                                className="w-full h-full object-cover"
                                muted
                              />
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-linear-to-t from-black/70 via-black/40 to-transparent group-hover:from-black/80 transition-all">
                                <Video className="h-12 w-12 text-white mb-2" />
                                <span className="text-sm text-white font-medium">Video #{idx + 1}</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <img
                                src={url}
                                alt={`Evidencia ${idx + 1}`}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                              <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full font-medium">
                                #{idx + 1}
                              </div>
                            </>
                          )}
                          <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Eye className="h-8 w-8 text-white drop-shadow-lg" />
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEquipoDetalleSeleccionado(expandedEquipo.equipo);
                    setIsDetalleModalOpen(true);
                    setIsExpandedViewOpen(false);
                  }}
                  className="flex-1 sm:flex-none hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalles Técnicos
                </Button>

                {!expandedEquipo.resuelto && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCurrentEquipo(expandedEquipo);
                        setIsEvidenceModalOpen(true);
                        setIsExpandedViewOpen(false);
                      }}
                      className="flex-1 sm:flex-none border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 transition-colors"
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Agregar Evidencia ({expandedEquipo.imagenes?.length || 0})
                    </Button>
                    <Button
                      variant="success"
                      onClick={() => {
                        setResolvingEquipo(expandedEquipo);
                        setIsResolveModalOpen(true);
                        setIsExpandedViewOpen(false);
                      }}
                      className="flex-1 sm:flex-none shadow-sm hover:shadow-md transition-all"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Resolver
                    </Button>
                  </>
                )}
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
