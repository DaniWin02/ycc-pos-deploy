import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, UserPlus, Phone, CreditCard, Award, Building2, User, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCustomerStore, Customer, CustomerType } from '../stores/customer.store';
import { QuickCustomerModal } from './QuickCustomerModal';

const TYPE_CONFIG: Record<CustomerType, { label: string; color: string; icon: any; bg: string }> = {
  SOCIO: { label: 'Socio', color: 'text-purple-700', icon: Award, bg: 'bg-purple-50' },
  CLIENTE: { label: 'Cliente', color: 'text-blue-700', icon: User, bg: 'bg-blue-50' },
  INVITADO: { label: 'Invitado', color: 'text-gray-700', icon: UserCheck, bg: 'bg-gray-50' },
  CORPORATIVO: { label: 'Corporativo', color: 'text-amber-700', icon: Building2, bg: 'bg-amber-50' },
};

const fmt = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);

interface CustomerSelectorProps {
  onCustomerSelect?: (customer: Customer | null) => void;
  selectedCustomer?: Customer | null;
}

export const CustomerSelector: React.FC<CustomerSelectorProps> = ({ 
  onCustomerSelect,
  selectedCustomer: externalSelected 
}) => {
  const { 
    searchCustomers, 
    selectCustomer, 
    searchResults, 
    isSearching, 
    searchQuery, 
    setSearchQuery,
    selectedCustomer: storeSelected 
  } = useCustomerStore();

  const [showQuickModal, setShowQuickModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use external or store selected customer
  const selected = externalSelected || storeSelected;

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchCustomers(searchQuery);
        setShowDropdown(true);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchCustomers]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = useCallback((customer: Customer) => {
    selectCustomer(customer);
    setSearchQuery('');
    setShowDropdown(false);
    onCustomerSelect?.(customer);
  }, [selectCustomer, setSearchQuery, onCustomerSelect]);

  const handleClear = useCallback(() => {
    selectCustomer(null);
    setSearchQuery('');
    setShowDropdown(false);
    onCustomerSelect?.(null);
  }, [selectCustomer, onCustomerSelect]);

  const TypeBadge = ({ type }: { type: CustomerType }) => {
    const config = TYPE_CONFIG[type];
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  // Customer selected - show info card
  if (selected) {
    return (
      <>
        <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
              {selected.firstName[0]}{selected.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 truncate">{selected.fullName}</span>
                <TypeBadge type={selected.type} />
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                {selected.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {selected.phone}
                  </span>
                )}
                {selected.memberNumber && (
                  <span className="text-purple-600 font-medium">#{selected.memberNumber}</span>
                )}
              </div>
            </div>
            <button 
              onClick={handleClear}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {selected.type === 'SOCIO' && (
            <div className="flex gap-3 mt-2 pt-2 border-t border-gray-100 text-xs">
              <div className="flex items-center gap-1 text-gray-600">
                <CreditCard className="w-3 h-3" />
                <span>Saldo: <span className="font-medium text-emerald-600">{fmt(selected.balance)}</span></span>
              </div>
              {selected.creditLimit > 0 && (
                <div className="flex items-center gap-1 text-gray-600">
                  <span>Crédito: <span className="font-medium text-blue-600">{fmt(selected.creditLimit)}</span></span>
                </div>
              )}
            </div>
          )}
        </div>

        <QuickCustomerModal 
          isOpen={showQuickModal} 
          onClose={() => setShowQuickModal(false)} 
        />
      </>
    );
  }

  // No customer selected - show search
  return (
    <>
      <div ref={containerRef} className="relative">
        <div className="bg-white rounded-lg shadow-sm p-2.5 md:p-3 border border-gray-200">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!e.target.value.trim()) setShowDropdown(false);
              }}
              onFocus={() => searchQuery.trim() && setShowDropdown(true)}
              placeholder="Buscar cliente por nombre, teléfono o #socio..."
              className="flex-1 px-2 py-1.5 border-none text-sm focus:outline-none focus:ring-0 min-h-[40px]"
            />
            {searchQuery && (
              <button 
                onClick={() => { setSearchQuery(''); inputRef.current?.focus(); }}
                className="p-1 hover:bg-gray-100 rounded text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* New customer button */}
          <button
            onClick={() => setShowQuickModal(true)}
            className="mt-2 w-full py-2 px-3 rounded-lg border-2 border-dashed border-emerald-300 text-emerald-600 hover:bg-emerald-50 text-sm font-medium transition-all flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Nuevo Cliente
          </button>
        </div>

        {/* Search results dropdown */}
        <AnimatePresence>
          {showDropdown && (searchResults.length > 0 || isSearching) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-64 overflow-y-auto z-50"
            >
              {isSearching ? (
                <div className="p-4 text-center text-gray-400 text-sm">Buscando...</div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-sm">
                  No se encontraron clientes
                </div>
              ) : (
                <div className="py-1">
                  {searchResults.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => handleSelect(customer)}
                      className="w-full px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 text-left transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium text-xs">
                        {customer.firstName[0]}{customer.lastName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 truncate">{customer.fullName}</span>
                          <TypeBadge type={customer.type} />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {customer.phone && <span>{customer.phone}</span>}
                          {customer.memberNumber && (
                            <span className="text-purple-600">#{customer.memberNumber}</span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <QuickCustomerModal 
        isOpen={showQuickModal} 
        onClose={() => setShowQuickModal(false)} 
      />
    </>
  );
};
