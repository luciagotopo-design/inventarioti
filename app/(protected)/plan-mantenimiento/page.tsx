// Página Plan de Mantenimiento
'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Table from '@/components/ui/Table';
import FileUpload from '@/components/ui/FileUpload';
import { PlanMantenimiento, AccionMantenimiento, InventarioGeneral } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import { uploadMultipleFiles, deleteMultipleFiles } from '@/lib/storage';
import { ImageIcon, Video, X, Eye, ExternalLink } from 'lucide-react';

const estadosEjecucion = ['Pendiente', 'En Proceso', 'Completado', 'Cancelado'];

export default function PlanMantenimientoPage() {
  const [planes, setPlanes] = useState<PlanMantenimiento[]>([]);
  const [acciones, setAcciones] = useState<AccionMantenimiento[]>([]);
  const [equipos, setEquipos] = useState<InventarioGeneral[]>([]);
  const [loading, setLoading] = useState(true);
  const [estadoFilter, setEstadoFilter] = useState('');

  // Modal análisis IA
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [analyzingPlan, setAnalyzingPlan] = useState<PlanMantenimiento | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Modal nuevo plan
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newPlanData, setNewPlanData] = useState({
    idEquipo: '',
    accionId: '',
    descripcionTrabajo: '',
    responsableEjecucion: '',
    fechaProgramada: '',
    presupuesto: '',
    observaciones: '',
  });

  // Estados para imágenes
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // Modal de detalles
  const [isDetalleModalOpen, setIsDetalleModalOpen] = useState(false);
  const [planSeleccionado, setPlanSeleccionado] = useState<PlanMantenimiento | null>(null);
  const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);

  // Modal actualizar plan
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updatingPlan, setUpdatingPlan] = useState<PlanMantenimiento | null>(null);
  const [updateData, setUpdateData] = useState({
    estadoEjecucion: '',
    fechaEjecucion: '',
    costoReal: '',
    descripcionTrabajo: '',
    observaciones: '',
  });

  useEffect(() => {
    fetchMaestros();
  }, []);

  useEffect(() => {
    fetchPlanes();
  }, [estadoFilter]);

  const fetchMaestros = async () => {
    console.log('\n🔵 [PLAN MANTENIMIENTO] Cargando maestros y equipos críticos...');
    try {
      const [maestrosRes, equiposRes] = await Promise.all([
        fetch('/api/maestros'),
        fetch('/api/inventario?limit=1000'),
      ]);

      console.log(`📊 Maestros response: ${maestrosRes.status}, Equipos response: ${equiposRes.status}`);

      if (!maestrosRes.ok || !equiposRes.ok) {
        throw new Error('Error en las peticiones');
      }

      const maestrosData = await maestrosRes.json();
      const equiposData = await equiposRes.json();

      // Filtrar solo equipos críticos
      const equiposCriticos = equiposData.equipos.filter((e: InventarioGeneral) => e.esCritico);

      console.log(`✅ Acciones: ${maestrosData.acciones?.length}, Equipos críticos: ${equiposCriticos.length} de ${equiposData.equipos?.length} totales\n`);
      setAcciones(maestrosData.acciones);
      setEquipos(equiposCriticos);
    } catch (error) {
      console.error('❌ [ERROR] Error fetching maestros:', error);
    }
  };

  const fetchPlanes = async () => {
    console.log('\n🔵 [PLAN MANTENIMIENTO] Cargando planes...');
    const startTime = Date.now();

    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...(estadoFilter && { estadoEjecucion: estadoFilter }),
      });

      console.log(`🔍 Consultando /api/plan-mantenimiento?${params}`);
      const response = await fetch(`/api/plan-mantenimiento?${params}`);
      console.log(`📊 Response status: ${response.status}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const duration = Date.now() - startTime;

      console.log(`✅ Planes cargados en ${duration}ms - Total: ${data.length}\n`);
      setPlanes(data);
    } catch (error) {
      console.error('❌ [ERROR] Error fetching planes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setUploadingImages(true);

      // Subir nuevas imágenes si las hay
      let uploadedUrls: string[] = [];
      if (imageFiles.length > 0) {
        const equipoSerial = equipos.find(eq => eq.id === newPlanData.idEquipo)?.serial || 'plan';
        const folder = `mantenimiento/${equipoSerial}`;
        const results = await uploadMultipleFiles(imageFiles, folder);
        uploadedUrls = results.filter(r => r.success && r.url).map(r => r.url!);
      }

      const response = await fetch('/api/plan-mantenimiento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newPlanData,
          presupuesto: newPlanData.presupuesto ? parseFloat(newPlanData.presupuesto) : null,
          imagenes: uploadedUrls,
        }),
      });

      if (response.ok) {
        setIsNewModalOpen(false);
        resetNewPlanForm();
        fetchPlanes();
      }
    } catch (error) {
      console.error('Error creating plan:', error);
      alert('Error al crear plan: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    } finally {
      setUploadingImages(false);
    }
  };

  const handleUpdatePlan = async () => {
    if (!updatingPlan) return;

    try {
      setUploadingImages(true);

      // Subir nuevas imágenes si las hay
      let uploadedUrls: string[] = [...existingImages];
      if (imageFiles.length > 0) {
        const equipoSerial = updatingPlan.equipo?.serial || 'plan';
        const folder = `mantenimiento/${equipoSerial}`;
        const results = await uploadMultipleFiles(imageFiles, folder);
        const newUrls = results.filter(r => r.success && r.url).map(r => r.url!);
        uploadedUrls = [...uploadedUrls, ...newUrls];
      }

      const response = await fetch(`/api/plan-mantenimiento/${updatingPlan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updateData,
          costoReal: updateData.costoReal ? parseFloat(updateData.costoReal) : null,
          imagenes: uploadedUrls,
        }),
      });

      if (response.ok) {
        setIsUpdateModalOpen(false);
        setUpdatingPlan(null);
        resetUpdateForm();
        fetchPlanes();
      }
    } catch (error) {
      console.error('Error updating plan:', error);
      alert('Error al actualizar plan: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    } finally {
      setUploadingImages(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este plan?')) return;

    try {
      const response = await fetch(`/api/plan-mantenimiento/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchPlanes();
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  };

  const handleAnalyzePlan = async (plan: PlanMantenimiento) => {
    if (!plan.descripcionTrabajo) {
      alert('Debe agregar una descripción del trabajo para analizar');
      return;
    }

    // Verificar si Gemini está configurado
    const hasGeminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!hasGeminiKey) {
      alert('⚠️ Gemini AI no está configurado.\n\nPara usar esta función:\n1. Ve a https://aistudio.google.com/apikey\n2. Crea una API key\n3. Agrégala al archivo .env como GEMINI_API_KEY');
      return;
    }

    // Verificar si ya existe un análisis guardado
    if (plan.analisisIa) {
      if (confirm('Este plan ya tiene un análisis guardado. ¿Desea ver el existente?\n\n(OK para ver el guardado, Cancelar para generar uno nuevo)')) {
        setAnalyzingPlan(plan);
        setAnalysisResult(plan.analisisIa);
        setIsAnalysisModalOpen(true);
        setIsAnalyzing(false);
        return;
      }
    }

    setAnalyzingPlan(plan);
    setIsAnalysisModalOpen(true);
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const response = await fetch('/api/plan-mantenimiento/analizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          equipoData: {
            categoria: plan.equipo?.categoria?.nombre || 'N/A',
            marca: plan.equipo?.marca || '',
            modelo: plan.equipo?.modelo || '',
            serial: plan.equipo?.serial || '',
            estado: plan.equipo?.estado?.nombre || 'N/A',
            ubicacion: plan.equipo?.ubicacionDetallada || plan.equipo?.sede?.nombre || 'N/A',
          },
          accionMantenimiento: plan.accion?.nombre || '',
          descripcionTrabajo: plan.descripcionTrabajo,
          presupuesto: plan.presupuesto,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAnalysisResult(data.analisis);
      } else {
        alert('❌ Error al analizar:\n\n' + (data.error || 'Error desconocido') + '\n\n💡 Verifica tu API key de Gemini en https://aistudio.google.com/apikey');
      }
    } catch (error) {
      console.error('Error analyzing plan:', error);
      alert('Error al conectar con el servicio de análisis. Verifica la consola para más detalles.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetNewPlanForm = () => {
    setNewPlanData({
      idEquipo: '',
      accionId: '',
      descripcionTrabajo: '',
      responsableEjecucion: '',
      fechaProgramada: '',
      presupuesto: '',
      observaciones: '',
    });
    setImageFiles([]);
    setExistingImages([]);
  };

  const resetUpdateForm = () => {
    setUpdateData({
      estadoEjecucion: '',
      fechaEjecucion: '',
      costoReal: '',
      descripcionTrabajo: '',
      observaciones: '',
    });
    setImageFiles([]);
    setExistingImages([]);
  };

  const handleRemoveExistingImage = (url: string) => {
    setExistingImages(prev => prev.filter(img => img !== url));
  };

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, 'default' | 'warning' | 'success' | 'danger'> = {
      'Pendiente': 'default',
      'En Proceso': 'warning',
      'Completado': 'success',
      'Cancelado': 'danger',
    };
    return <Badge variant={variants[estado] || 'default'}>{estado}</Badge>;
  };

  const columns = [
    {
      key: 'equipo',
      header: 'Equipo',
      render: (plan: PlanMantenimiento) => (
        <div>
          <div className="font-medium text-gray-900">
            {plan.equipo?.marca} {plan.equipo?.modelo}
          </div>
          <div className="text-sm text-gray-500">
            {plan.equipo?.serial}
          </div>
        </div>
      ),
    },
    {
      key: 'accion',
      header: 'Acción',
      render: (plan: PlanMantenimiento) => plan.accion?.nombre || 'N/A',
    },
    {
      key: 'fechaProgramada',
      header: 'Fecha Programada',
      render: (plan: PlanMantenimiento) => formatDate(plan.fechaProgramada),
    },
    {
      key: 'responsable',
      header: 'Responsable',
      render: (plan: PlanMantenimiento) => plan.responsableEjecucion || 'N/A',
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (plan: PlanMantenimiento) => getEstadoBadge(plan.estadoEjecucion),
    },
    {
      key: 'presupuesto',
      header: 'Presupuesto',
      render: (plan: PlanMantenimiento) => formatCurrency(plan.presupuesto),
    },
    {
      key: 'costoReal',
      header: 'Costo Real',
      render: (plan: PlanMantenimiento) => (
        <span className={plan.costoReal && plan.presupuesto && plan.costoReal > plan.presupuesto ? 'text-red-600 font-bold' : ''}>
          {formatCurrency(plan.costoReal)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (plan: PlanMantenimiento) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setPlanSeleccionado(plan);
              setIsDetalleModalOpen(true);
            }}
            title="Ver detalles completos"
          >
            👁️ Ver
          </Button>
          {plan.descripcionTrabajo && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAnalyzePlan(plan)}
              title="Analizar con IA"
            >
              🤖 Analizar
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setUpdatingPlan(plan);
              setUpdateData({
                estadoEjecucion: plan.estadoEjecucion,
                fechaEjecucion: plan.fechaEjecucion
                  ? new Date(plan.fechaEjecucion).toISOString().split('T')[0]
                  : '',
                costoReal: plan.costoReal?.toString() || '',
                descripcionTrabajo: plan.descripcionTrabajo || '',
                observaciones: plan.observaciones || '',
              });
              setExistingImages(plan.imagenes || []);
              setImageFiles([]);
              setIsUpdateModalOpen(true);
            }}
          >
            Actualizar
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDeletePlan(plan.id)}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Plan de Mantenimiento</h1>
        <p className="text-gray-600 mt-2">Programación y seguimiento de mantenimientos</p>
      </div>

      {/* Filtros y acciones */}
      <Card className="mb-6">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={estadoFilter === '' ? 'primary' : 'outline'}
              onClick={() => setEstadoFilter('')}
            >
              Todos
            </Button>
            {estadosEjecucion.map((estado) => (
              <Button
                key={estado}
                size="sm"
                variant={estadoFilter === estado ? 'primary' : 'outline'}
                onClick={() => setEstadoFilter(estado)}
              >
                {estado}
              </Button>
            ))}
          </div>
          <Button onClick={() => setIsNewModalOpen(true)}>
            + Nuevo Plan
          </Button>
        </div>
      </Card>

      {/* Tabla */}
      <Card>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <Table data={planes} columns={columns} />
        )}
      </Card>

      {/* Modal nuevo plan */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => {
          setIsNewModalOpen(false);
          resetNewPlanForm();
        }}
        title="Nuevo Plan de Mantenimiento"
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => {
              setIsNewModalOpen(false);
              resetNewPlanForm();
            }}>
              Cancelar
            </Button>
            <Button onClick={handleCreatePlan}>
              Crear Plan
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreatePlan} className="space-y-4">
          <Select
            label="Equipo Crítico *"
            options={equipos.map(e => ({
              value: e.id,
              label: `${e.marca} ${e.modelo} - ${e.serial} ${e.estado?.nombre ? `(${e.estado.nombre})` : ''}`
            }))}
            value={newPlanData.idEquipo}
            onChange={(e) => setNewPlanData({ ...newPlanData, idEquipo: e.target.value })}
            required
          />

          <Select
            label="Tipo de Acción *"
            options={acciones.map(a => ({ value: a.id, label: a.nombre }))}
            value={newPlanData.accionId}
            onChange={(e) => setNewPlanData({ ...newPlanData, accionId: e.target.value })}
            required
          />

          <Textarea
            label="Descripción del Trabajo a Realizar *"
            placeholder="Detalla qué se hará al equipo: piezas a cambiar, procedimientos, etc."
            value={newPlanData.descripcionTrabajo}
            onChange={(e) => setNewPlanData({ ...newPlanData, descripcionTrabajo: e.target.value })}
            required
            rows={4}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Responsable de Ejecución"
              value={newPlanData.responsableEjecucion}
              onChange={(e) => setNewPlanData({ ...newPlanData, responsableEjecucion: e.target.value })}
            />

            <Input
              label="Fecha Programada *"
              type="date"
              value={newPlanData.fechaProgramada}
              onChange={(e) => setNewPlanData({ ...newPlanData, fechaProgramada: e.target.value })}
              required
            />

            <Input
              label="Presupuesto"
              type="number"
              step="0.01"
              value={newPlanData.presupuesto}
              onChange={(e) => setNewPlanData({ ...newPlanData, presupuesto: e.target.value })}
            />
          </div>

          <Textarea
            label="Observaciones"
            value={newPlanData.observaciones}
            onChange={(e) => setNewPlanData({ ...newPlanData, observaciones: e.target.value })}
          />

          {/* Upload de imágenes */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Evidencias del Plan (Opcional)
            </h4>

            <FileUpload
              onFilesSelected={setImageFiles}
              maxFiles={10}
              allowCamera={true}
              allowVideo={true}
              label="Agregar imágenes/videos"
              hint="Máximo 10 archivos, 50MB cada uno"
            />
          </div>
        </form>
      </Modal>

      {/* Modal actualizar plan */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setUpdatingPlan(null);
          resetUpdateForm();
        }}
        title="Actualizar Plan de Mantenimiento"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => {
              setIsUpdateModalOpen(false);
              setUpdatingPlan(null);
              resetUpdateForm();
            }}>
              Cancelar
            </Button>
            <Button onClick={handleUpdatePlan}>
              Actualizar
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {updatingPlan && (
            <div className="p-4 bg-gray-50 rounded-lg mb-4">
              <p className="font-medium">
                {updatingPlan.equipo?.marca} {updatingPlan.equipo?.modelo}
              </p>
              <p className="text-sm text-gray-600">
                {updatingPlan.accion?.nombre}
              </p>
            </div>
          )}

          <Select
            label="Estado de Ejecución *"
            options={estadosEjecucion.map(e => ({ value: e, label: e }))}
            value={updateData.estadoEjecucion}
            onChange={(e) => setUpdateData({ ...updateData, estadoEjecucion: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Fecha de Ejecución"
              type="date"
              value={updateData.fechaEjecucion}
              onChange={(e) => setUpdateData({ ...updateData, fechaEjecucion: e.target.value })}
            />

            <Input
              label="Costo Real"
              type="number"
              step="0.01"
              value={updateData.costoReal}
              onChange={(e) => setUpdateData({ ...updateData, costoReal: e.target.value })}
            />
          </div>

          <Textarea
            label="Descripción del Trabajo Realizado"
            placeholder="Actualiza qué se hizo al equipo, piezas cambiadas, problemas encontrados..."
            value={updateData.descripcionTrabajo}
            onChange={(e) => setUpdateData({ ...updateData, descripcionTrabajo: e.target.value })}
            rows={4}
          />

          <Textarea
            label="Observaciones"
            value={updateData.observaciones}
            onChange={(e) => setUpdateData({ ...updateData, observaciones: e.target.value })}
          />

          {/* Imágenes y evidencias */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Evidencias del Mantenimiento
            </h4>

            {/* Imágenes existentes */}
            {existingImages.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Imágenes actuales:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {existingImages.map((url: string, index: number) => {
                    const isVideo = url.match(/\.(mp4|mov|webm)$/i);
                    return (
                      <div key={index} className="relative group">
                        {isVideo ? (
                          <video
                            src={url}
                            className="w-full h-24 object-cover rounded-lg"
                            controls
                          />
                        ) : (
                          <img
                            src={url}
                            alt={`Imagen ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(url)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        {isVideo && (
                          <div className="absolute bottom-1 left-1 bg-blue-500 text-white px-1.5 py-0.5 rounded text-xs flex items-center gap-1">
                            <Video className="h-3 w-3" />
                            Video
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Upload de nuevas imágenes */}
            <FileUpload
              onFilesSelected={setImageFiles}
              maxFiles={10}
              allowCamera={true}
              allowVideo={true}
              label="Agregar nuevas evidencias"
              hint="Máximo 10 archivos, 50MB cada uno"
            />
          </div>
        </div>
      </Modal>

      {/* Modal análisis IA */}
      <Modal
        isOpen={isAnalysisModalOpen}
        onClose={() => {
          setIsAnalysisModalOpen(false);
          setAnalyzingPlan(null);
          setAnalysisResult(null);
        }}
        title="🤖 Análisis Inteligente de Mantenimiento"
        size="lg"
      >
        <div className="space-y-4">
          {analyzingPlan && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-bold text-lg text-blue-900 mb-2">
                {analyzingPlan.equipo?.marca} {analyzingPlan.equipo?.modelo}
              </h3>
              <p className="text-sm text-blue-700">
                <strong>Acción:</strong> {analyzingPlan.accion?.nombre}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                <strong>Trabajo Planificado:</strong> {analyzingPlan.descripcionTrabajo}
              </p>
            </div>
          )}

          {isAnalyzing && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Analizando trabajo de mantenimiento con IA...</p>
              <p className="text-sm text-gray-500 mt-2">Esto puede tomar unos segundos</p>
            </div>
          )}

          {!isAnalyzing && analysisResult && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {/* Evaluación del Plan */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-bold text-lg mb-2">📋 Evaluación del Plan</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Adecuación:</strong> <Badge variant={
                    analysisResult.evaluacion_plan?.adecuacion === 'EXCELENTE' ? 'success' :
                      analysisResult.evaluacion_plan?.adecuacion === 'BUENA' ? 'default' :
                        analysisResult.evaluacion_plan?.adecuacion === 'REGULAR' ? 'warning' : 'danger'
                  }>{analysisResult.evaluacion_plan?.adecuacion}</Badge></p>
                  <p className="mt-2">{analysisResult.evaluacion_plan?.observaciones}</p>
                </div>
              </div>

              {/* Procedimiento Optimizado */}
              {analysisResult.procedimiento_optimizado && analysisResult.procedimiento_optimizado.length > 0 && (
                <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                  <h4 className="font-bold text-lg mb-3 text-blue-900">🛠️ Procedimiento de Ejecución</h4>
                  <div className="space-y-3">
                    {analysisResult.procedimiento_optimizado.map((paso: any, idx: number) => (
                      <div key={idx} className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                          {paso.paso}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{paso.descripcion}</p>
                          {paso.herramientas_requeridas && paso.herramientas_requeridas.length > 0 && (
                            <p className="text-xs text-blue-700 mt-1">
                              🔧 Herramientas: {paso.herramientas_requeridas.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Componentes Necesarios */}
              {analysisResult.componentes_necesarios && analysisResult.componentes_necesarios.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-bold text-lg mb-2">🔧 Componentes y Repuestos</h4>
                  {analysisResult.componentes_necesarios.map((comp: any, idx: number) => (
                    <div key={idx} className="mb-4 p-3 bg-gray-50 rounded">
                      <p className="font-semibold">{comp.componente}</p>
                      <p className="text-sm text-gray-600">{comp.especificaciones}</p>
                      <p className="text-sm mt-1"><strong>Cantidad:</strong> {comp.cantidad}</p>
                      <p className="text-sm"><strong>Prioridad:</strong> <Badge variant={
                        comp.prioridad === 'CRÍTICO' ? 'danger' :
                          comp.prioridad === 'IMPORTANTE' ? 'warning' : 'default'
                      }>{comp.prioridad}</Badge></p>

                      {comp.opciones_compra && comp.opciones_compra.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-semibold">💰 Opciones de Compra:</p>
                          {comp.opciones_compra.map((opcion: any, oidx: number) => (
                            <div key={oidx} className="ml-4 mt-1 text-xs">
                              <p><strong>{opcion.tienda}:</strong> {formatCurrency(opcion.precio_total)} - {opcion.disponibilidad}</p>
                            </div>
                          ))}
                          {comp.recomendacion_compra && (
                            <p className="text-xs text-green-700 mt-1">✅ {comp.recomendacion_compra}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Análisis de Presupuesto */}
              {analysisResult.analisis_presupuesto && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-bold text-lg mb-2">💵 Análisis de Presupuesto</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Presupuesto Asignado:</strong> {formatCurrency(analysisResult.analisis_presupuesto.presupuesto_asignado)}</p>
                    <p><strong>Costo Total Estimado:</strong> {formatCurrency(analysisResult.analisis_presupuesto.costo_total_estimado)}</p>
                    <p><strong>Diferencia:</strong> <span className={analysisResult.analisis_presupuesto.diferencia >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(analysisResult.analisis_presupuesto.diferencia)}
                    </span></p>
                    <p><strong>Evaluación:</strong> <Badge variant={
                      analysisResult.analisis_presupuesto.evaluacion === 'SUFICIENTE' ? 'success' :
                        analysisResult.analisis_presupuesto.evaluacion === 'AJUSTADO' ? 'warning' : 'danger'
                    }>{analysisResult.analisis_presupuesto.evaluacion}</Badge></p>
                    <p className="mt-2">{analysisResult.analisis_presupuesto.justificacion}</p>
                  </div>
                </div>
              )}

              {/* Resumen Ejecutivo */}
              {analysisResult.resumen_ejecutivo && (
                <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                  <h4 className="font-bold text-lg mb-2 text-green-900">✅ Resumen y Recomendación</h4>
                  <p className="text-sm mb-2"><strong>Nivel de Aprobación:</strong> <Badge variant={
                    analysisResult.resumen_ejecutivo.nivel_aprobacion === 'APROBADO' ? 'success' :
                      analysisResult.resumen_ejecutivo.nivel_aprobacion === 'APROBADO_CON_CAMBIOS' ? 'warning' : 'danger'
                  }>{analysisResult.resumen_ejecutivo.nivel_aprobacion}</Badge></p>
                  <p className="text-sm"><strong>Tiempo Estimado:</strong> {analysisResult.resumen_ejecutivo.tiempo_total_estimado}</p>
                  <p className="mt-2 text-sm font-semibold text-green-800">{analysisResult.resumen_ejecutivo.recomendacion_final}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Modal de Detalles del Plan */}
      <Modal
        isOpen={isDetalleModalOpen}
        onClose={() => {
          setIsDetalleModalOpen(false);
          setPlanSeleccionado(null);
        }}
        title="Detalles del Plan de Mantenimiento"
        size="xl"
      >
        {planSeleccionado && (
          <div className="space-y-6">
            {/* Información del equipo */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Equipo</h3>
              <p className="text-lg font-bold text-gray-900">
                {planSeleccionado.equipo?.marca} {planSeleccionado.equipo?.modelo}
              </p>
              <p className="text-sm text-gray-600">Serial: {planSeleccionado.equipo?.serial}</p>
              <p className="text-sm text-gray-600">Categoría: {planSeleccionado.equipo?.categoria?.nombre}</p>
            </div>

            {/* Detalles del plan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Acción de Mantenimiento</p>
                <p className="text-base font-medium text-gray-900">{planSeleccionado.accion?.nombre}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estado</p>
                {getEstadoBadge(planSeleccionado.estadoEjecucion)}
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha Programada</p>
                <p className="text-base font-medium text-gray-900">{formatDate(planSeleccionado.fechaProgramada)}</p>
              </div>
              {planSeleccionado.fechaEjecucion && (
                <div>
                  <p className="text-sm text-gray-500">Fecha de Ejecución</p>
                  <p className="text-base font-medium text-gray-900">{formatDate(planSeleccionado.fechaEjecucion)}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Responsable</p>
                <p className="text-base font-medium text-gray-900">{planSeleccionado.responsableEjecucion || 'No asignado'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Presupuesto</p>
                <p className="text-base font-medium text-gray-900">{formatCurrency(planSeleccionado.presupuesto)}</p>
              </div>
              {planSeleccionado.costoReal && (
                <div>
                  <p className="text-sm text-gray-500">Costo Real</p>
                  <p className={`text-base font-medium ${planSeleccionado.costoReal > (planSeleccionado.presupuesto || 0) ? 'text-red-600' : 'text-green-600'
                    }`}>
                    {formatCurrency(planSeleccionado.costoReal)}
                  </p>
                </div>
              )}
            </div>

            {/* Descripción del trabajo */}
            {planSeleccionado.descripcionTrabajo && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Descripción del Trabajo</p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{planSeleccionado.descripcionTrabajo}</p>
                </div>
              </div>
            )}

            {/* Observaciones */}
            {planSeleccionado.observaciones && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Observaciones</p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{planSeleccionado.observaciones}</p>
                </div>
              </div>
            )}

            {/* Análisis IA Guardado */}
            {planSeleccionado.analisisIa && (
              <div className="mt-6 border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white rounded-xl overflow-hidden shadow-sm">
                <div className="bg-indigo-50/80 px-5 py-3 border-b border-indigo-100 flex items-center justify-between">
                  <h3 className="text-base font-bold text-indigo-900 flex items-center gap-2">
                    <span className="text-xl">🤖</span> Análisis Inteligente
                  </h3>
                  {planSeleccionado.analisisIa.evaluacionPlan?.adecuacion && (
                    <Badge variant={
                      planSeleccionado.analisisIa.evaluacionPlan.adecuacion === 'EXCELENTE' ? 'success' :
                        planSeleccionado.analisisIa.evaluacionPlan.adecuacion === 'BUENA' ? 'default' :
                          planSeleccionado.analisisIa.evaluacionPlan.adecuacion === 'REGULAR' ? 'warning' : 'danger'
                    }>
                      {planSeleccionado.analisisIa.evaluacionPlan.adecuacion}
                    </Badge>
                  )}
                </div>

                <div className="p-5 space-y-6">
                  {/* Observaciones */}
                  {planSeleccionado.analisisIa.evaluacionPlan?.observaciones && (
                    <div className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                      <p className="font-semibold text-gray-900 mb-1">Observación General:</p>
                      {planSeleccionado.analisisIa.evaluacionPlan.observaciones}
                    </div>
                  )}

                  {/* Procedimiento */}
                  {planSeleccionado.analisisIa.procedimientoOptimizado && planSeleccionado.analisisIa.procedimientoOptimizado.length > 0 && (
                    <div>
                      <h4 className="flex items-center gap-2 font-bold text-gray-900 text-sm mb-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        Procedimiento Optimizado
                      </h4>
                      <div className="relative border-l-2 border-blue-100 ml-2 space-y-4 py-1">
                        {planSeleccionado.analisisIa.procedimientoOptimizado.map((paso: any, idx: number) => (
                          <div key={idx} className="ml-6 relative">
                            <div className="absolute -left-[31px] top-1 w-6 h-6 rounded-full bg-white border-2 border-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shadow-sm">
                              {paso.paso}
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:border-blue-200 transition-colors">
                              <p className="text-sm text-gray-800 font-medium">{paso.descripcion}</p>
                              {paso.herramientasRequeridas && paso.herramientasRequeridas.length > 0 && (
                                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded inline-flex">
                                  <span className="font-semibold">🔧 Herramientas:</span>
                                  {paso.herramientasRequeridas.join(', ')}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Componentes */}
                  {planSeleccionado.analisisIa.componentesNecesarios && planSeleccionado.analisisIa.componentesNecesarios.length > 0 && (
                    <div>
                      <h4 className="flex items-center gap-2 font-bold text-gray-900 text-sm mb-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                        Repuestos y Costos
                      </h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {planSeleccionado.analisisIa.componentesNecesarios.map((comp: any, idx: number) => (
                          <div key={idx} className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2 border-b border-gray-100 pb-2">
                              <div>
                                <p className="font-bold text-sm text-gray-900 line-clamp-1" title={comp.componente}>
                                  {comp.componente}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">{comp.razonUso}</p>
                              </div>
                              <Badge variant={comp.prioridad === 'CRÍTICO' ? 'danger' : 'default'}>
                                {comp.prioridad}
                              </Badge>
                            </div>

                            {/* Opciones de Compra */}
                            <div className="space-y-2 mt-2">
                              {(!comp.opcionesCompra || comp.opcionesCompra.length === 0) ? (
                                <p className="text-xs text-gray-400 italic">No se encontraron opciones de compra online.</p>
                              ) : (
                                comp.opcionesCompra.map((opcion: any, oidx: number) => {
                                  // Verificar si hay URL válida (búsqueda o producto)
                                  const hasUrl = opcion.url && opcion.url !== 'N/A';
                                  // Usar 'a' si hay link, 'div' si no
                                  const Container = hasUrl ? 'a' : 'div';
                                  const props = hasUrl ? { href: opcion.url, target: '_blank', rel: 'noreferrer' } : {};

                                  return (
                                    <Container
                                      key={oidx}
                                      {...props}
                                      className={`flex justify-between items-center text-xs p-2 rounded transition-colors border border-transparent ${hasUrl
                                          ? 'bg-blue-50/50 hover:bg-blue-100 hover:border-blue-200 cursor-pointer group'
                                          : 'bg-gray-50'
                                        }`}
                                    >
                                      <span className={`font-medium ${hasUrl ? 'text-blue-900' : 'text-gray-700'}`}>
                                        {opcion.tienda}
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <span className={`font-bold ${hasUrl ? 'text-blue-700' : 'text-gray-900'}`}>
                                          {opcion.precioTotal ? formatCurrency(opcion.precioTotal) : 'N/A'}
                                        </span>
                                        {hasUrl && <ExternalLink className="w-3 h-3 text-blue-500 group-hover:text-blue-700" />}
                                      </div>
                                    </Container>
                                  );
                                })
                              )}
                            </div>

                            {comp.recomendacionCompra && (
                              <div className="mt-2 text-xs text-green-700 bg-green-50 p-2 rounded border border-green-100">
                                <span className="font-bold">💡 Tip:</span> {comp.recomendacionCompra}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Imágenes y Videos */}
            {planSeleccionado.imagenes && planSeleccionado.imagenes.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Evidencias ({planSeleccionado.imagenes.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {planSeleccionado.imagenes.map((url, index) => {
                    const isVideo = url.match(/\.(mp4|mov|webm)$/i);
                    return (
                      <div
                        key={index}
                        className="relative group cursor-pointer"
                        onClick={() => setImagenSeleccionada(url)}
                      >
                        {isVideo ? (
                          <div className="relative">
                            <video
                              src={url}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center">
                              <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                                <Video className="h-3 w-3" />
                                Video
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="relative">
                            <img
                              src={url}
                              alt={`Evidencia ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center">
                              <span className="text-white text-xs opacity-0 group-hover:opacity-100 bg-black bg-opacity-50 px-2 py-1 rounded">
                                Ver imagen
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal para imagen en tamaño completo */}
      {imagenSeleccionada && (
        <div
          className="fixed inset-0 z-60 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => setImagenSeleccionada(null)}
        >
          <button
            onClick={() => setImagenSeleccionada(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <X className="h-8 w-8" />
          </button>
          {imagenSeleccionada.match(/\.(mp4|mov|webm)$/i) ? (
            <video
              src={imagenSeleccionada}
              className="max-w-full max-h-full rounded-lg"
              controls
              autoPlay
            />
          ) : (
            <img
              src={imagenSeleccionada}
              alt="Evidencia completa"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}
    </div>
  );
}
