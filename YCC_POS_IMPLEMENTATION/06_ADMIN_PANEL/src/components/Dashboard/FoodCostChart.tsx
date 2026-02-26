import React from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import { AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react'

interface FoodCostChartProps {
  data?: {
    theoretical: number
    actual: number
    target: number
  }
  loading?: boolean
}

export function FoodCostChart({ data, loading = false }: FoodCostChartProps) {
  if (!data) {
    return (
      <div className="admin-card p-6">
        <div className="animate-pulse">
          <div className="h-64 w-full bg-admin-border rounded"></div>
        </div>
      </div>
    )
  }

  const variance = data.actual - data.theoretical
  const variancePercentage = (variance / data.theoretical) * 100
  const isOnTarget = data.actual <= data.target

  // Generate mock historical data for the chart
  const historicalData = [
    { month: 'Ene', theoretical: 24.5, actual: 26.2, target: 30.0 },
    { month: 'Feb', theoretical: 25.1, actual: 27.8, target: 30.0 },
    { month: 'Mar', theoretical: 24.8, actual: 25.5, target: 30.0 },
    { month: 'Abr', theoretical: 25.2, actual: 28.1, target: 30.0 },
    { month: 'May', theoretical: 25.0, actual: 28.5, target: 30.0 },
    { month: 'Jun', theoretical: 25.3, actual: 28.5, target: 30.0 }
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-admin-border rounded-lg shadow-lg">
          <p className="text-sm font-medium text-admin-text mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="font-medium">{entry.name}</span>
              </span>
              <span className="font-bold">{entry.value.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="admin-card"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-admin-text">
            Food Cost Analysis
          </h3>
          <p className="text-sm text-admin-text-secondary">
            Teórico vs Real vs Target
          </p>
        </div>

        {/* Status indicator */}
        <div className={`
          flex items-center space-x-2 px-3 py-2 rounded-lg
          ${isOnTarget 
            ? 'bg-admin-success/10 text-admin-success' 
            : 'bg-admin-warning/10 text-admin-warning'
          }
        `}>
          {isOnTarget ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">
            {isOnTarget ? 'On Target' : 'Above Target'}
          </span>
        </div>
      </div>

      {/* Current Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-admin-border rounded-lg">
          <p className="text-sm text-admin-text-secondary mb-1">Teórico</p>
          <p className="text-2xl font-bold text-admin-text">
            {data.theoretical.toFixed(1)}%
          </p>
        </div>
        
        <div className="text-center p-4 bg-admin-border rounded-lg">
          <p className="text-sm text-admin-text-secondary mb-1">Real</p>
          <p className="text-2xl font-bold text-admin-text">
            {data.actual.toFixed(1)}%
          </p>
        </div>
        
        <div className="text-center p-4 bg-admin-border rounded-lg">
          <p className="text-sm text-admin-text-secondary mb-1">Target</p>
          <p className="text-2xl font-bold text-admin-primary">
            {data.target.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Variance */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`
          p-4 rounded-lg mb-6
          ${variance > 0 ? 'bg-admin-warning/10' : 'bg-admin-success/10'}
        `}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-admin-text-secondary">Variance</p>
            <p className="text-lg font-bold">
              {variance > 0 ? '+' : ''}{variance.toFixed(1)}%
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {variance > 0 ? (
              <TrendingUp className="w-5 h-5 text-admin-warning" />
            ) : (
              <TrendingDown className="w-5 h-5 text-admin-success" />
            )}
            <span className="text-sm font-medium">
              {variance > 0 ? 'Above Target' : 'Below Target'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Chart */}
      <div className="h-80">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-2 border-admin-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={historicalData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              
              <XAxis 
                dataKey="month" 
                tick={{ fill: '#6B7280', fontSize: 12 }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={{ stroke: '#E5E7EB' }}
              />
              
              <YAxis 
                tick={{ fill: '#6B7280', fontSize: 12 }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={{ stroke: '#E5E7EB' }}
                tickFormatter={(value) => `${value}%`}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              {/* Target line */}
              <ReferenceLine 
                y={data.target} 
                stroke="#DC2626" 
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{ value: "Target", position: "right" }}
              />
              
              <Line
                type="monotone"
                dataKey="theoretical"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: '#10B981', r: 4 }}
                activeDot={{ r: 6 }}
                animationDuration={1000}
                animationBegin={0}
              />
              
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#F59E0B"
                strokeWidth={2}
                dot={{ fill: '#F59E0B', r: 4 }}
                activeDot={{ r: 6 }}
                animationDuration={1000}
                animationBegin={200}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Recommendations */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 pt-4 border-t border-admin-border"
        >
          <h4 className="font-medium text-admin-text mb-3">Recommendations</h4>
          <div className="space-y-2">
            {variance > 3 ? (
              <>
                <div className="flex items-start space-x-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-admin-warning mt-0.5 flex-shrink-0" />
                  <span className="text-admin-text-secondary">
                    Food cost está significativamente above target. Revisar porciones y control de inventario.
                  </span>
                </div>
                <div className="flex items-start space-x-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-admin-warning mt-0.5 flex-shrink-0" />
                  <span className="text-admin-text-secondary">
                    Considerar renegotiar precios con proveedores.
                  </span>
                </div>
              </>
            ) : variance > 0 ? (
              <div className="flex items-start space-x-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-admin-warning mt-0.5 flex-shrink-0" />
                <span className="text-admin-text-secondary">
                  Food cost ligeramente above target. Monitorear tendencias.
                </span>
              </div>
            ) : (
              <div className="flex items-start space-x-2 text-sm">
                <TrendingUp className="w-4 h-4 text-admin-success mt-0.5 flex-shrink-0" />
                <span className="text-admin-text-secondary">
                  Food cost dentro del target. Mantener control actual.
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
