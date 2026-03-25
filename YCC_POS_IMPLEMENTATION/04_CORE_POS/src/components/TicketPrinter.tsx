import React from 'react';
import { X } from 'lucide-react';
import { loadPrinterConfig, PrinterConfig } from '../config/printerConfig';

export interface TicketData {
  folio: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  taxAmount: number;
  total: number;
  paymentMethod: string;
  amountPaid?: number;
  changeAmount?: number;
  customerName?: string;
  date: Date;
  cashier: string;
}

export interface PrinterOptions {
  printerType: 'bluetooth' | 'usb' | 'network';
  printerName?: string;
  copies?: number;
}

export class TicketPrinter {
  static generateTicketHTML(ticket: TicketData, config?: PrinterConfig): string {
    const printerConfig = config || loadPrinterConfig();
    const items = ticket.items.map(item => `
      <tr>
        <td style="padding: 4px 0; font-size: ${printerConfig.fontSize.normal}px; line-height: 1.4;">
          <strong>${item.quantity}x</strong> ${item.name}
        </td>
        <td style="padding: 4px 0; font-size: ${printerConfig.fontSize.normal}px; text-align: right; white-space: nowrap;">$${item.totalPrice.toFixed(2)}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Ticket - ${ticket.folio}</title>
          <style>
            @page {
              size: ${printerConfig.paperWidth}mm auto;
              margin: 2mm;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Courier New', 'Consolas', monospace;
              margin: 0;
              padding: 8px;
              width: ${printerConfig.paperWidth - 4}mm;
              font-size: ${printerConfig.fontSize.normal}px;
              color: #000;
              line-height: 1.3;
            }
            .header {
              text-align: center;
              margin-bottom: 12px;
              border-bottom: 2px dashed #000;
              padding-bottom: 8px;
            }
            .header h1 {
              font-size: ${printerConfig.fontSize.header}px;
              margin: 0 0 4px 0;
              font-weight: bold;
              letter-spacing: 1px;
            }
            .header .subtitle {
              font-size: ${printerConfig.fontSize.normal}px;
              margin: 3px 0;
              font-weight: bold;
            }
            .header p {
              font-size: ${printerConfig.fontSize.small}px;
              margin: 2px 0;
              line-height: 1.4;
            }
            .separator {
              border-top: 1px dashed #000;
              margin: 8px 0;
            }
            .separator-solid {
              border-top: 2px solid #000;
              margin: 8px 0;
            }
            .info {
              margin-bottom: 8px;
              font-size: ${printerConfig.fontSize.normal}px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin: 3px 0;
              line-height: 1.4;
            }
            .info-row .label {
              font-weight: normal;
            }
            .info-row .value {
              font-weight: bold;
              text-align: right;
            }
            .items-table {
              width: 100%;
              margin: 8px 0;
              border-collapse: collapse;
            }
            .items-table th {
              text-align: left;
              border-bottom: 2px solid #000;
              padding: 4px 0;
              font-size: ${printerConfig.fontSize.normal}px;
              font-weight: bold;
            }
            .items-table td {
              padding: 4px 0;
              font-size: ${printerConfig.fontSize.normal}px;
              vertical-align: top;
              line-height: 1.4;
            }
            .totals {
              border-top: 2px dashed #000;
              margin-top: 8px;
              padding-top: 8px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin: 4px 0;
              font-size: ${printerConfig.fontSize.normal}px;
              font-weight: bold;
            }
            .grand-total {
              font-size: ${printerConfig.fontSize.header}px;
              margin: 6px 0;
              padding: 6px 0;
            }
            .tax-info {
              font-size: ${printerConfig.fontSize.small}px;
              color: #555;
            }
            .tax-info .row {
              display: flex;
              justify-content: space-between;
              margin: 2px 0;
              font-weight: normal;
            }
            .payment-info {
              margin-top: 8px;
              padding-top: 8px;
              border-top: 1px dashed #000;
              font-size: ${printerConfig.fontSize.normal}px;
            }
            .footer {
              text-align: center;
              margin-top: 12px;
              padding-top: 8px;
              border-top: 2px dashed #000;
              font-size: ${printerConfig.fontSize.small}px;
              line-height: 1.5;
            }
            .footer p {
              margin: 3px 0;
            }
            strong {
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${printerConfig.businessName}</h1>
            <p class="subtitle">TICKET DE VENTA</p>
            <p>${printerConfig.businessAddress}</p>
            <p>${printerConfig.businessPhone}</p>
            ${printerConfig.businessEmail ? `<p>${printerConfig.businessEmail}</p>` : ''}
            ${printerConfig.showTaxInfo && printerConfig.taxId ? `<p>${printerConfig.taxId}</p>` : ''}
          </div>

          <div class="separator"></div>
          
          <div class="info">
            <div class="info-row">
              <span class="label">FOLIO:</span>
              <span class="value">${ticket.folio}</span>
            </div>
            <div class="info-row">
              <span class="label">FECHA:</span>
              <span class="value">${ticket.date.toLocaleDateString('es-MX')}</span>
            </div>
            <div class="info-row">
              <span class="label">HORA:</span>
              <span class="value">${ticket.date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div class="info-row">
              <span class="label">CAJERO:</span>
              <span class="value">${ticket.cashier}</span>
            </div>
            ${ticket.customerName ? `
              <div class="info-row">
                <span class="label">CLIENTE:</span>
                <span class="value">${ticket.customerName}</span>
              </div>
            ` : ''}
          </div>
          
          <div class="separator"></div>

          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 70%;">PRODUCTO</th>
                <th style="width: 30%; text-align: right;">IMPORTE</th>
              </tr>
            </thead>
            <tbody>
              ${items}
            </tbody>
          </table>

          <div class="totals">
            <div class="separator-solid"></div>
            <div class="total-row grand-total">
              <span>TOTAL:</span>
              <span>$${ticket.total.toFixed(2)}</span>
            </div>
            <div class="separator"></div>
            <div class="tax-info">
              <div class="row">
                <span>Subtotal:</span>
                <span>$${ticket.subtotal.toFixed(2)}</span>
              </div>
              <div class="row">
                <span>IVA 16% (incluido):</span>
                <span>$${ticket.taxAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div class="separator"></div>
          
          <div class="payment-info">
            <div class="info-row">
              <span class="label"><strong>MÉTODO PAGO:</strong></span>
              <span class="value"><strong>${ticket.paymentMethod === 'CASH' ? 'EFECTIVO' : ticket.paymentMethod === 'CARD' ? 'TARJETA' : 'CUENTA SOCIO'}</strong></span>
            </div>
            ${ticket.amountPaid ? `
              <div class="info-row">
                <span class="label">Recibido:</span>
                <span class="value">$${ticket.amountPaid.toFixed(2)}</span>
              </div>
            ` : ''}
            ${ticket.changeAmount && ticket.changeAmount > 0 ? `
              <div class="info-row">
                <span class="label"><strong>CAMBIO:</strong></span>
                <span class="value"><strong>$${ticket.changeAmount.toFixed(2)}</strong></span>
              </div>
            ` : ''}
          </div>

          <div class="footer">
            ${printerConfig.footerMessage.split('\n').map(line => `<p>${line}</p>`).join('')}
            <p>================================</p>
          </div>
        </body>
      </html>
    `;
  }

  static async printTicket(ticket: TicketData, options: PrinterOptions = { printerType: 'bluetooth' }): Promise<void> {
    try {
      // Generar HTML del ticket
      const ticketHTML = this.generateTicketHTML(ticket);

      // Crear ventana de impresión
      const printWindow = window.open('', '_blank', 'width=400,height=600');
      
      if (!printWindow) {
        throw new Error('No se pudo abrir la ventana de impresión. Asegúrate de permitir ventanas emergentes.');
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
