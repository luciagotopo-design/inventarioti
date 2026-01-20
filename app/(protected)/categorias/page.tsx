// Página Gestión de Categorías
'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Table from '@/components/ui/Table';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Textarea from '@/components/ui/Textarea';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorAlert from '@/components/ui/ErrorAlert';
import { Categoria } from '@/types';

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
  });

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categorias');
      
      if (!response.ok) throw new Error('Error al cargar categorías');
      
      const data = await response.json();
      setCategorias(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching categorias:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingCategoria 
        ? `/api/categorias/${editingCategoria.id}`
        : '/api/categorias';
      
      const method = editingCategoria ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsModalOpen(false);
        resetForm();
        fetchCategorias();
      } else {
        const error = await response.json();
        alert(error.error || 'Error al guardar categoría');
      }
    } catch (error) {
      console.error('Error saving categoria:', error);
      alert('Error al guardar categoría');
    }
  };

  const handleEdit = (categoria: Categoria) => {
    setEditingCategoria(categoria);
    setFormData({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;

    try {
      const response = await fetch(`/api/categorias/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchCategorias();
      } else {
        const error = await response.json();
        alert(error.error || 'Error al eliminar categoría');
      }
    } catch (error) {
      console.error('Error deleting categoria:', error);
      alert('Error al eliminar categoría');
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
    });
    setEditingCategoria(null);
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  if (loading) {
    return <LoadingSpinner fullScreen size="lg" message="Cargando categorías..." />;
  }

  if (error) {
    return (
      <ErrorAlert
        title="Error al cargar categorías"
        message={error}
        onRetry={fetchCategorias}
      />
    );
  }

  const columns = [
    {
      key: 'nombre',
      header: 'Nombre',
      render: (categoria: Categoria) => (
        <span className="font-bold text-gray-900 text-base">{categoria.nombre}</span>
      ),
    },
    {
      key: 'descripcion',
      header: 'Descripción',
      render: (categoria: Categoria) => (
        <span className="text-gray-700 text-sm">{categoria.descripcion || 'N/A'}</span>
      ),
    },
    {
      key: 'activo',
      header: 'Estado',
      render: (categoria: Categoria) => (
        categoria.activo ? (
          <Badge variant="success">Activo</Badge>
        ) : (
          <Badge variant="default">Inactivo</Badge>
        )
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (categoria: Categoria) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handleEdit(categoria)}>
            Editar
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(categoria.id)}>
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Gestión de Categorías</h1>
          <p className="text-lg text-gray-700 font-medium">Administra las categorías de equipos del inventario</p>
        </div>
        <Button onClick={handleOpenModal} size="lg">
          <span className="text-lg">➕ Nueva Categoría</span>
        </Button>
      </div>

      {/* Tabla */}
      <Card>
        <Table
          data={categorias}
          columns={columns}
          emptyMessage="No hay categorías registradas"
        />
      </Card>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre *"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="PC/Portátil, Monitor, Impresora..."
            required
          />

          <Textarea
            label="Descripción"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            placeholder="Descripción opcional de la categoría..."
            rows={3}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {editingCategoria ? 'Guardar Cambios' : 'Crear Categoría'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
