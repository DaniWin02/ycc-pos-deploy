import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Customer, CustomerSearchFilters } from '../types/customer.types';

interface CustomerSearchProps {
  onCustomerSelect: (customer: Customer) => void;
  onClear?: () => void;
  className?: string;
  disabled?: boolean;
}

// Componente de búsqueda de clientes/socios
export const CustomerSearch: React.FC<CustomerSearchProps> = ({ 
  onCustomerSelect, 
  onClear, 
  className = '',
  disabled = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async (term: string) => {
    if (term.length < 2) {
      setCustomers([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setSearchTerm(term);
    setSelectedIndex(-1);

    try {
      // Aquí iría a la API Gateway
      const response = await fetch(`/api/customers/search?q=${encodeURIComponent(term)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const result = await response.json();
      
      if (result.success) {
        setCustomers(result.data.customers);
        setShowResults(true);
      } else {
        setCustomers([]);
        setShowResults(false);
      }
    } catch (error) {
      console.error('❌ Error en búsqueda:', error);
      setCustomers([]);
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSearchTerm(`${customer.firstName} ${customer.lastName}`);
    setShowResults(false);
    setSelectedIndex(-1);
    onCustomerSelect(customer);
    
    // Enfocar el input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setCustomers([]);
    setShowResults(false);
    setSelectedIndex(-1);
    onClear?.();
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < customers.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : customers.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && customers[selectedIndex]) {
          handleCustomerSelect(customers[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        handleClear();
        break;
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length >= 2) {
        handleSearch(searchTerm);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar cliente o número de socio..."
          className={`
            w-full px-4 py-3 pr-10 bg-white border border-gray-300 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            text-gray-900 placeholder-gray-500
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
          `}
          disabled={disabled}
        />
        
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-r-2 border-blue-600"></div>
          </div>
        )}
        
        {searchTerm && !isSearching && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      <AnimatePresence>
        {showResults && customers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto"
          >
            <div className="p-4">
              <div className="text-sm text-gray-600 mb-3">
                {customers.length} cliente{customers.length === 1 ? '' : 's'} encontrado{customers.length === 1 ? '' : 's'}
              </div>
              
              {customers.map((customer, index) => (
                <motion.div
                  key={customer.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    transition: { type: 'spring', stiffness: 300, damping: 30 }
                  }}
                  className={`
                    p-3 cursor-pointer hover:bg-blue-50 transition-colors duration-200
                    ${index === selectedIndex ? 'bg-blue-100 border-blue-500' : 'border-gray-200'}
                    ${index === 0 ? 'border-t-0' : 'border-t'}
                  `}
                  onClick={() => handleCustomerSelect(customer)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {customer.firstName} {customer.lastName}
                      </div>
                      {customer.memberNumber && (
                        <div className="text-sm text-gray-600">
                          Socio: #{customer.memberNumber}
                        </div>
                      )}
                      {customer.email && (
                        <div className="text-sm text-gray-600">
                          {customer.email}
                        </div>
                      )}
                      {customer.phone && (
                        <div className="text-sm text-gray-600">
                          {customer.phone}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        customer.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {customer.isActive ? 'Activo' : 'Inactivo'}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
