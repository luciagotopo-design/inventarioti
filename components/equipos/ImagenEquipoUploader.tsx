'use client';

import { useState, useRef } from 'react';
import { Upload, Camera, Loader2, CheckCircle, AlertCircle, X, Plus } from 'lucide-react';

interface AnalisisEquipo {
    identificacion_exitosa: boolean;
    confianza_analisis: string;
    equipo: {
        tipo: string;
        categoria_sugerida: string;
        marca: string;
        modelo: string;
        serial: string;
        etiqueta_activo: string;
        cantidad?: number; // 🆕 Campo de cantidad
    };
    estado_visual: {
        estado_general: string;
        descripcion: string;
        danos_visibles: string[];
        observaciones: string[];
    };
    caracteristicas_fisicas: {
        color_predominante: string;
        puertos_visibles: string[];
        tamano_estimado: string;
        otros_detalles: string[];
    };
    textos_identificados: {
        etiquetas: string[];
        numeros: string[];
        codigos: string[];
        otros: string[];
    };
    recomendaciones: {
        informacion_adicional_necesaria: string[];
        verificar_manualmente: string[];
        sugerencias_inventario: string[];
    };
    metadatos: {
        precisa_revision_manual: boolean;
        nivel_detalle_obtenido: string;
        imagen_clara: boolean;
    };
}

interface Props {
    onAnalisisCompletado?: (analisis: AnalisisEquipo) => void;
    onEquipoExtraido?: (equipoData: any) => void;
}

export default function ImagenEquipoUploader({ onAnalisisCompletado, onEquipoExtraido }: Props) {
    const [imagen, setImagen] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [analizando, setAnalizando] = useState(false);
    const [analisis, setAnalisis] = useState<AnalisisEquipo | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tipo
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setError('Formato no válido. Use JPG, PNG o WEBP');
            return;
        }

        // Validar tamaño (10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('La imagen es demasiado grande. Máximo 10MB');
            return;
        }

        setImagen(file);
        setError(null);
        setAnalisis(null);

        // Crear preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleAnalizar = async () => {
        if (!imagen) return;

        setAnalizando(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('image', imagen);

            const response = await fetch('/api/equipos/analizar-imagen', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al analizar la imagen');
            }

            if (data.success) {
                setAnalisis(data.analisis);
                onAnalisisCompletado?.(data.analisis);

                // Extraer datos del equipo para autocompletar formulario
                if (data.analisis.identificacion_exitosa) {
                    const equipoExtraido = {
                        marca: data.analisis.equipo.marca !== 'No identificado' ? data.analisis.equipo.marca : '',
                        modelo: data.analisis.equipo.modelo !== 'No identificado' ? data.analisis.equipo.modelo : '',
                        serial: data.analisis.equipo.serial !== 'No visible' ? data.analisis.equipo.serial : '',
                        cantidad: data.analisis.equipo.cantidad || 1, // 🆕 CANTIDAD DETECTADA POR IA
                        categoria_sugerida: data.analisis.equipo.categoria_sugerida,
                        estado_sugerido: data.analisis.estado_visual.estado_general,
                        observaciones: generarObservaciones(data.analisis),
                    };
                    onEquipoExtraido?.(equipoExtraido);
                }
            }
        } catch (err: any) {
            console.error('Error al analizar:', err);
            setError(err.message || 'Error al analizar la imagen');
        } finally {
            setAnalizando(false);
        }
    };

    const generarObservaciones = (analisis: AnalisisEquipo): string => {
        const obs: string[] = [];

        obs.push(`Estado visual: ${analisis.estado_visual.descripcion}`);

        if (analisis.estado_visual.danos_visibles.length > 0) {
            obs.push(`Daños: ${analisis.estado_visual.danos_visibles.join(', ')}`);
        }

        if (analisis.caracteristicas_fisicas.puertos_visibles.length > 0) {
            obs.push(`Puertos: ${analisis.caracteristicas_fisicas.puertos_visibles.join(', ')}`);
        }

        if (analisis.textos_identificados.etiquetas.length > 0) {
            obs.push(`Etiquetas identificadas: ${analisis.textos_identificados.etiquetas.join(', ')}`);
        }

        return obs.join('. ');
    };

    const limpiar = () => {
        setImagen(null);
        setPreviewUrl(null);
        setAnalisis(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const getConfianzaColor = (confianza: string) => {
        switch (confianza?.toLowerCase()) {
            case 'alta': return 'text-green-600 bg-green-50 border-green-200';
            case 'media': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'baja': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getEstadoColor = (estado: string) => {
        switch (estado?.toLowerCase()) {
            case 'excelente': return 'bg-green-100 text-green-800 border-green-300';
            case 'bueno': return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'regular': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'malo': return 'bg-orange-100 text-orange-800 border-orange-300';
            case 'crítico': return 'bg-red-100 text-red-800 border-red-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    return (
        <div className="space-y-6">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-all bg-gradient-to-br from-blue-50 to-indigo-50">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                    id="imagen-equipo-input"
                />

                {!previewUrl ? (
                    <label htmlFor="imagen-equipo-input" className="cursor-pointer block">
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-blue-100 rounded-full">
                                <Camera className="w-12 h-12 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-gray-700">
                                    Toma una foto o sube una imagen del equipo
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                    JPG, PNG o WEBP (máximo 10MB)
                                </p>
                            </div>
                            <button
                                type="button"
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                            >
                                <Upload className="w-5 h-5" />
                                Seleccionar Imagen
                            </button>
                        </div>
                    </label>
                ) : (
                    <div className="space-y-4">
                        <div className="relative inline-block">
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="max-w-full max-h-96 rounded-lg shadow-lg mx-auto"
                            />
                            <button
                                onClick={limpiar}
                                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                type="button"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {!analisis && (
                            <button
                                onClick={handleAnalizar}
                                disabled={analizando}
                                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                type="button"
                            >
                                {analizando ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Analizando con IA...
                                    </>
                                ) : (
                                    <>
                                        <Camera className="w-5 h-5" />
                                        Analizar Equipo con IA
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-red-800">Error</h4>
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                </div>
            )}

            {/* Resultados del Análisis */}
            {analisis && (
                <div className="space-y-4 animate-fadeIn">
                    {/* Header de Resultados */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-green-100 rounded-full">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-green-800 mb-2">
                                    ✨ Análisis IA Completado
                                </h3>
                                <div className="flex gap-3 flex-wrap">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getConfianzaColor(analisis.confianza_analisis)}`}>
                                        Confianza: {analisis.confianza_analisis}
                                    </span>
                                    {analisis.identificacion_exitosa ? (
                                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-300">
                                            ✓ Identificado
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">
                                            ⚠ Requiere revisión
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Información del Equipo */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                            🖥️ Información del Equipo
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoItem label="Tipo" value={analisis.equipo.tipo} />
                            <InfoItem label="Categoría" value={analisis.equipo.categoria_sugerida} />
                            <InfoItem label="Marca" value={analisis.equipo.marca} />
                            <InfoItem label="Modelo" value={analisis.equipo.modelo} />
                            <InfoItem label="Serial" value={analisis.equipo.serial} />
                            <InfoItem label="Etiqueta de Activo" value={analisis.equipo.etiqueta_activo} />
                        </div>
                    </div>

                    {/* Estado Visual */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                            🔍 Estado Visual
                        </h4>
                        <div className="space-y-3">
                            <div>
                                <span className={`px-4 py-2 rounded-lg text-sm font-bold border ${getEstadoColor(analisis.estado_visual.estado_general)}`}>
                                    {analisis.estado_visual.estado_general}
                                </span>
                            </div>
                            <p className="text-gray-700">{analisis.estado_visual.descripcion}</p>

                            {analisis.estado_visual.danos_visibles.length > 0 && (
                                <div>
                                    <p className="font-semibold text-sm text-gray-600 mb-2">⚠️ Daños Visibles:</p>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                        {analisis.estado_visual.danos_visibles.map((dano, idx) => (
                                            <li key={idx}>{dano}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {analisis.estado_visual.observaciones.length > 0 && (
                                <div>
                                    <p className="font-semibold text-sm text-gray-600 mb-2">📝 Observaciones:</p>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                        {analisis.estado_visual.observaciones.map((obs, idx) => (
                                            <li key={idx}>{obs}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Características Físicas */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                            📦 Características Físicas
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoItem label="Color" value={analisis.caracteristicas_fisicas.color_predominante} />
                            <InfoItem label="Tamaño Estimado" value={analisis.caracteristicas_fisicas.tamano_estimado} />

                            {analisis.caracteristicas_fisicas.puertos_visibles.length > 0 && (
                                <div className="md:col-span-2">
                                    <p className="font-semibold text-sm text-gray-600 mb-2">🔌 Puertos Visibles:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {analisis.caracteristicas_fisicas.puertos_visibles.map((puerto, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-200">
                                                {puerto}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Textos Identificados */}
                    {(analisis.textos_identificados.etiquetas.length > 0 ||
                        analisis.textos_identificados.numeros.length > 0 ||
                        analisis.textos_identificados.codigos.length > 0) && (
                            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    📋 Textos Identificados
                                </h4>
                                <div className="space-y-3">
                                    {analisis.textos_identificados.etiquetas.length > 0 && (
                                        <TextosLista titulo="Etiquetas" items={analisis.textos_identificados.etiquetas} />
                                    )}
                                    {analisis.textos_identificados.numeros.length > 0 && (
                                        <TextosLista titulo="Números" items={analisis.textos_identificados.numeros} />
                                    )}
                                    {analisis.textos_identificados.codigos.length > 0 && (
                                        <TextosLista titulo="Códigos" items={analisis.textos_identificados.codigos} />
                                    )}
                                </div>
                            </div>
                        )}

                    {/* Recomendaciones */}
                    {analisis.recomendaciones.informacion_adicional_necesaria.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                            <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-amber-800">
                                💡 Recomendaciones
                            </h4>
                            <div className="space-y-3">
                                {analisis.recomendaciones.informacion_adicional_necesaria.length > 0 && (
                                    <div>
                                        <p className="font-semibold text-sm text-amber-700 mb-2">
                                            ℹ️ Información Adicional Necesaria:
                                        </p>
                                        <ul className="list-disc list-inside space-y-1 text-sm text-amber-800">
                                            {analisis.recomendaciones.informacion_adicional_necesaria.map((info, idx) => (
                                                <li key={idx}>{info}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {analisis.recomendaciones.verificar_manualmente.length > 0 && (
                                    <div>
                                        <p className="font-semibold text-sm text-amber-700 mb-2">
                                            ⚠️ Verificar Manualmente:
                                        </p>
                                        <ul className="list-disc list-inside space-y-1 text-sm text-amber-800">
                                            {analisis.recomendaciones.verificar_manualmente.map((verif, idx) => (
                                                <li key={idx}>{verif}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Metadatos */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <div className="flex gap-4 text-sm text-gray-600">
                            <span>📊 Nivel de Detalle: <strong>{analisis.metadatos.nivel_detalle_obtenido}</strong></span>
                            <span>📸 Imagen Clara: <strong>{analisis.metadatos.imagen_clara ? 'Sí' : 'No'}</strong></span>
                            {analisis.metadatos.precisa_revision_manual && (
                                <span className="text-amber-600 font-semibold">⚠️ Requiere Revisión Manual</span>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Componentes auxiliares
function InfoItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-sm font-semibold text-gray-600">{label}</p>
            <p className="text-gray-800 mt-1">{value || 'No disponible'}</p>
        </div>
    );
}

function TextosLista({ titulo, items }: { titulo: string; items: string[] }) {
    return (
        <div>
            <p className="font-semibold text-sm text-gray-600 mb-2">{titulo}:</p>
            <div className="flex flex-wrap gap-2">
                {items.map((item, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm border border-gray-300 font-mono">
                        {item}
                    </span>
                ))}
            </div>
        </div>
    );
}
