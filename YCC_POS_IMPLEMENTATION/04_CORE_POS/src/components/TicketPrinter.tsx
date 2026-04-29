import React from 'react';
import { X } from 'lucide-react';
import { loadPrinterConfig, PrinterConfig } from '../config/printerConfig';

const displayFolio = (folio: string) => {
  if (!folio) return '#---';
  if (folio.includes('-')) {
    const num = folio.split('-')[1];
    return `#${num.padStart(3, '0')}`;
  }
  return `#${folio.padStart(3, '0')}`;
};

// Tipos de items con información de estación para comandas múltiples
export interface TicketItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  stationName?: string;
  stationId?: string;
  modifiers?: string[];
  notes?: string;
}

export interface TicketData {
  folio: string;
  items: TicketItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  discountAmount?: number;
  paymentMethod: string;
  amountPaid?: number;
  changeAmount?: number;
  customerName?: string;
  customerId?: string;
  tableNumber?: string;
  orderType?: string;
  date: Date;
  cashier: string;
  terminalName?: string;
  // Para pagos divididos
  splitPayments?: Array<{ method: string; amount: number }>;
}

export interface PrinterOptions {
  printerType: 'bluetooth' | 'usb' | 'network';
  printerName?: string;
  copies?: number;
}

// Función para obtener el nombre del método de pago en español
const getPaymentMethodName = (method: string): string => {
  const methods: Record<string, string> = {
    'CASH': 'EFECTIVO',
    'CARD': 'TARJETA',
    'CREDIT_CARD': 'TARJETA CRÉDITO',
    'DEBIT_CARD': 'TARJETA DÉBITO',
    'MEMBER_ACCOUNT': 'CUENTA SOCIO',
    'TRANSFER': 'TRANSFERENCIA',
    'CHEQUE': 'CHEQUE',
    'VALE': 'VALE',
    'OTHER': 'OTRO'
  };
  return methods[method] || method.toUpperCase();
};

// Función para obtener tipo de orden en español
const getOrderTypeName = (type?: string): string => {
  if (!type) return '';
  const types: Record<string, string> = {
    'MESA': 'MESA',
    'LLEVAR': 'PARA LLEVAR',
    'BARRA': 'BARRA',
    'PEDIDO': 'PEDIDO',
    'COUNTER': 'MOSTRADOR',
    'TABLE': 'MESA',
    'DELIVERY': 'ENVÍO A DOMICILIO',
    'TAKEOUT': 'PARA LLEVAR'
  };
  return types[type] || type.toUpperCase();
};

export class TicketPrinter {
  static generateTicketHTML(ticket: TicketData, config?: PrinterConfig): string {
    const printerConfig = config || loadPrinterConfig();
    const tax = printerConfig.tax;
    
    // Calcular desglose de impuestos según configuración
    const taxRate = tax.rate / 100;
    let subtotalDisplay: number;
    let taxDisplay: number;
    let taxIncludedText: string;
    
    if (tax.enabled) {
      if (tax.included) {
        // IVA incluido en precios: desglosar del total
        subtotalDisplay = ticket.total / (1 + taxRate);
        taxDisplay = ticket.total - subtotalDisplay;
        taxIncludedText = `(${tax.rate}% INCLUIDO)`;
      } else {
        // IVA no incluido: sumar al subtotal
        subtotalDisplay = ticket.subtotal;
        taxDisplay = ticket.taxAmount;
        taxIncludedText = `(${tax.rate}%)`;
      }
    } else {
      subtotalDisplay = ticket.total;
      taxDisplay = 0;
      taxIncludedText = '';
    }

    // Agrupar items por estación si hay stationName
    const hasStations = ticket.items.some(item => item.stationName);
    let itemsHTML = '';
    
    if (hasStations) {
      // Agrupar por estación
      const grouped = ticket.items.reduce((acc, item) => {
        const station = item.stationName || 'GENERAL';
        if (!acc[station]) acc[station] = [];
        acc[station].push(item);
        return acc;
      }, {} as Record<string, TicketItem[]>);
      
      itemsHTML = Object.entries(grouped).map(([station, items]) => `
        <tr>
          <td colspan="2" style="padding: 6px 0 3px 0; font-size: ${printerConfig.fontSize.small}px; font-weight: 900; text-transform: uppercase; border-top: 1px dotted #666;">
            ► ${station}
          </td>
        </tr>
        ${items.map(item => `
          <tr>
            <td style="padding: 3px 0 3px 8px; font-size: ${printerConfig.fontSize.normal}px; line-height: 1.3;">
              <strong>${item.quantity}x</strong> ${item.name}
              ${item.modifiers?.length ? `<br/><span style="font-size: ${printerConfig.fontSize.small - 1}px; color: #555;">   ${item.modifiers.join(', ')}</span>` : ''}
              ${item.notes ? `<br/><span style="font-size: ${printerConfig.fontSize.small - 1}px; color: #555; font-style: italic;">   *${item.notes}</span>` : ''}
            </td>
            <td style="padding: 3px 0; font-size: ${printerConfig.fontSize.normal}px; text-align: right; white-space: nowrap; vertical-align: top;">
              $${item.totalPrice.toFixed(2)}
            </td>
          </tr>
        `).join('')}
      `).join('');
    } else {
      // Sin agrupación por estación
      itemsHTML = ticket.items.map(item => `
        <tr>
          <td style="padding: 4px 0; font-size: ${printerConfig.fontSize.normal}px; line-height: 1.4;">
            <strong>${item.quantity}x</strong> ${item.name}
            ${item.modifiers?.length ? `<br/><span style="font-size: ${printerConfig.fontSize.small}px; color: #555;">   ${item.modifiers.join(', ')}</span>` : ''}
            ${item.notes ? `<br/><span style="font-size: ${printerConfig.fontSize.small}px; color: #555; font-style: italic;">   *${item.notes}</span>` : ''}
          </td>
          <td style="padding: 4px 0; font-size: ${printerConfig.fontSize.normal}px; text-align: right; white-space: nowrap; vertical-align: top;">
            $${item.totalPrice.toFixed(2)}
          </td>
        </tr>
      `).join('');
    }

    // Generar sección de pagos divididos si existen
    let splitPaymentsHTML = '';
    if (ticket.splitPayments && ticket.splitPayments.length > 0) {
      splitPaymentsHTML = `
        <div style="margin-top: 8px; padding-top: 6px; border-top: 1px dotted #666;">
          <div style="font-size: ${printerConfig.fontSize.small}px; font-weight: 900; margin-bottom: 4px;">PAGO DIVIDIDO:</div>
          ${ticket.splitPayments.map(p => `
            <div style="display: flex; justify-content: space-between; font-size: ${printerConfig.fontSize.normal}px; padding: 2px 0;">
              <span>${getPaymentMethodName(p.method)}</span>
              <span>$${p.amount.toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    // Fecha formateada con hora completa
    const dateStr = ticket.date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const timeStr = ticket.date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Ticket ${displayFolio(ticket.folio)}</title>
          <style>
            @page {
              size: ${printerConfig.paperWidth}mm auto;
              margin: 0;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Courier New', 'Courier', monospace;
              width: ${printerConfig.paperWidth}mm;
              font-size: ${printerConfig.fontSize.normal}px;
              color: #000;
              line-height: 1.3;
              padding: 4mm;
            }
            
            /* ENCABEZADO */
            .header {
              text-align: center;
              margin-bottom: 8px;
              padding-bottom: 6px;
              border-bottom: 2px solid #000;
            }
            .header .logo-area {
              font-size: ${printerConfig.fontSize.header - 2}px;
              font-weight: bold;
              letter-spacing: 2px;
              margin-bottom: 4px;
            }
            .header .business-name {
              font-size: ${printerConfig.fontSize.header}px;
              font-weight: 900;
              text-transform: uppercase;
              margin: 4px 0;
            }
            .header .subtitle {
              font-size: ${printerConfig.fontSize.normal + 2}px;
              font-weight: 700;
              margin: 4px 0;
              letter-spacing: 1px;
            }
            .header .tax-id {
              font-size: ${printerConfig.fontSize.small}px;
              margin-top: 4px;
              font-weight: 600;
            }
            .header .address {
              font-size: ${printerConfig.fontSize.small}px;
              line-height: 1.2;
              margin-top: 2px;
            }
            
            /* SEPARADORES */
            .separator {
              border-top: 1px dashed #333;
              margin: 6px 0;
            }
            .separator-double {
              border-top: 2px solid #000;
              border-bottom: 1px solid #000;
              height: 3px;
              margin: 6px 0;
            }
            
            /* INFO DE ORDEN */
            .order-info {
              margin: 6px 0;
            }
            .order-info-row {
              display: flex;
              justify-content: space-between;
              font-size: ${printerConfig.fontSize.normal}px;
              padding: 1px 0;
            }
            .order-info-label {
              font-weight: 600;
            }
            .order-info-value {
              font-weight: 700;
            }
            .order-type-badge {
              background: #000;
              color: #fff;
              padding: 1px 6px;
              font-size: ${printerConfig.fontSize.small}px;
              font-weight: 900;
            }
            
            /* TABLA DE ITEMS */
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin: 6px 0;
            }
            .items-table thead th {
              text-align: left;
              border-bottom: 2px solid #000;
              padding: 4px 0;
              font-size: ${printerConfig.fontSize.normal - 1}px;
              font-weight: 900;
              text-transform: uppercase;
            }
            .items-table thead th:last-child {
              text-align: right;
            }
            .items-table tbody td {
              padding: 2px 0;
              vertical-align: top;
            }
            
            /* TOTALES */
            .totals-section {
              margin-top: 8px;
              padding-top: 6px;
              border-top: 2px solid #000;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 2px 0;
              font-size: ${printerConfig.fontSize.normal}px;
            }
            .total-row.subtotal {
              font-weight: 600;
            }
            .total-row.tax {
              font-size: ${printerConfig.fontSize.small}px;
              color: #333;
            }
            .total-row.discount {
              color: #d32f2f;
            }
            .total-row.grand-total {
              font-size: ${printerConfig.fontSize.header}px;
              font-weight: 900;
              padding: 6px 0;
              border-top: 1px solid #000;
              border-bottom: 2px solid #000;
              margin: 4px 0;
            }
            .tax-notice {
              text-align: center;
              font-size: ${printerConfig.fontSize.small - 1}px;
              font-weight: 600;
              margin: 4px 0;
              font-style: italic;
            }
            
            /* PAGO */
            .payment-section {
              margin-top: 8px;
              padding-top: 6px;
              border-top: 1px dashed #333;
            }
            .payment-title {
              font-size: ${printerConfig.fontSize.normal}px;
              font-weight: 900;
              text-transform: uppercase;
              margin-bottom: 4px;
            }
            .payment-method {
              font-size: ${printerConfig.fontSize.normal + 2}px;
              font-weight: 900;
              background: #f0f0f0;
              padding: 4px 8px;
              text-align: center;
              margin: 4px 0;
              border: 1px solid #000;
            }
            .payment-row {
              display: flex;
              justify-content: space-between;
              font-size: ${printerConfig.fontSize.normal}px;
              padding: 2px 0;
            }
            .payment-row.received {
              font-weight: 700;
            }
            .payment-row.change {
              font-size: ${printerConfig.fontSize.normal + 2}px;
              font-weight: 900;
              color: #2e7d32;
            }
            
            /* PIE */
            .footer {
              text-align: center;
              margin-top: 12px;
              padding-top: 8px;
              border-top: 2px dashed #000;
            }
            .footer-line {
              font-size: ${printerConfig.fontSize.small}px;
              margin: 3px 0;
              line-height: 1.3;
            }
            .footer-disclaimer {
              font-size: ${printerConfig.fontSize.small - 1}px;
              font-weight: 600;
              margin-top: 6px;
              padding: 4px;
              border: 1px solid #000;
            }
            .barcode-area {
              font-family: monospace;
              font-size: ${printerConfig.fontSize.normal + 4}px;
              letter-spacing: 4px;
              margin: 8px 0;
              text-align: center;
            }
            
            /* UTILIDADES */
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: 700; }
            .font-black { font-weight: 900; }
            .uppercase { text-transform: uppercase; }
            .small { font-size: ${printerConfig.fontSize.small}px; }
            .tiny { font-size: ${printerConfig.fontSize.small - 1}px; }
          </style>
        </head>
        <body>
          <!-- ENCABEZADO -->
          <div class="header">
            <div class="logo-area">═══════════════════</div>
            <div class="business-name">${printerConfig.businessName}</div>
            <div class="subtitle">TICKET DE VENTA</div>
            ${printerConfig.showTaxInfo && printerConfig.taxId ? `
              <div class="tax-id">${printerConfig.taxId}</div>
            ` : ''}
            <div class="address">
              ${printerConfig.businessAddress}<br/>
              ${printerConfig.businessPhone}
            </div>
          </div>
          
          <div class="separator"></div>
          
          <!-- INFO DE ORDEN -->
          <div class="order-info">
            <div class="order-info-row">
              <span class="order-info-label">FOLIO:</span>
              <span class="order-info-value font-black">${displayFolio(ticket.folio)}</span>
            </div>
            <div class="order-info-row">
              <span class="order-info-label">FECHA:</span>
              <span class="order-info-value">${dateStr} ${timeStr}</span>
            </div>
            ${ticket.orderType ? `
              <div class="order-info-row">
                <span class="order-info-label">TIPO:</span>
                <span class="order-type-badge">${getOrderTypeName(ticket.orderType)}</span>
              </div>
            ` : ''}
            ${ticket.tableNumber ? `
              <div class="order-info-row">
                <span class="order-info-label">MESA:</span>
                <span class="order-info-value font-black">${ticket.tableNumber}</span>
              </div>
            ` : ''}
            ${ticket.terminalName ? `
              <div class="order-info-row">
                <span class="order-info-label">TERMINAL:</span>
                <span class="order-info-value">${ticket.terminalName}</span>
              </div>
            ` : ''}
            <div class="order-info-row">
              <span class="order-info-label">CAJERO:</span>
              <span class="order-info-value">${ticket.cashier.toUpperCase()}</span>
            </div>
            ${ticket.customerName ? `
              <div class="order-info-row" style="margin-top: 4px; padding-top: 4px; border-top: 1px dotted #999;">
                <span class="order-info-label font-black">CLIENTE:</span>
                <span class="order-info-value font-black">${ticket.customerName.toUpperCase()}</span>
              </div>
            ` : ''}
            ${ticket.customerId ? `
              <div class="order-info-row small">
                <span class="order-info-label">NO. SOCIO:</span>
                <span class="order-info-value">${ticket.customerId}</span>
              </div>
            ` : ''}
          </div>
          
          <div class="separator"></div>
          
          <!-- ITEMS -->
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 75%;">DESCRIPCIÓN</th>
                <th style="width: 25%; text-align: right;">IMPORTE</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
          
          <div class="separator-double"></div>
          
          <!-- TOTALES -->
          <div class="totals-section">
            ${tax.enabled && tax.included ? `
              <div class="tax-notice">PRECIOS INCLUYEN ${tax.name} ${tax.rate}%</div>
            ` : ''}
            
            <div class="total-row subtotal">
              <span>SUBTOTAL:</span>
              <span>$${subtotalDisplay.toFixed(2)}</span>
            </div>
            
            ${tax.enabled ? `
              <div class="total-row tax">
                <span>${tax.name} ${tax.rate}% ${taxIncludedText}:</span>
                <span>$${taxDisplay.toFixed(2)}</span>
              </div>
            ` : ''}
            
            ${ticket.discountAmount && ticket.discountAmount > 0 ? `
              <div class="total-row discount">
                <span>DESCUENTO:</span>
                <span>-$${ticket.discountAmount.toFixed(2)}</span>
              </div>
            ` : ''}
            
            <div class="total-row grand-total">
              <span class="uppercase">TOTAL A PAGAR:</span>
              <span>$${ticket.total.toFixed(2)}</span>
            </div>
            
            ${!tax.included && tax.enabled ? `
              <div class="tax-notice">${tax.name} NO INCLUIDO EN PRECIOS</div>
            ` : ''}
          </div>
          
          <div class="separator"></div>
          
          <!-- PAGO -->
          <div class="payment-section">
            <div class="payment-title">FORMA DE PAGO</div>
            
            ${ticket.splitPayments && ticket.splitPayments.length > 0 ? splitPaymentsHTML : `
              <div class="payment-method">
                ${getPaymentMethodName(ticket.paymentMethod)}
              </div>
            `}
            
            ${ticket.amountPaid && ticket.amountPaid > ticket.total ? `
              <div class="payment-row received">
                <span>EFECTIVO RECIBIDO:</span>
                <span>$${ticket.amountPaid.toFixed(2)}</span>
              </div>
              ${ticket.changeAmount && ticket.changeAmount > 0 ? `
                <div class="payment-row change">
                  <span>CAMBIO:</span>
                  <span>$${ticket.changeAmount.toFixed(2)}</span>
                </div>
              ` : ''}
            ` : ''}
          </div>
          
          <div class="separator"></div>
          
          <!-- PIE -->
          <div class="footer">
            <div class="barcode-area">*${ticket.folio}*</div>
            
            ${printerConfig.footerMessage.split('\n').map(line => `
              <div class="footer-line">${line}</div>
            `).join('')}
            
            <div class="footer-disclaimer">
              Este documento es un comprobante de venta.<br/>
              No es un CFDI (Comprobante Fiscal Digital).<br/>
              Para facturar solicite su ticket al cajero.
            </div>
            
            <div class="footer-line" style="margin-top: 8px; font-size: ${printerConfig.fontSize.small - 2}px;">
              ${dateStr} ${timeStr} - ${ticket.cashier}
            </div>
          </div>
        </body>
      </html>
    `;
  }

  static async printTicket(ticket: TicketData, options: PrinterOptions = { printerType: 'bluetooth' }): Promise<void> {
    try {
      // Generar HTML del ticket
      const ticketHTML = this.generateTicketHTML(ticket);

      // Intentar abrir ventana de impresión
      const printWindow = window.open('', '_blank', 'width=400,height=600');
      
      // Si el navegador bloqueó la ventana, usar iframe oculto como fallback
      if (!printWindow || printWindow.closed || typeof printWindow.closed === 'undefined') {
        console.warn('Ventana de impresión bloqueada. Usando método alternativo (iframe)...');
        
        // Crear iframe oculto para imprimir
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.opacity = '0';
        iframe.style.pointerEvents = 'none';
        document.body.appendChild(iframe);
        
        const iframeDoc = iframe.contentWindow?.document;
        if (!iframeDoc) {
          throw new Error('No se pudo crear el iframe de impresión');
        }
        
        iframeDoc.open();
        iframeDoc.write(ticketHTML);
        iframeDoc.close();
        
        // Esperar y luego imprimir
        setTimeout(() => {
          try {
            iframe.contentWindow?.print();
            // Limpiar después de imprimir
            setTimeout(() => {
              document.body.removeChild(iframe);
            }, 1000);
          } catch (e) {
            console.error('Error imprimiendo desde iframe:', e);
            document.body.removeChild(iframe);
          }
        }, 500);
        
        return; // Salir del método, ya se imprimió por iframe
      }

      // Escribir contenido en la ventana
      printWindow.document.write(ticketHTML);
      printWindow.document.close();

      // Esperar a que se cargue el contenido
      printWindow.onload = () => {
        // Configurar opciones de impresión
        printWindow.print();
        
        // Cerrar ventana después de imprimir
        printWindow.onafterprint = () => {
          printWindow.close();
        };

        // Fallback por si onafterprint no funciona
        setTimeout(() => {
          if (!printWindow.closed) {
            printWindow.close();
          }
        }, 1000);
      };

    } catch (error) {
      console.error('Error imprimiendo ticket:', error);
      throw error;
    }
  }

  static async detectPrinters(): Promise<PrinterOptions[]> {
    // Simulación de detección de impresoras
    // En una implementación real, esto usaría la API de impresoras del navegador o una librería específica
    return [
      { printerType: 'bluetooth', printerName: 'POS-THERMAL-BT1' },
      { printerType: 'bluetooth', printerName: 'POS-THERMAL-BT2' },
      { printerType: 'usb', printerName: 'POS-THERMAL-USB1' },
      { printerType: 'network', printerName: 'POS-NET-01' }
    ];
  }

  static async testPrinter(printerName: string): Promise<boolean> {
    try {
      // Imprimir ticket de prueba
      const testTicket: TicketData = {
        folio: 'TEST-' + Date.now(),
        items: [
          { name: 'Producto de Prueba', quantity: 1, unitPrice: 10.00, totalPrice: 10.00 }
        ],
        subtotal: 10.00,
        taxAmount: 1.60,
        total: 11.60,
        paymentMethod: 'CASH',
        amountPaid: 20.00,
        changeAmount: 8.40,
        date: new Date(),
        cashier: 'Cajero Test'
      };

      await this.printTicket(testTicket, { printerType: 'bluetooth', printerName });
      return true;
    } catch (error) {
      console.error('Error en prueba de impresora:', error);
      return false;
    }
  }
}

// Componente React para selección de impresora
export const PrinterSelector: React.FC<{
  onSelectPrinter: (printer: PrinterOptions) => void;
  onClose: () => void;
}> = ({ onSelectPrinter, onClose }) => {
  const [printers, setPrinters] = React.useState<PrinterOptions[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [testing, setTesting] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadPrinters = async () => {
      try {
        const availablePrinters = await TicketPrinter.detectPrinters();
        setPrinters(availablePrinters);
      } catch (error) {
        console.error('Error detectando impresoras:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPrinters();
  }, []);

  const handleTestPrinter = async (printerName: string) => {
    setTesting(printerName);
    try {
      const success = await TicketPrinter.testPrinter(printerName);
      if (success) {
        alert('✅ Impresora funcionando correctamente');
      } else {
        alert('❌ Error al imprimir. Verifique la conexión.');
      }
    } catch (error) {
      alert('❌ Error al probar impresora');
    } finally {
      setTesting(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Seleccionar Impresora</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Buscando impresoras...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {printers.map((printer, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{printer.printerName}</div>
                      <div className="text-sm text-gray-500 capitalize">{printer.printerType}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTestPrinter(printer.printerName || '')}
                        disabled={testing === printer.printerName}
                        className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                      >
                        {testing === printer.printerName ? 'Probando...' : 'Probar'}
                      </button>
                      <button
                        onClick={() => onSelectPrinter(printer)}
                        className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
                      >
                        Seleccionar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Conexiones Disponibles:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>🔵 Bluetooth - Impresoras térmicas portátiles</li>
              <li>⚡ USB - Impresoras conectadas directamente</li>
              <li>🌐 Red - Impresoras de red Wi-Fi/Ethernet</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
