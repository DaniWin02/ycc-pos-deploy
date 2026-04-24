import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Plus, Edit2, Trash2, Eye, X, Save,
  Phone, Mail, MapPin, CreditCard, ShoppingBag, Calendar,
  Filter, ChevronDown, UserCheck, UserX, Award, Building2, User
} from 'lucide-react';

const API_URL = 'http://localhost:3004/api/customers';
const fmt = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);

type CustomerType = 'SOCIO' | 'CLIENTE' | 'INVITADO' | 'CORPORATIVO';

interface Customer {
  id: string;
  memberNumber?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string;
  phone?: string;
  address?: string;
  rfc?: string;
  type: CustomerType;
  balance: number;
  creditLimit: number;
  notes?: string;
  birthDate?: string;
  isActive: boolean;
  totalOrders: number;
  totalSpent: number;
  recentOrders: any[];
  createdAt: string;
  updatedAt: string;
}

interface CustomerDetail extends Customer {
  orders: any[];
}

const TYPE_CONFIG: Record<CustomerType, { label: string; color: string; icon: any }> = {
  SOCIO: { label: 'Socio', color: 'bg-purple-100 text-purple-700', icon: Award },
  CLIENTE: { label: 'Cliente', color: 'bg-blue-100 text-blue-700', icon: User },
  INVITADO: { label: 'Invitado', color: 'bg-gray-100 text-gray-700', icon: UserCheck },
  CORPORATIVO: { label: 'Corporativo', color: 'bg-amber-100 text-amber-700', icon: Building2 },
};

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Partial<Customer> | null>(null);

  // Form state for create/edit
  const emptyForm = {
    firstName: '', lastName: '', email: '', phone: '', address: '',
    rfc: '', type: 'CLIENTE' as CustomerType, creditLimit: 0, notes: '',
    birthDate: '', memberNumber: ''
  };
  const [form, setForm] = useState(emptyForm);

  const loadCustomers = async () => {
    try {
      const params = new URLSearchParams();
      if (filterType !== 'ALL') params.set('type', filterType);
      if (searchTerm) params.set('search', searchTerm);

      const res = await fetch(`${API_URL}?${params.toString()}`);
      if (!res.ok) throw new Error('Error cargando clientes');
      const data = await res.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error cargando clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCustomers(); }, [filterType, searchTerm]);

  const handleCreate = async () => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          creditLimit: Number(form.creditLimit) || 0
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error creando cliente');
      }
      setShowCreateModal(false);
      setForm(emptyForm);
      await loadCustomers();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleEdit = async () => {
    if (!editingCustomer) return;
    try {
      const res = await fetch(`${API_URL}/${editingCustomer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCustomer)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error actualizando cliente');
      }
      setShowEditModal(false);
      setEditingCustomer(null);
      await loadCustomers();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar/desactivar este cliente?')) return;
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      await loadCustomers();
    } catch (error) {
      console.error('Error eliminando cliente:', error);
    }
  };

  const viewDetail = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/${id}`);
      if (!res.ok) throw new Error('Error cargando detalle');
      const data = await res.json();
      setSelectedCustomer(data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error cargando detalle:', error);
    }
  };

  const openEdit = (customer: Customer) => {
    setEditingCustomer({
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      rfc: customer.rfc || '',
      type: customer.type,
      creditLimit: customer.creditLimit,
      notes: customer.notes || '',
      birthDate: customer.birthDate ? customer.birthDate.split('T')[0] : '',
      memberNumber: customer.memberNumber || '',
      isActive: customer.isActive
    });
    setShowEditModal(true);
  };

  const TypeBadge = ({ type }: { type: CustomerType }) => {
    const config = TYPE_CONFIG[type];
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-sm text-gray-500 mt-1">Gestión de socios, clientes e invitados</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setShowCreateModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nuevo Cliente
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[250px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email, teléfono, RFC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="ALL">Todos los tipos</option>
          <option value="SOCIO">Socios</option>
          <option value="CLIENTE">Clientes</option>
          <option value="INVITADO">Invitados</option>
          <option value="CORPORATIVO">Corporativos</option>
        </select>
        <button
          onClick={loadCustomers}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Actualizar
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Clientes', value: customers.length, icon: Users, color: 'text-blue-600' },
          { label: 'Socios', value: customers.filter(c => c.type === 'SOCIO').length, icon: Award, color: 'text-purple-600' },
          { label: 'Ventas Totales', value: fmt(customers.reduce((s, c) => s + c.totalSpent, 0)), icon: ShoppingBag, color: 'text-emerald-600' },
          { label: 'Saldo Total', value: fmt(customers.reduce((s, c) => s + c.balance, 0)), icon: CreditCard, color: 'text-amber-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Cargando clientes...</div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">No se encontraron clientes</p>
            <p className="text-sm">Crea un nuevo cliente para comenzar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contacto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RFC</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Saldo</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Crédito</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Compras</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Gastado</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((customer) => (
                  <motion.tr
                    key={customer.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                          {customer.firstName[0]}{customer.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{customer.fullName}</p>
                          {customer.memberNumber && (
                            <p className="text-xs text-gray-500">{customer.memberNumber}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><TypeBadge type={customer.type} /></td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        {customer.phone && (
                          <p className="text-xs text-gray-600 flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {customer.phone}
                          </p>
                        )}
                        {customer.email && (
                          <p className="text-xs text-gray-600 flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {customer.email}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{customer.rfc || '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-sm font-medium ${customer.balance > 0 ? 'text-emerald-600' : customer.balance < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        {fmt(customer.balance)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-600">
                      {customer.creditLimit > 0 ? fmt(customer.creditLimit) : '—'}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">{customer.totalOrders}</td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">{fmt(customer.totalSpent)}</td>
                    <td className="px-6 py-4 text-center">
                      {customer.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <UserCheck className="w-3 h-3" /> Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          <UserX className="w-3 h-3" /> Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => viewDetail(customer.id)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEdit(customer)}
                          className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Nuevo Cliente</h2>
                  <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                    <input
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                    <input
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Cliente</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as CustomerType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="CLIENTE">Cliente</option>
                    <option value="SOCIO">Socio</option>
                    <option value="INVITADO">Invitado</option>
                    <option value="CORPORATIVO">Corporativo</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">RFC</label>
                    <input
                      value={form.rfc}
                      onChange={(e) => setForm({ ...form, rfc: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="XAXX010101000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Límite de Crédito</label>
                    <input
                      type="number"
                      value={form.creditLimit}
                      onChange={(e) => setForm({ ...form, creditLimit: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <input
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                    <input
                      type="date"
                      value={form.birthDate}
                      onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">No. de Socio</label>
                    <input
                      value={form.memberNumber}
                      onChange={(e) => setForm({ ...form, memberNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Auto-generado si es Socio"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!form.firstName || !form.lastName}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    Guardar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedCustomer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Detalle del Cliente</h2>
                  <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Customer Info Card */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl">
                      {selectedCustomer.firstName[0]}{selectedCustomer.lastName[0]}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{selectedCustomer.fullName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <TypeBadge type={selectedCustomer.type} />
                        {selectedCustomer.memberNumber && (
                          <span className="text-xs text-gray-500">#{selectedCustomer.memberNumber}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    {selectedCustomer.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" /> {selectedCustomer.phone}
                      </div>
                    )}
                    {selectedCustomer.email && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" /> {selectedCustomer.email}
                      </div>
                    )}
                    {selectedCustomer.address && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" /> {selectedCustomer.address}
                      </div>
                    )}
                    {selectedCustomer.rfc && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <CreditCard className="w-4 h-4" /> RFC: {selectedCustomer.rfc}
                      </div>
                    )}
                    {selectedCustomer.birthDate && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" /> {new Date(selectedCustomer.birthDate).toLocaleDateString('es-MX')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'Compras', value: selectedCustomer.totalOrders, icon: ShoppingBag, color: 'text-blue-600' },
                    { label: 'Total Gastado', value: fmt(selectedCustomer.totalSpent), icon: CreditCard, color: 'text-emerald-600' },
                    { label: 'Saldo', value: fmt(selectedCustomer.balance), icon: CreditCard, color: 'text-amber-600' },
                    { label: 'Crédito', value: fmt(selectedCustomer.creditLimit), icon: CreditCard, color: 'text-purple-600' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                      <stat.icon className={`w-4 h-4 mx-auto ${stat.color}`} />
                      <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                      <p className="text-sm font-bold text-gray-900">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Purchase History */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Historial de Compras</h3>
                  {selectedCustomer.orders.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">Sin compras registradas</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {selectedCustomer.orders.map((order: any) => (
                        <div key={order.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-lg p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{order.folio}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString('es-MX', {
                                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                              })}
                              {' · '}{order.items?.length || 0} items
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">{fmt(Number(order.totalAmount))}</p>
                            <span className={`text-xs font-medium ${
                              order.paymentStatus === 'CAPTURED' ? 'text-green-600' :
                              order.paymentStatus === 'PENDING' ? 'text-amber-600' :
                              'text-red-600'
                            }`}>
                              {order.paymentStatus === 'CAPTURED' ? 'Pagado' :
                               order.paymentStatus === 'PENDING' ? 'Pendiente' :
                               order.paymentStatus === 'REFUNDED' ? 'Reembolsado' : order.paymentStatus}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedCustomer.notes && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Notas</h3>
                    <p className="text-sm text-gray-600 bg-amber-50 rounded-lg p-3">{selectedCustomer.notes}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && editingCustomer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Editar Cliente</h2>
                  <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                      value={editingCustomer.firstName || ''}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                    <input
                      value={editingCustomer.lastName || ''}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={editingCustomer.type || 'CLIENTE'}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, type: e.target.value as CustomerType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="CLIENTE">Cliente</option>
                    <option value="SOCIO">Socio</option>
                    <option value="INVITADO">Invitado</option>
                    <option value="CORPORATIVO">Corporativo</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={editingCustomer.email || ''}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input
                      type="tel"
                      value={editingCustomer.phone || ''}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">RFC</label>
                    <input
                      value={editingCustomer.rfc || ''}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, rfc: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Límite de Crédito</label>
                    <input
                      type="number"
                      value={editingCustomer.creditLimit || 0}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, creditLimit: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <input
                    value={editingCustomer.address || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                  <textarea
                    value={editingCustomer.notes || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows={2}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">Estado:</label>
                  <button
                    onClick={() => setEditingCustomer({ ...editingCustomer, isActive: !editingCustomer.isActive })}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      editingCustomer.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {editingCustomer.isActive ? 'Activo' : 'Inactivo'}
                  </button>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    <Save className="w-4 h-4" />
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
