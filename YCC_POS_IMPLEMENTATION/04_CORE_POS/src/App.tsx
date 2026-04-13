import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Package, CreditCard, DollarSign, Users, LogOut,
  Plus, Minus, Trash2, Search, X, Check, Banknote, ArrowLeft,
  Lock, ChevronRight, Receipt, Clock, TrendingUp, AlertCircle,
  Store, Utensils, Truck, Settings, Scissors, UserCircle, Printer
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useCartStore } from './stores/cart.store';
import { useComandasStore } from './stores/comandas.store';
import { ComandasPanel } from './components/ComandasPanel';
import { NewComandaModal } from './components/NewComandaModal';
import { Product, PaymentMethod, SaleRecord, POSMode, SplitPayment, ComandaType } from './types';
import { CashSessionResponse, ShiftResponse, CashCutReport, SaleResponse } from './types/api.types';
import { ModeSelector } from './components/ModeSelector';
import { TableMode } from './components/TableMode';
import { DeliveryMode } from './components/DeliveryMode';
import { CashCutModal } from './components/CashCutModal';
import { TicketPrinter, TicketData } from './components/TicketPrinter';
import { PrinterConfigModal } from './components/PrinterConfigModal';
import { api, endpoints } from './lib/apiClient';

// ===================== HELPERS =====================
const fmt = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);

// ===================== MOCK DATA =====================
const CATEGORIES = [
  { id: 'all', name: 'Todos' },
];

// ===================== SCREENS =====================
type Screen = 'mode-select' | 'login' | 'pos' | 'payment' | 'complete' | 'cash-open' | 'cash-close' | 'history';

// ===================== APP =====================
export const App: React.FC = () => {
  // Mode
  const [posMode, setPosMode] = useState<POSMode>('COUNTER');
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [showTableMode, setShowTableMode] = useState(false);
  const [showDeliveryMode, setShowDeliveryMode] = useState(false);
  
  // Auth
  const [screen, setScreen] = useState<Screen>('login');
  const [user, setUser] = useState('');
  const [userId, setUserId] = useState('');
  const [pin, setPin] = useState('');
  const [cashOpen, setCashOpen] = useState(false);
  const [openingFloat, setOpeningFloat] = useState('');
  
  // Cash Session & Shift Management
  const [currentCashSession, setCurrentCashSession] = useState<CashSessionResponse | null>(null);
  const [currentShift, setCurrentShift] = useState<ShiftResponse | null>(null);
  const [showCashCutModal, setShowCashCutModal] = useState(false);
  const [showPrinterConfig, setShowPrinterConfig] = useState(false);
  const [terminalId] = useState('terminal-main');
  
  // Print Error Modal
  const [showPrintError, setShowPrintError] = useState(false);
  const [printErrorMessage, setPrintErrorMessage] = useState('');

  // POS
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [categories, setCategories] = useState([{ id: 'all', name: 'Todos' }]);

  // Load products on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await api.get(endpoints.products.list());
        
        // Transformar datos del API al formato del frontend
        const transformedProducts = data.map((p: ProductResponse) => ({
          id: p.id,
          sku: p.sku,
          name: p.name,
          price: Number(p.price),
          categoryId: p.categoryId,
          categoryName: p.category?.name || 'Sin categoría',
          imageUrl: p.imageUrl || undefined
        }));
        
        setProducts(transformedProducts);
        setIsLoadingProducts(false);
        
        // Extraer categorías únicas
        const uniqueCategories = Array.from(
          new Set(transformedProducts.map((p: Product) => p.categoryId))
        ).map(id => {
          const product = transformedProducts.find((p: Product) => p.categoryId === id);
          return {
            id: id || 'unknown',
            name: product?.categoryName || 'Sin categoría'
          };
        });
        
        setCategories([{ id: 'all', name: 'Todos' }, ...uniqueCategories]);
      } catch (error) {
        console.error('Error loading products:', error);
        toast.error('Error al cargar productos');
        setIsLoadingProducts(false);
      }
    };
    
    loadProducts();
  }, []);

  // Cart store
  const { items, addItem, removeItem, updateQuantity, clearCart, getTotals, getItemCount, completeSale } = useCartStore();

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [cashReceived, setCashReceived] = useState('');
  const [customerName, setCustomerName] = useState(''); // Nombre del cliente
  const [isProcessing, setIsProcessing] = useState(false);

  // Sales history
  const [salesHistory, setSalesHistory] = useState<SaleRecord[]>([]);
  const [lastSale, setLastSale] = useState<SaleRecord | null>(null);
  const [historyLoadedForShift, setHistoryLoadedForShift] = useState<string | null>(null);

  // Sale detail modal
  const [selectedSale, setSelectedSale] = useState<SaleRecord | null>(null);
  const [showSaleDetail, setShowSaleDetail] = useState(false);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const [showSplitPayment, setShowSplitPayment] = useState(false);
  const [splitPayments, setSplitPayments] = useState<SplitPayment[]>([]);

  // Cash Close inputs
  const [countedCash, setCountedCash] = useState('');
  const [closeNotes, setCloseNotes] = useState('');

  // Sales history search
  const [historySearch, setHistorySearch] = useState('');

  // Multicomanda
  const [showNewComandaModal, setShowNewComandaModal] = useState(false);
  const [comandasMode, setComandasMode] = useState(false);
  const { activeComandaId, getActiveComanda, addItemToComanda, removeItemFromComanda, updateItemQuantity: updateComandaItemQuantity, getComandaTotals, closeComanda } = useComandasStore();

  const totals = getTotals();
  const itemCount = getItemCount();

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // =============== CASH SESSION & SHIFT MANAGEMENT ===============
  
  // Verificar sesión de caja activa al cargar
  useEffect(() => {
    if (userId && terminalId) {
      checkActiveCashSession();
      checkActiveShift();
    }
  }, [userId, terminalId]);

  const checkActiveCashSession = async () => {
    try {
      const session = await api.get(endpoints.cashSessions.active(terminalId));
      if (session) {
        setCurrentCashSession(session);
        setCashOpen(true);
        console.log('✅ Sesión de caja activa encontrada:', session.id);
      } else {
        setCashOpen(false);
      }
    } catch (error) {
      console.error('Error verificando sesión de caja:', error);
      setCashOpen(false);
    }
  };

  const checkActiveShift = async () => {
    if (!userId) return;
    
    try {
      const shift = await api.get(endpoints.shifts.current(userId));
      if (shift) {
        setCurrentShift(shift);
        console.log('✅ Turno activo encontrado:', shift.id);
        // Cargar historial del turno desde localStorage
        loadHistoryForShift(shift.id);
      }
    } catch (error) {
      console.error('Error verificando turno:', error);
    }
  };

  const startShift = async (userIdParam: string) => {
    try {
      const shift = await api.post(endpoints.shifts.start(), {
        userId: userIdParam,
        terminalId
      });
      
      setCurrentShift(shift);
      toast.success('Turno iniciado correctamente');
      console.log('✅ Turno iniciado:', shift.id);
      // Cargar historial del turno desde localStorage
      loadHistoryForShift(shift.id);
      return shift;
    } catch (error) {
      console.error('Error iniciando turno:', error);
      toast.error('Error al iniciar turno');
      return null;
    }
  };

  // =============== HISTORY PERSISTENCE ===============
  const getHistoryStorageKey = (shiftId: string) => `pos_history_${shiftId}`;
  const getHistoryDateKey = (shiftId: string) => `pos_history_date_${shiftId}`;

  const loadHistoryForShift = (shiftId: string) => {
    try {
      const storageKey = getHistoryStorageKey(shiftId);
      const dateKey = getHistoryDateKey(shiftId);
      const storedHistory = localStorage.getItem(storageKey);
      const storedDate = localStorage.getItem(dateKey);
      
      if (storedHistory && storedDate) {
        const today = new Date().toDateString();
        const savedDate = new Date(storedDate).toDateString();
        
        // Si el historial es del mismo día, cargarlo
        if (today === savedDate) {
          const history = JSON.parse(storedHistory);
          // Convertir fechas de string a Date
          const parsedHistory = history.map((sale: SaleResponse) => ({
            ...sale,
            createdAt: new Date(sale.createdAt)
          }));
          setSalesHistory(parsedHistory);
          setHistoryLoadedForShift(shiftId);
          console.log('✅ Historial cargado desde localStorage:', parsedHistory.length, 'ventas');
        } else {
          // Si es de otro día, limpiar el historial
          console.log('🗑️ Historial de otro día, limpiando...');
          localStorage.removeItem(storageKey);
          localStorage.removeItem(dateKey);
          setSalesHistory([]);
          setHistoryLoadedForShift(shiftId);
        }
      } else {
        setSalesHistory([]);
        setHistoryLoadedForShift(shiftId);
      }
    } catch (error) {
      console.error('Error cargando historial:', error);
      setSalesHistory([]);
      setHistoryLoadedForShift(shiftId);
    }
  };

  const saveHistoryToStorage = (history: SaleRecord[], shiftId: string) => {
    try {
      const storageKey = getHistoryStorageKey(shiftId);
      const dateKey = getHistoryDateKey(shiftId);
      localStorage.setItem(storageKey, JSON.stringify(history));
      localStorage.setItem(dateKey, new Date().toISOString());
      console.log('💾 Historial guardado en localStorage');
    } catch (error) {
      console.error('Error guardando historial:', error);
    }
  };

  // Guardar historial automáticamente cuando cambie
  useEffect(() => {
    if (currentShift && historyLoadedForShift === currentShift.id && salesHistory.length > 0) {
      saveHistoryToStorage(salesHistory, currentShift.id);
    }
  }, [salesHistory, currentShift, historyLoadedForShift]);

  const openCashSession = async (openingFloatAmount: number) => {
    try {
      const session = await api.post(endpoints.cashSessions.open(), {
        terminalId,
        userId,
        openingFloat: openingFloatAmount
      });
      
      setCurrentCashSession(session);
      setCashOpen(true);
      toast.success('Caja abierta correctamente');
      console.log('✅ Sesión de caja abierta:', session.id);
      return session;
    } catch (error) {
      console.error('Error abriendo caja:', error);
      toast.error('Error al abrir caja');
      return null;
    }
  };

  const handleCashCutComplete = (report: CashCutReport) => {
    console.log('✅ Corte de caja completado:', report);
    console.log('🔍 Estado actual - Modal abierto:', showCashCutModal);
    
    // Actualizar estado de caja
    setCashOpen(false);
    
    // IMPORTANTE: NO limpiar currentCashSession aquí ni cerrar el modal
    // El modal necesita currentCashSession para seguir renderizándose
    // La limpieza se hará cuando el usuario cierre el modal manualmente
    
    toast.success('Corte de caja realizado correctamente');
  };

  const handleCloseCashCutModal = () => {
    console.log('🚪 Cerrando modal de corte de caja');
    setShowCashCutModal(false);
    setCurrentCashSession(null);
  };

  // Validación: No permitir agregar productos sin caja abierta
  const validateCashSessionBeforeAction = (): boolean => {
    if (!currentCashSession || !cashOpen) {
      toast.error('Debes abrir caja antes de realizar ventas', {
        duration: 4000,
        icon: '🔒',
      });
      return false;
    }
    return true;
  };

  // Wrapper para addItem con validación
  const handleAddItem = (product: Product) => {
    if (!validateCashSessionBeforeAction()) {
      return;
    }
    if (comandasMode && activeComandaId) {
      addItemToComanda(activeComandaId, product);
      toast.success(`${product.name} → ${getActiveComanda()?.nombre}`, { duration: 1500 });
    } else {
      addItem(product);
      toast.success(`${product.name} agregado`, { duration: 1500 });
    }
  };

  // Crear nueva comanda
  const handleCreateComanda = (nombre: string, tipo: ComandaType) => {
    useComandasStore.getState().createComanda(nombre, tipo);
    toast.success(`Comanda "${nombre}" creada`, { icon: '🍽️' });
  };

  // Obtener items y totales según el modo activo
  const activeComanda = comandasMode ? getActiveComanda() : null;
  const comandaTotals = activeComanda ? getComandaTotals(activeComanda.id) : null;
  const displayItems = comandasMode && activeComanda ? activeComanda.items : items;
  const displayTotals = comandasMode && comandaTotals ? comandaTotals : totals;
  const displayItemCount = comandasMode && activeComanda ? activeComanda.items.reduce((s, i) => s + i.quantity, 0) : itemCount;

  // =============== LOGIN ===============
  const handleLogin = async () => {
    if (pin.length !== 4) {
      toast.error('El PIN debe tener 4 dígitos');
      return;
    }

    // Determinar usuario basado en PIN
    let userName = 'Cajero';
    let userIdValue = 'user-cashier';
    
    if (pin === '1234') {
      userName = 'Cajero 1';
      userIdValue = 'user-cashier';
    } else if (pin === '0000' || pin === '9999') {
      userName = 'Administrador';
      userIdValue = 'user-admin';
    }

    setUser(userName);
    setUserId(userIdValue);
    
    toast.success(`Bienvenido ${userName}`, { icon: '👋' });
    console.log('✅ Login exitoso:', { userName, userIdValue });

    // Iniciar turno automáticamente si no existe
    const shift = await startShift(userIdValue);
    
    if (shift) {
      console.log('✅ Turno iniciado automáticamente');
    }

    setScreen('cash-open');
  };

  // =============== CASH OPEN ===============
  const handleOpenCash = async () => {
    const amount = parseFloat(openingFloat) || 0;
    
    if (amount <= 0) {
      toast.error('El monto inicial debe ser mayor a 0');
      return;
    }

    if (!userId) {
      toast.error('Error: Usuario no identificado');
      return;
    }

    const session = await openCashSession(amount);
    
    if (session) {
      console.log('✅ Caja abierta, navegando al POS');
      setScreen('pos');
    }
  };

  // Function to open sale detail modal
  const handleOpenSaleDetail = (sale: SaleRecord) => {
    setSelectedSale(sale);
    setShowSaleDetail(true);
  };

  // Function to update payment method (solo actualiza localmente)
  const handleUpdatePaymentMethod = (saleId: string, newMethod: PaymentMethod) => {
    // Update local state
    setSalesHistory(prev => {
      const updated = prev.map(s => 
        s.id === saleId ? { ...s, paymentMethod: newMethod, splitPayments: undefined } : s
      );
      // Guardar en localStorage inmediatamente
      if (currentShift) {
        saveHistoryToStorage(updated, currentShift.id);
      }
      return updated;
    });
    
    // Update selected sale if it's the one being viewed
    setSelectedSale(prev => prev ? { ...prev, paymentMethod: newMethod, splitPayments: undefined } : null);
    
    toast.success('Método de pago actualizado');
  };

  // Function to handle split payment (para pantalla de pago)
  const handleOpenSplitPayment = () => {
    // Inicializar con pagos divididos existentes o crear uno nuevo
    if (splitPayments.length > 0) {
      // Ya hay pagos divididos, solo abrir el modal
      setShowSplitPayment(true);
    } else {
      // Crear pagos divididos por defecto
      setSplitPayments([
        { method: 'CASH', amount: displayTotals.total / 2 },
        { method: 'CREDIT_CARD', amount: displayTotals.total / 2 }
      ]);
      setShowSplitPayment(true);
    }
  };

  const handleAddSplitPayment = () => {
    const remaining = displayTotals.total - splitPayments.reduce((sum, p) => sum + p.amount, 0);
    setSplitPayments([...splitPayments, { method: 'CASH', amount: Math.max(0, remaining) }]);
  };

  const handleRemoveSplitPayment = (index: number) => {
    setSplitPayments(splitPayments.filter((_, i) => i !== index));
  };

  const handleUpdateSplitPayment = (index: number, field: 'method' | 'amount', value: PaymentMethod | number) => {
    setSplitPayments(splitPayments.map((p, i) =>
      i === index ? { ...p, [field]: field === 'amount' ? Number(value) || 0 : value } : p
    ));
  };

  const handleSaveSplitPayment = () => {
    const total = splitPayments.reduce((sum, p) => sum + p.amount, 0);
    
    if (Math.abs(total - displayTotals.total) > 0.01) {
      toast.error(`El total debe ser ${fmt(displayTotals.total)}`);
      return;
    }

    setShowSplitPayment(false);
    toast.success('Pago dividido configurado');
  };

  const handleCancelSplitPayment = () => {
    setSplitPayments([]);
    setShowSplitPayment(false);
  };
  // =============== PRINT TICKET ===============
  const handlePrintSaleTicket = async (sale: SaleRecord) => {
    try {
      const ticketData: TicketData = {
        folio: sale.folio,
        items: sale.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.totalPrice / item.quantity,
          totalPrice: item.totalPrice
        })),
        subtotal: sale.subtotal,
        taxAmount: sale.taxAmount,
        total: sale.total,
        paymentMethod: sale.paymentMethod,
        amountPaid: sale.amountPaid,
        changeAmount: sale.changeAmount,
        date: sale.createdAt,
        cashier: user
      };

      await TicketPrinter.printTicket(ticketData);
      toast.success('Ticket enviado a impresora');
    } catch (error: unknown) {
      console.error('❌ Error al imprimir ticket:', error);
      const errorMessage = error instanceof Error ? error.message : 'No se pudo imprimir el ticket. Verifica que la impresora esté conectada.';
      setPrintErrorMessage(errorMessage);
      setShowPrintError(true);
    }
  };

  // =============== PAYMENT ===============
  const handlePay = async () => {
    setIsProcessing(true);
    
    try {
      let saleFromBackend: any;
      let saleItems: any[];
      let saleTotal: number;
      let saleSubtotal: number;
      let saleTaxAmount: number;
      let saleDiscountAmount: number;

      if (comandasMode && activeComanda) {
        // Venta desde comanda activa
        const comandaItems = activeComanda.items;
        const comandaTotalsData = getComandaTotals(activeComanda.id);
        
        saleItems = comandaItems.map(item => ({
          productId: item.productId,
          name: item.name,
          sku: item.sku || `SKU-${item.productId}`,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          price: item.unitPrice,
          totalPrice: item.totalPrice,
          taxAmount: 0,
          modifiers: [],
          stationId: item.stationId
        }));
        saleTotal = comandaTotalsData.total;
        saleSubtotal = comandaTotalsData.subtotal;
        saleTaxAmount = comandaTotalsData.taxAmount;
        saleDiscountAmount = comandaTotalsData.discountAmount;

        // Enviar venta directamente al backend
        const response = await fetch('http://localhost:3004/api/sales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: saleItems,
            totalAmount: saleTotal,
            subtotal: saleSubtotal,
            taxAmount: saleTaxAmount,
            paymentMethod,
            cashReceived: paymentMethod === 'CASH' ? parseFloat(cashReceived) || saleTotal : saleTotal,
            change: paymentMethod === 'CASH' ? Math.max(0, (parseFloat(cashReceived) || saleTotal) - saleTotal) : 0,
            terminalId,
            userId,
            customerName: activeComanda.customerName || customerName || activeComanda.nombre,
            notes: activeComanda.notes || ''
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || errorData.error || 'Error al crear venta');
        }
        
        saleFromBackend = await response.json();
        
        // Cerrar comanda después de venta exitosa
        closeComanda(activeComanda.id);
      } else {
        // Venta desde carrito normal
        const { setCustomerName: setStoreCustomerName } = useCartStore.getState();
        setStoreCustomerName(customerName);
        saleFromBackend = await completeSale();
        saleItems = [...items];
        saleTotal = totals.total;
        saleSubtotal = totals.subtotal;
        saleTaxAmount = totals.taxAmount;
        saleDiscountAmount = totals.discountAmount;
      }
      
      // Crear registro local para mostrar
      const received = paymentMethod === 'CASH' ? parseFloat(cashReceived) || saleTotal : saleTotal;
      const sale: SaleRecord = {
        id: saleFromBackend.id,
        folio: saleFromBackend.folio,
        items: saleItems,
        subtotal: saleSubtotal,
        taxAmount: saleTaxAmount,
        discountAmount: saleDiscountAmount,
        total: saleTotal,
        paymentMethod,
        splitPayments: splitPayments.length > 0 ? [...splitPayments] : undefined,
        amountPaid: received,
        changeAmount: Math.max(0, received - saleTotal),
        createdAt: new Date(saleFromBackend.createdAt),
        status: 'COMPLETED',
      };
      
      setSalesHistory(prev => {
        const updated = [sale, ...prev];
        if (currentShift) {
          saveHistoryToStorage(updated, currentShift.id);
        }
        return updated;
      });
      setLastSale(sale);
      setCashReceived('');
      setCustomerName('');
      setSplitPayments([]);
      
      // Si modo comandas, limpiar carrito también y no ir a complete
      if (comandasMode) {
        clearCart();
        toast.success(`Comanda cobrada - Folio: ${saleFromBackend.folio}`, { icon: '✅', duration: 3000 });
        setScreen('pos');
      } else {
        setScreen('complete');
      }
      
      console.log('✅ Venta completada y guardada en backend:', saleFromBackend);
      
      setTimeout(() => {
        handlePrintSaleTicket(sale);
      }, 500);
    } catch (error) {
      console.error('❌ Error al procesar venta:', error);
      alert('Error al procesar la venta. Por favor intenta de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  // =============== CASH CLOSE ===============
  const handleCloseCash = () => {
    setCashOpen(false);
    setScreen('login');
    setPin('');
    setUser('');
    setOpeningFloat('');
    setSalesHistory([]);
  };

  // ===================== RENDER =====================
  // --- LOGIN ---
  if (screen === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-600 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">YCC Country Club</h1>
            <p className="text-gray-500 mt-1">Punto de Venta</p>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Ingresa tu PIN</label>
            <div className="flex justify-center gap-3 mb-4">
              {[0,1,2,3].map(i => (
                <div key={i} className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-2xl font-bold transition-all ${pin.length > i ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-200'}`}>
                  {pin.length > i ? '*' : ''}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1,2,3,4,5,6,7,8,9,'',0,'del'].map((n, i) => (
                <button key={i} disabled={n === ''} onClick={() => {
                  if (n === 'del') setPin(p => p.slice(0, -1));
                  else if (pin.length < 4 && n !== '') setPin(p => p + n);
                }} className={`h-14 rounded-xl text-lg font-semibold transition-all ${n === '' ? 'invisible' : n === 'del' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-gray-100 hover:bg-gray-200 text-gray-800 active:scale-95'}`}>
                  {n === 'del' ? 'DEL' : n}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleLogin} disabled={pin.length !== 4} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]">
            Ingresar
          </button>
        </motion.div>
      </div>
    );
  }

  // --- CASH OPEN ---
  if (screen === 'cash-open') {
    return (
      <div className="h-screen bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-600 flex items-center justify-center p-3 sm:p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 w-full max-w-sm">
          <div className="text-center mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Banknote className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600" />
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Apertura de Caja</h2>
            <p className="text-gray-500 text-xs sm:text-sm">Hola, {user}</p>
          </div>
          <div className="mb-4 sm:mb-6">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Fondo de caja inicial ($MXN)</label>
            <input type="number" value={openingFloat} onChange={e => setOpeningFloat(e.target.value)} placeholder="0.00" className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl text-xl sm:text-2xl text-center font-bold focus:border-emerald-500 focus:outline-none" autoFocus />
          </div>
          <button onClick={handleOpenCash} disabled={!openingFloat || parseFloat(openingFloat) <= 0} className="w-full py-2 sm:py-3 bg-emerald-600 text-white rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base hover:bg-emerald-700 disabled:opacity-40 transition-all">
            Abrir Caja
          </button>
        </motion.div>
      </div>
    );
  }

  // --- SALE COMPLETE ---
  if (screen === 'complete' && lastSale) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center p-3 sm:p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 w-full max-w-sm text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }} className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Check className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
          </motion.div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Venta Completada</h2>
          <p className="text-gray-500 mb-3 sm:mb-4 text-xs sm:text-sm">Folio: {lastSale.folio}</p>
          <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 text-left space-y-1 sm:space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between font-bold text-base"><span>Total</span><span className="text-emerald-600">{fmt(lastSale.total)}</span></div>
            <div className="border-t pt-2 mt-2 space-y-1">
              <div className="flex justify-between text-xs text-gray-500"><span>Subtotal</span><span>{fmt(lastSale.subtotal)}</span></div>
              <div className="flex justify-between text-xs text-gray-500"><span>IVA 16% (incluido)</span><span>{fmt(lastSale.taxAmount)}</span></div>
            </div>
            {lastSale.paymentMethod === 'CASH' && (
              <>
                <div className="flex justify-between"><span className="text-gray-600">Recibido</span><span>{fmt(lastSale.amountPaid)}</span></div>
                <div className="flex justify-between text-amber-600 font-semibold"><span>Cambio</span><span>{fmt(lastSale.changeAmount)}</span></div>
              </>
            )}
            <div className="flex justify-between"><span className="text-gray-500">Metodo</span><span className="capitalize">{lastSale.paymentMethod === 'CASH' ? 'Efectivo' : lastSale.paymentMethod === 'CREDIT_CARD' ? 'Tarjeta' : lastSale.paymentMethod === 'DEBIT_CARD' ? 'Debito' : 'Socio'}</span></div>
          </div>
          <button onClick={() => setScreen('pos')} className="w-full py-2 sm:py-3 bg-emerald-600 text-white rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base hover:bg-emerald-700 transition-all">
            Nueva Venta
          </button>
        </motion.div>
      </div>
    );
  }

  // --- PAYMENT ---
  if (screen === 'payment') {
    const cashAmount = parseFloat(cashReceived) || 0;
    const change = Math.max(0, cashAmount - displayTotals.total);
    const canPay = paymentMethod === 'CASH' ? cashAmount >= displayTotals.total : true;
    return (
      <div className="h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b px-3 sm:px-4 py-2 flex items-center justify-between flex-shrink-0">
          <button onClick={() => setScreen('pos')} className="flex items-center gap-1 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Volver</span>
          </button>
          <h1 className="text-lg font-bold text-gray-900">Cobrar</h1>
          <div className="text-lg font-bold text-emerald-600">{fmt(displayTotals.total)}</div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          <div className="max-w-md mx-auto space-y-3">
            {/* Nombre del Cliente */}
            <div className="bg-white rounded-lg shadow-sm p-3">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm flex items-center gap-2">
                <UserCircle className="w-4 h-4" />
                Nombre del Cliente (Opcional)
              </h3>
              <input 
                type="text" 
                value={customerName} 
                onChange={e => setCustomerName(e.target.value)} 
                placeholder="Ingrese el nombre del cliente" 
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-base focus:border-emerald-500 focus:outline-none" 
              />
            </div>

            {/* Payment methods - Compacto */}
            <div className="bg-white rounded-lg shadow-sm p-3">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">Método de Pago</h3>
              
              {splitPayments.length > 0 ? (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-blue-900 text-sm">Pago Dividido</span>
                    <button
                      onClick={() => setShowSplitPayment(true)}
                      className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                    >
                      Editar
                    </button>
                  </div>
                  {splitPayments.map((payment, index) => (
                    <div key={index} className="flex justify-between text-xs py-1">
                      <span className="text-gray-700">
                        {payment.method === 'CASH' && 'Efectivo'}
                        {payment.method === 'CREDIT_CARD' && 'Tarjeta Crédito'}
                        {payment.method === 'DEBIT_CARD' && 'Tarjeta Débito'}
                        {payment.method === 'MEMBER_ACCOUNT' && 'Cuenta Socio'}
                      </span>
                      <span className="font-medium text-gray-900">{fmt(payment.amount)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {([['CASH', 'Efectivo', Banknote], ['CREDIT_CARD', 'Tarjeta', CreditCard], ['DEBIT_CARD', 'Débito', CreditCard], ['MEMBER_ACCOUNT', 'Socio', Users]] as [PaymentMethod, string, any][]).map(([method, label, Icon]) => (
                    <button 
                      key={method} 
                      onClick={() => setPaymentMethod(method)} 
                      className={`p-2 rounded-lg border-2 flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === method 
                          ? 'border-emerald-500 bg-emerald-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${paymentMethod === method ? 'text-emerald-600' : 'text-gray-400'}`} />
                      <span className={`font-medium text-xs ${paymentMethod === method ? 'text-emerald-700' : 'text-gray-600'}`}>
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              
              <button
                onClick={() => setShowSplitPayment(true)}
                className="w-full mt-2 p-2 rounded-lg border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 text-xs font-medium transition-all flex items-center justify-center gap-2"
              >
                <Scissors className="w-4 h-4" />
                Pago Dividido
              </button>
            </div>

            {/* Cash input - Optimizado */}
            {paymentMethod === 'CASH' && (
              <div className="bg-white rounded-lg shadow-sm p-3">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">Efectivo Recibido</h3>
                <input 
                  type="number" 
                  value={cashReceived} 
                  onChange={e => setCashReceived(e.target.value)} 
                  placeholder="0.00" 
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-2xl text-center font-bold focus:border-emerald-500 focus:outline-none" 
                  autoFocus 
                />
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[50, 100, 200, 500, 1000].map(n => (
                    <button 
                      key={n} 
                      onClick={() => setCashReceived(String(n))} 
                      className="py-2 px-2 bg-gray-100 rounded font-medium text-sm hover:bg-gray-200 transition-colors"
                    >
                      ${n}
                    </button>
                  ))}
                  <button 
                    onClick={() => setCashReceived(String(Math.ceil(displayTotals.total / 10) * 10))} 
                    className="py-2 px-2 bg-emerald-100 text-emerald-700 rounded font-medium text-sm hover:bg-emerald-200 transition-colors"
                  >
                    Exacto
                  </button>
                </div>
                {cashAmount > 0 && (
                  <div className={`mt-2 p-2 rounded-lg text-center text-lg font-bold ${
                    change >= 0 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'
                  }`}>
                    Cambio: {fmt(change)}
                  </div>
                )}
              </div>
            )}

            {/* Order summary - Compacto */}
            <div className="bg-white rounded-lg shadow-sm p-3">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">Resumen de Compra</h3>
              <div className="space-y-1 text-sm max-h-40 overflow-y-auto">
                {displayItems.map(item => (
                  <div key={item.productId} className="flex justify-between py-1">
                    <span className="text-gray-600 truncate flex-1 mr-2">
                      <span className="font-semibold">{item.quantity}x</span> {item.name}
                    </span>
                    <span className="font-medium flex-shrink-0">{fmt(item.totalPrice)}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
                  <div className="flex justify-between font-bold text-base">
                    <span>TOTAL</span>
                    <span className="text-emerald-600">{fmt(displayTotals.total)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Subtotal</span>
                      <span>{fmt(displayTotals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>IVA 16% (incluido)</span>
                      <span>{fmt(displayTotals.taxAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botón de pago - Destacado */}
            <button 
              onClick={handlePay} 
              disabled={!canPay || isProcessing} 
              className="w-full py-3 bg-emerald-600 text-white rounded-lg font-bold text-base hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              {isProcessing ? (
                <>
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} 
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" 
                  />
                  Procesando...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Confirmar Pago
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- CASH CLOSE ---
  if (screen === 'cash-close') {
    const totalCash = salesHistory.filter(s => s.paymentMethod === 'CASH').reduce((a, s) => a + s.total, 0);
    const totalCard = salesHistory.filter(s => s.paymentMethod !== 'CASH').reduce((a, s) => a + s.total, 0);
    const totalSales = salesHistory.reduce((a, s) => a + s.total, 0);
    const expectedCash = (parseFloat(openingFloat) || 0) + totalCash;
    const countedAmount = parseFloat(countedCash) || 0;
    const difference = countedAmount - expectedCash;
    return (
      <div className="h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between flex-shrink-0">
          <button onClick={() => setScreen('pos')} className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-gray-900"><ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden sm:inline text-xs sm:text-sm">Volver</span></button>
          <h1 className="text-base sm:text-lg font-bold text-gray-900">Cierre de Caja</h1>
          <div />
        </header>
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 text-base sm:text-lg">Resumen del Turno</h3>
            <div className="space-y-2">
              <div className="flex justify-between p-2 bg-gray-50 rounded-lg text-xs sm:text-sm"><span className="text-gray-600">Cajero</span><span className="font-medium">{user}</span></div>
              <div className="flex justify-between p-2 bg-gray-50 rounded-lg text-xs sm:text-sm"><span className="text-gray-600">Fondo Inicial</span><span className="font-medium">{fmt(parseFloat(openingFloat) || 0)}</span></div>
              <div className="flex justify-between p-2 bg-gray-50 rounded-lg text-xs sm:text-sm"><span className="text-gray-600">Ventas Totales</span><span className="font-bold text-emerald-600">{fmt(totalSales)}</span></div>
              <div className="flex justify-between p-2 bg-gray-50 rounded-lg text-xs sm:text-sm"><span className="text-gray-600">Total Efectivo</span><span className="font-medium">{fmt(totalCash)}</span></div>
              <div className="flex justify-between p-2 bg-gray-50 rounded-lg text-xs sm:text-sm"><span className="text-gray-600">Total Tarjetas</span><span className="font-medium">{fmt(totalCard)}</span></div>
              <div className="flex justify-between p-2 bg-gray-50 rounded-lg text-xs sm:text-sm"><span className="text-gray-600">Transacciones</span><span className="font-medium">{salesHistory.length}</span></div>
              <div className="flex justify-between p-2 bg-amber-50 rounded-lg border border-amber-200 text-xs sm:text-sm"><span className="text-amber-700 font-medium">Efectivo Esperado</span><span className="font-bold text-amber-700">{fmt(expectedCash)}</span></div>
            </div>
          </div>
          
          {/* Input de Efectivo Contado */}
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 space-y-3">
            <label className="block text-sm font-medium text-gray-700">Efectivo Contado en Caja ($)</label>
            <input 
              type="number" 
              value={countedCash} 
              onChange={e => setCountedCash(e.target.value)} 
              placeholder="0.00" 
              className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl text-xl sm:text-2xl text-center font-bold focus:border-emerald-500 focus:outline-none min-h-[44px]"
            />
            {countedAmount > 0 && (
              <div className={`p-2 rounded-lg text-center text-sm font-bold ${difference === 0 ? 'bg-emerald-100 text-emerald-700' : difference > 0 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                Diferencia: {difference === 0 ? 'Cuadre perfecto' : difference > 0 ? `Sobrante: ${fmt(difference)}` : `Faltante: ${fmt(Math.abs(difference))}`}
              </div>
            )}
          </div>
          
          {/* Notas de cierre */}
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 space-y-3">
            <label className="block text-sm font-medium text-gray-700">Notas (opcional)</label>
            <textarea 
              value={closeNotes} 
              onChange={e => setCloseNotes(e.target.value)} 
              placeholder="Observaciones del cierre..." 
              rows={3}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-emerald-500 focus:outline-none resize-none min-h-[44px]"
            />
          </div>
          
          <button 
            onClick={() => {
              if (countedAmount <= 0) {
                toast.error('Debes ingresar el efectivo contado');
                return;
              }
              handleCloseCash();
            }} 
            className="w-full py-3 sm:py-4 bg-red-600 text-white rounded-lg sm:rounded-xl font-bold text-sm sm:text-base hover:bg-red-700 transition-all min-h-[44px]"
          >
            Cerrar Caja y Salir
          </button>
        </div>
      </div>
    );
  }

  // --- SALES HISTORY ---
  if (screen === 'history') {
    // Filtrar ventas por folio o método de pago
    const filteredSales = salesHistory.filter(sale => {
      if (!historySearch) return true;
      const search = historySearch.toLowerCase();
      return sale.folio.toLowerCase().includes(search) || 
             sale.paymentMethod.toLowerCase().includes(search) ||
             sale.total.toString().includes(search);
    });
    
    return (
      <div className="h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between flex-shrink-0">
          <button onClick={() => setScreen('pos')} className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-gray-900"><ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden sm:inline text-xs sm:text-sm">Volver</span></button>
          <h1 className="text-base sm:text-lg font-bold text-gray-900">Historial de Ventas</h1>
          <div className="text-xs sm:text-sm text-gray-500">{filteredSales.length} ventas</div>
        </header>
        
        {/* Search bar */}
        <div className="bg-white border-b px-3 sm:px-4 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              value={historySearch} 
              onChange={e => setHistorySearch(e.target.value)} 
              placeholder="Buscar por folio..." 
              className="w-full pl-10 pr-10 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white min-h-[44px]"
            />
            {historySearch && (
              <button onClick={() => setHistorySearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          {filteredSales.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Receipt className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No hay ventas registradas</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSales.map(sale => (
                <div 
                  key={sale.id} 
                  onClick={() => handleOpenSaleDetail(sale)}
                  className="bg-white rounded-lg shadow-sm p-2 sm:p-3 flex items-center justify-between gap-2 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{sale.folio}</div>
                    <div className="text-xs text-gray-500">{sale.items.length} articulos - {sale.createdAt.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-emerald-600 text-xs sm:text-sm">{fmt(sale.total)}</div>
                    <div className="text-xs text-gray-400 capitalize">{sale.paymentMethod === 'CASH' ? 'Efectivo' : 'Tarjeta'}</div>
                  </div>
                  {/* Botón de impresión en historial */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrintSaleTicket(sale);
                    }}
                    className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors flex-shrink-0"
                    title="Imprimir ticket"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sale Detail Modal - Dentro del historial */}
        {showSaleDetail && selectedSale && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="bg-emerald-600 text-white px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">{selectedSale.folio}</h2>
                  <p className="text-emerald-100 text-sm">
                    {selectedSale.createdAt.toLocaleDateString('es-MX')} - {selectedSale.createdAt.toLocaleTimeString('es-MX')}
                  </p>
                </div>
                <button
                  onClick={() => setShowSaleDetail(false)}
                  className="text-emerald-100 hover:text-white p-1"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {/* Items list */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Productos</h3>
                  <div className="space-y-2">
                    {selectedSale.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div>
                          <span className="font-medium text-gray-900">{item.quantity}x</span>{' '}
                          <span className="text-gray-700">{item.name}</span>
                        </div>
                        <span className="text-gray-900 font-medium">{fmt(item.totalPrice)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{fmt(selectedSale.subtotal)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">IVA 16%</span>
                    <span className="font-medium">{fmt(selectedSale.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                    <span>Total</span>
                    <span className="text-emerald-600">{fmt(selectedSale.total)}</span>
                  </div>
                </div>

                {/* Payment Method Section */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Método de Pago</h3>
                  
                  {selectedSale.splitPayments && selectedSale.splitPayments.length > 0 ? (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-blue-900">Pago Dividido</span>
                      </div>
                      {selectedSale.splitPayments.map((payment, index) => (
                        <div key={index} className="flex justify-between text-sm py-1">
                          <span className="text-gray-700">
                            {payment.method === 'CASH' && 'Efectivo'}
                            {payment.method === 'CREDIT_CARD' && 'Tarjeta Crédito'}
                            {payment.method === 'DEBIT_CARD' && 'Tarjeta Débito'}
                            {payment.method === 'MEMBER_ACCOUNT' && 'Cuenta Socio'}
                          </span>
                          <span className="font-medium text-gray-900">{fmt(payment.amount)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {(['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'MEMBER_ACCOUNT'] as PaymentMethod[]).map((method) => (
                        <button
                          key={method}
                          onClick={() => handleUpdatePaymentMethod(selectedSale.id, method)}
                          disabled={selectedSale.paymentMethod === method}
                          className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                            selectedSale.paymentMethod === method
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          {method === 'CASH' && 'Efectivo'}
                          {method === 'CREDIT_CARD' && 'Tarjeta Crédito'}
                          {method === 'DEBIT_CARD' && 'Tarjeta Débito'}
                          {method === 'MEMBER_ACCOUNT' && 'Cuenta Socio'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t flex gap-3">
                <button
                  onClick={() => setShowSaleDetail(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    handlePrintSaleTicket(selectedSale);
                    setShowSaleDetail(false);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Split Payment Modal */}
        {showSplitPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <Scissors className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Pago Dividido</h2>
                      <p className="text-blue-100 text-sm">Configurar métodos de pago</p>
                    </div>
                  </div>
                  <button
                    onClick={handleCancelSplitPayment}
                    className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-4">
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total a pagar:</span>
                    <span className="text-2xl font-bold text-gray-900">{fmt(displayTotals.total)}</span>
                  </div>
                  <div className="mt-2 flex justify-between items-center text-sm">
                    <span className="text-gray-600">Total dividido:</span>
                    <span className={`font-semibold ${
                      Math.abs(splitPayments.reduce((sum, p) => sum + p.amount, 0) - displayTotals.total) < 0.01
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {fmt(splitPayments.reduce((sum, p) => sum + p.amount, 0))}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  {splitPayments.map((payment, index) => (
                    <div key={index} className="bg-white border-2 border-gray-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-gray-700">Pago {index + 1}</span>
                        {splitPayments.length > 1 && (
                          <button
                            onClick={() => handleRemoveSplitPayment(index)}
                            className="ml-auto text-red-500 hover:text-red-600 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={payment.method}
                          onChange={(e) => handleUpdateSplitPayment(index, 'method', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="CASH">Efectivo</option>
                          <option value="CREDIT_CARD">Tarjeta Crédito</option>
                          <option value="DEBIT_CARD">Tarjeta Débito</option>
                          <option value="MEMBER_ACCOUNT">Cuenta Socio</option>
                        </select>
                        <input
                          type="number"
                          value={payment.amount}
                          onChange={(e) => handleUpdateSplitPayment(index, 'amount', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          step="0.01"
                          min="0"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleAddSplitPayment}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2 mb-4"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Método de Pago
                </button>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t flex gap-3">
                <button
                  onClick={handleCancelSplitPayment}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveSplitPayment}
                  disabled={Math.abs(splitPayments.reduce((sum, p) => sum + p.amount, 0) - displayTotals.total) > 0.01}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Guardar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  // ===================== MAIN POS SCREEN =====================
  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* HEADER */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-2 sm:px-4 h-12 sm:h-14 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-1 sm:gap-3">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center">
            <Package className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm sm:text-lg font-bold text-gray-900 leading-tight">YCC POS</h1>
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500">{user}</p>
              {currentShift && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Turno activo
                </span>
              )}
              {cashOpen && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  Caja abierta
                </span>
              )}
            </div>
          </div>
          <div className="sm:hidden">
            <h1 className="text-sm font-bold text-gray-900">POS</h1>
          </div>
          {/* Mode indicator - Más prominente */}
          <button 
            onClick={() => setShowModeSelector(true)}
            className={`
              ml-3 px-3 py-2 rounded-xl flex items-center gap-2 font-bold text-sm transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl
              ${posMode === 'COUNTER' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''}
              ${posMode === 'TABLE' ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''}
              ${posMode === 'DELIVERY' ? 'bg-purple-500 hover:bg-purple-600 text-white' : ''}
            `}
            title="Cambiar modo de operación"
          >
            {posMode === 'COUNTER' && (
              <>
                <Store className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Mostrador</span>
                <span className="sm:hidden">Mostrador</span>
              </>
            )}
            {posMode === 'TABLE' && (
              <>
                <Utensils className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Mesa</span>
                <span className="sm:hidden">Mesa</span>
              </>
            )}
            {posMode === 'DELIVERY' && (
              <>
                <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Domicilio</span>
                <span className="sm:hidden">Domicilio</span>
              </>
            )}
            <Settings className="w-3 h-3 opacity-70" />
          </button>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Toggle Multicomanda */}
          <button
            onClick={() => setComandasMode(!comandasMode)}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1 transition-all ${
              comandasMode
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
            title="Modo Multicomanda"
          >
            <Utensils className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{comandasMode ? 'Comandas' : 'Multicomanda'}</span>
          </button>
          {/* Botón de Corte de Caja */}
          {cashOpen && currentCashSession && (
            <button 
              onClick={() => {
                if (window.confirm('¿Deseas realizar el corte de caja?')) {
                  setShowCashCutModal(true);
                }
              }}
              className="px-2 sm:px-3 py-1 sm:py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1 transition-colors"
              title="Corte de Caja"
            >
              <Scissors className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Corte</span>
            </button>
          )}
          <button onClick={() => setScreen('history')} className="p-1 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-600" title="Historial"><Receipt className="w-3 h-3 sm:w-4 sm:h-4" /></button>
          <button onClick={() => setShowPrinterConfig(true)} className="p-1 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-600" title="Configurar Impresora"><Printer className="w-3 h-3 sm:w-4 sm:h-4" /></button>
          <button onClick={() => setScreen('cash-close')} className="p-1 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-600" title="Cerrar Sesión"><LogOut className="w-3 h-3 sm:w-4 sm:h-4" /></button>
        </div>
      </header>

      {/* MULTICOMANDA PANEL */}
      {comandasMode && (
        <ComandasPanel
          onNewComanda={() => setShowNewComandaModal(true)}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: PRODUCT CATALOG */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Search + Categories */}
          <div className="p-2 sm:p-3 lg:p-4 space-y-2 bg-white border-b">
            <div className="relative max-w-xl">
              <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
              <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar productos..." className="w-full pl-7 sm:pl-9 pr-7 sm:pr-9 py-1.5 sm:py-2 lg:py-3 bg-gray-100 rounded-lg sm:rounded-xl text-xs sm:text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white" />
              {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2"><X className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" /></button>}
            </div>
            <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-1">
              {CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`px-2 sm:px-3 lg:px-4 py-1 lg:py-1.5 rounded-full text-xs lg:text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat.id ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{cat.name}</button>
              ))}
            </div>
          </div>
          {/* Products Grid - Mejorado para desktop */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-3 lg:p-4">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-1 sm:gap-2 lg:gap-4">
              {filteredProducts.map(product => {
                const inCart = comandasMode && activeComanda 
                  ? activeComanda.items.find(i => i.productId === product.id)
                  : items.find(i => i.productId === product.id);
                return (
                  <motion.button key={product.id} whileTap={{ scale: 0.95 }} onClick={() => handleAddItem(product)} className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-2 sm:p-3 lg:p-4 text-left hover:shadow-md hover:border-emerald-200 transition-all relative group">
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-xs font-mono text-gray-400 hidden xl:block">{product.sku}</span>
                      {inCart && <span className="bg-emerald-600 text-white text-xs font-bold rounded-full w-4 h-4 sm:w-6 sm:h-6 flex items-center justify-center">{inCart.quantity}</span>}
                    </div>
                    <h3 className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-base leading-tight mb-1 lg:mb-2 truncate">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-lg lg:text-xl font-bold text-emerald-600">{fmt(product.price)}</span>
                      <span className="text-xs text-gray-400 hidden lg:block">{product.categoryName}</span>
                    </div>
                    <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-emerald-600 opacity-0 group-active:opacity-10 transition-opacity" />
                  </motion.button>
                );
              })}
            </div>
            {filteredProducts.length === 0 && (
              <div className="text-center py-8 lg:py-16 text-gray-400">
                <Search className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 mx-auto mb-2 sm:mb-3 opacity-30" />
                <p className="text-xs sm:text-sm lg:text-base">No se encontraron productos</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: CART SIDEBAR - Ancho optimizado para desktop */}
        <div className="w-full sm:w-72 md:w-80 lg:w-96 xl:w-[420px] 2xl:w-[480px] bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
          {/* Cart header */}
          <div className="p-2 sm:p-3 lg:p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-1 sm:gap-2">
              <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-emerald-600" />
              <h2 className="font-bold text-gray-900 text-xs sm:text-sm lg:text-base">
                {comandasMode && activeComanda ? activeComanda.nombre : 'Carrito'}
              </h2>
              {displayItemCount > 0 && <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-1 sm:px-2 py-0.5 rounded-full">{displayItemCount}</span>}
            </div>
            {displayItems.length > 0 && <button onClick={comandasMode && activeComanda ? () => { displayItems.forEach(i => removeItemFromComanda(activeComanda.id, i.productId)); } : clearCart} className="text-xs lg:text-sm text-red-500 hover:text-red-700 font-medium">Limpiar</button>}
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto">
            {displayItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-2 sm:p-4 lg:p-6">
                <ShoppingCart className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 mb-2 sm:mb-4 opacity-20" />
                <p className="text-xs lg:text-sm">{comandasMode ? 'Selecciona una comanda' : 'Agrega productos al carrito'}</p>
              </div>
            ) : (
              <AnimatePresence>
                {displayItems.map(item => (
                  <motion.div key={item.productId} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-1.5 sm:p-2 lg:p-3 border-b border-gray-100 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-xs lg:text-sm truncate">{item.name}</h4>
                        <p className="text-xs text-gray-400">{fmt(item.unitPrice)}</p>
                      </div>
                      <button onClick={() => comandasMode && activeComanda ? removeItemFromComanda(activeComanda.id, item.productId) : removeItem(item.productId)} className="p-1 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-3 h-3 lg:w-4 lg:h-4" /></button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <button onClick={() => comandasMode && activeComanda ? updateComandaItemQuantity(activeComanda.id, item.productId, item.quantity - 1) : updateQuantity(item.productId, item.quantity - 1)} className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"><Minus className="w-2 h-2 sm:w-3 sm:h-3" /></button>
                        <span className="w-5 sm:w-6 lg:w-8 text-center text-xs lg:text-sm font-bold">{item.quantity}</span>
                        <button onClick={() => comandasMode && activeComanda ? updateComandaItemQuantity(activeComanda.id, item.productId, item.quantity + 1) : updateQuantity(item.productId, item.quantity + 1)} className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-700 flex items-center justify-center transition-colors"><Plus className="w-2 h-2 sm:w-3 sm:h-3" /></button>
                      </div>
                      <span className="font-bold text-gray-900 text-xs lg:text-sm">{fmt(item.totalPrice)}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Cart totals + pay - Mejorado para desktop */}
          {displayItems.length > 0 && (
            <div className="border-t bg-gray-50 p-2 sm:p-3 lg:p-4 space-y-2 lg:space-y-3">
              <div className="flex justify-between font-bold text-sm sm:text-base lg:text-lg">
                <span>Total</span>
                <span className="text-emerald-600">{fmt(displayTotals.total)}</span>
              </div>
              <div className="border-t pt-2 space-y-1 text-xs lg:text-sm">
                <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{fmt(displayTotals.subtotal)}</span></div>
                <div className="flex justify-between text-gray-500"><span>IVA 16% (incluido)</span><span>{fmt(displayTotals.taxAmount)}</span></div>
              </div>
              <button 
                onClick={() => {
                  if (posMode === 'COUNTER') {
                    setScreen('payment');
                  } else if (posMode === 'TABLE') {
                    setShowTableMode(true);
                  } else if (posMode === 'DELIVERY') {
                    setShowDeliveryMode(true);
                  }
                }}
                className={`
                  w-full py-2 sm:py-2.5 lg:py-3 text-white rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm lg:text-base transition-all active:scale-[0.98] flex items-center justify-center gap-1 lg:gap-2
                  ${posMode === 'COUNTER' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                  ${posMode === 'TABLE' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                  ${posMode === 'DELIVERY' ? 'bg-purple-600 hover:bg-purple-700' : ''}
                `}
              >
                {posMode === 'COUNTER' && <><CreditCard className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" /> <span>Cobrar</span></>}
                {posMode === 'TABLE' && <><Utensils className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" /> <span>Enviar a Cocina</span></>}
                {posMode === 'DELIVERY' && <><Truck className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" /> <span>Crear Pedido</span></>}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mode Selector Overlay */}
      {showModeSelector && (
        <ModeSelector
          currentMode={posMode}
          onModeChange={(mode) => {
            setPosMode(mode);
            setShowModeSelector(false);
          }}
        />
      )}

      {/* Table Mode Overlay */}
      {showTableMode && (
        <TableMode
          items={displayItems as any[]}
          total={displayTotals.total}
          onSendToKitchen={async (tableNumber, customerName) => {
            try {
              await api.post(endpoints.comandas.create(), {
                tipo: 'MESA',
                mesa: tableNumber,
                cliente: customerName,
                items: displayItems.map(item => ({
                  nombre: item.name,
                  cantidad: item.quantity,
                  precio: item.unitPrice,
                  notas: ''
                })),
                total: displayTotals.total,
                notas: ''
              });

              if (comandasMode && activeComanda) { closeComanda(activeComanda.id); } clearCart();
              setShowTableMode(false);
              toast.success(`Pedido enviado a cocina - Mesa: ${tableNumber}`);
            } catch (error) {
              console.error('Error:', error);
              toast.error('Error al enviar pedido a cocina');
            }
          }}
          onCancel={() => setShowTableMode(false)}
        />
      )}

      {/* Delivery Mode Overlay */}
      {showDeliveryMode && (
        <DeliveryMode
          items={displayItems as any[]}
          total={displayTotals.total}
          onCreateDelivery={async (customerName, phone, address) => {
            try {
              await api.post(endpoints.comandas.create(), {
                tipo: 'DOMICILIO',
                cliente: customerName,
                telefono: phone,
                domicilio: address,
                items: displayItems.map(item => ({
                  nombre: item.name,
                  cantidad: item.quantity,
                  precio: item.unitPrice,
                  notas: ''
                })),
                total: displayTotals.total,
                notas: ''
              });

              if (comandasMode && activeComanda) { closeComanda(activeComanda.id); } clearCart();
              setShowDeliveryMode(false);
              toast.success(`Pedido a domicilio creado - ${customerName}`);
            } catch (error) {
              console.error('Error:', error);
              toast.error('Error al crear pedido a domicilio');
            }
          }}
          onCancel={() => setShowDeliveryMode(false)}
        />
      )}

      {/* Cash Cut Modal */}
      {showCashCutModal && currentCashSession && (
        <CashCutModal
          isOpen={showCashCutModal}
          onClose={handleCloseCashCutModal}
          sessionId={currentCashSession.id}
          terminalId={terminalId}
          userId={userId}
          onCutComplete={handleCashCutComplete}
        />
      )}

      {/* Print Error Modal */}
      {showPrintError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Error de Impresión</h2>
              </div>
              <button
                onClick={() => setShowPrintError(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-4">{printErrorMessage}</p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Posibles soluciones:</strong>
                </p>
                <ul className="text-sm text-yellow-700 mt-2 space-y-1 list-disc list-inside">
                  <li>Verifica que la impresora esté encendida</li>
                  <li>Asegúrate de que la impresora esté conectada</li>
                  <li>Permite ventanas emergentes en tu navegador</li>
                  <li>Intenta imprimir nuevamente desde el historial</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPrintError(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  setShowPrintError(false);
                  setScreen('history');
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ir al Historial
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* New Comanda Modal */}
      {showNewComandaModal && (
        <NewComandaModal
          isOpen={showNewComandaModal}
          onClose={() => setShowNewComandaModal(false)}
          onCreate={handleCreateComanda}
        />
      )}

      {/* Printer Config Modal */}
      <PrinterConfigModal 
        isOpen={showPrinterConfig}
        onClose={() => setShowPrinterConfig(false)}
      />

      {/* Toast Notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
};
