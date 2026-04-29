// Configuración de impresora térmica para tickets
export interface TaxConfig {
  enabled: boolean;
  rate: number; // Porcentaje (ej: 16 para 16%)
  included: boolean; // true = precios incluyen IVA, false = IVA se agrega al subtotal
  name: string; // "IVA", "IEPS", etc.
  code: string; // "IVA", "IEPS", "ISR"
}

export interface PrinterConfig {
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail?: string;
  taxId?: string; // RFC en México
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
  tax: TaxConfig;
  // Opciones de impresión
  printCopies: number;
  cutPaper: boolean;
  openDrawer: boolean; // Abrir caja registradora
}

// Configuración por defecto - Estándares México (IVA 16% incluido)
export const DEFAULT_PRINTER_CONFIG: PrinterConfig = {
  businessName: 'YCC COUNTRY CLUB',
  businessAddress: 'Av. Principal 123, Mérida, Yucatán',
  businessPhone: 'Tel: (999) 123-4567',
  businessEmail: 'contacto@ycc.com',
  taxId: 'RFC: YCC123456ABC',
  footerMessage: '¡Gracias por su visita!\nVuelva pronto\nEste documento no es un CFDI\nPara facturar solicite su ticket',
  paperWidth: 80,
  fontSize: {
    header: 20,
    normal: 14,
    small: 12
  },
  showLogo: false,
  showTaxInfo: true,
  tax: {
    enabled: true,
    rate: 16,
    included: true, // En México los precios generalmente incluyen IVA
    name: 'IVA',
    code: 'IVA'
  },
  printCopies: 1,
  cutPaper: true,
  openDrawer: false
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
