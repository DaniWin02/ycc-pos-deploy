import React from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface KdsPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  itemsPerPage?: number
  totalItems?: number
}

export function KdsPagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  itemsPerPage = 12,
  totalItems = 0 
}: KdsPaginationProps) {
  // Generar array de páginas a mostrar
  const getVisiblePages = () => {
    const delta = 2 // páginas antes y después de la actual
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  const handlePageClick = (page: number) => {
    onPageChange(page)
  }

  // Calcular rango de items
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  if (totalPages <= 1) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between px-6 py-4 bg-kds-header border-t border-kds-border"
    >
      {/* Información de items */}
      <div className="text-sm text-kds-secondary">
        {totalItems > 0 && (
          <span>
            Mostrando {startItem}-{endItem} de {totalItems} tickets
          </span>
        )}
      </div>

      {/* Controles de paginación */}
      <div className="flex items-center space-x-2">
        {/* Botón anterior */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={`
            p-2 rounded-lg transition-colors
            ${currentPage === 1 
              ? 'bg-kds-border text-kds-secondary cursor-not-allowed' 
              : 'bg-kds-card hover:bg-kds-border text-kds-text cursor-pointer'
            }
          `}
        >
          <ChevronLeft className="w-4 h-4" />
        </motion.button>

        {/* Números de página */}
        <div className="flex items-center space-x-1">
          {getVisiblePages().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-2 text-kds-secondary">...</span>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePageClick(page as number)}
                  className={`
                    px-3 py-1 rounded-lg text-sm font-medium transition-colors
                    ${currentPage === page
                      ? 'bg-green-600 text-white'
                      : 'bg-kds-card hover:bg-kds-border text-kds-text'
                    }
                  `}
                >
                  {page}
                </motion.button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Botón siguiente */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`
            p-2 rounded-lg transition-colors
            ${currentPage === totalPages 
              ? 'bg-kds-border text-kds-secondary cursor-not-allowed' 
              : 'bg-kds-card hover:bg-kds-border text-kds-text cursor-pointer'
            }
          `}
        >
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  )
}
