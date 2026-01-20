// Componente para cargar imágenes y videos con soporte de cámara
'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, X, Image as ImageIcon, Video, Loader2 } from 'lucide-react';
import Button from './Button';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  accept?: string;
  allowCamera?: boolean;
  allowVideo?: boolean;
  disabled?: boolean;
  label?: string;
  hint?: string;
}

interface PreviewFile {
  file: File;
  preview: string;
  type: 'image' | 'video';
}

export default function FileUpload({
  onFilesSelected,
  maxFiles = 5,
  accept = 'image/*,video/*',
  allowCamera = true,
  allowVideo = true,
  disabled = false,
  label = 'Subir archivos',
  hint = 'Imágenes (JPG, PNG, WEBP) o videos (MP4, MOV). Máx 50MB por archivo.'
}: FileUploadProps) {
  const [previews, setPreviews] = useState<PreviewFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const remainingSlots = maxFiles - previews.length;
    const filesToAdd = fileArray.slice(0, remainingSlots);

    const newPreviews: PreviewFile[] = filesToAdd.map(file => {
      const isVideo = file.type.startsWith('video/');
      return {
        file,
        preview: URL.createObjectURL(file),
        type: isVideo ? 'video' : 'image'
      };
    });

    const updatedPreviews = [...previews, ...newPreviews];
    setPreviews(updatedPreviews);
    onFilesSelected(updatedPreviews.map(p => p.file));
  };

  const removeFile = (index: number) => {
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setPreviews(updatedPreviews);
    onFilesSelected(updatedPreviews.map(p => p.file));
    
    // Revoke object URL to free memory
    URL.revokeObjectURL(previews[index].preview);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {/* Área de carga */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-all
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 bg-white'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <div className="space-y-4">
          {/* Iconos */}
          <div className="flex justify-center gap-4">
            <ImageIcon className="h-12 w-12 text-gray-400" />
            {allowVideo && <Video className="h-12 w-12 text-gray-400" />}
          </div>

          {/* Texto */}
          <div>
            <p className="text-sm font-medium text-gray-700">
              Arrastra y suelta archivos aquí
            </p>
            <p className="text-xs text-gray-500 mt-1">o</p>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || previews.length >= maxFiles}
              className="w-full sm:w-auto"
            >
              <Upload className="h-4 w-4 mr-2" />
              Seleccionar archivos
            </Button>

            {allowCamera && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => cameraInputRef.current?.click()}
                disabled={disabled || previews.length >= maxFiles}
                className="w-full sm:w-auto"
              >
                <Camera className="h-4 w-4 mr-2" />
                Tomar foto/video
              </Button>
            )}
          </div>

          {/* Hint */}
          {hint && (
            <p className="text-xs text-gray-500 mt-2">
              {hint}
            </p>
          )}

          {/* Contador */}
          <p className="text-xs text-gray-600 font-medium">
            {previews.length} / {maxFiles} archivos seleccionados
          </p>
        </div>

        {/* Input oculto para archivos */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={(e) => handleFiles(e.target.files)}
          disabled={disabled}
          className="hidden"
        />

        {/* Input oculto para cámara */}
        {allowCamera && (
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*,video/*"
            capture="environment"
            onChange={(e) => handleFiles(e.target.files)}
            disabled={disabled}
            className="hidden"
          />
        )}
      </div>

      {/* Vista previa de archivos */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {previews.map((preview, index) => (
            <div
              key={index}
              className="relative group rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Preview */}
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {preview.type === 'video' ? (
                  <video
                    src={preview.preview}
                    className="w-full h-full object-cover"
                    muted
                  />
                ) : (
                  <img
                    src={preview.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Badge de tipo */}
              <div className="absolute top-2 left-2">
                <span className={`
                  px-2 py-1 text-xs font-medium rounded
                  ${preview.type === 'video' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-blue-500 text-white'
                  }
                `}>
                  {preview.type === 'video' ? (
                    <><Video className="h-3 w-3 inline mr-1" />Video</>
                  ) : (
                    <><ImageIcon className="h-3 w-3 inline mr-1" />Imagen</>
                  )}
                </span>
              </div>

              {/* Botón eliminar */}
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </button>

              {/* Nombre del archivo */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2">
                <p className="text-xs truncate">{preview.file.name}</p>
                <p className="text-xs text-gray-300">
                  {(preview.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
