import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
  formatValue?: (value: number) => string
  onAnimationComplete?: () => void
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 600,
  decimals = 2,
  prefix = '',
  suffix = '',
  className = '',
  formatValue,
  onAnimationComplete
}) => {
  const [currentValue, setCurrentValue] = useState(value)
  const [isAnimating, setIsAnimating] = useState(false)
  const previousValue = usePrevious(value)
  const animationRef = useRef<number>()
  const startTimeRef = useRef<number>()
  const startValueRef = useRef<number>()

  // Format value for display
  const formatDisplayValue = (val: number): string => {
    if (formatValue) {
      return formatValue(val)
    }
    return `${prefix}${val.toFixed(decimals)}${suffix}`
  }

  // Easing function for smooth animation
  const easeOutQuart = (t: number): number => {
    return 1 - Math.pow(1 - t, 4)
  }

  // Animation loop
  const animate = (timestamp: number) => {
    if (!startTimeRef.current || !startValueRef.current) return

    const elapsed = timestamp - startTimeRef.current
    const progress = Math.min(elapsed / duration, 1)
    const easedProgress = easeOutQuart(progress)
    
    const newValue = startValueRef.current + (value - startValueRef.current) * easedProgress
    setCurrentValue(newValue)

    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animate)
    } else {
      setIsAnimating(false)
      onAnimationComplete?.()
    }
  }

  // Start animation when value changes
  useEffect(() => {
    if (previousValue !== undefined && previousValue !== value) {
      // Cancel any ongoing animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }

      startValueRef.current = currentValue
      startTimeRef.current = undefined
      setIsAnimating(true)

      // Start new animation
      animationRef.current = requestAnimationFrame((timestamp) => {
        startTimeRef.current = timestamp
        animate(timestamp)
      })
    } else if (previousValue === undefined) {
      // Initial value
      setCurrentValue(value)
    }
  }, [value, previousValue, currentValue, duration])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <span className={`inline-block ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentValue}-${isAnimating}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={isAnimating ? 'text-admin-primary' : ''}
        >
          {formatDisplayValue(currentValue)}
        </motion.div>
      </AnimatePresence>
    </span>
  )
}

// Hook for previous value
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}
