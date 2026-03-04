import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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

export const SettingsPage: React.FC = () => {
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
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-600 mt-1">Administra la configuración del sistema</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleResetSettings}
            className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            Restablecer
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
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
          className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
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
        <div className="w-64 bg-white rounded-lg shadow-md p-4">
          <nav className="space-y-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-lg shadow-md p-6">
          {/* Store Settings */}
          {activeTab === 'store' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Store className="w-6 h-6" />
                Configuración de la Tienda
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Negocio</label>
                  <input
                    type="text"
                    value={storeSettings.name}
                    onChange={(e) => setStoreSettings({...storeSettings, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">RFC / ID Fiscal</label>
                  <input
                    type="text"
                    value={storeSettings.taxId}
                    onChange={(e) => setStoreSettings({...storeSettings, taxId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                  <input
                    type="text"
                    value={storeSettings.address}
                    onChange={(e) => setStoreSettings({...storeSettings, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                  <input
                    type="tel"
                    value={storeSettings.phone}
                    onChange={(e) => setStoreSettings({...storeSettings, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={storeSettings.email}
                    onChange={(e) => setStoreSettings({...storeSettings, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Moneda</label>
                  <select
                    value={storeSettings.currency}
                    onChange={(e) => setStoreSettings({...storeSettings, currency: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="MXN">MXN - Peso Mexicano</option>
                    <option value="USD">USD - Dólar Americano</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zona Horaria</label>
                  <select
                    value={storeSettings.timezone}
                    onChange={(e) => setStoreSettings({...storeSettings, timezone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="America/Mexico_City">Ciudad de México</option>
                    <option value="America/Tijuana">Tijuana</option>
                    <option value="America/Monterrey">Monterrey</option>
                    <option value="America/Guadalajara">Guadalajara</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Idioma</label>
                  <select
                    value={storeSettings.language}
                    onChange={(e) => setStoreSettings({...storeSettings, language: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Settings className="w-6 h-6" />
                Configuración del Sistema
              </h2>
              
              <div className="space-y-6">
                {/* Backup Settings */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Copias de Seguridad
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-700">Backup Automático</p>
                        <p className="text-sm text-gray-500">Realizar copias de seguridad automáticamente</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={systemSettings.autoBackup}
                          onChange={(e) => setSystemSettings({...systemSettings, autoBackup: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Frecuencia de Backup</label>
                      <select
                        value={systemSettings.backupFrequency}
                        onChange={(e) => setSystemSettings({...systemSettings, backupFrequency: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <FolderOpen className="w-5 h-5" />
                    Inventario
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-700">Alertas de Stock Bajo</p>
                        <p className="text-sm text-gray-500">Notificar cuando el inventario sea bajo</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={systemSettings.lowStockAlert}
                          onChange={(e) => setSystemSettings({...systemSettings, lowStockAlert: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Umbral de Stock Bajo</label>
                      <input
                        type="number"
                        value={systemSettings.lowStockThreshold}
                        onChange={(e) => setSystemSettings({...systemSettings, lowStockThreshold: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={!systemSettings.lowStockAlert}
                      />
                    </div>
                  </div>
                </div>

                {/* Notification Settings */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notificaciones
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-700">Habilitar Notificaciones</p>
                        <p className="text-sm text-gray-500">Mostrar notificaciones del sistema</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={systemSettings.enableNotifications}
                          onChange={(e) => setSystemSettings({...systemSettings, enableNotifications: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Receipt Settings */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Printer className="w-5 h-5" />
                    Tickets de Venta
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-700">Imprimir Ticket Automáticamente</p>
                        <p className="text-sm text-gray-500">Imprimir ticket después de cada venta</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={systemSettings.enablePrintReceipt}
                          onChange={(e) => setSystemSettings({...systemSettings, enablePrintReceipt: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Encabezado del Ticket</label>
                      <textarea
                        value={systemSettings.receiptHeader}
                        onChange={(e) => setSystemSettings({...systemSettings, receiptHeader: e.target.value})}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pie del Ticket</label>
                      <textarea
                        value={systemSettings.receiptFooter}
                        onChange={(e) => setSystemSettings({...systemSettings, receiptFooter: e.target.value})}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CreditCard className="w-6 h-6" />
                Configuración de Pagos
              </h2>
              
              <div className="space-y-6">
                {/* Payment Methods */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4">Métodos de Pago</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-700">Efectivo</p>
                        <p className="text-sm text-gray-500">Aceptar pagos en efectivo</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={paymentSettings.enableCash}
                          onChange={(e) => setPaymentSettings({...paymentSettings, enableCash: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-700">Tarjeta de Crédito/Débito</p>
                        <p className="text-sm text-gray-500">Aceptar pagos con tarjeta</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={paymentSettings.enableCard}
                          onChange={(e) => setPaymentSettings({...paymentSettings, enableCard: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-700">Cuenta de Socio</p>
                        <p className="text-sm text-gray-500">Permitir cargos a cuenta de socios</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={paymentSettings.enableAccount}
                          onChange={(e) => setPaymentSettings({...paymentSettings, enableAccount: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Account Settings */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4">Configuración de Cuenta de Socio</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Límite de Crédito</label>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">$</span>
                      <input
                        type="number"
                        value={paymentSettings.accountCreditLimit}
                        onChange={(e) => setPaymentSettings({...paymentSettings, accountCreditLimit: parseInt(e.target.value) || 0})}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={!paymentSettings.enableAccount}
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Límite máximo de crédito para cuentas de socio</p>
                  </div>
                </div>

                {/* Card Processor */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4">Procesador de Tarjetas</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Procesador de Pago</label>
                    <select
                      value={paymentSettings.cardProcessor}
                      onChange={(e) => setPaymentSettings({...paymentSettings, cardProcessor: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Smartphone className="w-6 h-6" />
                Configuración de Hardware
              </h2>
              
              <div className="space-y-6">
                {/* Cash Drawer */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Cajón de Dinero
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Puerto del Cajón</label>
                    <select
                      value={paymentSettings.cashDrawerPort}
                      onChange={(e) => setPaymentSettings({...paymentSettings, cashDrawerPort: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="COM1">COM1</option>
                      <option value="COM2">COM2</option>
                      <option value="COM3">COM3</option>
                      <option value="COM4">COM4</option>
                      <option value="USB">USB</option>
                    </select>
                    <p className="text-sm text-gray-500 mt-1">Puerto de conexión del cajón de dinero</p>
                  </div>
                </div>

                {/* System Status */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <HardDrive className="w-5 h-5" />
                    Estado del Sistema
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Espacio en Disco</span>
                      <span className="text-sm font-medium text-green-600">45.2 GB libre</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Memoria RAM</span>
                      <span className="text-sm font-medium text-green-600">6.8 GB libre</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Conexión a Red</span>
                      <span className="text-sm font-medium text-green-600">Estable</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Base de Datos</span>
                      <span className="text-sm font-medium text-green-600">Conectada</span>
                    </div>
                  </div>
                </div>

                {/* Network */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Wifi className="w-5 h-5" />
                    Conexión de Red
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">IP Local</span>
                      <span className="text-sm font-medium text-gray-900">192.168.1.100</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Gateway</span>
                      <span className="text-sm font-medium text-gray-900">192.168.1.1</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">DNS</span>
                      <span className="text-sm font-medium text-gray-900">8.8.8.8</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Velocidad de Conexión</span>
                      <span className="text-sm font-medium text-green-600">95 Mbps</span>
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
