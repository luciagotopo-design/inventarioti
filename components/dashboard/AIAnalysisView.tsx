'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ReactMarkdown from 'react-markdown';
import { Sparkles, RefreshCw, AlertCircle, BrainCircuit, TrendingUp, Lightbulb } from 'lucide-react';

export default function AIAnalysisView() {
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalysis = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/dashboard/analizar');
            const data = await response.json();
            if (data.success) {
                setAnalysis(data.analisis);
            } else {
                throw new Error(data.error || 'Error al generar análisis');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Solo cargar si no hay análisis previo
        if (!analysis) {
            fetchAnalysis();
        }
    }, []);

    if (loading && !analysis) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-200 shadow-sm">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-400 blur-2xl opacity-20 animate-pulse"></div>
                    <LoadingSpinner size="lg" message="El Cerebro Digital está analizando tu inventario..." />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <Card className="border-rose-200 bg-rose-50/50">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-3 text-rose-600 mb-4">
                        <AlertCircle className="h-6 w-6" />
                        <span className="font-bold">Error en el motor de IA</span>
                    </div>
                    <p className="text-rose-700 mb-6">{error}</p>
                    <Button onClick={fetchAnalysis} variant="outline" className="border-rose-200 hover:bg-rose-100">
                        <RefreshCw className="mr-2 h-4 w-4" /> Reintentar Análisis
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 border-0 text-white shadow-xl shadow-blue-500/20">
                    <CardHeader className="pb-2">
                        <div className="p-2 bg-white/10 w-fit rounded-lg mb-2">
                            <BrainCircuit className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-xl">Motor de IA Activo</CardTitle>
                        <CardDescription className="text-blue-100">Análisis basado en Gemini 1.5 Flash</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-blue-50/80 leading-relaxed">
                            Nuestro algoritmo analiza patrones de falla, estados de criticidad y distribución de activos para optimizar tu operación TI.
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                        <div className="p-2 bg-emerald-50 w-fit rounded-lg mb-2 text-emerald-600">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-xl text-slate-800">Tendencias</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Detectamos anomalías en la salud de los dispositivos en tiempo real para predecir necesidades de mantenimiento.
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                        <div className="p-2 bg-amber-50 w-fit rounded-lg mb-2 text-amber-600">
                            <Lightbulb className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-xl text-slate-800">Optimización</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Recomendaciones inteligentes de presupuesto y renovación basadas en la antigüedad real de tus activos.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-0 shadow-2xl bg-white overflow-hidden group">
                <div className="p-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="h-5 w-5 text-blue-600 animate-pulse" />
                            <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                                Análisis Estratégico de IA
                            </CardTitle>
                        </div>
                        <CardDescription className="font-medium text-slate-500">
                            Consultoría automática generada el {new Date().toLocaleDateString()}
                        </CardDescription>
                    </div>
                    <Button
                        onClick={fetchAnalysis}
                        disabled={loading}
                        variant="outline"
                        size="sm"
                        className="rounded-full px-4 hover:bg-slate-50 border-slate-200"
                    >
                        {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2 text-blue-600" />}
                        Actualizar Análisis
                    </Button>
                </CardHeader>
                <CardContent className="pt-8">
                    {analysis ? (
                        <div className="prose prose-slate max-w-none 
              prose-headings:text-slate-900 prose-headings:font-bold prose-headings:tracking-tight
              prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-lg
              prose-strong:text-slate-900 prose-strong:font-bold
              prose-ul:list-disc prose-ul:pl-6
              prose-li:text-slate-600 prose-li:mb-2
              prose-h3:text-blue-700 prose-h3:border-l-4 prose-h3:border-blue-600 prose-h3:pl-4 prose-h3:mt-8 prose-h3:mb-4">
                            <ReactMarkdown>{analysis}</ReactMarkdown>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <BrainCircuit className="h-16 w-16 mb-4 opacity-20" />
                            <p>No hay análisis disponible en este momento.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
