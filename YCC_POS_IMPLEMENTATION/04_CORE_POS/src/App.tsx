import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Package, CreditCard, DollarSign, Users, LogOut,
  Plus, Minus, Trash2, Search, X, Check, Banknote, ArrowLeft,
  Lock, ChevronRight, Receipt, Clock, TrendingUp, AlertCircle,
  Store, Utensils, Truck, Settings, Scissors, UserCircle, Printer, RotateCcw
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useCartStore } from './stores/cart.store';
import { useComandasStore } from './stores/comandas.store';
import { ComandasPanel } from './components/ComandasPanel';
import { NewComandaModal } from './components/NewComandaModal';
import { CustomerSelector } from './components/CustomerSelector';
import { Product, PaymentMethod, SaleRecord, POSMode, SplitPayment, ComandaType, SelectedModifier, ModifierGroup } from './types';
import { CashSessionResponse, ShiftResponse, CashCutReport, SaleResponse, ProductResponse } from './types/api.types';
import { ModeSelector } from './components/ModeSelector';
import { TableMode } from './components/TableMode';
import { DeliveryMode } from './components/DeliveryMode';
import { CashCutModal } from './components/CashCutModal';
import { TicketPrinter, TicketData } from './components/TicketPrinter';
import { PrinterConfigModal } from './components/PrinterConfigModal';
import { ProductCustomizationModal } from './components/ProductCustomizationModal';
import { api, endpoints } from './lib/apiClient';
import { Logo, useBranding } from './hooks/useBranding';

// ===================== HELPERS =====================
const fmt = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
const displayFolio = (folio: string) => {
  if (!folio) return '#---';
  if (folio.includes('-')) {
    const num = folio.split('-')[1];
    return `#${num}`;
  }
  return `#${folio}`;
};


// ===================== SCREENS =====================
type Screen = 'mode-select' | 'login' | 'pos' | 'payment' | 'complete' | 'cash-open' | 'cash-close' | 'history';

// ===================== APP =====================
export const App: React.FC = () => {
  // Mode
  const [posMode, setPosMode] = useState<POSMode>('COUNTER');
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [showTableMode, setShowTableMode] = useState(false);
  const [showDeliveryMode, setShowDeliveryMode] = useState(false);
  
  // Branding configuration from Admin Panel
  const branding = useBranding();
  
  // Auth - persistido en localStorage para sobrevivir recarga
  const [screen, setScreen] = useState<Screen>(() => (localStorage.getItem('pos_screen') as Screen) || 'login');
  const [user, setUser] = useState(() => localStorage.getItem('pos_user') || '');
  const [userId, setUserId] = useState(() => localStorage.getItem('pos_userId') || '');
  const [pin, setPin] = useState('');
  const [cashOpen, setCashOpen] = useState(() => localStorage.getItem('pos_cashOpen') === 'true');
  const [openingFloat, setOpeningFloat] = useState(() => localStorage.getItem('pos_openingFloat') || '');
  
  // Cash Session & Shift Management - persistido para sobrevivir recarga
  const [currentCashSession, setCurrentCashSession] = useState<CashSessionResponse | null>(() => {
    try {
      const stored = localStorage.getItem('pos_currentCashSession');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [currentShift, setCurrentShift] = useState<ShiftResponse | null>(() => {
    try {
      const stored = localStorage.getItem('pos_currentShift');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
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
        const transformedProducts = data.map((p: any) => ({
          id: p.id,
          sku: p.sku,
          name: p.name,
          price: Number(p.price),
          categoryId: p.categoryId,
          categoryName: p.category?.name || 'Sin categoría',
          imageUrl: p.imageUrl || undefined,
          stationId: p.stationId || p.station?.id,
          station: p.station,
          hasVariants: p.hasVariants || false,
          variantLabel: p.variantLabel || undefined,
          variants: p.variants?.map((v: any) => ({
            id: v.id,
            productId: v.productId,
            name: v.name,
            sku: v.sku,
            price: Number(v.price),
            cost: v.cost ? Number(v.cost) : undefined,
            currentStock: Number(v.currentStock),
            image: v.image || undefined,
            description: v.description || undefined,
            isActive: v.isActive,
            sortOrder: v.sortOrder
          })) || undefined,
          modifierGroups: p.modifierGroups?.map((mg: any) => ({
            id: mg.modifierGroup.id,
            name: mg.modifierGroup.name,
            description: mg.modifierGroup.description || undefined,
            isRequired: mg.modifierGroup.isRequired,
            isActive: mg.modifierGroup.isActive,
            modifiers: mg.modifierGroup.modifiers?.map((m: any) => ({
              id: m.id,
              name: m.name,
              description: m.description || undefined,
              priceAdd: Number(m.priceAdd),
              isActive: m.isActive
            })) || []
          })) || undefined
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
  const [historyDate, setHistoryDate] = useState<string>(new Date().toISOString().split('T')[0]); // Fecha seleccionada (por defecto hoy)

  // Multicomanda - cada comanda tiene su carrito independiente
  const [showNewComandaModal, setShowNewComandaModal] = useState(false);
  // Variant selector
  const [variantPickerProduct, setVariantPickerProduct] = useState<Product | null>(null);
  // Key para forzar re-render del carrito después de venta (evita datos stale)
  const [cartKey, setCartKey] = useState(0);
  const { comandas, activeComandaId, getActiveComanda, addItemToComanda, removeItemFromComanda, updateItemQuantity: updateComandaItemQuantity, getComandaTotals, closeComanda, setComandaCustomerId, setComandaCustomerName, clearAllComandas, resetOrderState } = useComandasStore();

  const totals = getTotals();
  const itemCount = getItemCount();

  // Mostrar mensaje cuando no hay comandas activas
  useEffect(() => {
    const activeComandas = comandas.filter(c => c.status === 'ACTIVE');
    if (screen === 'pos' && activeComandas.length === 0) {
      toast('🍽️ Abre una comanda para comenzar a vender', {
        duration: 5000,
        icon: '💡',
        style: {
          background: '#fef3c7',
          color: '#92400e',
          border: '1px solid #f59e0b',
          fontWeight: '500'
        }
      });
    }
  }, [comandas, screen]);

  // Filter products - ahora incluye búsqueda por categoría
  const filteredProducts = products.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      p.name.toLowerCase().includes(searchLower) || 
      p.sku.toLowerCase().includes(searchLower) ||
      p.categoryName?.toLowerCase().includes(searchLower);
    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // =============== DAILY AUTO-RESET ===============
  const DAILY_RESET_KEY = 'pos_lastResetDate';

  const performDailyReset = () => {
    const today = new Date().toDateString();
    const lastReset = localStorage.getItem(DAILY_RESET_KEY);

    if (lastReset !== today) {
      console.log('🔄 Reinicio diario detectado - Limpiando sesión anterior');
      // Limpiar todo el estado de sesión
      setCashOpen(false);
      setScreen('login');
      setPin('');
      setUser('');
      setUserId('');
      setOpeningFloat('');
      setSalesHistory([]);
      setCurrentShift(null);
      setCurrentCashSession(null);
      clearAllComandas();
      // Limpiar localStorage
      localStorage.removeItem('pos_screen');
      localStorage.removeItem('pos_user');
      localStorage.removeItem('pos_userId');
      localStorage.removeItem('pos_cashOpen');
      localStorage.removeItem('pos_openingFloat');
      localStorage.removeItem('pos_currentCashSession');
      localStorage.removeItem('pos_currentShift');
      // Marcar reset de hoy
      localStorage.setItem(DAILY_RESET_KEY, today);
      toast('🔄 Reinicio diario realizado', { icon: '🔄', duration: 3000 });
    }
  };

  // Verificar reinicio diario al cargar y cada minuto
  useEffect(() => {
    performDailyReset();
    const interval = setInterval(() => {
      performDailyReset();
    }, 60000); // Checar cada minuto
    return () => clearInterval(interval);
  }, []);

  // =============== CASH SESSION & SHIFT MANAGEMENT ===============
  
  // Persistir estado en localStorage
  useEffect(() => { if (screen !== 'login') localStorage.setItem('pos_screen', screen); }, [screen]);
  useEffect(() => { localStorage.setItem('pos_user', user); }, [user]);
  useEffect(() => { localStorage.setItem('pos_userId', userId); }, [userId]);
  useEffect(() => { localStorage.setItem('pos_cashOpen', String(cashOpen)); }, [cashOpen]);
  useEffect(() => { localStorage.setItem('pos_openingFloat', openingFloat); }, [openingFloat]);
  useEffect(() => { localStorage.setItem('pos_currentCashSession', JSON.stringify(currentCashSession)); }, [currentCashSession]);
  useEffect(() => { localStorage.setItem('pos_currentShift', JSON.stringify(currentShift)); }, [currentShift]);

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

  const loadHistoryForShift = (shiftId: string) => {
    try {
      const storageKey = getHistoryStorageKey(shiftId);
      const storedHistory = localStorage.getItem(storageKey);
      
      if (storedHistory) {
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
      localStorage.setItem(storageKey, JSON.stringify(history));
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

  // Guard centralizado: verifica si se puede modificar el carrito
  const canModifyCart = (): boolean => {
    if (!activeComandaId) {
      toast.error('⚠️ Primero debes abrir una comanda para realizar la compra', { 
        duration: 3000,
        icon: '🍽️'
      });
      return false;
    }
    return validateCashSessionBeforeAction();
  };

  // Wrapper para addItem con validación - SIEMPRE agrega a la comanda activa
  const handleAddItem = (product: Product, variantId?: string, variantName?: string, variantPrice?: number, modifiers?: SelectedModifier[], notes?: string) => {
    if (!canModifyCart()) {
      return;
    }
    // Agregar SIEMPRE a la comanda activa (cada comanda tiene su carrito independiente)
    addItemToComanda(activeComandaId!, product, 1, variantId, variantName, product.variantLabel, variantPrice, modifiers, notes);
    const label = variantName ? `${product.name} (${variantName})` : product.name;
    toast.success(`${label} → ${getActiveComanda()?.nombre}`, { duration: 1500 });
    setVariantPickerProduct(null); // Cerrar picker si estaba abierto
  };

  // Manejar click en producto: verificar comanda activa primero
  const handleProductClick = (product: Product) => {
    // Guard: no permitir agregar productos sin comanda activa
    if (!activeComandaId) {
      toast.error('⚠️ Primero debes abrir una comanda para agregar productos', { 
        duration: 3000,
        icon: '🍽️'
      });
      return;
    }
    
    const hasVariants = product.hasVariants && product.variants && product.variants.length > 0;
    const hasModifiers = product.modifierGroups && product.modifierGroups.length > 0;
    if (hasVariants || hasModifiers) {
      setVariantPickerProduct(product);
    } else {
      handleAddItem(product);
    }
  };

  // Crear nueva comanda
  const handleCreateComanda = (nombre: string, tipo: ComandaType) => {
    useComandasStore.getState().createComanda(nombre, tipo);
    toast.success(`Comanda "${nombre}" creada`, { icon: '🍽️' });
  };

  // Obtener items y totales de la comanda activa (cada comanda tiene su carrito individual)
  const activeComanda = getActiveComanda();
  const comandaTotals = activeComanda ? getComandaTotals(activeComanda.id) : null;
  // SIEMPRE mostrar items de la comanda activa, nunca el carrito global
  const displayItems = activeComanda ? activeComanda.items : [];
  const displayTotals = activeComanda && comandaTotals ? comandaTotals : { subtotal: 0, taxAmount: 0, discountAmount: 0, total: 0, itemCount: 0 };
  const displayItemCount = activeComanda ? activeComanda.items.reduce((s, i) => s + i.quantity, 0) : 0;

  // =============== LOGIN ===============
  const handleLogin = async () => {
    if (pin.length !== 4) {
      toast.error('El PIN debe tener 4 dígitos');
      return;
    }

    // Limpiar comandas de sesiones anteriores
    clearAllComandas();

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

  // Function to update payment method (con API)
  const handleUpdatePaymentMethod = async (saleId: string, newMethod: PaymentMethod) => {
    try {
      const response = await fetch(`http://localhost:3004/api/sales/${saleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod: newMethod })
      });
      
      if (!response.ok) throw new Error('Error actualizando método de pago');
      
      // Update local state
      setSalesHistory(prev => {
        const updated = prev.map(s => 
          s.id === saleId ? { ...s, paymentMethod: newMethod, splitPayments: undefined } : s
        );
        if (currentShift) saveHistoryToStorage(updated, currentShift.id);
        return updated;
      });
      
      setSelectedSale(prev => prev ? { ...prev, paymentMethod: newMethod, splitPayments: undefined } : null);
      toast.success('Método de pago actualizado');
    } catch (error) {
      toast.error('Error al actualizar método de pago');
    }
  };

  // Function to update order type (tipo de comanda)
  const handleUpdateOrderType = async (saleId: string, newType: OrderType) => {
    try {
      const response = await fetch(`http://localhost:3004/api/sales/${saleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderType: newType })
      });
      
      if (!response.ok) throw new Error('Error actualizando tipo de comanda');
      
      // Update local state
      setSalesHistory(prev => {
        const updated = prev.map(s => 
          s.id === saleId ? { ...s, orderType: newType } : s
        );
        if (currentShift) saveHistoryToStorage(updated, currentShift.id);
        return updated;
      });
      
      setSelectedSale(prev => prev ? { ...prev, orderType: newType } : null);
      toast.success(`Tipo de comanda cambiado a ${newType}`);
    } catch (error) {
      toast.error('Error al actualizar tipo de comanda');
    }
  };

  // Function to cancel order
  const handleCancelOrder = async (saleId: string) => {
    if (!confirm('¿Estás seguro de cancelar este pedido?\n\nEsta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3004/api/sales/${saleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' })
      });
      
      if (!response.ok) throw new Error('Error cancelando pedido');
      
      // Update local state
      setSalesHistory(prev => {
        const updated = prev.map(s => 
          s.id === saleId ? { ...s, status: 'CANCELLED' as OrderStatus } : s
        );
        if (currentShift) saveHistoryToStorage(updated, currentShift.id);
        return updated;
      });
      
      setSelectedSale(prev => prev ? { ...prev, status: 'CANCELLED' as OrderStatus } : null);
      toast.success('Pedido cancelado');
    } catch (error) {
      toast.error('Error al cancelar pedido');
    }
  };

  // Function to handle split payment (para pantalla de pago)
  const handleOpenSplitPayment = () => {
    if (splitPayments.length > 0) {
      setShowSplitPayment(true);
    } else {
      const half = Math.round(displayTotals.total / 2 * 100) / 100;
      const otherHalf = Math.round((displayTotals.total - half) * 100) / 100;
      setSplitPayments([
        { method: 'CASH', amount: half },
        { method: 'CREDIT_CARD', amount: otherHalf }
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

      if (!activeComanda) {
        toast.error('Selecciona una comanda primero');
        setIsProcessing(false);
        return;
      }

      // Venta SIEMPRE desde la comanda activa (cada comanda tiene su carrito independiente)
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
          customerId: activeComanda.customerId || undefined,
          customerName: activeComanda.customerName || customerName || activeComanda.nombre,
          notes: activeComanda.notes || '',
          splitPayments: splitPayments.length > 0 ? splitPayments.map(p => ({ method: p.method, amount: p.amount })) : undefined
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Error al crear venta');
      }
      
      saleFromBackend = await response.json();
      
      // Guardar el ID de la comanda que se está cerrando
      const closedComandaId = activeComanda.id;
      
      // Resetear completamente el estado de la orden antes de cerrar la comanda
      resetOrderState(closedComandaId);
      
      // Cerrar comanda después de venta exitosa
      closeComanda(closedComandaId);
      
      // Limpiar cualquier dato persistente en localStorage relacionado con la comanda
      localStorage.removeItem(`comanda_${closedComandaId}_items`);
      localStorage.removeItem(`comanda_${closedComandaId}_cart`);
      
      // Forzar actualización de estado de pago
      setCashReceived('');
      setCustomerName('');
      setSplitPayments([]);
      setPaymentMethod('CASH');
      
      // Forzar re-render del carrito para evitar datos stale
      setCartKey(prev => prev + 1);
      
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
      
      // Comanda cobrada exitosamente - mostrar modal para crear nueva comanda
      toast.success(`Comanda cobrada - Folio: ${displayFolio(saleFromBackend.folio)}`, { icon: '✅', duration: 3000 });
      
      // Mostrar modal para crear nueva comanda en lugar de ir a pantalla complete
      setShowNewComandaModal(true);
      
      console.log('✅ Venta completada y guardada en backend:', saleFromBackend);
      
      // Imprimir ticket y luego redirigir a POS después de un momento
      setTimeout(async () => {
        try {
          await handlePrintSaleTicket(sale);
          // Después de imprimir (o cancelar), redirigir a POS automáticamente
          setTimeout(() => {
            setScreen('pos');
          }, 1500); // Dar tiempo para que el usuario vea el ticket
        } catch (printError) {
          // Si hay error en impresión, igual redirigir a POS
          console.log('⚠️ Error o cancelación de impresión, redirigiendo...');
          setScreen('pos');
        }
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
    setUserId('');
    setOpeningFloat('');
    setSalesHistory([]);
    setCurrentShift(null);
    setCurrentCashSession(null);
    clearAllComandas();
    // Limpiar localStorage de sesión
    localStorage.removeItem('pos_screen');
    localStorage.removeItem('pos_user');
    localStorage.removeItem('pos_userId');
    localStorage.removeItem('pos_cashOpen');
    localStorage.removeItem('pos_openingFloat');
    localStorage.removeItem('pos_currentCashSession');
    localStorage.removeItem('pos_currentShift');
    // Actualizar fecha de reset para evitar doble reset
    localStorage.setItem(DAILY_RESET_KEY, new Date().toDateString());
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
          <p className="text-gray-500 mb-3 sm:mb-4 text-xs sm:text-sm">Folio: {displayFolio(lastSale.folio)}</p>
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
    const isSplitMode = splitPayments.length > 0;
    const splitTotal = splitPayments.reduce((sum, p) => sum + p.amount, 0);
    const splitCashAmount = isSplitMode ? splitPayments.filter(p => p.method === 'CASH').reduce((sum, p) => sum + p.amount, 0) : 0;
    // Guard: requerir comanda activa y monto válido para poder pagar
    const hasActiveComanda = !!activeComandaId && displayItems.length > 0;
    const canPay = hasActiveComanda && (isSplitMode
      ? Math.abs(splitTotal - displayTotals.total) < 0.01 && (!splitPayments.some(p => p.method === 'CASH') || cashAmount >= splitCashAmount)
      : paymentMethod === 'CASH' ? cashAmount >= displayTotals.total : true);
    return (
      <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-3 md:px-5 py-2 md:py-3 flex items-center justify-between flex-shrink-0">
          <button onClick={() => { setSplitPayments([]); setScreen('pos'); }} className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 min-h-[44px] px-2">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Volver</span>
          </button>
          <h1 className="text-base md:text-lg font-bold text-gray-900">Cobrar</h1>
          <div className="text-base md:text-lg font-bold text-emerald-600">{fmt(displayTotals.total)}</div>
        </header>
        
        <div className="flex-1 overflow-hidden p-2 md:p-4">
          <div className="h-full max-w-5xl mx-auto md:grid md:grid-cols-2 md:gap-4 flex flex-col gap-2 md:gap-0">
            {/* Columna izquierda: Pago */}
            <div className="flex flex-col gap-2 md:gap-3 min-h-0 flex-1 md:flex-none">
              {/* Selector de Cliente */}
              <div className="flex-shrink-0">
                <CustomerSelector 
                  onCustomerSelect={(customer) => {
                    if (activeComanda) {
                      setComandaCustomerId(activeComanda.id, customer?.id);
                      setComandaCustomerName(activeComanda.id, customer?.fullName || '');
                    }
                    setCustomerName(customer?.fullName || '');
                  }}
                />
              </div>

              {/* Payment methods - compacto */}
              <div className="bg-white rounded-lg shadow-sm p-2.5 md:p-3 flex-shrink-0">
                {isSplitMode ? (
                  <div className="space-y-2">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 md:p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-blue-900 text-sm">Pago Dividido</span>
                        <span className={`text-xs font-semibold ${
                          Math.abs(splitTotal - displayTotals.total) < 0.01 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {fmt(splitTotal)} / {fmt(displayTotals.total)}
                        </span>
                      </div>
                      {splitPayments.map((payment, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2 last:mb-0">
                          <span className="text-xs font-semibold text-gray-500 w-6">#{index + 1}</span>
                          <select
                            value={payment.method}
                            onChange={(e) => handleUpdateSplitPayment(index, 'method', e.target.value as PaymentMethod)}
                            className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[36px] bg-white"
                          >
                            <option value="CASH">💵 Efectivo</option>
                            <option value="CREDIT_CARD">💳 T. Crédito</option>
                            <option value="DEBIT_CARD">💳 T. Débito</option>
                            <option value="MEMBER_ACCOUNT">👤 Cta. Socio</option>
                          </select>
                          <input
                            type="number"
                            value={payment.amount}
                            onChange={(e) => handleUpdateSplitPayment(index, 'amount', Number(e.target.value) || 0)}
                            className="w-24 px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-right font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[36px]"
                            step="0.01"
                            min="0"
                          />
                          {splitPayments.length > 1 && (
                            <button onClick={() => handleRemoveSplitPayment(index)} className="text-red-500 hover:text-red-600 p-1">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                      {Math.abs(splitTotal - displayTotals.total) > 0.01 && (
                        <div className="text-red-600 text-xs mt-1 font-semibold">
                          Diferencia: {fmt(Math.abs(splitTotal - displayTotals.total))}
                        </div>
                      )}
                    </div>
                    {/* Quick split + add + cancel */}
                    <div className="grid grid-cols-4 gap-1.5">
                      <button
                        onClick={() => {
                          const half = Math.round(displayTotals.total / 2 * 100) / 100;
                          const other = Math.round((displayTotals.total - half) * 100) / 100;
                          setSplitPayments([
                            { method: 'CASH', amount: half },
                            { method: 'CREDIT_CARD', amount: other }
                          ]);
                        }}
                        className="p-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-colors min-h-[36px]"
                      >
                        50/50
                      </button>
                      <button
                        onClick={() => {
                          const third = Math.round(displayTotals.total / 3 * 100) / 100;
                          const rest = Math.round((displayTotals.total - third * 2) * 100) / 100;
                          setSplitPayments([
                            { method: 'CASH', amount: third },
                            { method: 'CREDIT_CARD', amount: third },
                            { method: 'DEBIT_CARD', amount: rest }
                          ]);
                        }}
                        className="p-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-colors min-h-[36px]"
                      >
                        3 partes
                      </button>
                      <button
                        onClick={handleAddSplitPayment}
                        className="p-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-colors min-h-[36px] flex items-center justify-center gap-0.5"
                      >
                        <Plus className="w-3 h-3" />
                        Agregar
                      </button>
                      <button
                        onClick={handleCancelSplitPayment}
                        className="p-1.5 bg-red-50 border border-red-200 rounded-lg text-xs font-medium text-red-600 hover:bg-red-100 hover:border-red-400 transition-colors min-h-[36px] flex items-center justify-center gap-0.5"
                      >
                        <X className="w-3 h-3" />
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-4 gap-1.5 md:gap-2">
                      {([['CASH', 'Efectivo', Banknote], ['CREDIT_CARD', 'Tarjeta', CreditCard], ['DEBIT_CARD', 'Débito', CreditCard], ['MEMBER_ACCOUNT', 'Socio', Users]] as [PaymentMethod, string, any][]).map(([method, label, Icon]) => (
                        <button 
                          key={method} 
                          onClick={() => setPaymentMethod(method)} 
                          className={`p-2 md:p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-all min-h-[52px] md:min-h-[60px] ${
                            paymentMethod === method 
                              ? 'border-emerald-500 bg-emerald-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className={`w-5 h-5 md:w-6 md:h-6 ${paymentMethod === method ? 'text-emerald-600' : 'text-gray-400'}`} />
                          <span className={`font-medium text-xs md:text-sm ${paymentMethod === method ? 'text-emerald-700' : 'text-gray-600'}`}>
                            {label}
                          </span>
                        </button>
                      ))}
                    </div>
                    {/* Quick split options inline */}
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => {
                          const half = Math.round(displayTotals.total / 2 * 100) / 100;
                          const other = Math.round((displayTotals.total - half) * 100) / 100;
                          setSplitPayments([
                            { method: 'CASH', amount: half },
                            { method: 'CREDIT_CARD', amount: other }
                          ]);
                        }}
                        className="p-1.5 md:p-2 rounded-lg border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 text-xs font-medium transition-colors flex items-center justify-center gap-1 min-h-[38px]"
                      >
                        <Scissors className="w-3.5 h-3.5" />
                        50/50
                      </button>
                      <button
                        onClick={() => {
                          const third = Math.round(displayTotals.total / 3 * 100) / 100;
                          const rest = Math.round((displayTotals.total - third * 2) * 100) / 100;
                          setSplitPayments([
                            { method: 'CASH', amount: third },
                            { method: 'CREDIT_CARD', amount: third },
                            { method: 'DEBIT_CARD', amount: rest }
                          ]);
                        }}
                        className="p-1.5 md:p-2 rounded-lg border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 text-xs font-medium transition-colors flex items-center justify-center gap-1 min-h-[38px]"
                      >
                        <Scissors className="w-3.5 h-3.5" />
                        3 partes
                      </button>
                      <button
                        onClick={() => {
                          setSplitPayments([
                            { method: 'CASH', amount: displayTotals.total },
                            { method: 'CREDIT_CARD', amount: 0 }
                          ]);
                          setShowSplitPayment(true);
                        }}
                        className="p-1.5 md:p-2 rounded-lg border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 text-xs font-medium transition-colors flex items-center justify-center gap-1 min-h-[38px]"
                      >
                        <Scissors className="w-3.5 h-3.5" />
                        Personalizado
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Cash input - compacto */}
              {(paymentMethod === 'CASH' || (isSplitMode && splitPayments.some(p => p.method === 'CASH'))) && (
                <div className="bg-white rounded-lg shadow-sm p-2.5 md:p-3 flex-shrink-0">
                  <input 
                    type="number" 
                    value={cashReceived} 
                    onChange={e => setCashReceived(e.target.value)} 
                    placeholder="Efectivo recibido" 
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-xl md:text-2xl text-center font-bold focus:border-emerald-500 focus:outline-none min-h-[48px]" 
                    autoFocus 
                  />
                  <div className="grid grid-cols-4 gap-1.5 mt-2">
                    {[50, 100, 200, 500, 1000].map(n => (
                      <button 
                        key={n} 
                        onClick={() => setCashReceived(String(n))} 
                        className="py-2 px-1 bg-gray-100 rounded-lg font-medium text-sm md:text-base hover:bg-gray-200 transition-colors min-h-[40px] active:scale-95"
                      >
                        ${n}
                      </button>
                    ))}
                    <button 
                      onClick={() => setCashReceived(String(Math.ceil(displayTotals.total / 10) * 10))} 
                      className="py-2 px-1 bg-emerald-100 text-emerald-700 rounded-lg font-medium text-sm md:text-base hover:bg-emerald-200 transition-colors min-h-[40px] active:scale-95 col-span-1 md:col-span-1"
                    >
                      Exacto
                    </button>
                  </div>
                  {cashAmount > 0 && (
                    <div className={`mt-2 p-2 rounded-lg text-center text-lg md:text-xl font-bold ${
                      change >= 0 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'
                    }`}>
                      Cambio: {fmt(change)}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Columna derecha: Resumen */}
            <div className="flex flex-col gap-2 md:gap-3 min-h-0 flex-1 md:flex-none">
              {/* Order summary - compacto */}
              <div className="bg-white rounded-lg shadow-sm p-2.5 md:p-3 flex-1 min-h-0 flex flex-col">
                <h3 className="font-semibold text-gray-900 mb-1.5 text-sm">Resumen</h3>
                <div className="flex-1 overflow-y-auto space-y-0.5 text-sm min-h-0">
                  {displayItems.map(item => (
                    <div key={item.productId} className="flex justify-between py-0.5">
                      <span className="text-gray-600 truncate flex-1 mr-2">
                        <span className="font-semibold">{item.quantity}x</span> {item.name}
                      </span>
                      <span className="font-medium flex-shrink-0">{fmt(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2 space-y-1 flex-shrink-0">
                  <div className="flex justify-between font-bold text-base md:text-lg">
                    <span>TOTAL</span>
                    <span className="text-emerald-600">{fmt(displayTotals.total)}</span>
                  </div>
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

              {/* Botón de pago */}
              <button 
                onClick={handlePay} 
                disabled={!canPay || isProcessing} 
                className="w-full py-3 md:py-4 bg-emerald-600 text-white rounded-lg font-bold text-sm md:text-base hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg min-h-[48px] md:min-h-[56px] flex-shrink-0"
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
                    Confirmar Pago {isSplitMode ? '(Dividido)' : ''}
                  </>
                )}
              </button>
            </div>
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
    // Filtrar ventas por fecha, folio o método de pago
    const filteredSales = salesHistory.filter(sale => {
      // Filtro por fecha
      const saleDate = new Date(sale.createdAt).toISOString().split('T')[0];
      const dateMatch = saleDate === historyDate;
      
      // Filtro por búsqueda de texto
      if (!historySearch) return dateMatch;
      const search = historySearch.toLowerCase();
      const searchMatch = sale.folio.toLowerCase().includes(search) || 
             sale.paymentMethod.toLowerCase().includes(search) ||
             sale.total.toString().includes(search);
      
      return dateMatch && searchMatch;
    });
    
    return (
      <div className="h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between flex-shrink-0">
          <button onClick={() => setScreen('pos')} className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-gray-900"><ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden sm:inline text-xs sm:text-sm">Volver</span></button>
          <h1 className="text-base sm:text-lg font-bold text-gray-900">Historial de Ventas</h1>
          <div className="text-xs sm:text-sm text-gray-500">{filteredSales.length} ventas</div>
        </header>
        
        {/* Date and Search bar */}
        <div className="bg-white border-b px-3 sm:px-4 py-2 space-y-2">
          {/* Date selector */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={historyDate}
              onChange={(e) => setHistoryDate(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white min-h-[44px]"
            />
            <button
              onClick={() => setHistoryDate(new Date().toISOString().split('T')[0])}
              className="px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors whitespace-nowrap"
            >
              Hoy
            </button>
          </div>
          {/* Search input */}
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
                    <div className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{displayFolio(sale.folio)}</div>
                    <div className="text-xs text-gray-500">{sale.items.length} articulos - {sale.createdAt.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-emerald-600 text-xs sm:text-sm">{fmt(sale.total)}</div>
                    <div className="text-xs text-gray-400 capitalize">{sale.paymentMethod === 'CASH' ? 'Efectivo' : 'Tarjeta'}</div>
                    {sale.orderType && (
                      <div className="text-xs text-gray-500">
                        {sale.orderType === 'MESA' && '🍽️ Mesa'}
                        {sale.orderType === 'DOMICILIO' && '📦 Domicilio'}
                        {sale.orderType === 'LLEVAR' && '🥡 Llevar'}
                        {sale.orderType === 'BARRA' && '☕ Barra'}
                      </div>
                    )}
                  </div>
                  {/* Botones de acciones en historial */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Cambiar método de pago */}
                    <select
                      value={sale.paymentMethod}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleUpdatePaymentMethod(sale.id, e.target.value as PaymentMethod);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs bg-white border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      title="Cambiar método de pago"
                    >
                      <option value="CASH">💵 Efectivo</option>
                      <option value="CREDIT_CARD">💳 Crédito</option>
                      <option value="DEBIT_CARD">💳 Débito</option>
                      <option value="MEMBER_ACCOUNT">👤 Socio</option>
                    </select>

                    {/* Cambiar tipo de comanda */}
                    <select
                      value={sale.orderType || 'MESA'}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleUpdateOrderType(sale.id, e.target.value as OrderType);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs bg-white border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      title="Cambiar tipo de comanda"
                    >
                      <option value="MESA">🍽️ Mesa</option>
                      <option value="DOMICILIO">📦 Domicilio</option>
                      <option value="LLEVAR">🥡 Llevar</option>
                      <option value="BARRA">☕ Barra</option>
                    </select>

                    {/* Cancelar pedido */}
                    {sale.status !== 'CANCELLED' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelOrder(sale.id);
                        }}
                        className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded transition-colors"
                        title="Cancelar pedido"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}

                    {/* Imprimir ticket */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrintSaleTicket(sale);
                      }}
                      className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded transition-colors"
                      title="Imprimir ticket"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
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
                  <h2 className="text-xl font-bold">{displayFolio(selectedSale.folio)}</h2>
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-white" />
                  <h2 className="text-lg font-bold text-white">Pago Dividido</h2>
                </div>
                <button onClick={handleCancelSplitPayment} className="text-white hover:bg-white hover:bg-opacity-20 p-1.5 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="px-4 py-3 flex-1 overflow-y-auto">
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Total a pagar:</span>
                    <span className="text-xl font-bold text-gray-900">{fmt(displayTotals.total)}</span>
                  </div>
                  <div className="mt-1.5 flex justify-between items-center text-sm">
                    <span className="text-gray-600">Total dividido:</span>
                    <span className={`font-semibold ${
                      Math.abs(splitPayments.reduce((sum, p) => sum + p.amount, 0) - displayTotals.total) < 0.01
                        ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {fmt(splitPayments.reduce((sum, p) => sum + p.amount, 0))}
                    </span>
                  </div>
                  {Math.abs(splitPayments.reduce((sum, p) => sum + p.amount, 0) - displayTotals.total) > 0.01 && (
                    <div className="mt-1.5 text-xs text-red-600 font-semibold">
                      Diferencia: {fmt(Math.abs(splitPayments.reduce((sum, p) => sum + p.amount, 0) - displayTotals.total))}
                    </div>
                  )}
                </div>

                {/* Quick Split Presets */}
                <div className="mb-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">División rápida</span>
                  <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                    <button
                      onClick={() => {
                        const half = Math.round(displayTotals.total / 2 * 100) / 100;
                        const other = Math.round((displayTotals.total - half) * 100) / 100;
                        setSplitPayments([
                          { method: 'CASH', amount: half },
                          { method: 'CREDIT_CARD', amount: other }
                        ]);
                      }}
                      className="p-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-colors min-h-[40px]"
                    >
                      50% / 50%
                    </button>
                    <button
                      onClick={() => {
                        const third = Math.round(displayTotals.total / 3 * 100) / 100;
                        const rest = Math.round((displayTotals.total - third * 2) * 100) / 100;
                        setSplitPayments([
                          { method: 'CASH', amount: third },
                          { method: 'CREDIT_CARD', amount: third },
                          { method: 'DEBIT_CARD', amount: rest }
                        ]);
                      }}
                      className="p-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-colors min-h-[40px]"
                    >
                      3 partes iguales
                    </button>
                    <button
                      onClick={() => {
                        setSplitPayments([
                          { method: 'CASH', amount: displayTotals.total },
                          { method: 'CREDIT_CARD', amount: 0 }
                        ]);
                      }}
                      className="p-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-colors min-h-[40px]"
                    >
                      Personalizado
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  {splitPayments.map((payment, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-2.5">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-semibold text-gray-600">Pago {index + 1}</span>
                        {splitPayments.length > 1 && (
                          <button onClick={() => handleRemoveSplitPayment(index)} className="ml-auto text-red-500 hover:text-red-600 p-1">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={payment.method}
                          onChange={(e) => handleUpdateSplitPayment(index, 'method', e.target.value as PaymentMethod)}
                          className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[40px]"
                        >
                          <option value="CASH">💵 Efectivo</option>
                          <option value="CREDIT_CARD">💳 T. Crédito</option>
                          <option value="DEBIT_CARD">💳 T. Débito</option>
                          <option value="MEMBER_ACCOUNT">👤 Cta. Socio</option>
                        </select>
                        <input
                          type="number"
                          value={payment.amount}
                          onChange={(e) => handleUpdateSplitPayment(index, 'amount', Number(e.target.value) || 0)}
                          className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[40px]"
                          step="0.01"
                          min="0"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleAddSplitPayment}
                  className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-1.5 text-sm min-h-[40px]"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Método
                </button>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 bg-gray-50 border-t flex gap-2 flex-shrink-0">
                <button
                  onClick={handleCancelSplitPayment}
                  className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm min-h-[40px] flex items-center justify-center gap-1.5"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setSplitPayments([]);
                  }}
                  className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm min-h-[40px] flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reiniciar
                </button>
                <button
                  onClick={handleSaveSplitPayment}
                  disabled={Math.abs(splitPayments.reduce((sum, p) => sum + p.amount, 0) - displayTotals.total) > 0.01}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 text-sm min-h-[40px]"
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
      <header className="bg-white shadow-sm border-b border-gray-200 px-3 md:px-6 h-14 md:h-16 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-4">
          <Logo width={40} height={40} className="rounded-lg overflow-hidden" />
          <h1 className="font-bold text-gray-900 text-lg md:text-xl">
            {branding.companyName || 'YCC Country Club'}
          </h1>
          <div className="hidden md:block">
            <h1 className="text-base md:text-lg font-bold text-gray-900 leading-tight">YCC POS</h1>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500">{user}</p>
              {currentShift && (
                <span className="text-sm bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Turno activo
                </span>
              )}
              {cashOpen && (
                <span className="text-sm bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  Caja abierta
                </span>
              )}
            </div>
          </div>
          <div className="md:hidden">
            <h1 className="text-sm font-bold text-gray-900">POS</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          {/* Botón de Corte de Caja */}
          {cashOpen && currentCashSession && (
            <button 
              onClick={() => {
                if (window.confirm('¿Deseas realizar el corte de caja?')) {
                  setShowCashCutModal(true);
                }
              }}
              className="px-3 md:px-4 py-2 md:py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm md:text-base font-medium flex items-center gap-1.5 md:gap-2 transition-colors min-h-[44px]"
              title="Corte de Caja"
            >
              <Scissors className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden md:inline">Corte</span>
            </button>
          )}
          <button onClick={() => setScreen('history')} className="p-2.5 md:p-3 rounded-lg hover:bg-gray-100 text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center" title="Historial"><Receipt className="w-5 h-5 md:w-6 md:h-6" /></button>
          <button onClick={() => setShowPrinterConfig(true)} className="p-2.5 md:p-3 rounded-lg hover:bg-gray-100 text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center" title="Configurar Impresora"><Printer className="w-5 h-5 md:w-6 md:h-6" /></button>
          <button onClick={() => setScreen('cash-close')} className="p-2.5 md:p-3 rounded-lg hover:bg-gray-100 text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center" title="Cerrar Sesión"><LogOut className="w-5 h-5 md:w-6 md:h-6" /></button>
        </div>
      </header>

      {/* PESTAÑAS DE COMANDAS - Siempre visibles debajo del header */}
      <ComandasPanel
        onNewComanda={() => setShowNewComandaModal(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: PRODUCT CATALOG */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Search + Categories - Chips mejorados */}
          <div className="p-3 md:p-4 space-y-3 bg-white border-b shadow-sm z-10">
            {/* Búsqueda */}
            <div className="relative max-w-xl">
              <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                placeholder="Buscar productos, categorías..." 
                className="w-full pl-11 pr-11 py-3 bg-gray-100 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all" 
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>
            
            {/* Categorías tipo chips con scroll horizontal */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-3 px-3 md:-mx-4 md:px-4 scrollbar-hide">
              {categories.map(cat => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button 
                    key={cat.id} 
                    onClick={() => setSelectedCategory(cat.id)} 
                    className={`
                      px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap 
                      transition-all duration-150 min-h-[44px] flex-shrink-0
                      active:scale-95
                      ${isSelected 
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 ring-2 ring-emerald-600 ring-offset-2' 
                        : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/50'
                      }
                    `}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Products Grid - Optimizado para tablet con feedback táctil mejorado */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4">
            {!activeComanda ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ShoppingCart className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">No hay comanda activa</h3>
                <p className="text-gray-500 mb-4 max-w-xs">
                  Para agregar productos, primero debes crear o seleccionar una comanda
                </p>
                <button
                  onClick={() => setShowNewComandaModal(true)}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Nueva Comanda
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4">
                {filteredProducts.map(product => {
                // Buscar producto en la comanda activa (cada comanda tiene su carrito individual)
                const inCart = activeComanda 
                  ? activeComanda.items.find(i => i.productId === product.id)
                  : null;
                const canAddProduct = !!activeComandaId;
                return (
                  <motion.button 
                    key={product.id} 
                    whileTap={canAddProduct ? { scale: 0.92, y: 2 } : undefined}
                    whileHover={canAddProduct ? { y: -2 } : undefined}
                    onClick={() => handleProductClick(product)} 
                    disabled={!canAddProduct}
                    className={`
                      bg-white rounded-xl shadow-sm border-2 p-3 md:p-4 text-left 
                      transition-all duration-150 relative overflow-hidden
                      ${canAddProduct 
                        ? 'active:shadow-inner cursor-pointer' 
                        : 'opacity-50 cursor-not-allowed grayscale'
                      }
                      ${inCart && canAddProduct
                        ? 'border-emerald-300 shadow-md shadow-emerald-100' 
                        : canAddProduct 
                          ? 'border-gray-100 hover:border-emerald-200 hover:shadow-md'
                          : 'border-gray-200'
                      }
                    `}
                  >
                    {/* Badge de cantidad en carrito */}
                    {inCart && (
                      <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs font-black rounded-full w-6 h-6 flex items-center justify-center shadow-md animate-pulse">
                        {inCart.quantity}
                      </div>
                    )}

                    {/* Badge de variantes/modifiers */}
                    {product.hasVariants && (
                      <div className="absolute top-2 left-2 bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                        {product.variantLabel || 'Opciones'}
                      </div>
                    )}
                    {!product.hasVariants && product.modifierGroups && product.modifierGroups.length > 0 && (
                      <div className="absolute top-2 left-2 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                        Personalizable
                      </div>
                    )}

                    {/* Indicador de categoría */}
                    <div className="flex items-center gap-1 mb-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-[10px] uppercase tracking-wide text-gray-400 font-medium">
                        {product.categoryName}
                      </span>
                    </div>

                    {/* Nombre del producto */}
                    <h3 className="font-bold text-gray-900 text-sm md:text-base leading-snug mb-2 line-clamp-2 min-h-[2.5rem]">
                      {product.name}
                    </h3>

                    {/* Precio - destacado */}
                    {product.hasVariants ? (
                      <div className="flex items-baseline justify-between mt-auto">
                        <span className="text-sm md:text-base font-bold text-blue-600">
                          desde {fmt(Math.min(...(product.variants?.map(v => v.price) || [product.price])))}
                        </span>
                        <span className="text-xs text-blue-400">MXN</span>
                      </div>
                    ) : product.modifierGroups && product.modifierGroups.length > 0 ? (
                      <div className="flex items-baseline justify-between mt-auto">
                        <span className="text-lg md:text-xl font-black text-emerald-600">
                          {fmt(product.price)}
                        </span>
                        <span className="text-xs text-gray-400">MXN</span>
                      </div>
                    ) : (
                      <div className="flex items-baseline justify-between mt-auto">
                        <span className="text-lg md:text-xl font-black text-emerald-600">
                          {fmt(product.price)}
                        </span>
                        <span className="text-xs text-gray-400">MXN</span>
                      </div>
                    )}
                    
                    {/* Efecto de ripple al tocar */}
                    <div className="absolute inset-0 bg-emerald-500/0 active:bg-emerald-500/10 transition-colors pointer-events-none" />
                  </motion.button>
                );
              })}
              {filteredProducts.length === 0 && (
                <div className="col-span-full text-center py-8 lg:py-16 text-gray-400">
                  <Search className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 mx-auto mb-2 sm:mb-3 opacity-30" />
                  <p className="text-xs sm:text-sm lg:text-base">No se encontraron productos</p>
                </div>
              )}
            </div>
          )}
          </div>
        </div>

        {/* RIGHT: CART SIDEBAR - Optimizado para tablet con jerarquía visual mejorada */}
        <div className="w-full md:w-80 lg:w-96 xl:w-[420px] 2xl:w-[480px] bg-white border-l border-gray-200 flex flex-col flex-shrink-0 relative">
          {/* Cart header - Muestra el nombre de la comanda activa */}
          <div className="p-3 md:p-4 border-b flex items-center justify-between bg-white">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-sm md:text-base">
                  {activeComanda ? activeComanda.nombre : 'Selecciona comanda'}
                </h2>
                {activeComanda && displayItemCount > 0 && (
                  <span className="text-xs text-gray-500">{displayItemCount} {displayItemCount === 1 ? 'item' : 'items'}</span>
                )}
              </div>
            </div>
            {activeComanda && displayItems.length > 0 && (
              <button 
                onClick={() => {
                  if (confirm(`¿Vaciar la comanda "${activeComanda.nombre}"?`)) {
                    displayItems.forEach(i => removeItemFromComanda(activeComanda.id, i.productId));
                  }
                }} 
                className="text-xs md:text-sm text-gray-400 hover:text-red-500 font-medium px-2 py-1 min-h-[36px] transition-colors"
              >
                Vaciar
              </button>
            )}
          </div>

          {/* Cart items - Solo muestra items de la comanda activa seleccionada */}
          {/* Key prop fuerza re-render cuando cambia la comanda activa o después de venta, evitando datos stale */}
          <div 
            key={`${activeComandaId || 'no-comanda'}-${cartKey}`} 
            className="flex-1 overflow-y-auto"
          >
            {!activeComanda ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4 md:p-6">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-full flex items-center justify-center mb-3 md:mb-4">
                  <ShoppingCart className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />
                </div>
                <p className="text-sm md:text-base text-gray-500 font-medium">
                  Selecciona una comanda
                </p>
                <p className="text-xs text-gray-400 mt-1">Toca una pestaña arriba</p>
              </div>
            ) : displayItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4 md:p-6">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-full flex items-center justify-center mb-3 md:mb-4">
                  <ShoppingCart className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />
                </div>
                <p className="text-sm md:text-base text-gray-500 font-medium">
                  {activeComanda.nombre}
                </p>
                <p className="text-xs text-gray-400 mt-1">Agrega productos a esta comanda</p>
              </div>
            ) : (
              <AnimatePresence>
                {displayItems.map(item => (
                  <motion.div 
                    key={item.productId} 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: 10 }}
                    className="p-3 md:p-4 border-b border-gray-100 hover:bg-gray-50/80 transition-colors"
                  >
                    {/* Nombre y eliminar */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0 pr-2">
                        <h4 className="font-semibold text-gray-900 text-sm md:text-base leading-tight">{item.name}</h4>
                        <p className="text-xs text-gray-400 mt-0.5">{fmt(item.unitPrice)} c/u</p>
                        {/* Modifiers */}
                        {item.modifiers && item.modifiers.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.modifiers.map((m, i) => (
                              <span key={i} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">
                                {m.modifierName}{m.priceAdd > 0 ? ` +${fmt(m.priceAdd)}` : ''}
                              </span>
                            ))}
                          </div>
                        )}
                        {/* Notes */}
                        {item.notes && (
                          <p className="text-[10px] text-amber-600 mt-1 italic">📝 {item.notes}</p>
                        )}
                      </div>
                      <button 
                        onClick={() => activeComanda 
                          ? removeItemFromComanda(activeComanda.id, item.productId) 
                          : null
                        } 
                        disabled={!activeComanda}
                        className={`p-2 rounded-lg transition-all min-h-[36px] min-w-[36px] flex items-center justify-center
                          ${activeComanda 
                            ? 'text-gray-300 hover:text-red-500 hover:bg-red-50 active:scale-90' 
                            : 'text-gray-200 cursor-not-allowed'
                          }
                        `}
                        title="Eliminar item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Cantidad y total - más espaciado */}
                    <div className="flex items-center justify-between">
                      <div className={`flex items-center gap-1 rounded-lg p-1 ${activeComanda ? 'bg-gray-100' : 'bg-gray-50'}`}>
                        <button 
                          onClick={() => activeComanda 
                            ? updateComandaItemQuantity(activeComanda.id, item.productId, item.quantity - 1) 
                            : null
                          } 
                          disabled={!activeComanda}
                          className={`w-8 h-8 md:w-9 md:h-9 rounded-md flex items-center justify-center transition-all
                            ${activeComanda 
                              ? 'bg-white shadow-sm hover:shadow active:scale-90 active:bg-gray-50' 
                              : 'bg-gray-100 cursor-not-allowed'
                            }
                          `}
                        >
                          <Minus className={`w-4 h-4 ${activeComanda ? 'text-gray-600' : 'text-gray-300'}`} />
                        </button>
                        <span className={`w-10 text-center text-sm md:text-base font-bold ${activeComanda ? 'text-gray-900' : 'text-gray-400'}`}>
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => activeComanda 
                            ? updateComandaItemQuantity(activeComanda.id, item.productId, item.quantity + 1) 
                            : null
                          } 
                          disabled={!activeComanda}
                          className={`w-8 h-8 md:w-9 md:h-9 rounded-md flex items-center justify-center transition-all
                            ${activeComanda 
                              ? 'bg-white shadow-sm hover:shadow active:scale-90 active:bg-emerald-50' 
                              : 'bg-gray-100 cursor-not-allowed'
                            }
                          `}
                        >
                          <Plus className={`w-4 h-4 ${activeComanda ? 'text-emerald-600' : 'text-gray-300'}`} />
                        </button>
                      </div>
                      <span className="font-bold text-gray-900 text-base md:text-lg">{fmt(item.totalPrice)}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Cart totals + pay - STICKY y con jerarquía visual máxima */}
          {displayItems.length > 0 && (
            <div className="border-t border-gray-200 bg-gradient-to-b from-gray-50 to-white p-3 md:p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
              {/* Desglose */}
              <div className="space-y-1.5 mb-3 pb-3 border-b border-gray-200/60">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-medium">{fmt(displayTotals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>IVA 16% incluido</span>
                  <span className="font-medium">{fmt(displayTotals.taxAmount)}</span>
                </div>
              </div>
              
              {/* Total destacado */}
              <div className="flex justify-between items-baseline mb-4">
                <span className="text-lg md:text-xl font-bold text-gray-900">TOTAL</span>
                <span className="text-2xl md:text-3xl font-black text-emerald-600 tracking-tight">
                  {fmt(displayTotals.total)}
                </span>
              </div>
              
              {/* Botón Cobrar - MÁXIMO DESTAQUE */}
              <button 
                onClick={() => {
                  if (!activeComandaId) {
                    toast.error('⚠️ Primero debes abrir una comanda para cobrar', { 
                      duration: 3000,
                      icon: '🍽️'
                    });
                    return;
                  }
                  if (posMode === 'COUNTER') {
                    setScreen('payment');
                  } else if (posMode === 'TABLE') {
                    setShowTableMode(true);
                  } else if (posMode === 'DELIVERY') {
                    setShowDeliveryMode(true);
                  }
                }}
                disabled={!activeComandaId}
                className={`
                  w-full py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-lg md:text-xl 
                  transition-all duration-150 
                  active:scale-[0.96] active:shadow-inner
                  flex items-center justify-center gap-3 min-h-[64px] md:min-h-[72px]
                  shadow-lg
                  ${!activeComandaId 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' 
                    : posMode === 'COUNTER' 
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white hover:shadow-xl hover:-translate-y-0.5 shadow-emerald-600/30' 
                      : posMode === 'TABLE' 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:shadow-xl hover:-translate-y-0.5 shadow-blue-600/30'
                        : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white hover:shadow-xl hover:-translate-y-0.5 shadow-purple-600/30'
                  }
                `}
              >
                <CreditCard className="w-6 h-6 md:w-7 md:h-7" /> 
                <span>COBRAR AHORA</span>
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

              if (activeComanda) { closeComanda(activeComanda.id); }
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

              if (activeComanda) { closeComanda(activeComanda.id); }
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

      {/* Product Customization Modal (Variants + Modifiers) */}
      {variantPickerProduct && (
        <ProductCustomizationModal
          product={variantPickerProduct}
          onClose={() => setVariantPickerProduct(null)}
          onAdd={handleAddItem}
          fmt={fmt}
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
