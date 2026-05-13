import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, DollarSign, Calculator, Printer, Clock, User, TrendingUp, TrendingDown } from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3004').replace(/\/api\/?$/, '');

interface CashSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionType: 'open' | 'close';
  terminalId: string;
  userId: string;
  onSessionComplete?: () => void;
}

interface CashSession {
  id: string;
  openingFloat: number;
  openedAt: string;
  openedByUser: {
    firstName: string;
    lastName: string;
  };
}

export const CashSessionModal: React.FC<CashSessionModalProps> = ({
  isOpen,
  onClose,
  sessionType,
  terminalId,
  userId,
  onSessionComplete
}) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeSession, setActiveSession] = useState<CashSession | null>(null);
  const [report, setReport] = useState<any>(null);

  // Debug: Verificar props del modal
  console.log('🎭 CashSessionModal renderizado:', { isOpen, sessionType, terminalId, userId });

  useEffect(() => {
    if (isOpen && sessionType === 'close') {
      loadActiveSession();
    }
  }, [isOpen, sessionType]);

  const loadActiveSession = async () => {
    try {
      const response = await fetch(`${API_URL}/cash-sessions/active/${terminalId}`);
      if (response.ok) {
        const session = await response.json();
        setActiveSession(session);
      }
    } catch (error) {
      console.error('Error cargando sesión activa:', error);
    }
  };

  const handleOpenSession = async () => {
    if (!amount || parseFloat(amount) < 0) {
      alert('Por favor ingresa un monto válido');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/cash-sessions/open`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          terminalId,
          userId,
          openingFloat: parseFloat(amount)
        })
      });

      if (response.ok) {
        alert('Sesión de caja abierta exitosamente');
        onSessionComplete?.();
        onClose();
      } else {
        const error = await response.json();
        alert(error.error || 'Error abriendo sesión');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error abriendo sesión de caja');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSession = async () => {
    if (!amount || parseFloat(amount) < 0) {
      alert('Por favor ingresa el monto de cierre');
      return;
    }

    if (!activeSession) {
      alert('No hay sesión activa');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/cash-sessions/close/${activeSession.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          closingFloat: parseFloat(amount),
          notes: ''
        })
      });

      if (response.ok) {
        const reportData = await response.json();
        setReport(reportData);
      } else {
        const error = await response.json();
        alert(error.error || 'Error cerrando sesión');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error cerrando sesión de caja');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReport = () => {
    if (!report) return;
    
    // Crear contenido para imprimir
    const printContent = `
      <html>
        <head>
          <title>Corte de Caja - ${report.session.terminal.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .section { margin: 20px 0; }
            .row { display: flex; justify-content: space-between; padding: 5px 0; }
            .total { font-weight: bold; font-size: 1.2em; border-top: 2px solid #000; margin-top: 10px; padding-top: 10px; }
            .difference { color: ${report.cash.difference >= 0 ? 'green' : 'red'}; }
          </style>
        </head>
        <body>
          <h1>CORTE DE CAJA (CORTE Z)</h1>
          <div class="section">
            <h2>Información de Sesión</h2>
            <div class="row"><span>Terminal:</span><span>${report.session.terminal.name}</span></div>
            <div class="row"><span>Cajero:</span><span>${report.session.openedByUser.firstName} ${report.session.openedByUser.lastName}</span></div>
            <div class="row"><span>Apertura:</span><span>${new Date(report.session.openedAt).toLocaleString()}</span></div>
            <div class="row"><span>Cierre:</span><span>${new Date(report.session.closedAt).toLocaleString()}</span></div>
          </div>
          
          <div class="section">
            <h2>Resumen de Ventas</h2>
            <div class="row"><span>Total de Ventas:</span><span>${report.sales.count}</span></div>
            <div class="row"><span>Efectivo:</span><span>$${report.sales.totalCash.toFixed(2)}</span></div>
            <div class="row"><span>Tarjeta:</span><span>$${report.sales.totalCard.toFixed(2)}</span></div>
            <div class="row total"><span>Total:</span><span>$${report.sales.total.toFixed(2)}</span></div>
          </div>
          
          <div class="section">
            <h2>Efectivo en Caja</h2>
            <div class="row"><span>Fondo Inicial:</span><span>$${report.cash.opening.toFixed(2)}</span></div>
            <div class="row"><span>Efectivo Esperado:</span><span>$${report.cash.expected.toFixed(2)}</span></div>
            <div class="row"><span>Efectivo Real:</span><span>$${report.cash.actual.toFixed(2)}</span></div>
            <div class="row total difference"><span>Diferencia:</span><span>$${report.cash.difference.toFixed(2)}</span></div>
          </div>
          
          <div style="margin-top: 40px; text-align: center; font-size: 0.9em;">
            <p>Firma del Cajero: _______________________</p>
            <p>Firma del Supervisor: _______________________</p>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleFinishClose = () => {
    onSessionComplete?.();
    setReport(null);
    setAmount('');
    onClose();
  };

  console.log('🔍 Verificando isOpen:', isOpen);
  if (!isOpen) {
    console.log('❌ Modal no se muestra porque isOpen es false');
    return null;
  }
  console.log('✅ Modal se mostrará porque isOpen es true');

  // Mostrar reporte de cierre
  if (report) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Corte de Caja (Corte Z)</h2>
              <button onClick={handleFinishClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Información de sesión */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Información de Sesión
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Terminal:</span>
                    <span className="font-medium">{report.session.terminal.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cajero:</span>
                    <span className="font-medium">
                      {report.session.openedByUser.firstName} {report.session.openedByUser.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Apertura:</span>
                    <span className="font-medium">{new Date(report.session.openedAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cierre:</span>
                    <span className="font-medium">{new Date(report.session.closedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Resumen de ventas */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Resumen de Ventas
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total de Ventas:</span>
                    <span className="font-medium">{report.sales.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Efectivo:</span>
                    <span className="font-medium">${report.sales.totalCash.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tarjeta:</span>
                    <span className="font-medium">${report.sales.totalCard.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-blue-200">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-lg">${report.sales.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Efectivo en caja */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Efectivo en Caja
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fondo Inicial:</span>
                    <span className="font-medium">${report.cash.opening.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Efectivo Esperado:</span>
                    <span className="font-medium">${report.cash.expected.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Efectivo Real:</span>
                    <span className="font-medium">${report.cash.actual.toFixed(2)}</span>
                  </div>
                  <div className={`flex justify-between pt-2 border-t border-green-200 ${
                    report.cash.difference >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <span className="font-semibold flex items-center gap-1">
                      {report.cash.difference >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      Diferencia:
                    </span>
                    <span className="font-bold text-lg">${report.cash.difference.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3">
                <button
                  onClick={handlePrintReport}
                  className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Printer className="w-5 h-5" />
                  Imprimir Reporte
                </button>
                <button
                  onClick={handleFinishClose}
                  className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Finalizar
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Modal de apertura/cierre
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {sessionType === 'open' ? 'Abrir Caja' : 'Cerrar Caja (Corte Z)'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          {activeSession && sessionType === 'close' && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900">Sesión Activa</span>
              </div>
              <div className="text-sm space-y-1 text-blue-800">
                <p>Cajero: {activeSession.openedByUser.firstName} {activeSession.openedByUser.lastName}</p>
                <p>Apertura: {new Date(activeSession.openedAt).toLocaleString()}</p>
                <p>Fondo Inicial: ${Number(activeSession.openingFloat).toFixed(2)}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {sessionType === 'open' ? 'Fondo Inicial' : 'Efectivo en Caja'}
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={sessionType === 'open' ? handleOpenSession : handleCloseSession}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Procesando...' : sessionType === 'open' ? 'Abrir Caja' : 'Cerrar Caja'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
