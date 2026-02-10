import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useStore } from '../stores/store'
import { DollarSign, Package, Users, TrendingUp } from 'lucide-react'

export default function Dashboard() {
  const { customers, products, sales, expenses, setCustomers, setProducts, setSales, setExpenses, loading, setLoading } = useStore()
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    lowStockProducts: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch customers
      const { data: customersData } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (customersData) setCustomers(customersData)

      // Fetch products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (productsData) setProducts(productsData)

      // Fetch sales
      const { data: salesData } = await supabase
        .from('sales')
        .select('*')
        .order('sale_date', { ascending: false })
        .limit(100)
      
      if (salesData) setSales(salesData)

      // Fetch expenses
      const { data: expensesData } = await supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false })
        .limit(100)
      
      if (expensesData) setExpenses(expensesData)

      // Calculate stats
      const today = new Date().toISOString().split('T')[0]
      const todaySales = salesData?.filter(sale => 
        sale.sale_date.startsWith(today)
      ) || []
      
      const totalRevenue = todaySales.reduce((sum, sale) => sum + sale.total_amount, 0)
      const totalExpenses = expensesData?.reduce((sum, expense) => sum + expense.amount, 0) || 0
      const lowStockProducts = productsData?.filter(product => 
        (product.stock_quantity || 0) <= product.min_stock
      ).length || 0

      setStats({
        totalSales: todaySales.length,
        totalRevenue,
        totalExpenses: totalExpenses,
        lowStockProducts
      })

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      name: 'Vendas Hoje',
      value: stats.totalSales.toString(),
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    {
      name: 'Receita Hoje',
      value: `R$ ${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-blue-500'
    },
    {
      name: 'Clientes Ativos',
      value: customers.length.toString(),
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      name: 'Produtos em Falta',
      value: stats.lowStockProducts.toString(),
      icon: Package,
      color: 'bg-red-500'
    }
  ]

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral do seu negócio</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Ações Rápidas</h3>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/vendas/nova"
              className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Nova Venda
            </a>
            <a
              href="/clientes/novo"
              className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Novo Cliente
            </a>
            <a
              href="/produtos/novo"
              className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
            >
              Novo Produto
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}