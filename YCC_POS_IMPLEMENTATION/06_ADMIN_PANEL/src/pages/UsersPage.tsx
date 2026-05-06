import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import { 
  Users, Plus, Edit2, Trash2, Search, X, Shield, Mail, Phone, Lock, 
  Monitor, Utensils, LayoutDashboard, Activity, Wifi, WifiOff, 
  Clock, LogIn, Store, ChefHat, ShieldCheck, AlertCircle,
  UserPlus, RefreshCw, Loader2, Zap, ArrowRight
} from 'lucide-react';

// ===================== INTERFACES =====================

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'MANAGER' | 'CASHIER' | 'KITCHEN';
  pin: string;
  password: string;
  isActive: boolean;
  canAccessPos: boolean;
  canAccessKds: boolean;
  canAccessAdmin: boolean;
  phone?: string;
  createdAt: string;
  lastLogin?: string;
  // Activity fields (real-time)
  isOnline?: boolean;
  currentModule?: 'POS' | 'KDS' | 'ADMIN' | null;
  lastSeen?: string;
  lastActivityAt?: string;
  loginTime?: string;
}

interface ActivityStats {
  total: number;
  online: number;
  offline: number;
  inPos: number;
  inKds: number;
  inAdmin: number;
}

// ===================== CONSTANTES =====================

const ONLINE_TIMEOUT_MS = 45000; // 45 segundos sin actividad = offline
const REFRESH_INTERVAL_MS = 10000; // Polling cada 10 segundos como backup
const ACTIVITY_CHECK_INTERVAL_MS = 5000; // Verificar actividad cada 5 segundos

const ROLE_COLORS = {
  ADMIN: 'bg-red-100 text-red-800 border-red-200',
  MANAGER: 'bg-purple-100 text-purple-800 border-purple-200',
  CASHIER: 'bg-blue-100 text-blue-800 border-blue-200',
  KITCHEN: 'bg-orange-100 text-orange-800 border-orange-200'
};

const ROLE_LABELS = {
  ADMIN: 'Administrador',
  MANAGER: 'Gerente',
  CASHIER: 'Cajero',
  KITCHEN: 'Cocina'
};

// ===================== COMPONENTE PRINCIPAL =====================

export const UsersPage: React.FC = () => {
  // Estado de usuarios y carga
  const [users, setUsers] = useState<User[]>([]);
  const [dbUserCount, setDbUserCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Estado de modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Estado de estadísticas calculadas (no del backend)
  const [calculatedStats, setCalculatedStats] = useState<ActivityStats>({
    total: 0,
    online: 0,
    offline: 0,
    inPos: 0,
    inKds: 0,
    inAdmin: 0
  });
  
  // Referencias
  const socketRef = useRef<Socket | null>(null);
  const activityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityMapRef = useRef<Map<string, number>>(new Map());
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'CASHIER' as User['role'],
    phone: '',
    pin: '',
    password: '',
    isActive: true,
    canAccessPos: true,
    canAccessKds: false,
    canAccessAdmin: false
  });

  // ===================== FUNCIONES AUXILIARES =====================

  /**
   * Verifica si un usuario está realmente "en línea" basado en su última actividad
   */
  const isUserOnline = useCallback((user: User): boolean => {
    if (!user.lastActivityAt && !user.lastSeen) return false;
    
    const lastActivity = user.lastActivityAt || user.lastSeen;
    if (!lastActivity) return false;
    
    const lastActivityTime = new Date(lastActivity).getTime();
    const now = Date.now();
    const timeSinceActivity = now - lastActivityTime;
    
    return timeSinceActivity < ONLINE_TIMEOUT_MS;
  }, []);

  /**
   * Calcula las estadísticas en tiempo real basadas en los usuarios actuales
   */
  const calculateRealtimeStats = useCallback((userList: User[]): ActivityStats => {
    const stats: ActivityStats = {
      total: userList.length,
      online: 0,
      offline: 0,
      inPos: 0,
      inKds: 0,
      inAdmin: 0
    };

    userList.forEach(user => {
      const online = isUserOnline(user);
      
      if (online) {
        stats.online++;
        if (user.currentModule === 'POS') stats.inPos++;
        if (user.currentModule === 'KDS') stats.inKds++;
        if (user.currentModule === 'ADMIN') stats.inAdmin++;
      } else {
        stats.offline++;
      }
    });

    return stats;
  }, [isUserOnline]);

  /**
   * Formatea el tiempo transcurrido desde la última actividad
   */
  const formatTimeAgo = (dateString?: string): string => {
    if (!dateString) return 'Nunca';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 5) return 'Ahora mismo';
    if (diffSecs < 60) return `Hace ${diffSecs}s`;
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString();
  };

  // ===================== CARGA DE DATOS =====================

  /**
   * Carga los usuarios desde la base de datos (fuente de verdad)
   */
  const loadUsersFromDB = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3004/api/users');
      if (!response.ok) throw new Error('Error al cargar usuarios');
      
      const data = await response.json();
      const userArray = Array.isArray(data) ? data : [];
      
      setDbUserCount(userArray.length);
      return userArray;
    } catch (error) {
      console.error('Error cargando usuarios de BD:', error);
      setDbUserCount(0);
      return [];
    }
  }, []);

  /**
   * Carga la actividad de usuarios desde el backend
   */
  const loadUserActivity = useCallback(async () => {
    try {
      setIsRefreshing(true);
      
      // 1. Cargar usuarios base de datos (fuente de verdad)
      const dbUsers = await loadUsersFromDB();
      
      if (dbUsers.length === 0) {
        // No hay usuarios en la base de datos - mostrar estado vacío
        setUsers([]);
        setCalculatedStats({
          total: 0,
          online: 0,
          offline: 0,
          inPos: 0,
          inKds: 0,
          inAdmin: 0
        });
        setLoading(false);
        setInitialLoad(false);
        setIsRefreshing(false);
        return;
      }

      // 2. Intentar cargar actividad en tiempo real
      let activityData: { users?: any[]; stats?: ActivityStats } = {};
      
      try {
        const response = await fetch('http://localhost:3004/api/auth/activity');
        if (response.ok) {
          activityData = await response.json();
        }
      } catch (error) {
        console.warn('No se pudo cargar actividad en tiempo real:', error);
      }

      // 3. Merge: Usuarios de BD + Actividad en tiempo real
      const activityUsers = activityData.users || [];
      
      const mergedUsers = dbUsers.map((dbUser: User) => {
        const activityUser = activityUsers.find((au: any) => au.id === dbUser.id);
        
        if (activityUser) {
          // Actualizar con datos de actividad en tiempo real
          return {
            ...dbUser,
            isOnline: isUserOnline(activityUser),
            currentModule: activityUser.currentModule || null,
            lastSeen: activityUser.lastSeen || activityUser.lastActivityAt,
            lastActivityAt: activityUser.lastActivityAt || activityUser.lastSeen,
            loginTime: activityUser.loginTime
          };
        }
        
        // Usuario sin actividad reciente = offline
        return {
          ...dbUser,
          isOnline: false,
          currentModule: null,
          lastSeen: dbUser.lastLogin || undefined,
          lastActivityAt: dbUser.lastLogin || undefined
        };
      });

      setUsers(mergedUsers);
      
      // 4. Calcular estadísticas en tiempo real
      const stats = calculateRealtimeStats(mergedUsers);
      setCalculatedStats(stats);
      
    } catch (error) {
      console.error('Error cargando actividad:', error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
      setIsRefreshing(false);
    }
  }, [loadUsersFromDB, calculateRealtimeStats, isUserOnline]);

  // ===================== WEBSOCKETS =====================

  useEffect(() => {
    const socket = io('http://localhost:3004', {
      transports: ['polling', 'websocket'],
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 UsersPage: Conectado a Socket.IO');
    });

    socket.on('user:activity:updated', (activityData: any) => {
      console.log('📊 Actividad actualizada:', activityData);
      
      // Actualizar usuarios con nueva actividad
      if (activityData?.users && Array.isArray(activityData.users)) {
        setUsers(prevUsers => {
          const updatedUsers = prevUsers.map(user => {
            const activityUser = activityData.users.find((au: any) => au.id === user.id);
            if (activityUser) {
              return {
                ...user,
                isOnline: isUserOnline(activityUser),
                currentModule: activityUser.currentModule || user.currentModule,
                lastSeen: activityUser.lastSeen || activityUser.lastActivityAt,
                lastActivityAt: activityUser.lastActivityAt || new Date().toISOString()
              };
            }
            return user;
          });
          
          // Recalcular estadísticas
          const newStats = calculateRealtimeStats(updatedUsers);
          setCalculatedStats(newStats);
          
          return updatedUsers;
        });
      }
    });

    socket.on('user:login', (userData: any) => {
      console.log('👤 Usuario conectado:', userData);
      // Forzar refresh para capturar nuevo usuario
      loadUserActivity();
    });

    socket.on('disconnect', () => {
      console.log('🔌 UsersPage: Desconectado de Socket.IO');
    });

    return () => {
      socket.close();
    };
  }, [loadUserActivity, calculateRealtimeStats, isUserOnline]);

  // ===================== EFECTOS =====================

  // Carga inicial
  useEffect(() => {
    loadUserActivity();
  }, [loadUserActivity]);

  // Polling como backup (cada 10 segundos)
  useEffect(() => {
    const interval = setInterval(() => {
      loadUserActivity();
    }, REFRESH_INTERVAL_MS);
    
    return () => clearInterval(interval);
  }, [loadUserActivity]);

  // Verificación periódica de actividad (para marcar offline automáticamente)
  useEffect(() => {
    const checkActivity = () => {
      setUsers(prevUsers => {
        const updatedUsers = prevUsers.map(user => ({
          ...user,
          isOnline: isUserOnline(user)
        }));
        
        const newStats = calculateRealtimeStats(updatedUsers);
        setCalculatedStats(newStats);
        
        return updatedUsers;
      });
    };

    const interval = setInterval(checkActivity, ACTIVITY_CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [calculateRealtimeStats, isUserOnline]);

  // ===================== HANDLERS =====================

  const handleRefresh = () => {
    loadUserActivity();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingUser 
        ? `http://localhost:3004/api/users/${editingUser.id}`
        : 'http://localhost:3004/api/users';
      const method = editingUser ? 'PUT' : 'POST';
      
      const submitData = {
        ...formData,
        pin: formData.pin || null
      };
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        await loadUserActivity();
        closeModal();
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Error: ${errorData.error || 'No se pudo guardar el usuario'}`);
      }
    } catch (error) {
      console.error('Error guardando usuario:', error);
      alert('Error de conexión al guardar usuario');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?\n\nNota: Si el usuario tiene ventas o registros asociados, se desactivará en lugar de eliminarse.')) return;
    
    try {
      const response = await fetch(`http://localhost:3004/api/users/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Mostrar mensaje diferente según el tipo de eliminación
        if (result.softDeleted) {
          alert(`✅ ${result.message}\n\n${result.reason || 'El usuario ha sido desactivado y no aparecerá en la lista.'}`);
        } else {
          alert('✅ Usuario eliminado exitosamente');
        }
        
        await loadUserActivity();
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`❌ Error: ${errorData.error || 'No se pudo eliminar el usuario'}${errorData.details ? '\n' + errorData.details : ''}`);
      }
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      alert('❌ Error de conexión al eliminar usuario');
    }
  };

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username || '',
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        role: user.role || 'CASHIER',
        phone: user.phone || '',
        pin: user.pin || '',
        password: '',
        isActive: user.isActive ?? true,
        canAccessPos: user.canAccessPos ?? true,
        canAccessKds: user.canAccessKds ?? false,
        canAccessAdmin: user.canAccessAdmin ?? false
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        role: 'CASHIER',
        phone: '',
        pin: '',
        password: '',
        isActive: true,
        canAccessPos: true,
        canAccessKds: false,
        canAccessAdmin: false
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  // ===================== RENDER HELPERS =====================

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ===================== RENDER: EMPTY STATE =====================

  if (!loading && dbUserCount === 0) {
    return (
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
            <p className="text-gray-600 mt-1">Gestiona los usuarios del sistema</p>
          </div>
        </div>

        {/* Stats en 0 */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <StatCard 
            label="Total Usuarios" 
            value={0} 
            icon={Users} 
            color="indigo"
            borderColor="border-indigo-500"
          />
          <StatCard 
            label="En Línea" 
            value={0} 
            icon={Wifi} 
            color="emerald"
            borderColor="border-emerald-500"
          />
          <StatCard 
            label="Fuera de Línea" 
            value={0} 
            icon={WifiOff} 
            color="gray"
            borderColor="border-gray-400"
          />
          <StatCard 
            label="En POS" 
            value={0} 
            icon={Store} 
            color="blue"
            borderColor="border-blue-500"
          />
          <StatCard 
            label="En KDS" 
            value={0} 
            icon={ChefHat} 
            color="orange"
            borderColor="border-orange-500"
          />
          <StatCard 
            label="En Admin" 
            value={0} 
            icon={ShieldCheck} 
            color="purple"
            borderColor="border-purple-500"
          />
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            No hay usuarios registrados
          </h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Comienza creando tu primer usuario administrador para gestionar el sistema.
          </p>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-all font-medium shadow-lg shadow-indigo-200"
          >
            <UserPlus className="w-5 h-5" />
            Crear Usuario
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <UserModal 
              isOpen={isModalOpen}
              onClose={closeModal}
              editingUser={editingUser}
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ===================== RENDER: MAIN CONTENT =====================

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-600 mt-1">
            {dbUserCount > 0 
              ? `Gestiona los ${dbUserCount} usuarios del sistema`
              : 'Gestiona los usuarios del sistema'
            }
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Actualizando...' : 'Actualizar'}
          </button>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            <Plus className="w-5 h-5" />
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Activity Stats - Real-time */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <StatCard 
          label="Total Usuarios" 
          value={calculatedStats.total} 
          icon={Users} 
          color="indigo"
          borderColor="border-indigo-500"
          isLoading={loading && initialLoad}
        />
        <StatCard 
          label="En Línea" 
          value={calculatedStats.online} 
          icon={Wifi} 
          color="emerald"
          borderColor="border-emerald-500"
          pulse={calculatedStats.online > 0}
          isLoading={loading && initialLoad}
        />
        <StatCard 
          label="Fuera de Línea" 
          value={calculatedStats.offline} 
          icon={WifiOff} 
          color="gray"
          borderColor="border-gray-400"
          isLoading={loading && initialLoad}
        />
        <StatCard 
          label="En POS" 
          value={calculatedStats.inPos} 
          icon={Store} 
          color="blue"
          borderColor="border-blue-500"
          isLoading={loading && initialLoad}
        />
        <StatCard 
          label="En KDS" 
          value={calculatedStats.inKds} 
          icon={ChefHat} 
          color="orange"
          borderColor="border-orange-500"
          isLoading={loading && initialLoad}
        />
        <StatCard 
          label="En Admin" 
          value={calculatedStats.inAdmin} 
          icon={ShieldCheck} 
          color="purple"
          borderColor="border-purple-500"
          isLoading={loading && initialLoad}
        />
      </div>

      {/* Consistency Warning */}
      {calculatedStats.online > calculatedStats.total && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-800">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">
            Advertencia: Hay inconsistencia en los datos. Usuarios online ({calculatedStats.online}) &gt; Total ({calculatedStats.total})
          </span>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar usuarios por nombre, email o usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        {searchTerm && (
          <p className="text-sm text-gray-500 mt-2">
            {filteredUsers.length} resultado{filteredUsers.length !== 1 ? 's' : ''} para "{searchTerm}"
          </p>
        )}
      </div>

      {/* Users Table */}
      {loading && initialLoad ? (
        <TableSkeleton />
      ) : filteredUsers.length === 0 && searchTerm ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No se encontraron usuarios para "{searchTerm}"</p>
          <button
            onClick={() => setSearchTerm('')}
            className="mt-3 text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Limpiar búsqueda
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-[120px]" />
              <col className="w-[140px]" />
              <col className="w-[80px]" />
              <col className="w-[100px]" />
              <col className="w-[90px]" />
              <col className="w-[80px]" />
              <col className="w-[130px]" />
              <col className="w-[180px]" />
            </colgroup>
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">PIN</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acceso</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actividad</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="font-medium text-gray-900 truncate" title={user.username}>{user.username}</span>
                      {user.isOnline && (
                        <span className="relative flex h-2 w-2 flex-shrink-0" title="En línea">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-sm text-gray-900 truncate block" title={`${user.firstName} ${user.lastName}`}>
                      {user.firstName} {user.lastName}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center text-sm text-gray-600 font-mono">
                      <Lock className="w-4 h-4 mr-1 text-gray-400 flex-shrink-0" />
                      {user.pin ? '••••' : '—'}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border whitespace-nowrap ${ROLE_COLORS[user.role]}`}>
                      {ROLE_LABELS[user.role]}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      {user.canAccessPos && (
                        <span title="POS" className="text-blue-600"><Monitor className="w-4 h-4" /></span>
                      )}
                      {user.canAccessKds && (
                        <span title="KDS" className="text-orange-600"><Utensils className="w-4 h-4" /></span>
                      )}
                      {user.canAccessAdmin && (
                        <span title="Admin" className="text-purple-600"><LayoutDashboard className="w-4 h-4" /></span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                      user.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-col gap-1">
                      {/* Online/Offline Status */}
                      <div className="flex items-center gap-1">
                        {user.isOnline ? (
                          <>
                            <Wifi className="w-3 h-3 text-emerald-500" />
                            <span className="text-xs text-emerald-600 font-medium">En línea</span>
                          </>
                        ) : (
                          <>
                            <WifiOff className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">Fuera de línea</span>
                          </>
                        )}
                      </div>
                      
                      {/* Current Module */}
                      {user.isOnline && user.currentModule && (
                        <div className="flex items-center gap-1">
                          {user.currentModule === 'POS' && (
                            <span className="text-xs text-blue-600 flex items-center gap-1">
                              <Store className="w-3 h-3" /> En POS
                            </span>
                          )}
                          {user.currentModule === 'KDS' && (
                            <span className="text-xs text-orange-600 flex items-center gap-1">
                              <ChefHat className="w-3 h-3" /> En KDS
                            </span>
                          )}
                          {user.currentModule === 'ADMIN' && (
                            <span className="text-xs text-purple-600 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> En Admin
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* Last Activity */}
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(user.lastActivityAt || user.lastSeen)}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(user)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-sm text-sm font-medium whitespace-nowrap"
                        title="Editar usuario"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all shadow-sm text-sm font-medium whitespace-nowrap"
                        title="Eliminar usuario"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Real-time indicator */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-500" />
          <span>Actualización en tiempo real activa</span>
          <span className="text-xs text-gray-400">(timeout: {ONLINE_TIMEOUT_MS/1000}s)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span>Socket.IO conectado</span>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <UserModal 
            isOpen={isModalOpen}
            onClose={closeModal}
            editingUser={editingUser}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ===================== COMPONENTES AUXILIARES =====================

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  borderColor: string;
  pulse?: boolean;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  icon: Icon, 
  color, 
  borderColor,
  pulse = false,
  isLoading = false
}) => {
  const colorClasses: Record<string, string> = {
    indigo: 'text-indigo-600',
    emerald: 'text-emerald-600',
    gray: 'text-gray-600',
    blue: 'text-blue-600',
    orange: 'text-orange-600',
    purple: 'text-purple-600'
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${borderColor} transition-all hover:shadow-lg`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-xs uppercase font-semibold ${color === 'gray' ? 'text-gray-500' : colorClasses[color]}`}>
            {label}
          </p>
          {isLoading ? (
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mt-1"></div>
          ) : (
            <p className={`text-2xl font-bold ${colorClasses[color]} ${pulse ? 'animate-pulse' : ''}`}>
              {value}
            </p>
          )}
        </div>
        <Icon className={`w-8 h-8 ${colorClasses[color]} opacity-80`} />
      </div>
    </div>
  );
};

const TableSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
    <div className="p-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0">
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2 animate-pulse"></div>
            <div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse"></div>
          </div>
          <div className="w-20">
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingUser: User | null;
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const UserModal: React.FC<UserModalProps> = ({ 
  isOpen, 
  onClose, 
  editingUser, 
  formData, 
  setFormData, 
  onSubmit 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuario *</label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="CASHIER">Cajero</option>
                <option value="KITCHEN">Cocina</option>
                <option value="MANAGER">Gerente</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>

            {!editingUser && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PIN (4-6 dígitos)</label>
              <input
                type="text"
                maxLength={6}
                placeholder="1234"
                value={formData.pin}
                onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">PIN numérico para acceso rápido en POS y KDS</p>
            </div>

            {/* Permisos de Acceso */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Permisos de Acceso</h4>
              <div className="space-y-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.canAccessPos}
                    onChange={(e) => setFormData({ ...formData, canAccessPos: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Acceso al POS (Punto de Venta)</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.canAccessKds}
                    onChange={(e) => setFormData({ ...formData, canAccessKds: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Acceso al KDS (Cocina)</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.canAccessAdmin}
                    onChange={(e) => setFormData({ ...formData, canAccessAdmin: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Acceso al Admin Panel</span>
                </label>
              </div>
            </div>

            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Usuario activo</span>
            </label>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                {editingUser ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default UsersPage;
