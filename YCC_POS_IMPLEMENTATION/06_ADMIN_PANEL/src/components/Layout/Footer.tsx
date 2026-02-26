import React from 'react';

interface FooterProps {
  className?: string;
}

// Componente de footer del Admin Panel
export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`
      bg-white border-t border-gray-200 py-4 px-6
      ${className}
    `}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            © {currentYear} Country Club POS. Todos los derechos reservados.
          </div>
          
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <a href="#" className="hover:text-gray-900 transition-colors duration-200">
              Ayuda
            </a>
            <a href="#" className="hover:text-gray-900 transition-colors duration-200">
              Documentación
            </a>
            <a href="#" className="hover:text-gray-900 transition-colors duration-200">
              Soporte
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
