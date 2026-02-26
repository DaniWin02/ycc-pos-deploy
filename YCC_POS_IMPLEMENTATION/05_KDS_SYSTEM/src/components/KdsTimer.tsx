import React from 'react'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'

interface KdsTimerProps {
  startTime: string
  size?: 'small' | 'medium' | 'large'
  showSeconds?: boolean
}

export function KdsTimer({ startTime, size = 'medium', showSeconds = false }: KdsTimerProps) {
  const [elapsed, setElapsed] = React.useState(0)

  // Calcular tiempo transcurrido
  React.useEffect(() => {
    const start = new Date(startTime).getTime()
    
    const interval = setInterval(() => {
      const now = new Date().getTime()
      setElapsed(Math.floor((now - start) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime])

  // Formatear tiempo
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return showSeconds 
        ? `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        : `${hours}h ${minutes}m`
    }
    
    return showSeconds 
      ? `${minutes}:${secs.toString().padStart(2, '0')}`
      : `${minutes}m`
  }

  // Determinar color basado en tiempo
  const getColorClass = () => {
    const minutes = Math.floor(elapsed / 60)
    
    if (minutes > 15) return 'text-red-600 animate-pulse-red'
    if (minutes > 10) return 'text-red-500'
    if (minutes > 5) return 'text-yellow-500'
    return 'text-green-500'
  }

  // Determinar tamaño
  const getSizeClass = () => {
    switch (size) {
      case 'small': return 'text-sm'
      case 'medium': return 'text-lg'
      case 'large': return 'text-2xl'
      default: return 'text-lg'
    }
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        flex items-center space-x-2 font-mono font-bold
        ${getColorClass()}
        ${getSizeClass()}
      `}
    >
      <Clock className="w-4 h-4" />
      <span>{formatTime(elapsed)}</span>
    </motion.div>
  )
}
