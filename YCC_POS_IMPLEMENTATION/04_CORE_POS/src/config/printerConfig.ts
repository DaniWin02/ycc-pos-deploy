// Configuración de impresora térmica para tickets
export interface PrinterConfig {
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail?: string;
  taxId?: string;
  footerMessage: string;
  logoUrl?: string;
  paperWidth: number; // en mm (80mm es estándar)
  fontSize: {
    header: number;
    normal: number;
    small: number;
  };
  showLogo: boolean;
  showTaxInfo: boolean;
}

// Configuración por defecto
export const DEFAULT_PRINTER_CONFIG: PrinterConfig = {
  businessName: 'YCC COUNTRY CLUB',
  businessAddress: 'Av. Principal 123, Mérida, Yucatán',
  businessPhone: 'Tel: (999) 123-4567',
  businessEmail: 'contacto@ycc.com',
  taxId: 'RFC: YCC123456ABC',
  footerMessage: '¡Gracias por su visita!\nVuelva pronto',
  paperWidth: 80,
  fontSize: {
    header: 14,
    normal: 11,
    small: 9
  },
  showLogo: false,
  showTaxInfo: true
};

// Guardar configuración en localStorage
export const savePrinterConfig = (config: PrinterConfig): void => {
  try {
    localStorage.setItem('printerConfig', JSON.stringify(config));
  } catch (error) {
    console.error('Error guardando configuración de impresora:', error);
  }
};

// Cargar configuración desde localStorage
export const loadPrinterConfig = (): PrinterConfig => {
  try {
    const saved = localStorage.getItem('printerConfig');
    if (saved) {
      return { ...DEFAULT_PRINTER_CONFIG, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.error('Error cargando configuración de impresora:', error);
  }
  return DEFAULT_PRINTER_CONFIG;
};

// Resetear a configuración por defecto
export const resetPrinterConfig = (): void => {
  try {
    localStorage.removeItem('printerConfig');
  } catch (error) {
    console.error('Error reseteando configuración de impresora:', error);
  }
};
