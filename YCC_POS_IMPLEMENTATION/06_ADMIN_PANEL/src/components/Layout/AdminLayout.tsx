import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';

interface AdminLayoutProps {
  children: React.ReactNode;
  className?: string;
}

// Componente principal de layout del Admin Panel
export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  className = ''
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: sidebarOpen ? 0 : -300 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`
              fixed lg:relative lg:translate-x-0 z-30
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
              lg:block w-64 h-screen bg-white shadow-lg
              border-r border-gray-200
            `}
          >
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </motion.div>
        </AnimatePresence>

        {/* Overlay para móvil */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <Header onMenuClick={toggleSidebar} sidebarOpen={sidebarOpen} />

          {/* Page Content */}
          <main className="flex-1 p-6 overflow-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="max-w-7xl mx-auto"
            >
              {children}
            </motion.div>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  );
};
