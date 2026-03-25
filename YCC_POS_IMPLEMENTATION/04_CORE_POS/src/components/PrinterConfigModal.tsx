import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw, Printer } from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  loadPrinterConfig, 
  savePrinterConfig, 
  resetPrinterConfig, 
  DEFAULT_PRINTER_CONFIG,
  PrinterConfig 
} from '../config/printerConfig';

interface PrinterConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrinterConfigModal: React.FC<PrinterConfigModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<PrinterConfig>(DEFAULT_PRINTER_CONFIG);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const currentConfig = loadPrinterConfig();
      setConfig(currentConfig);
      setHasChanges(false);
    }
  }, [isOpen]);

  const handleChange = (field: keyof PrinterConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleFontSizeChange = (field: 'header' | 'normal' | 'small', value: number) => {
    setConfig(prev => ({
      ...prev,
      fontSize: { ...prev.fontSize, [field]: value }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    savePrinterConfig(config);
    setHasChanges(false);
    alert('✅ Configuración guardada correctamente');
  };

  const handleReset = () => {
    if (confirm('¿Estás seguro de restaurar la configuración por defecto?')) {
      resetPrinterConfig();
      setConfig(DEFAULT_PRINTER_CONFIG);
      setHasChanges(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Printer className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Configuración de Impresora</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Información del Negocio */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Información del Negocio
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Negocio
              </label>
              <input
                type="text"
                value={config.businessName}
                onChange={(e) => handleChange('businessName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="YCC COUNTRY CLUB"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <input
                type="text"
                value={config.businessAddress}
                onChange={(e) => handleChange('businessAddress', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Av. Principal 123, Mérida, Yucatán"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="text"
                value={config.businessPhone}
                onChange={(e) => handleChange('businessPhone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tel: (999) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email (opcional)
              </label>
              <input
                type="email"
                value={config.businessEmail || ''}
                onChange={(e) => handleChange('businessEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="contacto@ycc.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RFC (opcional)
              </label>
              <input
                type="text"
                value={config.taxId || ''}
                onChange={(e) => handleChange('taxId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="RFC: YCC123456ABC"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showTaxInfo"
                checked={config.showTaxInfo}
                onChange={(e) => handleChange('showTaxInfo', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="showTaxInfo" className="text-sm text-gray-700">
                Mostrar información fiscal en tickets
              </label>
            </div>
          </div>

          {/* Mensaje de Pie */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Mensaje de Despedida
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Texto del pie de página (usa \n para saltos de línea)
              </label>
              <textarea
                value={config.footerMessage}
                onChange={(e) => handleChange('footerMessage', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="¡Gracias por su visita!\nVuelva pronto"
              />
            </div>
          </div>

          {/* Configuración de Papel */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Configuración de Papel
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ancho del papel (mm)
              </label>
              <select
                value={config.paperWidth}
                onChange={(e) => handleChange('paperWidth', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="58">58mm (Portátil)</option>
                <option value="80">80mm (Estándar)</option>
              </select>
            </div>
          </div>

          {/* Tamaños de Fuente */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Tamaños de Fuente
            </h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Encabezado
                </label>
                <input
                  type="number"
                  min="10"
                  max="20"
                  value={config.fontSize.header}
                  onChange={(e) => handleFontSizeChange('header', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Normal
                </label>
                <input
                  type="number"
                  min="8"
                  max="16"
                  value={config.fontSize.normal}
                  onChange={(e) => handleFontSizeChange('normal', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pequeño
                </label>
                <input
                  type="number"
                  min="6"
                  max="12"
                  value={config.fontSize.small}
                  onChange={(e) => handleFontSizeChange('small', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Vista Previa */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Vista Previa:</h3>
            <div className="bg-white border border-gray-300 rounded p-4 text-center font-mono text-xs">
              <div style={{ fontSize: `${config.fontSize.header}px` }} className="font-bold mb-2">
                {config.businessName}
              </div>
              <div style={{ fontSize: `${config.fontSize.small}px` }} className="mb-2">
                {config.businessAddress}
              </div>
              <div style={{ fontSize: `${config.fontSize.small}px` }} className="mb-2">
                {config.businessPhone}
              </div>
              <div className="border-t border-dashed border-gray-400 my-2"></div>
              <div style={{ fontSize: `${config.fontSize.normal}px` }} className="font-bold">
                TICKET DE VENTA
              </div>
              <div className="border-t border-dashed border-gray-400 my-2"></div>
              <div style={{ fontSize: `${config.fontSize.small}px` }}>
                {config.footerMessage.split('\n').map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Restaurar
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Guardar Cambios
          </button>
        </div>
      </motion.div>
    </div>
  );
};
