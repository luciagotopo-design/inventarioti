// Modal para mostrar detalles completos de un equipo
'use client';

import React from 'react';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { InventarioGeneral } from '@/types';
import { 
  Calendar, 
  MapPin, 
  User, 
  Package, 
  FileText, 
  AlertTriangle,
  ImageIcon,
  Video,
  X
} from 'lucide-react';

interface EquipoDetalleModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipo: InventarioGeneral | null;
}

export default function EquipoDetalleModal({ isOpen, onClose, equipo }: EquipoDetalleModalProps) {
  if (!equipo) return null;

  const [imagenSeleccionada, setImagenSeleccionada] = React.useState<string | null>(null);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Detalles del Equipo"
        size="xl"
      >
        <div className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna izquierda */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Identificación
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div>
                    <span className="text-xs text-gray-500">Serial</span>
                    <p className="text-sm font-semibold text-gray-900">{equipo.serial}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Marca</span>
                    <p className="text-sm font-medium text-gray-900">{equipo.marca}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Modelo</span>
                    <p className="text-sm font-medium text-gray-900">{equipo.modelo}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Categoría</span>
                    <p className="text-sm font-medium text-gray-900">{equipo.categoria?.nombre || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Ubicación
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div>
                    <span className="text-xs text-gray-500">Sede</span>
                    <p className="text-sm font-medium text-gray-900">{equipo.sede?.nombre || 'N/A'}</p>
                  </div>
                  {equipo.ubicacionDetallada && (
                    <div>
                      <span className="text-xs text-gray-500">Ubicación Detallada</span>
                      <p className="text-sm font-medium text-gray-900">{equipo.ubicacionDetallada}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Columna derecha */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Estado y Prioridad
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Estado</span>
                    <Badge color={equipo.estado?.color}>
                      {equipo.estado?.nombre || 'N/A'}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Equipo Crítico</span>
                    {equipo.esCritico ? (
                      <Badge variant="danger">Sí</Badge>
                    ) : (
                      <Badge variant="default">No</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Responsable
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-900">
                    {equipo.responsable || 'No asignado'}
                  </p>
                </div>
              </div>

              {equipo.fechaRegistro && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Fecha de Registro
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(equipo.fechaRegistro).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Observaciones */}
          {equipo.observaciones && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Observaciones
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{equipo.observaciones}</p>
              </div>
            </div>
          )}

          {/* Imágenes y Videos */}
          {equipo.imagenes && equipo.imagenes.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Imágenes y Videos ({equipo.imagenes.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {equipo.imagenes.map((url, index) => {
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
                            alt={`Imagen ${index + 1}`}
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
      </Modal>

      {/* Modal para imagen en tamaño completo */}
      {imagenSeleccionada && (
        <div
          className="fixed inset-0 z-[60] bg-black bg-opacity-90 flex items-center justify-center p-4"
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
              alt="Imagen completa"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}
    </>
  );
}
