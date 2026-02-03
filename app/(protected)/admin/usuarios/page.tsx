// Página de Gestión de Usuarios
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import { Users, UserPlus, Edit, Trash2, Shield, CheckCircle, XCircle } from 'lucide-react';

interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  permisos: Record<string, boolean>;
}

interface Usuario {
  id: string;
  clerk_user_id: string;
  email: string;
  nombre: string;
  rol_id: string;
  rol?: Rol;
  activo: boolean;
  ultimo_acceso?: string;
  created_at: string;
}

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    nombre: '',
    rolId: '',
    activo: true,
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [usuariosRes, rolesRes] = await Promise.all([
        fetch('/api/usuarios'),
        fetch('/api/roles'),
      ]);

      const usuariosData = await usuariosRes.json();
      const rolesData = await rolesRes.json();

      // Asegurar que sean arrays
      setUsuarios(Array.isArray(usuariosData) ? usuariosData : []);
      setRoles(Array.isArray(rolesData) ? rolesData : []);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setUsuarios([]);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (usuario?: Usuario) => {
    if (usuario) {
      setEditingUsuario(usuario);
      setFormData({
        email: usuario.email,
        nombre: usuario.nombre,
        rolId: usuario.rol_id,
        activo: usuario.activo,
      });
    } else {
      setEditingUsuario(null);
      setFormData({
        email: '',
        nombre: '',
        rolId: '',
        activo: true,
      });
    }
    setIsModalOpen(true);
  };

  const cerrarModal = () => {
    setIsModalOpen(false);
    setEditingUsuario(null);
    setFormData({ email: '', nombre: '', rolId: '', activo: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = '/api/usuarios';
      const method = editingUsuario ? 'PUT' : 'POST';
      const body = editingUsuario
        ? { id: editingUsuario.id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await cargarDatos();
        cerrarModal();
      } else {
        const data = await response.json();
        alert(data.error || 'Error al guardar usuario');
      }
    } catch (error) {
      console.error('Error guardando usuario:', error);
      alert('Error al guardar el usuario');
    }
  };

  const cambiarEstado = async (usuario: Usuario) => {
    try {
      const response = await fetch('/api/usuarios', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: usuario.id,
          activo: !usuario.activo,
        }),
      });

      if (response.ok) {
        await cargarDatos();
      }
    } catch (error) {
      console.error('Error cambiando estado:', error);
    }
  };

  const eliminarUsuario = async (usuario: Usuario) => {
    if (!confirm(`¿Eliminar usuario "${usuario.email}"?`)) return;

    try {
      const response = await fetch(
        `/api/usuarios?id=${usuario.id}&clerkUserId=${usuario.clerk_user_id}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        await cargarDatos();
      } else {
        const data = await response.json();
        alert(data.error || 'Error al eliminar');
      }
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      alert('Error al eliminar el usuario');
    }
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
            <Users className="h-10 w-10 text-blue-600" />
            Gestión de Usuarios
          </h1>
          <p className="text-lg text-gray-600">Administra usuarios y sus roles</p>
        </div>
        <Button onClick={() => abrirModal()} className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">Total Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{usuarios.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {usuarios.filter(u => u.activo).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">Inactivos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-600">
              {usuarios.filter(u => !u.activo).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">Roles Asignados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{roles.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Usuarios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Usuarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Usuario
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Rol
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Creado
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {usuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900">{usuario.nombre}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-600">{usuario.email}</div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant="info" className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        {usuario.rol?.nombre || 'Sin rol'}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => cambiarEstado(usuario)}
                        className="flex items-center gap-1"
                      >
                        {usuario.activo ? (
                          <Badge variant="success" className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Activo
                          </Badge>
                        ) : (
                          <Badge variant="default" className="flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            Inactivo
                          </Badge>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-600">
                        {new Date(usuario.created_at).toLocaleDateString('es-ES')}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => abrirModal(usuario)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => eliminarUsuario(usuario)}
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Crear/Editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={cerrarModal}
        title={editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre *"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
            placeholder="Nombre completo"
          />

          <Input
            label="Email *"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={!!editingUsuario}
            placeholder="usuario@ejemplo.com"
          />

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol *
            </label>
            <select
              value={formData.rolId}
              onChange={(e) => setFormData({ ...formData, rolId: e.target.value })}
              required
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 border-gray-300"
            >
              <option value="">Seleccionar rol...</option>
              {roles.map((rol) => (
                <option key={rol.id} value={rol.id}>
                  {rol.nombre}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.activo}
              onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Usuario Activo
            </span>
          </label>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={cerrarModal}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingUsuario ? 'Actualizar' : 'Crear'} Usuario
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
