import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, User, Settings, LogOut } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
  className?: string;
}

// Componente de header del Admin Panel
export const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  sidebarOpen,
  className = ''
}) => {
  return (
    <header className={`
      bg-white border-b border-gray-200 shadow-sm
      ${className}
    `}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Menu button and search */}
          <div className="flex items-center gap-4">
            {/* Menu button for mobile */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="w-6 h-6 flex flex-col justify-center gap-1">
                <div className={`w-6 h-0.5 bg-gray-600 transition-all duration-300 ${sidebarOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
                <div className={`w-6 h-0.5 bg-gray-600 transition-all duration-300 ${sidebarOpen ? 'opacity-0' : ''}`}></div>
                <div className={`w-6 h-0.5 bg-gray-600 transition-all duration-300 ${sidebarOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
              </div>
            </button>

            {/* Search bar */}
            <div className="hidden md:flex items-center bg-gray-50 rounded-lg px-4 py-2 w-80">
              <Search className="w-5 h-5 text-gray-400 mr-3" />
              <input
                type="text"
                placeholder="Buscar usuarios, productos, órdenes..."
                className="bg-transparent outline-none text-gray-700 placeholder-gray-400 flex-1 text-sm"
              />
            </div>
          </div>

          {/* Right side - Notifications and user */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <motion.button
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {/* Notification badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
              >
                3
              </motion.div>
            </motion.button>

            {/* User menu */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium text-gray-900">Admin User</div>
                <div className="text-xs text-gray-500">Administrador</div>
              </div>
              
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
