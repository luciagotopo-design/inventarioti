'use client';

import { useState } from 'react';
import ImagenEquipoUploader from '@/components/equipos/ImagenEquipoUploader';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Plus, Sparkles, X } from 'lucide-react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onEquipoCreado?: () => void;
    categorias?: any[];
    estados?: any[];
    sedes?: any[];
}

export default function AgregarEquipoConIA({
    isOpen,
    onClose,
    onEquipoCreado,
    categorias = [],
    estados = [],
    sedes = []
}: Props) {
    const [paso, setPaso] = useState<1 | 2>(1);
    const [datosIA, setDatosIA] = useState<any>(null);
    const [formData, setFormData] = useState({
        serial: '',
        marca: '',
        modelo: '',
        cantidad: 1,
        categoriaId: '',
        estadoId: '',
        sedeId: '',
        ubicacionDetallada: '',
        responsable: '',
        observaciones: '',
        imagenes: [] as string[],
    });
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');



    const handleEquipoExtraido = (equipoData: any) => {
        console.log('📊 Datos extraídos de IA:', equipoData);
        setDatosIA(equipoData);

        // Autocompletar formulario con TODOS los datos de IA
        setFormData(prev => ({
            ...prev,
            marca: equipoData.marca || prev.marca,
            modelo: equipoData.modelo || prev.modelo,
            serial: equipoData.serial || prev.serial,
            cantidad: equipoData.cantidad || prev.cantidad, // 🆕 AUTO-DETECTAR CANTIDAD
            observaciones: equipoData.observaciones || prev.observaciones,
        }));

        // Auto-seleccionar categoría si coincide
        if (equipoData.categoria_sugerida) {
            const categoriaEncontrada = categorias.find(
                c => c.nombre.toLowerCase().includes(equipoData.categoria_sugerida.toLowerCase())
            );
            if (categoriaEncontrada) {
                setFormData(prev => ({ ...prev, categoriaId: categoriaEncontrada.id }));
                console.log('✅ Categoría auto-seleccionada:', categoriaEncontrada.nombre);
            } else {
                console.warn('⚠️ No se encontró categoría que coincida con:', equipoData.categoria_sugerida);
            }
        }

        // Auto-seleccionar estado si coincide
        if (equipoData.estado_sugerido) {
            const estadoEncontrado = estados.find(
                e => e.nombre.toLowerCase() === equipoData.estado_sugerido.toLowerCase()
            );
            if (estadoEncontrado) {
                setFormData(prev => ({ ...prev, estadoId: estadoEncontrado.id }));
                console.log('✅ Estado auto-seleccionado:', estadoEncontrado.nombre);
            } else {
                console.warn('⚠️ No se encontró estado que coincida con:', equipoData.estado_sugerido);
            }
        }

        // 🎯 AUTO-SELECCIONAR CALI como sede
        const sedeCali = sedes.find(
            s => s.nombre.toLowerCase().includes('cali')
        );
        if (sedeCali) {
            setFormData(prev => ({ ...prev, sedeId: sedeCali.id }));
            console.log('✅ Sede Cali seleccionada automáticamente');
        } else {
            console.warn('⚠️ No se encontró la sede "Cali" en la lista');
        }

        // Avanzar automáticamente al paso 2 si tenemos datos suficientes
        if (equipoData.marca && equipoData.modelo) {
            console.log('✨ Datos suficientes detectados, avanzando al paso 2...');
            setTimeout(() => setPaso(2), 800); // Pequeño delay para que el usuario vea el resultado
        }
    };



    const handleContinuar = () => {
        if (!datosIA) {
            setError('Primero analiza una imagen del equipo');
            return;
        }
        setPaso(2);
        setError('');
    };

    const handleGuardar = async () => {
        // Validaciones
        if (!formData.serial || !formData.marca || !formData.modelo) {
            setError('Serial, Marca y Modelo son campos obligatorios');
            return;
        }

        if (!formData.categoriaId || !formData.estadoId || !formData.sedeId) {
            setError('Categoría, Estado y Sede son campos obligatorios');
            return;
        }

        setGuardando(true);
        setError('');

        try {
            const response = await fetch('/api/inventario', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al crear el equipo');
            }

            const nuevoEquipo = await response.json();
            console.log('✅ Equipo creado:', nuevoEquipo);

            // Resetear formulario
            setFormData({
                serial: '',
                marca: '',
                modelo: '',
                cantidad: 1,
                categoriaId: '',
                estadoId: '',
                sedeId: '',
                ubicacionDetallada: '',
                responsable: '',
                observaciones: '',
                imagenes: [],
            });
            setDatosIA(null);
            setPaso(1);

            onEquipoCreado?.();
            onClose();

        } catch (err: any) {
            console.error('❌ Error al guardar:', err);
            setError(err.message || 'Error al guardar el equipo');
        } finally {
            setGuardando(false);
        }
    };

    const handleClose = () => {
        setFormData({
            serial: '',
            marca: '',
            modelo: '',
            cantidad: 1,
            categoriaId: '',
            estadoId: '',
            sedeId: '',
            ubicacionDetallada: '',
            responsable: '',
            observaciones: '',
            imagenes: [],
        });
        setDatosIA(null);
        setPaso(1);
        setError('');
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            Agregar Equipo con IA
                        </h2>
                        <p className="text-sm text-gray-500 font-normal">
                            {paso === 1 ? 'Paso 1: Analiza la imagen del equipo' : 'Paso 2: Completa la información'}
                        </p>
                    </div>
                </div>
            }
            size="xl"
            footer={
                <div className="flex justify-between w-full">
                    <Button variant="outline" onClick={handleClose}>
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                    </Button>

                    <div className="flex gap-3">
                        {paso === 2 && (
                            <Button variant="outline" onClick={() => setPaso(1)}>
                                ← Volver
                            </Button>
                        )}

                        {paso === 1 ? (
                            <Button
                                variant="primary"
                                onClick={handleContinuar}
                                disabled={!datosIA}
                            >
                                Continuar →
                            </Button>
                        ) : (
                            <Button
                                variant="primary"
                                onClick={handleGuardar}
                                disabled={guardando}
                            >
                                {guardando ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Agregar al Inventario
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            }
        >
            <div className="space-y-6">
                {/* Indicador de pasos */}
                <div className="flex items-center gap-4 pb-4 border-b">
                    <div className={`flex items-center gap-2 ${paso === 1 ? 'text-blue-600' : 'text-green-600'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${paso === 1 ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                            }`}>
                            {paso === 2 ? '✓' : '1'}
                        </div>
                        <span className="font-medium">Análisis IA</span>
                    </div>

                    <div className={`flex-1 h-1 rounded ${paso === 2 ? 'bg-green-200' : 'bg-gray-200'}`} />

                    <div className={`flex items-center gap-2 ${paso === 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${paso === 2 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
                            }`}>
                            2
                        </div>
                        <span className="font-medium">Datos del Equipo</span>
                    </div>
                </div>

                {/* Error global */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h4 className="font-semibold text-red-800">Error</h4>
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                {/* Paso 1: Análisis de Imagen */}
                {paso === 1 && (
                    <div>
                        <ImagenEquipoUploader
                            onEquipoExtraido={handleEquipoExtraido}
                        />

                        {datosIA && (
                            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <h4 className="font-bold text-green-800 mb-2">
                                            ✨ Análisis completado - Datos extraídos
                                        </h4>
                                        <p className="text-sm text-green-700">
                                            La IA ha identificado el equipo. Haz clic en <strong>"Continuar"</strong> para completar los datos.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Paso 2: Formulario */}
                {paso === 2 && (
                    <div className="space-y-6">
                        {/* Resumen de IA */}
                        {datosIA && (
                            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-blue-900 mb-2">
                                            📊 Información extraída por IA
                                        </h4>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            {datosIA.marca && (
                                                <div>
                                                    <span className="text-blue-600 font-medium">Marca:</span>
                                                    <p className="text-blue-900">{datosIA.marca}</p>
                                                </div>
                                            )}
                                            {datosIA.modelo && (
                                                <div>
                                                    <span className="text-blue-600 font-medium">Modelo:</span>
                                                    <p className="text-blue-900">{datosIA.modelo}</p>
                                                </div>
                                            )}
                                            {datosIA.categoria_sugerida && (
                                                <div>
                                                    <span className="text-blue-600 font-medium">Categoría sugerida:</span>
                                                    <p className="text-blue-900">{datosIA.categoria_sugerida}</p>
                                                </div>
                                            )}
                                            {datosIA.estado_sugerido && (
                                                <div>
                                                    <span className="text-blue-600 font-medium">Estado visual:</span>
                                                    <p className="text-blue-900">{datosIA.estado_sugerido}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Campos del formulario */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Serial / Etiqueta *"
                                value={formData.serial}
                                onChange={(e) => setFormData({ ...formData, serial: e.target.value })}
                                placeholder="Número de serie o etiqueta del equipo"
                                required
                            />

                            <Input
                                label="Cantidad"
                                type="number"
                                min="1"
                                value={formData.cantidad}
                                onChange={(e) => setFormData({ ...formData, cantidad: parseInt(e.target.value) })}
                            />

                            <Input
                                label="Marca *"
                                value={formData.marca}
                                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                                placeholder="Ej: Dell, HP, Lenovo"
                                required
                            />

                            <Input
                                label="Modelo *"
                                value={formData.modelo}
                                onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                                placeholder="Ej: Latitude 5420, ProDesk 600"
                                required
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Categoría *
                                </label>
                                <select
                                    value={formData.categoriaId}
                                    onChange={(e) => setFormData({ ...formData, categoriaId: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Seleccionar categoría</option>
                                    {categorias.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Estado *
                                </label>
                                <select
                                    value={formData.estadoId}
                                    onChange={(e) => setFormData({ ...formData, estadoId: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Seleccionar estado</option>
                                    {estados.map((est) => (
                                        <option key={est.id} value={est.id}>
                                            {est.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>


                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Sede *
                                    <span className="ml-2 text-xs text-green-600 font-normal">
                                        (Auto: Cali)
                                    </span>
                                </label>
                                <select
                                    value={formData.sedeId}
                                    onChange={(e) => setFormData({ ...formData, sedeId: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-green-50"
                                    required
                                >
                                    <option value="">Seleccionar sede</option>
                                    {sedes.map((sede) => (
                                        <option key={sede.id} value={sede.id}>
                                            {sede.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <Input
                                label="Ubicación Detallada"
                                value={formData.ubicacionDetallada}
                                onChange={(e) => setFormData({ ...formData, ubicacionDetallada: e.target.value })}
                                placeholder="Ej: Oficina 302, Piso 3"
                            />

                            <Input
                                label="Responsable (Opcional)"
                                value={formData.responsable}
                                onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                                placeholder="Nombre del responsable del equipo"
                            />
                        </div>

                        <Textarea
                            label="Observaciones"
                            value={formData.observaciones}
                            onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                            placeholder="Notas adicionales, observaciones o detalles relevantes..."
                            rows={4}
                        />
                    </div>
                )}
            </div>
        </Modal>
    );
}
