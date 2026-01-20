// Página Inventario General - CRUD completo
'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Table from '@/components/ui/Table';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Textarea from '@/components/ui/Textarea';
import FileUpload from '@/components/ui/FileUpload';
import AnalisisMantenimientoModal from '@/components/modals/AnalisisMantenimientoModal';
import EquipoDetalleModal from '@/components/modals/EquipoDetalleModal';
import { InventarioGeneral, Categoria, Estado, Sede } from '@/types';
import { uploadMultipleFiles, deleteMultipleFiles } from '@/lib/storage';
import { ImageIcon, Video, X } from 'lucide-react';

interface Maestros {
  categorias: Categoria[];
  estados: Estado[];
  sedes: Sede[];
}

export default function InventarioPage() {
  const [equipos, setEquipos] = useState<InventarioGeneral[]>([]);
  const [maestros, setMaestros] = useState<Maestros>({ categorias: [], estados: [], sedes: [] });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEquipo, setEditingEquipo] = useState<InventarioGeneral | null>(null);
  const [uploadingExcel, setUploadingExcel] = useState(false);
  const [analisisEquipoId, setAnalisisEquipoId] = useState<string | null>(null);
  const [analisisSerial, setAnalisisSerial] = useState<string>('');
  
  // Estado para modal de detalles
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<InventarioGeneral | null>(null);
  const [isDetalleModalOpen, setIsDetalleModalOpen] = useState(false);
  
  // Estado para imágenes
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  
  // Filtros y búsqueda
  const [search, setSearch] = useState('');
  const [sedeFilter, setSedeFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('');
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form data
  const [formData, setFormData] = useState({
    serial: '',
    marca: '',
    modelo: '',
    categoriaId: '',
    estadoId: '',
    sedeId: '',
    ubicacionDetallada: '',
    responsable: '',
    observaciones: '',
    esCritico: false,
    imagenes: [] as string[],
  });

  useEffect(() => {
    fetchMaestros();
  }, []);

  useEffect(() => {
    fetchEquipos();
  }, [currentPage, search, sedeFilter, estadoFilter, categoriaFilter]);

  const fetchMaestros = async () => {
    console.log('\n\ud83d\udd35 [INVENTARIO] Cargando datos maestros...');
    try {
      const response = await fetch('/api/maestros');
      console.log(`\ud83d\udcca Maestros response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`\u2705 Maestros cargados - Categor\u00edas: ${data.categorias?.length}, Estados: ${data.estados?.length}, Sedes: ${data.sedes?.length}\n`);
      setMaestros(data);
    } catch (error) {
      console.error('\u274c [ERROR] Error fetching maestros:', error);
    }
  };

  const fetchEquipos = async () => {
    console.log('\n\ud83d\udd35 [INVENTARIO] Cargando equipos...');
    const startTime = Date.now();
    
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(search && { search }),
        ...(sedeFilter && { sedeId: sedeFilter }),
        ...(estadoFilter && { estadoId: estadoFilter }),
        ...(categoriaFilter && { categoriaId: categoriaFilter }),
      });

      console.log(`\ud83d\udd0d Consultando /api/inventario?${params}`);
      const response = await fetch(`/api/inventario?${params}`);
      console.log(`\ud83d\udcca Response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      const duration = Date.now() - startTime;
      
      console.log(`\u2705 Equipos cargados en ${duration}ms - ${data.equipos?.length} equipos de ${data.total} totales\n`);
      setEquipos(data.equipos);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('\u274c [ERROR] Error fetching equipos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setUploadingImages(true);
      
      // Subir nuevas imágenes si las hay
      let uploadedUrls: string[] = [...existingImages];
      if (imageFiles.length > 0) {
        const folder = formData.serial || 'temp';
        const results = await uploadMultipleFiles(imageFiles, folder);
        uploadedUrls = [
          ...uploadedUrls,
          ...results.map(r => typeof r === 'string' ? r : r.url).filter((url): url is string => typeof url === 'string' && url !== undefined)
        ];
      }
      
      // Agregar URLs de imágenes al formData
      const dataToSubmit = {
        ...formData,
        imagenes: uploadedUrls,
      };
      
      const url = editingEquipo 
        ? `/api/inventario/${editingEquipo.id}`
        : '/api/inventario';
      
      const method = editingEquipo ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSubmit),
      });

      if (response.ok) {
        setIsModalOpen(false);
        resetForm();
        fetchEquipos();
      } else {
        const error = await response.json();
        alert(error.error || 'Error al guardar equipo');
      }
    } catch (error) {
      console.error('Error saving equipo:', error);
      alert('Error al guardar equipo: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    } finally {
      setUploadingImages(false);
    }
  };

  const handleEdit = (equipo: InventarioGeneral) => {
    setEditingEquipo(equipo);
    setFormData({
      serial: equipo.serial,
      marca: equipo.marca,
      modelo: equipo.modelo,
      categoriaId: equipo.categoriaId,
      estadoId: equipo.estadoId,
      sedeId: equipo.sedeId,
      ubicacionDetallada: equipo.ubicacionDetallada || '',
      responsable: equipo.responsable || '',
      observaciones: equipo.observaciones || '',
      esCritico: equipo.esCritico,
      imagenes: equipo.imagenes || [],
    });
    setExistingImages(equipo.imagenes || []);
    setImageFiles([]);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este equipo?')) return;

    try {
      const response = await fetch(`/api/inventario/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchEquipos();
      }
    } catch (error) {
      console.error('Error deleting equipo:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      serial: '',
      marca: '',
      modelo: '',
      categoriaId: '',
      estadoId: '',
      sedeId: '',
      ubicacionDetallada: '',
      responsable: '',
      observaciones: '',
      esCritico: false,
      imagenes: [],
    });
    setEditingEquipo(null);
    setImageFiles([]);
    setExistingImages([]);
  };

  const handleRemoveExistingImage = (url: string) => {
    setExistingImages(prev => prev.filter(img => img !== url));
  };

  const handleVerDetalles = (equipo: InventarioGeneral) => {
    setEquipoSeleccionado(equipo);
    setIsDetalleModalOpen(true);
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingExcel(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/inventario/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (response.ok) {
        let mensaje = `✅ Importación exitosa!\n\n`;
        mensaje += `📊 Total procesado: ${result.total}\n`;
        mensaje += `➕ Creados: ${result.creados}\n`;
        mensaje += `✏️ Actualizados: ${result.actualizados}\n`;
        mensaje += `❌ Errores: ${result.errores}`;
        
        if (result.detalles && result.detalles.length > 0) {
          mensaje += '\n\n📝 Detalles:\n';
          mensaje += result.detalles.map((d: any) => 
            d.error 
              ? `❌ Fila ${d.fila} (${d.serial}): ${d.error}` 
              : `✅ Fila ${d.fila} (${d.serial}): ${d.estado}`
          ).join('\n');
        }
        
        alert(mensaje);
        fetchEquipos();
        e.target.value = ''; // Limpiar input
      } else {
        alert(`❌ Error: ${result.error}\n\n${result.details || ''}`);
      }
    } catch (error) {
      console.error('Error uploading Excel:', error);
      alert('Error al subir el archivo');
    } finally {
      setUploadingExcel(false);
      e.target.value = '';
    }
  };

  const columns = [
    {
      key: 'serial',
      header: 'Serial',
      render: (equipo: InventarioGeneral) => (
        <span className="font-medium text-gray-900">{equipo.serial}</span>
      ),
    },
    {
      key: 'categoria',
      header: 'Categoría',
      render: (equipo: InventarioGeneral) => equipo.categoria?.nombre || 'N/A',
    },
    {
      key: 'marca',
      header: 'Marca/Modelo',
      render: (equipo: InventarioGeneral) => (
        <div>
          <div className="font-medium text-gray-900">{equipo.marca}</div>
          <div className="text-sm text-gray-500">{equipo.modelo}</div>
        </div>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (equipo: InventarioGeneral) => (
        <Badge color={equipo.estado?.color}>
          {equipo.estado?.nombre || 'N/A'}
        </Badge>
      ),
    },
    {
      key: 'sede',
      header: 'Sede',
      render: (equipo: InventarioGeneral) => equipo.sede?.nombre || 'N/A',
    },
    {
      key: 'responsable',
      header: 'Responsable',
      render: (equipo: InventarioGeneral) => equipo.responsable || 'N/A',
    },
    {
      key: 'esCritico',
      header: 'Crítico',
      render: (equipo: InventarioGeneral) => (
        equipo.esCritico ? (
          <Badge variant="danger">Sí</Badge>
        ) : (
          <Badge variant="default">No</Badge>
        )
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (equipo: InventarioGeneral) => (
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleVerDetalles(equipo)}
            title="Ver detalles completos"
          >
            👁️ Ver
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => {
              setAnalisisEquipoId(equipo.id);
              setAnalisisSerial(equipo.serial);
            }}
            title="Análisis Inteligente de Mantenimiento"
          >
            🔍 Analizar
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleEdit(equipo)}>
            Editar
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(equipo.id)}>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Inventario General</h1>
          <p className="text-lg text-gray-700 font-medium">Gestión completa del inventario de equipos</p>
        </div>

        {/* Filtros y acciones */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Input
              placeholder="Buscar por serial, marca..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              label="Búsqueda"
            />
            <Select
              options={maestros.sedes.map(s => ({ value: s.id, label: s.nombre }))}
              value={sedeFilter}
              onChange={(e) => setSedeFilter(e.target.value)}
              label="Sede"
            />
            <Select
              options={maestros.estados.map(e => ({ value: e.id, label: e.nombre }))}
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              label="Estado"
            />
            <Select
              options={maestros.categorias.map(c => ({ value: c.id, label: c.nombre }))}
              value={categoriaFilter}
              onChange={(e) => setCategoriaFilter(e.target.value)}
              label="Categoría"
            />
          </div>
          <div className="flex justify-between items-center">
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setSearch('');
                  setSedeFilter('');
                  setEstadoFilter('');
                  setCategoriaFilter('');
                }}
              >
                Limpiar Filtros
              </Button>
              
              <label className="inline-flex items-center">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleExcelUpload}
                  disabled={uploadingExcel}
                  className="hidden"
                  id="excel-upload"
                />
                <Button
                  variant="outline"
                  onClick={() => (document.getElementById('excel-upload') as HTMLInputElement)?.click()}
                  disabled={uploadingExcel}
                >
                  {uploadingExcel ? '⏳ Importando...' : '📊 Importar Excel'}
                </Button>
              </label>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
              + Nuevo Equipo
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
            <>
              <Table data={equipos} columns={columns} />
              
              {/* Paginación */}
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Página {currentPage} de {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>

        {/* Modal de formulario */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title={editingEquipo ? 'Editar Equipo' : 'Nuevo Equipo'}
          size="lg"
          footer={
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={uploadingImages}>
                {uploadingImages ? 'Subiendo...' : (editingEquipo ? 'Actualizar' : 'Crear')}
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Número de Serie/Etiqueta *"
                value={formData.serial}
                onChange={(e) => setFormData({ ...formData, serial: e.target.value })}
                placeholder="eda3IJASD"
                required
              />
              <Input
                label="Marca *"
                value={formData.marca}
                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                placeholder="edaDD"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Modelo *"
                value={formData.modelo}
                onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                required
              />
              <Select
                label="Categoría *"
                options={maestros.categorias.map(c => ({ value: c.id, label: c.nombre }))}
                value={formData.categoriaId}
                onChange={(e) => setFormData({ ...formData, categoriaId: e.target.value })}
                required
              />
            </div>

            {/* Ubicación y estado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Estado *"
                options={maestros.estados.map(e => ({ value: e.id, label: e.nombre }))}
                value={formData.estadoId}
                onChange={(e) => setFormData({ ...formData, estadoId: e.target.value })}
                required
              />
              <Select
                label="Sede *"
                options={maestros.sedes.map(s => ({ value: s.id, label: s.nombre }))}
                value={formData.sedeId}
                onChange={(e) => setFormData({ ...formData, sedeId: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Ubicación Detallada"
                value={formData.ubicacionDetallada}
                onChange={(e) => setFormData({ ...formData, ubicacionDetallada: e.target.value })}
              />
              <Input
                label="Responsable"
                value={formData.responsable}
                onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
              />
            </div>

            {/* Mantenimiento */}
            <div className="grid grid-cols-1">
              <Textarea
                label="Observaciones"
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                rows={4}
              />
            </div>

            {/* Imágenes y evidencias */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Imágenes y Videos del Equipo
              </h4>
              
              {/* Imágenes existentes */}
              {existingImages.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Imágenes actuales:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {existingImages.map((url, index) => {
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
                label="Agregar nuevas imágenes/videos"
                hint="Máximo 10 archivos, 50MB cada uno"
              />
            </div>

            {/* Equipo crítico */}
            <div className="flex items-center pt-2">
              <input
                type="checkbox"
                id="esCritico"
                checked={formData.esCritico}
                onChange={(e) => setFormData({ ...formData, esCritico: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="esCritico" className="ml-2 text-sm font-medium text-gray-700">
                Marcar como equipo crítico
              </label>
            </div>
          </form>
        </Modal>

        {/* Modal de Análisis Inteligente */}
        <AnalisisMantenimientoModal
          isOpen={!!analisisEquipoId}
          onClose={() => {
            setAnalisisEquipoId(null);
            setAnalisisSerial('');
          }}
          equipoId={analisisEquipoId || ''}
          equipoSerial={analisisSerial}
        />

        {/* Modal de Detalles del Equipo */}
        <EquipoDetalleModal
          isOpen={isDetalleModalOpen}
          onClose={() => {
            setIsDetalleModalOpen(false);
            setEquipoSeleccionado(null);
          }}
          equipo={equipoSeleccionado}
        />
      </div>
  );
}
