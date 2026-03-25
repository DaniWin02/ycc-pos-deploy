import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, DollarSign, Calculator, TrendingUp, TrendingDown, AlertCircle, Printer, CheckCircle } from 'lucide-react';
import { api, endpoints } from '../lib/apiClient';

interface CashCutModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  terminalId: string;
  userId: string;
  onCutComplete?: (report: any) => void;
}

interface SessionReport {
  session: any;
  sales: {
    count: number;
    totalCash: number;
    totalCard: number;
    totalMemberAccount: number;
    total: number;
  };
  cash: {
    opening: number;
    expected: number;
    counted: number;
    difference: number;
  };
  notes: string;
}

export const CashCutModal: React.FC<CashCutModalProps> = ({
  isOpen,
  onClose,
  sessionId,
  terminalId,
  userId,
  onCutComplete
}) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'confirm' | 'complete'>('input');
  const [countedCash, setCountedCash] = useState('');
  const [notes, setNotes] = useState('');
  const [report, setReport] = useState<SessionReport | null>(null);
  const [sessionData, setSessionData] = useState<any>(null);

  // Reset state cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      console.log('🔄 Modal abierto - Reseteando estado');
      setStep('input');
      setCountedCash('');
      setNotes('');
      setReport(null);
      setLoading(false);
      if (sessionId) {
        loadSessionData();
      }
    }
  }, [isOpen, sessionId]);

  // Debug: Log cuando cambia el step
  useEffect(() => {
    console.log('📍 Step actual:', step);
    console.log('📊 Report existe:', !!report);
    console.log('🚪 Modal abierto:', isOpen);
  }, [step, report, isOpen]);

  const loadSessionData = async () => {
    try {
      const data = await api.get(`/cash-sessions/${sessionId}/report`);
      setSessionData(data);
    } catch (error) {
      console.error('Error cargando datos de sesión:', error);
    }
  };

  const handleCloseCashSession = async () => {
    if (!countedCash || parseFloat(countedCash) < 0) {
      alert('Por favor ingresa el efectivo contado');
      return;
    }

    setLoading(true);
    try {
      console.log('🔒 Cerrando caja...', {
        sessionId,
        userId,
        countedCash: parseFloat(countedCash),
        notes
      });

      const reportData = await api.post(endpoints.cashSessions.close(sessionId), {
        userId,
        countedCash: parseFloat(countedCash),
        notes
      });

      console.log('✅ Respuesta del servidor:', reportData);
      console.log('📊 Datos del reporte:', {
        hasSession: !!reportData?.session,
        hasSales: !!reportData?.sales,
        hasCash: !!reportData?.cash,
        salesCount: reportData?.sales?.count,
        difference: reportData?.cash?.difference
      });

      if (!reportData || !reportData.session) {
        console.error('❌ Respuesta inválida del servidor:', reportData);
        alert('Error: Respuesta inválida del servidor');
        return;
      }

      setReport(reportData);
      console.log('✅ Report guardado en estado');
      
      setStep('complete');
      console.log('✅ Step cambiado a complete');
      
      onCutComplete?.(reportData);
    } catch (error: any) {
      console.error('❌ Error cerrando caja:', error);
      console.error('Detalles del error:', {
        message: error.message,
        response: error.response,
        data: error.response?.data
      });
      alert(`Error al cerrar caja: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintTicket = () => {
    if (!report) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const now = new Date();
    const dateStr = now.toLocaleDateString('es-MX', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const timeStr = now.toLocaleTimeString('es-MX');

    const ticketHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Corte de Caja - ${report.session.terminal?.name || terminalId}</title>
        <meta charset="UTF-8">
        <style>
          @media print {
            @page { 
              margin: 0; 
              size: 80mm auto;
            }
            body { 
              margin: 0;
              padding: 5mm;
            }
            .no-print {
              display: none;
            }
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 11px;
            line-height: 1.4;
            max-width: 80mm;
            margin: 0 auto;
            padding: 5mm;
            background: white;
            color: #000;
          }
          
          .header {
            text-align: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px dashed #000;
          }
          
          .logo {
            font-size: 16px;
            font-weight: bold;
            letter-spacing: 1px;
            margin-bottom: 5px;
          }
          
          .subtitle {
            font-size: 14px;
            font-weight: bold;
            margin: 8px 0;
          }
          
          .date-time {
            font-size: 10px;
            margin-top: 8px;
          }
          
          .section {
            margin: 12px 0;
            padding-bottom: 10px;
            border-bottom: 1px dashed #000;
          }
          
          .section-title {
            font-weight: bold;
            font-size: 12px;
            margin-bottom: 8px;
            text-align: center;
            background: #000;
            color: #fff;
            padding: 3px;
          }
          
          .row {
            display: flex;
            justify-content: space-between;
            margin: 4px 0;
            padding: 2px 0;
          }
          
          .row-label {
            flex: 1;
          }
          
          .row-value {
            text-align: right;
            font-weight: bold;
          }
          
          .total-row {
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid #000;
            font-size: 13px;
            font-weight: bold;
          }
          
          .difference-positive {
            color: #059669;
          }
          
          .difference-negative {
            color: #dc2626;
          }
          
          .notes {
            background: #f5f5f5;
            padding: 8px;
            margin: 10px 0;
            border: 1px solid #ddd;
            font-size: 10px;
          }
          
          .footer {
            text-align: center;
            margin-top: 15px;
            padding-top: 10px;
            border-top: 2px dashed #000;
            font-size: 10px;
          }
          
          .print-button {
            position: fixed;
            top: 10px;
            right: 10px;
            padding: 10px 20px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
          }
          
          .print-button:hover {
            background: #2563eb;
          }
        </style>
      </head>
      <body>
        <button class="print-button no-print" onclick="window.print()">🖨️ Imprimir</button>
        
        <div class="header">
          <div class="logo">═══════════════════════</div>
          <div class="logo">YCC COUNTRY CLUB</div>
          <div class="logo">═══════════════════════</div>
          <div class="subtitle">CORTE DE CAJA</div>
          <div class="date-time">
            ${dateStr}<br>
            ${timeStr}
          </div>
        </div>
        
        <div class="section">
          <div class="row">
            <span class="row-label">Cajero:</span>
            <span class="row-value">${report.session.closedByUser?.firstName || ''} ${report.session.closedByUser?.lastName || 'N/A'}</span>
          </div>
          <div class="row">
            <span class="row-label">Terminal:</span>
            <span class="row-value">${report.session.terminal?.name || terminalId}</span>
          </div>
          <div class="row">
            <span class="row-label">Sesión ID:</span>
            <span class="row-value">${report.session.id.substring(0, 8)}...</span>
          </div>
        </div>
        
        <div class="section">
          <div class="row">
            <span class="row-label">Apertura:</span>
            <span class="row-value">${new Date(report.session.openedAt).toLocaleString('es-MX', { 
              hour: '2-digit', 
              minute: '2-digit',
              day: '2-digit',
              month: '2-digit'
            })}</span>
          </div>
          <div class="row">
            <span class="row-label">Cierre:</span>
            <span class="row-value">${new Date(report.session.closedAt).toLocaleString('es-MX', { 
              hour: '2-digit', 
              minute: '2-digit',
              day: '2-digit',
              month: '2-digit'
            })}</span>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">RESUMEN DE VENTAS</div>
          <div class="row">
            <span class="row-label">Transacciones:</span>
            <span class="row-value">${report.sales.count}</span>
          </div>
          <div class="row">
            <span class="row-label">Efectivo:</span>
            <span class="row-value">$${report.sales.totalCash.toFixed(2)}</span>
          </div>
          <div class="row">
            <span class="row-label">Tarjeta:</span>
            <span class="row-value">$${report.sales.totalCard.toFixed(2)}</span>
          </div>
          <div class="row">
            <span class="row-label">Cuenta Socio:</span>
            <span class="row-value">$${report.sales.totalMemberAccount.toFixed(2)}</span>
          </div>
          <div class="row total-row">
            <span class="row-label">TOTAL VENTAS:</span>
            <span class="row-value">$${report.sales.total.toFixed(2)}</span>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">EFECTIVO EN CAJA</div>
          <div class="row">
            <span class="row-label">Fondo Inicial:</span>
            <span class="row-value">$${report.cash.opening.toFixed(2)}</span>
          </div>
          <div class="row">
            <span class="row-label">+ Ventas Efectivo:</span>
            <span class="row-value">$${report.sales.totalCash.toFixed(2)}</span>
          </div>
          <div class="row">
            <span class="row-label">= Esperado:</span>
            <span class="row-value">$${report.cash.expected.toFixed(2)}</span>
          </div>
          <div class="row">
            <span class="row-label">Contado Real:</span>
            <span class="row-value">$${report.cash.counted.toFixed(2)}</span>
          </div>
          <div class="row total-row ${report.cash.difference >= 0 ? 'difference-positive' : 'difference-negative'}">
            <span class="row-label">DIFERENCIA:</span>
            <span class="row-value">${report.cash.difference >= 0 ? '+' : ''}$${report.cash.difference.toFixed(2)}</span>
          </div>
        </div>
        
        ${report.notes ? `
        <div class="notes">
          <strong>NOTAS:</strong><br>
          ${report.notes}
        </div>
        ` : ''}
        
        <div class="footer">
          <p>═══════════════════════</p>
          <p>Gracias por su preferencia</p>
          <p>YCC Country Club</p>
          <p>═══════════════════════</p>
          <p style="margin-top: 10px; font-size: 9px;">
            Documento generado automáticamente<br>
            No válido como comprobante fiscal
          </p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(ticketHTML);
    printWindow.document.close();
    
    // Esperar a que se cargue el contenido antes de imprimir
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  };

  const fmt = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);

  console.log('🔍 RENDER - Condiciones:', {
    isOpen,
    step,
    hasReport: !!report,
    stepIsComplete: step === 'complete',
    shouldShowSummary: step === 'complete' && !!report
  });

  if (!isOpen) {
    console.log('❌ Modal cerrado - no renderizar');
    return null;
  }

  // Pantalla de resumen completo
  if (step === 'complete' && report) {
    console.log('✅ MOSTRANDO PANTALLA DE RESUMEN CON BOTÓN DE IMPRESIÓN');
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Corte de Caja Completado</h2>
                  <p className="text-sm text-gray-500">
                    {new Date(report.session.closedAt).toLocaleString('es-MX')}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Resumen de Ventas */}
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Resumen de Ventas
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-blue-700">Transacciones</p>
                  <p className="text-2xl font-bold text-blue-900">{report.sales.count}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-700">Total Ventas</p>
                  <p className="text-2xl font-bold text-blue-900">{fmt(report.sales.total)}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-blue-200">
                <div>
                  <p className="text-xs text-blue-600">Efectivo</p>
                  <p className="font-semibold text-blue-900">{fmt(report.sales.totalCash)}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-600">Tarjeta</p>
                  <p className="font-semibold text-blue-900">{fmt(report.sales.totalCard)}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-600">Cuenta Socio</p>
                  <p className="font-semibold text-blue-900">{fmt(report.sales.totalMemberAccount)}</p>
                </div>
              </div>
            </div>

            {/* Resumen de Efectivo */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Efectivo en Caja
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Fondo Inicial:</span>
                  <span className="font-semibold">{fmt(report.cash.opening)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Efectivo Esperado:</span>
                  <span className="font-semibold">{fmt(report.cash.expected)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Efectivo Contado:</span>
                  <span className="font-semibold">{fmt(report.cash.counted)}</span>
                </div>
                <div className={`flex justify-between pt-2 border-t ${report.cash.difference >= 0 ? 'border-green-200' : 'border-red-200'}`}>
                  <span className="font-bold">Diferencia:</span>
                  <span className={`font-bold text-lg ${report.cash.difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {report.cash.difference >= 0 ? '+' : ''}{fmt(report.cash.difference)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notas */}
            {report.notes && (
              <div className="bg-yellow-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-yellow-900 mb-2">Notas</h3>
                <p className="text-yellow-800">{report.notes}</p>
              </div>
            )}

            {/* Acciones */}
            <div className="flex gap-3">
              <button
                onClick={handlePrintTicket}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-5 h-5" />
                Imprimir Ticket
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Pantalla de ingreso de datos
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Corte de Caja</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {sessionData && (
            <div className="mb-6 space-y-3">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-blue-700">Total Ventas</span>
                  <span className="text-xl font-bold text-blue-900">{fmt(sessionData.sales.total)}</span>
                </div>
                <div className="text-xs text-blue-600">
                  {sessionData.sales.count} transacciones
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Fondo Inicial:</span>
                  <span className="font-semibold">{fmt(sessionData.cash.opening)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Efectivo Esperado:</span>
                  <span className="font-semibold text-green-600">{fmt(sessionData.cash.expected)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Efectivo Contado Manualmente
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                step="0.01"
                value={countedCash}
                onChange={(e) => setCountedCash(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                placeholder="0.00"
                autoFocus
              />
            </div>
            {countedCash && sessionData && (
              <div className="mt-2">
                <div className={`text-sm font-semibold ${
                  (parseFloat(countedCash) - sessionData.cash.expected) >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  Diferencia: {(parseFloat(countedCash) - sessionData.cash.expected) >= 0 ? '+' : ''}
                  {fmt(parseFloat(countedCash) - sessionData.cash.expected)}
                </div>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Observaciones del corte..."
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleCloseCashSession}
              disabled={loading || !countedCash}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Procesando...' : 'Cerrar Caja'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
