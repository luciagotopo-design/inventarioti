// Página de Gestión de Roles
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { Shield, Plus, Edit, Trash2, Users } from 'lucide-react';

interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  permisos: Record<string, boolean>;
  activo: boolean;
  created_at: string;
}

const PERMISOS_DISPONIBLES = [
  { key: 'usuarios', label: 'Gestión de Usuarios' },
  { key: 'inventario', label: 'Gestión de Inventario' },
  { key: 'mantenimiento', label: 'Plan de Mantenimiento' },
  { key: 'reportes', label: 'Reportes y Análisis' },
  { key: 'configuracion', label: 'Configuración del Sistema' },
];

export default function RolesPage() {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRol, setEditingRol] = useState<Rol | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    permisos: {} as Record<string, boolean>,
    activo: true,
  });

  useEffect(() => {
    cargarRoles();
  }, []);

  const cargarRoles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/roles');
      const data = await response.json();
      // Asegurar que sea un array
      setRoles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando roles:', error);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (rol?: Rol) => {
    if (rol) {
      setEditingRol(rol);
      setFormData({
        nombre: rol.nombre,
        descripcion: rol.descripcion,
        permisos: rol.permisos || {},
        activo: rol.activo,
      });
    } else {
      setEditingRol(null);
      setFormData({
        nombre: '',
        descripcion: '',
        permisos: {},
        activo: true,
      });
    }
    setIsModalOpen(true);
  };

  const cerrarModal = () => {
    setIsModalOpen(false);
    setEditingRol(null);
    setFormData({ nombre: '', descripcion: '', permisos: {}, activo: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = '/api/roles';
      const method = editingRol ? 'PUT' : 'POST';
      const body = editingRol
        ? { id: editingRol.id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await cargarRoles();
        cerrarModal();
      }
    } catch (error) {
      console.error('Error guardando rol:', error);
      alert('Error al guardar el rol');
    }
  };

  const eliminarRol = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar rol "${nombre}"?`)) return;

    try {
      const response = await fetch(`/api/roles?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        await cargarRoles();
      } else {
        alert(data.error || 'Error al eliminar');
      }
    } catch (error) {
      console.error('Error eliminando rol:', error);
      alert('Error al eliminar el rol');
    }
  };

  const togglePermiso = (key: string) => {
    setFormData({
      ...formData,
      permisos: {
        ...formData.permisos,
        [key]: !formData.permisos[key],
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Shield className="h-10 w-10 text-blue-600" />
            Gestión de Roles
          </h1>
          <p className="text-lg text-gray-600">Administra roles y permisos del sistema</p>
        </div>
        <Button onClick={() => abrirModal()} className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Nuevo Rol
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">Total Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{roles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">Roles Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {roles.filter(r => r.activo).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">Roles Inactivos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-600">
              {roles.filter(r => !r.activo).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Roles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {roles.map((rol) => (
          <Card key={rol.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <Shield className="h-6 w-6 text-blue-600" />
                    <CardTitle className="text-xl">{rol.nombre}</CardTitle>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{rol.descripcion}</p>
                </div>
                <Badge variant={rol.activo ? 'success' : 'default'}>
                  {rol.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Permisos */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Permisos:</p>
                  <div className="flex flex-wrap gap-2">
                    {PERMISOS_DISPONIBLES.map((permiso) => (
                      <Badge
                        key={permiso.key}
                        variant={rol.permisos?.[permiso.key] ? 'info' : 'default'}
                      >
                        {permiso.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => abrirModal(rol)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => eliminarRol(rol.id, rol.nombre)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal Crear/Editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={cerrarModal}
        title={editingRol ? 'Editar Rol' : 'Nuevo Rol'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre del Rol *"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
            placeholder="Ej: Técnico, Supervisor..."
          />

          <Textarea
            label="Descripción"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            placeholder="Describe las responsabilidades de este rol..."
            rows={3}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Permisos
            </label>
            <div className="space-y-2">
              {PERMISOS_DISPONIBLES.map((permiso) => (
                <label
                  key={permiso.key}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.permisos[permiso.key] || false}
                    onChange={() => togglePermiso(permiso.key)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {permiso.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.activo}
              onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Rol Activo
            </span>
          </label>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={cerrarModal}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingRol ? 'Actualizar' : 'Crear'} Rol
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
