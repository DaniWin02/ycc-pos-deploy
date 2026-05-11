import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useThemeStore } from '../stores/theme.store';
import {
  Settings, Store, CreditCard, Bell, Database,
  Smartphone, Printer, DollarSign, Save, RotateCcw,
  AlertTriangle, CheckCircle, FolderOpen, HardDrive, Wifi
} from 'lucide-react';

interface StoreSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
  currency: string;
  timezone: string;
  language: string;
}

interface SystemSettings {
  autoBackup: boolean;
  backupFrequency: string;
  lowStockAlert: boolean;
  lowStockThreshold: number;
  enableNotifications: boolean;
  enablePrintReceipt: boolean;
  receiptHeader: string;
  receiptFooter: string;
}

interface PaymentSettings {
  enableCash: boolean;
  enableCard: boolean;
  enableAccount: boolean;
  accountCreditLimit: number;
  cardProcessor: string;
  cashDrawerPort: string;
}

const ThemeToggle: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  theme: any;
}> = ({ checked, onChange, theme }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="sr-only"
    />
    <div
      className="w-11 h-6 rounded-full transition-colors"
      style={{ backgroundColor: checked ? theme.colors.primary : theme.colors.border }}
    />
    <div
      className="absolute top-[2px] h-5 w-5 rounded-full bg-white transition-transform"
      style={{ left: checked ? '24px' : '2px' }}
    />
  </label>
);

export const SettingsPage: React.FC = () => {
  const { getEffectiveConfig } = useThemeStore();
  
  // Get effective admin theme config
  const adminTheme = getEffectiveConfig('admin');
  
  // Fallback theme to prevent undefined errors
  const safeTheme = adminTheme || {
    colors: {
      textPrimary: '#0f172a',
      textSecondary: '#64748b',
      textMuted: '#94a3b8',
      surface: '#ffffff',
      border: '#e2e8f0',
      borderLight: '#f1f5f9',
      primary: '#059669', // Verde Country Club
      primaryLight: '#d1fae5', // emerald-100
      success: '#10b981',
      successLight: '#d1fae5',
      error: '#ef4444',
      errorLight: '#fef2f2'
    }
  };
  const [activeTab, setActiveTab] = useState<'store' | 'system' | 'payments' | 'hardware'>('store');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Store Settings
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    name: 'Country Club Restaurant',
    address: 'Av. Principal #123, Col. Centro',
    phone: '+52 555-123-4567',
    email: 'contact@countryclub.com',
    taxId: 'RFC123456ABC',
    currency: 'MXN',
    timezone: 'America/Mexico_City',
    language: 'es-MX'
  });

  // System Settings
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    autoBackup: true,
    backupFrequency: 'daily',
    lowStockAlert: true,
    lowStockThreshold: 10,
    enableNotifications: true,
    enablePrintReceipt: true,
    receiptHeader: 'COUNTRY CLUB RESTAURANT',
    receiptFooter: '¡Gracias por su visita!\nVuelva pronto'
  });

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    enableCash: true,
    enableCard: true,
    enableAccount: true,
    accountCreditLimit: 5000,
    cardProcessor: 'stripe',
    cashDrawerPort: 'COM1'
  });

  const tabs = [
    { id: 'store', label: 'Tienda', icon: Store },
    { id: 'system', label: 'Sistema', icon: Settings },
    { id: 'payments', label: 'Pagos', icon: CreditCard },
    { id: 'hardware', label: 'Hardware', icon: Smartphone }
  ];

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Guardar en localStorage
      localStorage.setItem('ycc-store-settings', JSON.stringify(storeSettings));
      localStorage.setItem('ycc-system-settings', JSON.stringify(systemSettings));
      localStorage.setItem('ycc-payment-settings', JSON.stringify(paymentSettings));
      
      showMessage('success', 'Configuración guardada exitosamente');
    } catch (error) {
      showMessage('error', 'Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSettings = () => {
    if (confirm('¿Está seguro de restablecer toda la configuración a los valores predeterminados?')) {
      // Resetear valores
      setStoreSettings({
        name: 'Country Club Restaurant',
        address: 'Av. Principal #123, Col. Centro',
        phone: '+52 555-123-4567',
        email: 'contact@countryclub.com',
        taxId: 'RFC123456ABC',
        currency: 'MXN',
        timezone: 'America/Mexico_City',
        language: 'es-MX'
      });
      
      setSystemSettings({
        autoBackup: true,
        backupFrequency: 'daily',
        lowStockAlert: true,
        lowStockThreshold: 10,
        enableNotifications: true,
        enablePrintReceipt: true,
        receiptHeader: 'COUNTRY CLUB RESTAURANT',
        receiptFooter: '¡Gracias por su visita!\nVuelva pronto'
      });
      
      setPaymentSettings({
        enableCash: true,
        enableCard: true,
        enableAccount: true,
        accountCreditLimit: 5000,
        cardProcessor: 'stripe',
        cashDrawerPort: 'COM1'
      });
      
      showMessage('success', 'Configuración restablecida');
    }
  };

  // Cargar settings desde localStorage al montar
  useEffect(() => {
    const savedStore = localStorage.getItem('ycc-store-settings');
    const savedSystem = localStorage.getItem('ycc-system-settings');
    const savedPayment = localStorage.getItem('ycc-payment-settings');

    if (savedStore) setStoreSettings(JSON.parse(savedStore));
    if (savedSystem) setSystemSettings(JSON.parse(savedSystem));
    if (savedPayment) setPaymentSettings(JSON.parse(savedPayment));
  }, []);

  return (
    <div className="p-6" style={{ color: safeTheme.colors.textPrimary }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: safeTheme.colors.textPrimary }}>Configuración</h1>
          <p className="mt-1" style={{ color: safeTheme.colors.textSecondary }}>Administra la configuración del sistema</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleResetSettings}
            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg transition-colors" style={{ backgroundColor: safeTheme.colors.textSecondary }}
          >
            <RotateCcw className="w-5 h-5" />
            Restablecer
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={loading}
            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50" style={{ backgroundColor: safeTheme.colors.primary }}
          >
            <Save className="w-5 h-5" />
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-lg flex items-center gap-3 border"
          style={message.type === 'success'
            ? { backgroundColor: safeTheme.colors.successLight, color: safeTheme.colors.success, borderColor: safeTheme.colors.success }
            : { backgroundColor: safeTheme.colors.errorLight, color: safeTheme.colors.error, borderColor: safeTheme.colors.error }}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          <span className="font-medium">{message.text}</span>
        </motion.div>
      )}

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 rounded-lg shadow-md p-4 border" style={{ backgroundColor: safeTheme.colors.surface, borderColor: safeTheme.colors.border }}>
          <nav className="space-y-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'font-medium'
                      : ''
                  }`}
                  style={activeTab === tab.id
                    ? { backgroundColor: safeTheme.colors.primaryLight, color: safeTheme.colors.primary }
                    : { color: safeTheme.colors.textSecondary }}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 rounded-lg shadow-md p-6 border" style={{ backgroundColor: safeTheme.colors.surface, borderColor: safeTheme.colors.border }}>
          {/* Store Settings */}
          {activeTab === 'store' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: safeTheme.colors.textPrimary }}>
                <Store className="w-6 h-6" />
                Configuración de la Tienda
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: safeTheme.colors.textSecondary }}>Nombre del Negocio</label>
                  <input
                    type="text"
                    value={storeSettings.name}
                    onChange={(e) => setStoreSettings({...storeSettings, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none" style={{ borderColor: safeTheme.colors.border, color: safeTheme.colors.textPrimary, backgroundColor: safeTheme.colors.surface }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: safeTheme.colors.textSecondary }}>RFC / ID Fiscal</label>
                  <input
                    type="text"
                    value={storeSettings.taxId}
                    onChange={(e) => setStoreSettings({...storeSettings, taxId: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none" style={{ borderColor: safeTheme.colors.border, color: safeTheme.colors.textPrimary, backgroundColor: safeTheme.colors.surface }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: safeTheme.colors.textSecondary }}>Dirección</label>
                  <input
                    type="text"
                    value={storeSettings.address}
                    onChange={(e) => setStoreSettings({...storeSettings, address: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none" style={{ borderColor: safeTheme.colors.border, color: safeTheme.colors.textPrimary, backgroundColor: safeTheme.colors.surface }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: safeTheme.colors.textSecondary }}>Teléfono</label>
                  <input
                    type="tel"
                    value={storeSettings.phone}
                    onChange={(e) => setStoreSettings({...storeSettings, phone: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none" style={{ borderColor: safeTheme.colors.border, color: safeTheme.colors.textPrimary, backgroundColor: safeTheme.colors.surface }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: safeTheme.colors.textSecondary }}>Email</label>
                  <input
                    type="email"
                    value={storeSettings.email}
                    onChange={(e) => setStoreSettings({...storeSettings, email: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none" style={{ borderColor: safeTheme.colors.border, color: safeTheme.colors.textPrimary, backgroundColor: safeTheme.colors.surface }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: safeTheme.colors.textSecondary }}>Moneda</label>
                  <select
                    value={storeSettings.currency}
                    onChange={(e) => setStoreSettings({...storeSettings, currency: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none" style={{ borderColor: safeTheme.colors.border, color: safeTheme.colors.textPrimary, backgroundColor: safeTheme.colors.surface }}
                  >
                    <option value="MXN">MXN - Peso Mexicano</option>
                    <option value="USD">USD - Dólar Americano</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: safeTheme.colors.textSecondary }}>Zona Horaria</label>
                  <select
                    value={storeSettings.timezone}
                    onChange={(e) => setStoreSettings({...storeSettings, timezone: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none" style={{ borderColor: safeTheme.colors.border, color: safeTheme.colors.textPrimary, backgroundColor: safeTheme.colors.surface }}
                  >
                    <option value="America/Mexico_City">Ciudad de México</option>
                    <option value="America/Tijuana">Tijuana</option>
                    <option value="America/Monterrey">Monterrey</option>
                    <option value="America/Guadalajara">Guadalajara</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: safeTheme.colors.textSecondary }}>Idioma</label>
                  <select
                    value={storeSettings.language}
                    onChange={(e) => setStoreSettings({...storeSettings, language: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none" style={{ borderColor: safeTheme.colors.border, color: safeTheme.colors.textPrimary, backgroundColor: safeTheme.colors.surface }}
                  >
                    <option value="es-MX">Español (México)</option>
                    <option value="en-US">English (US)</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* System Settings */}
          {activeTab === 'system' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: safeTheme.colors.textPrimary }}>
                <Settings className="w-6 h-6" />
                Configuración del Sistema
              </h2>
              
              <div className="space-y-6">
                {/* Backup Settings */}
                <div className="border rounded-lg p-4" style={{ borderColor: safeTheme.colors.border, backgroundColor: safeTheme.colors.surface }}>
                  <h3 className="font-medium mb-4 flex items-center gap-2" style={{ color: safeTheme.colors.textPrimary }}>
                    <Database className="w-5 h-5" />
                    Copias de Seguridad
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium" style={{ color: safeTheme.colors.textSecondary }}>Backup Automático</p>
                        <p className="text-sm" style={{ color: safeTheme.colors.textMuted }}>Realizar copias de seguridad automáticamente</p>
                      </div>
                      <ThemeToggle
                        checked={systemSettings.autoBackup}
                        onChange={(checked) => setSystemSettings({...systemSettings, autoBackup: checked})}
                        theme={safeTheme}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: safeTheme.colors.textSecondary }}>Frecuencia de Backup</label>
                      <select
                        value={systemSettings.backupFrequency}
                        onChange={(e) => setSystemSettings({...systemSettings, backupFrequency: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none" style={{ borderColor: safeTheme.colors.border, color: safeTheme.colors.textPrimary, backgroundColor: safeTheme.colors.surface }}
                        disabled={!systemSettings.autoBackup}
                      >
                        <option value="hourly">Cada hora</option>
                        <option value="daily">Diario</option>
                        <option value="weekly">Semanal</option>
                        <option value="monthly">Mensual</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Inventory Settings */}
                <div className="border rounded-lg p-4" style={{ borderColor: safeTheme.colors.border, backgroundColor: safeTheme.colors.surface }}>
                  <h3 className="font-medium mb-4 flex items-center gap-2" style={{ color: safeTheme.colors.textPrimary }}>
                    <FolderOpen className="w-5 h-5" />
                    Inventario
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium" style={{ color: safeTheme.colors.textSecondary }}>Alertas de Stock Bajo</p>
                        <p className="text-sm" style={{ color: safeTheme.colors.textMuted }}>Notificar cuando el inventario sea bajo</p>
                      </div>
                      <ThemeToggle
                        checked={systemSettings.lowStockAlert}
                        onChange={(checked) => setSystemSettings({...systemSettings, lowStockAlert: checked})}
                        theme={safeTheme}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: safeTheme.colors.textSecondary }}>Umbral de Stock Bajo</label>
                      <input
                        type="number"
                        value={systemSettings.lowStockThreshold}
                        onChange={(e) => setSystemSettings({...systemSettings, lowStockThreshold: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none" style={{ borderColor: safeTheme.colors.border, color: safeTheme.colors.textPrimary, backgroundColor: safeTheme.colors.surface }}
                        disabled={!systemSettings.lowStockAlert}
                      />
                    </div>
                  </div>
                </div>

                {/* Notification Settings */}
                <div className="border rounded-lg p-4" style={{ borderColor: safeTheme.colors.border, backgroundColor: safeTheme.colors.surface }}>
                  <h3 className="font-medium mb-4 flex items-center gap-2" style={{ color: safeTheme.colors.textPrimary }}>
                    <Bell className="w-5 h-5" />
                    Notificaciones
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium" style={{ color: safeTheme.colors.textSecondary }}>Habilitar Notificaciones</p>
                        <p className="text-sm" style={{ color: safeTheme.colors.textMuted }}>Mostrar notificaciones del sistema</p>
                      </div>
                      <ThemeToggle
                        checked={systemSettings.enableNotifications}
                        onChange={(checked) => setSystemSettings({...systemSettings, enableNotifications: checked})}
                        theme={safeTheme}
                      />
                    </div>
                  </div>
                </div>

                {/* Receipt Settings */}
                <div className="border rounded-lg p-4" style={{ borderColor: safeTheme.colors.border, backgroundColor: safeTheme.colors.surface }}>
                  <h3 className="font-medium mb-4 flex items-center gap-2" style={{ color: safeTheme.colors.textPrimary }}>
                    <Printer className="w-5 h-5" />
                    Tickets de Venta
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium" style={{ color: safeTheme.colors.textSecondary }}>Imprimir Ticket Automáticamente</p>
                        <p className="text-sm" style={{ color: safeTheme.colors.textMuted }}>Imprimir ticket después de cada venta</p>
                      </div>
                      <ThemeToggle
                        checked={systemSettings.enablePrintReceipt}
                        onChange={(checked) => setSystemSettings({...systemSettings, enablePrintReceipt: checked})}
                        theme={safeTheme}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: safeTheme.colors.textSecondary }}>Encabezado del Ticket</label>
                      <textarea
                        value={systemSettings.receiptHeader}
                        onChange={(e) => setSystemSettings({...systemSettings, receiptHeader: e.target.value})}
                        rows={2}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none" style={{ borderColor: safeTheme.colors.border, color: safeTheme.colors.textPrimary, backgroundColor: safeTheme.colors.surface }}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: safeTheme.colors.textSecondary }}>Pie del Ticket</label>
                      <textarea
                        value={systemSettings.receiptFooter}
                        onChange={(e) => setSystemSettings({...systemSettings, receiptFooter: e.target.value})}
                        rows={2}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none" style={{ borderColor: safeTheme.colors.border, color: safeTheme.colors.textPrimary, backgroundColor: safeTheme.colors.surface }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Payment Settings */}
          {activeTab === 'payments' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: safeTheme.colors.textPrimary }}>
                <CreditCard className="w-6 h-6" />
                Configuración de Pagos
              </h2>
              
              <div className="space-y-6">
                {/* Payment Methods */}
                <div className="border rounded-lg p-4" style={{ borderColor: safeTheme.colors.border, backgroundColor: safeTheme.colors.surface }}>
                  <h3 className="font-medium mb-4" style={{ color: safeTheme.colors.textPrimary }}>Métodos de Pago</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium" style={{ color: safeTheme.colors.textSecondary }}>Efectivo</p>
                        <p className="text-sm" style={{ color: safeTheme.colors.textMuted }}>Aceptar pagos en efectivo</p>
                      </div>
                      <ThemeToggle
                        checked={paymentSettings.enableCash}
                        onChange={(checked) => setPaymentSettings({...paymentSettings, enableCash: checked})}
                        theme={safeTheme}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium" style={{ color: safeTheme.colors.textSecondary }}>Tarjeta de Crédito/Débito</p>
                        <p className="text-sm" style={{ color: safeTheme.colors.textMuted }}>Aceptar pagos con tarjeta</p>
                      </div>
                      <ThemeToggle
                        checked={paymentSettings.enableCard}
                        onChange={(checked) => setPaymentSettings({...paymentSettings, enableCard: checked})}
                        theme={safeTheme}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium" style={{ color: safeTheme.colors.textSecondary }}>Cuenta de Socio</p>
                        <p className="text-sm" style={{ color: safeTheme.colors.textMuted }}>Permitir cargos a cuenta de socios</p>
                      </div>
                      <ThemeToggle
                        checked={paymentSettings.enableAccount}
                        onChange={(checked) => setPaymentSettings({...paymentSettings, enableAccount: checked})}
                        theme={safeTheme}
                      />
                    </div>
                  </div>
                </div>

                {/* Account Settings */}
                <div className="border rounded-lg p-4" style={{ borderColor: safeTheme.colors.border, backgroundColor: safeTheme.colors.surface }}>
                  <h3 className="font-medium mb-4" style={{ color: safeTheme.colors.textPrimary }}>Configuración de Cuenta de Socio</h3>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: safeTheme.colors.textSecondary }}>Límite de Crédito</label>
                    <div className="flex items-center gap-2">
                      <span style={{ color: safeTheme.colors.textMuted }}>$</span>
                      <input
                        type="number"
                        value={paymentSettings.accountCreditLimit}
                        onChange={(e) => setPaymentSettings({...paymentSettings, accountCreditLimit: parseInt(e.target.value) || 0})}
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none" style={{ borderColor: safeTheme.colors.border, color: safeTheme.colors.textPrimary, backgroundColor: safeTheme.colors.surface }}
                        disabled={!paymentSettings.enableAccount}
                      />
                    </div>
                    <p className="text-sm mt-1" style={{ color: safeTheme.colors.textMuted }}>Límite máximo de crédito para cuentas de socio</p>
                  </div>
                </div>

                {/* Card Processor */}
                <div className="border rounded-lg p-4" style={{ borderColor: safeTheme.colors.border, backgroundColor: safeTheme.colors.surface }}>
                  <h3 className="font-medium mb-4" style={{ color: safeTheme.colors.textPrimary }}>Procesador de Tarjetas</h3>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: safeTheme.colors.textSecondary }}>Procesador de Pago</label>
                    <select
                      value={paymentSettings.cardProcessor}
                      onChange={(e) => setPaymentSettings({...paymentSettings, cardProcessor: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none" style={{ borderColor: safeTheme.colors.border, color: safeTheme.colors.textPrimary, backgroundColor: safeTheme.colors.surface }}
                      disabled={!paymentSettings.enableCard}
                    >
                      <option value="stripe">Stripe</option>
                      <option value="square">Square</option>
                      <option value="mercadopago">Mercado Pago</option>
                      <option value="manual">Manual (Terminal Externa)</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Hardware Settings */}
          {activeTab === 'hardware' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: safeTheme.colors.textPrimary }}>
                <Smartphone className="w-6 h-6" />
                Configuración de Hardware
              </h2>
              
              <div className="space-y-6">
                {/* Cash Drawer */}
                <div className="border rounded-lg p-4" style={{ borderColor: safeTheme.colors.border, backgroundColor: safeTheme.colors.surface }}>
                  <h3 className="font-medium mb-4 flex items-center gap-2" style={{ color: safeTheme.colors.textPrimary }}>
                    <DollarSign className="w-5 h-5" />
                    Cajón de Dinero
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: safeTheme.colors.textSecondary }}>Puerto del Cajón</label>
                    <select
                      value={paymentSettings.cashDrawerPort}
                      onChange={(e) => setPaymentSettings({...paymentSettings, cashDrawerPort: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none" style={{ borderColor: safeTheme.colors.border, color: safeTheme.colors.textPrimary, backgroundColor: safeTheme.colors.surface }}
                    >
                      <option value="COM1">COM1</option>
                      <option value="COM2">COM2</option>
                      <option value="COM3">COM3</option>
                      <option value="COM4">COM4</option>
                      <option value="USB">USB</option>
                    </select>
                    <p className="text-sm mt-1" style={{ color: safeTheme.colors.textMuted }}>Puerto de conexión del cajón de dinero</p>
                  </div>
                </div>

                {/* System Status */}
                <div className="border rounded-lg p-4" style={{ borderColor: safeTheme.colors.border, backgroundColor: safeTheme.colors.surface }}>
                  <h3 className="font-medium mb-4 flex items-center gap-2" style={{ color: safeTheme.colors.textPrimary }}>
                    <HardDrive className="w-5 h-5" />
                    Estado del Sistema
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm" style={{ color: safeTheme.colors.textSecondary }}>Espacio en Disco</span>
                      <span className="text-sm font-medium" style={{ color: safeTheme.colors.success }}>45.2 GB libre</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm" style={{ color: safeTheme.colors.textSecondary }}>Memoria RAM</span>
                      <span className="text-sm font-medium" style={{ color: safeTheme.colors.success }}>6.8 GB libre</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm" style={{ color: safeTheme.colors.textSecondary }}>Conexión a Red</span>
                      <span className="text-sm font-medium" style={{ color: safeTheme.colors.success }}>Estable</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm" style={{ color: safeTheme.colors.textSecondary }}>Base de Datos</span>
                      <span className="text-sm font-medium" style={{ color: safeTheme.colors.success }}>Conectada</span>
                    </div>
                  </div>
                </div>

                {/* Network */}
                <div className="border rounded-lg p-4" style={{ borderColor: safeTheme.colors.border, backgroundColor: safeTheme.colors.surface }}>
                  <h3 className="font-medium mb-4 flex items-center gap-2" style={{ color: safeTheme.colors.textPrimary }}>
                    <Wifi className="w-5 h-5" />
                    Conexión de Red
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm" style={{ color: safeTheme.colors.textSecondary }}>IP Local</span>
                      <span className="text-sm font-medium" style={{ color: safeTheme.colors.textPrimary }}>192.168.1.100</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm" style={{ color: safeTheme.colors.textSecondary }}>Gateway</span>
                      <span className="text-sm font-medium" style={{ color: safeTheme.colors.textPrimary }}>192.168.1.1</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm" style={{ color: safeTheme.colors.textSecondary }}>DNS</span>
                      <span className="text-sm font-medium" style={{ color: safeTheme.colors.textPrimary }}>8.8.8.8</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm" style={{ color: safeTheme.colors.textSecondary }}>Velocidad de Conexión</span>
                      <span className="text-sm font-medium" style={{ color: safeTheme.colors.success }}>95 Mbps</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};





