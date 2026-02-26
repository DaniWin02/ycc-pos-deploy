import React from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  AlertTriangle
} from 'lucide-react'
import { StatCard } from '../components/Dashboard/StatCard'
import { SalesChart } from '../components/Dashboard/SalesChart'
import { TopProducts } from '../components/Dashboard/TopProducts'
import { FoodCostChart } from '../components/Dashboard/FoodCostChart'
import { AlertsPanel } from '../components/Dashboard/AlertsPanel'
import { StoreSelector } from '../components/Dashboard/StoreSelector'
import { useAdminStore } from '../stores/useAdminStore'

// Mock API functions - these would be real API calls
const fetchDailySales = async () => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))
  return {
    totalSales: 125000,
    totalOrders: 450,
    foodCostPercentage: 28.5,
    averageTicket: 278
  }
}

const fetchSalesByHour = async () => {
  await new Promise(resolve => setTimeout(resolve, 800))
  return [
    { hour: '09:00', sales: 2500, orders: 12 },
    { hour: '10:00', sales: 3200, orders: 18 },
    { hour: '11:00', sales: 4100, orders: 22 },
    { hour: '12:00', sales: 5800, orders: 28 },
    { hour: '13:00', sales: 6200, orders: 30 },
    { hour: '14:00', sales: 5500, orders: 25 },
    { hour: '15:00', sales: 4800, orders: 20 },
    { hour: '16:00', sales: 3900, orders: 16 },
    { hour: '17:00', sales: 3100, orders: 14 },
    { hour: '18:00', sales: 2800, orders: 12 },
    { hour: '19:00', sales: 2200, orders: 10 },
    { hour: '20:00', sales: 1800, orders: 8 },
    { hour: '21:00', sales: 1200, orders: 6 }
  ]
}

const fetchTopProducts = async () => {
  await new Promise(resolve => setTimeout(resolve, 600))
  return [
    { name: 'Hamburguesa Clásica', sold: 45, revenue: 3825 },
    { name: 'Coca Cola 600ml', sold: 68, revenue: 2040 },
    { name: 'Papas Fritas', sold: 52, revenue: 2340 },
    { name: 'Ensalada César', sold: 28, revenue: 1680 },
    { name: 'Agua 600ml', sold: 85, revenue: 1275 }
  ]
}

const fetchFoodCostData = async () => {
  await new Promise(resolve => setTimeout(resolve, 700))
  return {
    theoretical: 25.2,
    actual: 28.5,
    target: 30.0
  }
}

export function DashboardPage() {
  const { currentStore } = useAdminStore()

  // Queries
  const { data: dailySales, isLoading: salesLoading } = useQuery({
    queryKey: ['daily-sales', currentStore],
    queryFn: fetchDailySales,
    refetchInterval: 30000 // Refetch every 30 seconds
  })

  const { data: salesByHour, isLoading: chartLoading } = useQuery({
    queryKey: ['sales-by-hour', currentStore],
    queryFn: fetchSalesByHour,
    refetchInterval: 60000 // Refetch every minute
  })

  const { data: topProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['top-products', currentStore],
    queryFn: fetchTopProducts,
    refetchInterval: 30000
  })

  const { data: foodCostData, isLoading: costLoading } = useQuery({
    queryKey: ['food-cost', currentStore],
    queryFn: fetchFoodCostData,
    refetchInterval: 60000
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-admin-text">
            Dashboard
          </h1>
          <p className="text-admin-text-secondary mt-1">
            Resumen en tiempo real de operaciones
          </p>
        </div>
        
        <StoreSelector />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Ventas Hoy"
          value={dailySales?.totalSales || 0}
          icon={DollarSign}
          trend={{ value: 12.5, isPositive: true }}
          loading={salesLoading}
          color="green"
          format="currency"
        />
        
        <StatCard
          title="Pedidos"
          value={dailySales?.totalOrders || 0}
          icon={ShoppingCart}
          trend={{ value: 8.2, isPositive: true }}
          loading={salesLoading}
          color="blue"
        />
        
        <StatCard
          title="Food Cost %"
          value={dailySales?.foodCostPercentage || 0}
          icon={Package}
          trend={{ value: -2.1, isPositive: false }}
          loading={salesLoading}
          color="yellow"
          format="percentage"
        />
        
        <StatCard
          title="Ticket Promedio"
          value={dailySales?.averageTicket || 0}
          icon={Users}
          trend={{ value: 5.3, isPositive: true }}
          loading={salesLoading}
          color="purple"
          format="currency"
        />
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <SalesChart
          data={salesByHour || []}
          title="Ventas por Hora"
          loading={chartLoading}
        />

        {/* Top Products */}
        <TopProducts
          products={topProducts || []}
          loading={productsLoading}
        />
      </div>

      {/* Food Cost Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FoodCostChart
          data={foodCostData}
          loading={costLoading}
        />

        {/* Alerts Panel */}
        <AlertsPanel />
      </div>
    </motion.div>
  )
}
