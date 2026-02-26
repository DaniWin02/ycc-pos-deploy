import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Package, CreditCard, DollarSign, Users, LogOut,
  Plus, Minus, Trash2, Search, X, Check, Banknote, ArrowLeft,
  Lock, ChevronRight, Receipt, Clock, TrendingUp, AlertCircle
} from 'lucide-react';
import { useCartStore } from './stores/cart.store';
import { Product, PaymentMethod, SaleRecord } from './types';

// ===================== MOCK DATA =====================
const CATEGORIES = [
  { id: 'all', name: 'Todos' },
  { id: 'bebidas', name: 'Bebidas' },
  { id: 'comidas', name: 'Comidas' },
  { id: 'postres', name: 'Postres' },
  { id: 'snacks', name: 'Snacks' },
];

const MOCK_PRODUCTS: Product[] = [
  { id: '1', sku: 'BEB-001', name: 'Coca Cola 600ml', categoryId: 'bebidas', categoryName: 'Bebidas', price: 35, taxRate: 0.16, currentStock: 100, isActive: true },
  { id: '2', sku: 'BEB-002', name: 'Agua Natural 600ml', categoryId: 'bebidas', categoryName: 'Bebidas', price: 20, taxRate: 0.16, currentStock: 150, isActive: true },
  { id: '3', sku: 'BEB-003', name: 'Jugo de Naranja', categoryId: 'bebidas', categoryName: 'Bebidas', price: 45, taxRate: 0.16, currentStock: 60, isActive: true },
  { id: '4', sku: 'BEB-004', name: 'Limonada Natural', categoryId: 'bebidas', categoryName: 'Bebidas', price: 40, taxRate: 0.16, currentStock: 40, isActive: true },
  { id: '5', sku: 'BEB-005', name: 'Cerveza Artesanal', categoryId: 'bebidas', categoryName: 'Bebidas', price: 85, taxRate: 0.16, currentStock: 30, isActive: true },
  { id: '6', sku: 'COM-001', name: 'Hamburguesa Clasica', categoryId: 'comidas', categoryName: 'Comidas', price: 145, taxRate: 0.16, currentStock: 50, isActive: true },
  { id: '7', sku: 'COM-002', name: 'Club Sandwich', categoryId: 'comidas', categoryName: 'Comidas', price: 125, taxRate: 0.16, currentStock: 40, isActive: true },
  { id: '8', sku: 'COM-003', name: 'Ensalada Cesar', categoryId: 'comidas', categoryName: 'Comidas', price: 110, taxRate: 0.16, currentStock: 35, isActive: true },
  { id: '9', sku: 'COM-004', name: 'Tacos de Arrachera (3)', categoryId: 'comidas', categoryName: 'Comidas', price: 165, taxRate: 0.16, currentStock: 25, isActive: true },
  { id: '10', sku: 'COM-005', name: 'Pizza Margarita', categoryId: 'comidas', categoryName: 'Comidas', price: 195, taxRate: 0.16, currentStock: 20, isActive: true },
  { id: '11', sku: 'COM-006', name: 'Alitas BBQ (12pz)', categoryId: 'comidas', categoryName: 'Comidas', price: 175, taxRate: 0.16, currentStock: 30, isActive: true },
  { id: '12', sku: 'POS-001', name: 'Pastel de Chocolate', categoryId: 'postres', categoryName: 'Postres', price: 75, taxRate: 0.16, currentStock: 15, isActive: true },
  { id: '13', sku: 'POS-002', name: 'Flan Napolitano', categoryId: 'postres', categoryName: 'Postres', price: 55, taxRate: 0.16, currentStock: 20, isActive: true },
  { id: '14', sku: 'POS-003', name: 'Helado (3 bolas)', categoryId: 'postres', categoryName: 'Postres', price: 65, taxRate: 0.16, currentStock: 25, isActive: true },
  { id: '15', sku: 'SNK-001', name: 'Papas Fritas', categoryId: 'snacks', categoryName: 'Snacks', price: 55, taxRate: 0.16, currentStock: 45, isActive: true },
  { id: '16', sku: 'SNK-002', name: 'Nachos con Queso', categoryId: 'snacks', categoryName: 'Snacks', price: 85, taxRate: 0.16, currentStock: 35, isActive: true },
  { id: '17', sku: 'SNK-003', name: 'Guacamole con Totopos', categoryId: 'snacks', categoryName: 'Snacks', price: 95, taxRate: 0.16, currentStock: 20, isActive: true },
  { id: '18', sku: 'COM-007', name: 'Filete de Salmon', categoryId: 'comidas', categoryName: 'Comidas', price: 285, taxRate: 0.16, currentStock: 10, isActive: true },
];

const fmt = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);

// ===================== SCREENS =====================
type Screen = 'login' | 'pos' | 'payment' | 'complete' | 'cash-open' | 'cash-close' | 'history';

// ===================== APP =====================
export const App: React.FC = () => {
  // Auth
  const [screen, setScreen] = useState<Screen>('login');
  const [user, setUser] = useState('');
  const [pin, setPin] = useState('');
  const [cashOpen, setCashOpen] = useState(false);
  const [openingFloat, setOpeningFloat] = useState('');

  // POS
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Cart store
  const { items, addItem, removeItem, updateQuantity, clearCart, getTotals, getItemCount } = useCartStore();

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [cashReceived, setCashReceived] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Sales history
  const [salesHistory, setSalesHistory] = useState<SaleRecord[]>([]);
  const [lastSale, setLastSale] = useState<SaleRecord | null>(null);

  const totals = getTotals();
  const itemCount = getItemCount();

  // Filter products
  const filteredProducts = MOCK_PRODUCTS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // =============== LOGIN ===============
  const handleLogin = () => {
    if (pin.length === 4) {
      setUser(pin === '1234' ? 'Cajero 1' : pin === '0000' ? 'Supervisor' : 'Cajero');
      setScreen('cash-open');
    }
  };

  // =============== CASH OPEN ===============
  const handleOpenCash = () => {
    const amount = parseFloat(openingFloat) || 0;
    if (amount > 0) {
      setCashOpen(true);
      setScreen('pos');
    }
  };

  // =============== PAYMENT ===============
  const handlePay = async () => {
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 1500));
    const received = paymentMethod === 'CASH' ? parseFloat(cashReceived) || totals.total : totals.total;
    const sale: SaleRecord = {
      id: `sale_${Date.now()}`,
      folio: `V-${String(salesHistory.length + 1).padStart(4, '0')}`,
      items: [...items],
      subtotal: totals.subtotal,
      taxAmount: totals.taxAmount,
      discountAmount: totals.discountAmount,
      total: totals.total,
      paymentMethod,
      amountPaid: received,
      changeAmount: Math.max(0, received - totals.total),
      createdAt: new Date(),
      status: 'COMPLETED',
    };
    setSalesHistory(prev => [sale, ...prev]);
    setLastSale(sale);
    clearCart();
    setCashReceived('');
    setIsProcessing(false);
    setScreen('complete');
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
          <p className="text-center text-xs text-gray-400 mt-4">PIN de prueba: 1234</p>
        </motion.div>
      </div>
    );
  }

  // --- CASH OPEN ---
  if (screen === 'cash-open') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-600 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Banknote className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Apertura de Caja</h2>
            <p className="text-gray-500 text-sm">Hola, {user}</p>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Fondo de caja inicial ($MXN)</label>
            <input type="number" value={openingFloat} onChange={e => setOpeningFloat(e.target.value)} placeholder="0.00" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-2xl text-center font-bold focus:border-emerald-500 focus:outline-none" autoFocus />
          </div>
          <button onClick={handleOpenCash} disabled={!openingFloat || parseFloat(openingFloat) <= 0} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-40 transition-all">
            Abrir Caja
          </button>
        </motion.div>
      </div>
    );
  }

  // --- SALE COMPLETE ---
  if (screen === 'complete' && lastSale) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }} className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-emerald-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Venta Completada</h2>
          <p className="text-gray-500 mb-6">Folio: {lastSale.folio}</p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="font-medium">{fmt(lastSale.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">IVA (16%)</span><span className="font-medium">{fmt(lastSale.taxAmount)}</span></div>
            <div className="flex justify-between text-lg font-bold border-t pt-2"><span>Total</span><span className="text-emerald-600">{fmt(lastSale.total)}</span></div>
            {lastSale.paymentMethod === 'CASH' && (
              <>
                <div className="flex justify-between"><span className="text-gray-600">Recibido</span><span>{fmt(lastSale.amountPaid)}</span></div>
                <div className="flex justify-between text-amber-600 font-semibold"><span>Cambio</span><span>{fmt(lastSale.changeAmount)}</span></div>
              </>
            )}
            <div className="flex justify-between text-sm"><span className="text-gray-500">Metodo</span><span className="capitalize">{lastSale.paymentMethod === 'CASH' ? 'Efectivo' : lastSale.paymentMethod === 'CREDIT_CARD' ? 'Tarjeta Credito' : lastSale.paymentMethod === 'DEBIT_CARD' ? 'Tarjeta Debito' : 'Cuenta Socio'}</span></div>
          </div>
          <button onClick={() => setScreen('pos')} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all">
            Nueva Venta
          </button>
        </motion.div>
      </div>
    );
  }

  // --- PAYMENT ---
  if (screen === 'payment') {
    const cashAmount = parseFloat(cashReceived) || 0;
    const change = Math.max(0, cashAmount - totals.total);
    const canPay = paymentMethod === 'CASH' ? cashAmount >= totals.total : true;
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <button onClick={() => setScreen('pos')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900"><ArrowLeft className="w-5 h-5" /> Volver</button>
          <h1 className="text-xl font-bold text-gray-900">Cobrar</h1>
          <div className="text-2xl font-bold text-emerald-600">{fmt(totals.total)}</div>
        </header>
        <div className="max-w-2xl mx-auto p-6 space-y-6">
          {/* Payment methods */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Metodo de Pago</h3>
            <div className="grid grid-cols-2 gap-3">
              {([['CASH', 'Efectivo', Banknote], ['CREDIT_CARD', 'Tarjeta Credito', CreditCard], ['DEBIT_CARD', 'Tarjeta Debito', CreditCard], ['MEMBER_ACCOUNT', 'Cuenta Socio', Users]] as [PaymentMethod, string, any][]).map(([method, label, Icon]) => (
                <button key={method} onClick={() => setPaymentMethod(method)} className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${paymentMethod === method ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <Icon className={`w-6 h-6 ${paymentMethod === method ? 'text-emerald-600' : 'text-gray-400'}`} />
                  <span className={`font-medium ${paymentMethod === method ? 'text-emerald-700' : 'text-gray-600'}`}>{label}</span>
                </button>
              ))}
            </div>
          </div>
          {/* Cash input */}
          {paymentMethod === 'CASH' && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Efectivo Recibido</h3>
              <input type="number" value={cashReceived} onChange={e => setCashReceived(e.target.value)} placeholder="0.00" className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-3xl text-center font-bold focus:border-emerald-500 focus:outline-none" autoFocus />
              <div className="grid grid-cols-4 gap-2 mt-4">
                {[50, 100, 200, 500, 1000].map(n => (
                  <button key={n} onClick={() => setCashReceived(String(n))} className="py-2 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-all">{fmt(n)}</button>
                ))}
                <button onClick={() => setCashReceived(String(Math.ceil(totals.total / 10) * 10))} className="py-2 bg-emerald-100 text-emerald-700 rounded-lg font-medium hover:bg-emerald-200">Exacto</button>
              </div>
              {cashAmount > 0 && (
                <div className={`mt-4 p-4 rounded-xl text-center text-xl font-bold ${change >= 0 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'}`}>
                  Cambio: {fmt(change)}
                </div>
              )}
            </div>
          )}
          {/* Order summary */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Resumen</h3>
            <div className="space-y-2 text-sm">
              {items.map(item => (
                <div key={item.productId} className="flex justify-between"><span className="text-gray-600">{item.quantity}x {item.name}</span><span>{fmt(item.totalPrice)}</span></div>
              ))}
              <div className="border-t pt-2 flex justify-between"><span>Subtotal</span><span>{fmt(totals.subtotal)}</span></div>
              <div className="flex justify-between"><span>IVA (16%)</span><span>{fmt(totals.taxAmount)}</span></div>
              <div className="flex justify-between text-lg font-bold border-t pt-2"><span>Total</span><span className="text-emerald-600">{fmt(totals.total)}</span></div>
            </div>
          </div>
          <button onClick={handlePay} disabled={!canPay || isProcessing} className="w-full py-4 bg-emerald-600 text-white rounded-xl text-lg font-bold hover:bg-emerald-700 disabled:opacity-40 transition-all flex items-center justify-center gap-2">
            {isProcessing ? <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> Procesando...</> : <><Check className="w-5 h-5" /> Confirmar Pago</>}
          </button>
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
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <button onClick={() => setScreen('pos')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900"><ArrowLeft className="w-5 h-5" /> Volver</button>
          <h1 className="text-xl font-bold text-gray-900">Cierre de Caja</h1>
          <div />
        </header>
        <div className="max-w-lg mx-auto p-6 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 text-lg">Resumen del Turno</h3>
            <div className="space-y-3">
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg"><span className="text-gray-600">Cajero</span><span className="font-medium">{user}</span></div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg"><span className="text-gray-600">Fondo Inicial</span><span className="font-medium">{fmt(parseFloat(openingFloat) || 0)}</span></div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg"><span className="text-gray-600">Ventas Totales</span><span className="font-bold text-emerald-600">{fmt(totalSales)}</span></div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg"><span className="text-gray-600">Total Efectivo</span><span className="font-medium">{fmt(totalCash)}</span></div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg"><span className="text-gray-600">Total Tarjetas</span><span className="font-medium">{fmt(totalCard)}</span></div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg"><span className="text-gray-600">Transacciones</span><span className="font-medium">{salesHistory.length}</span></div>
              <div className="flex justify-between p-3 bg-amber-50 rounded-lg border border-amber-200"><span className="text-amber-700 font-medium">Efectivo Esperado en Caja</span><span className="font-bold text-amber-700">{fmt(expectedCash)}</span></div>
            </div>
          </div>
          <button onClick={handleCloseCash} className="w-full py-4 bg-red-600 text-white rounded-xl text-lg font-bold hover:bg-red-700 transition-all">
            Cerrar Caja y Salir
          </button>
        </div>
      </div>
    );
  }

  // --- SALES HISTORY ---
  if (screen === 'history') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <button onClick={() => setScreen('pos')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900"><ArrowLeft className="w-5 h-5" /> Volver</button>
          <h1 className="text-xl font-bold text-gray-900">Historial de Ventas</h1>
          <div className="text-sm text-gray-500">{salesHistory.length} ventas</div>
        </header>
        <div className="max-w-3xl mx-auto p-6">
          {salesHistory.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Receipt className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No hay ventas registradas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {salesHistory.map(sale => (
                <div key={sale.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{sale.folio}</div>
                    <div className="text-sm text-gray-500">{sale.items.length} articulos - {sale.createdAt.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-600">{fmt(sale.total)}</div>
                    <div className="text-xs text-gray-400 capitalize">{sale.paymentMethod === 'CASH' ? 'Efectivo' : 'Tarjeta'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===================== MAIN POS SCREEN =====================
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* HEADER */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 h-16 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">YCC POS</h1>
            <p className="text-xs text-gray-500">Country Club - {user}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setScreen('history')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600" title="Historial"><Receipt className="w-5 h-5" /></button>
          <button onClick={() => setScreen('cash-close')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600" title="Cerrar Caja"><LogOut className="w-5 h-5" /></button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: PRODUCT CATALOG */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search + Categories */}
          <div className="p-4 space-y-3 bg-white border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar producto o SKU..." className="w-full pl-10 pr-10 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white" />
              {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-gray-400" /></button>}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat.id ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{cat.name}</button>
              ))}
            </div>
          </div>
          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredProducts.map(product => {
                const inCart = items.find(i => i.productId === product.id);
                return (
                  <motion.button key={product.id} whileTap={{ scale: 0.95 }} onClick={() => addItem(product)} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-left hover:shadow-md hover:border-emerald-200 transition-all relative group">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-mono text-gray-400">{product.sku}</span>
                      {inCart && <span className="bg-emerald-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">{inCart.quantity}</span>}
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-2">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-emerald-600">{fmt(product.price)}</span>
                      <span className="text-xs text-gray-400">{product.categoryName}</span>
                    </div>
                    <div className="absolute inset-0 rounded-xl bg-emerald-600 opacity-0 group-active:opacity-10 transition-opacity" />
                  </motion.button>
                );
              })}
            </div>
            {filteredProducts.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No se encontraron productos</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: CART SIDEBAR */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
          {/* Cart header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-gray-900">Carrito</h2>
              {itemCount > 0 && <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">{itemCount}</span>}
            </div>
            {items.length > 0 && <button onClick={clearCart} className="text-xs text-red-500 hover:text-red-700 font-medium">Limpiar</button>}
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                <ShoppingCart className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-sm">Agrega productos al carrito</p>
              </div>
            ) : (
              <AnimatePresence>
                {items.map(item => (
                  <motion.div key={item.productId} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-3 border-b border-gray-100 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm truncate">{item.name}</h4>
                        <p className="text-xs text-gray-400">{fmt(item.unitPrice)} c/u</p>
                      </div>
                      <button onClick={() => removeItem(item.productId)} className="p-1 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"><Minus className="w-3 h-3" /></button>
                        <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-7 h-7 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 flex items-center justify-center transition-colors"><Plus className="w-3 h-3" /></button>
                      </div>
                      <span className="font-bold text-gray-900 text-sm">{fmt(item.totalPrice)}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Cart totals + pay */}
          {items.length > 0 && (
            <div className="border-t bg-gray-50 p-4 space-y-3">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{fmt(totals.subtotal)}</span></div>
                <div className="flex justify-between text-gray-600"><span>IVA (16%)</span><span>{fmt(totals.taxAmount)}</span></div>
              </div>
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-emerald-600">{fmt(totals.total)}</span>
              </div>
              <button onClick={() => setScreen('payment')} className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                <CreditCard className="w-5 h-5" /> Cobrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
