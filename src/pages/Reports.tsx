import { useState, useEffect } from 'react'
import { useStore } from '../stores/store'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'
import { BarChart3, DollarSign, ShoppingCart, Users, TrendingUp, Calendar, Package, AlertTriangle } from 'lucide-react'

export default function Reports() {
  const { sales, expenses, products, customers } = useStore()
  const { store } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('current')
  const [resolution, setResolution] = useState<'day' | 'month' | 'year'>('day')
  const [customStart, setCustomStart] = useState<string>('')
  const [customEnd, setCustomEnd] = useState<string>('')
  const [reportData, setReportData] = useState<any>({})

  useEffect(() => {
    if (store) {
      loadReportData()
    }
  }, [store, selectedPeriod, resolution, customStart, customEnd])

  const loadReportData = async () => {
    if (!store) return

    setLoading(true)
    try {
      const now = new Date()
      let startDate = selectedPeriod === 'current' 
        ? new Date(now.getFullYear(), now.getMonth(), 1)
        : new Date(now.getFullYear(), now.getMonth() - 1, 1)
      let endDate = selectedPeriod === 'current'
        ? new Date(now.getFullYear(), now.getMonth() + 1, 0)
        : new Date(now.getFullYear(), now.getMonth(), 0)

      if (customStart) startDate = new Date(customStart)
      if (customEnd) endDate = new Date(customEnd)

      // Vendas do período
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('*, sale_items(*)')
        .eq('store_id', store.id)
        .gte('sale_date', startDate.toISOString())
        .lte('sale_date', endDate.toISOString())

      if (salesError) throw salesError

      // Despesas do período
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('store_id', store.id)
        .gte('expense_date', startDate.toISOString())
        .lte('expense_date', endDate.toISOString())

      if (expensesError) throw expensesError

      // Produtos com baixo estoque
      const { data: lowStockData, error: lowStockError } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', store.id)
        .eq('active', true)
        .lte('stock_quantity', 5) // Considerar baixo estoque quando <= 5

      if (lowStockError) throw lowStockError

      // Calcular totais
      const totalSales = salesData?.reduce((sum: number, sale: any) => sum + sale.total_amount, 0) || 0
      const totalExpenses = expensesData?.reduce((sum: number, expense: any) => sum + expense.amount, 0) || 0
      const profit = totalSales - totalExpenses
      const totalItems = salesData?.reduce((sum: number, sale: any) => 
        sum + (sale.sale_items?.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0) || 0), 0
      ) || 0

      // Série temporal agregada conforme resolução
      const bucketKey = (d: Date) => {
        if (resolution === 'day') return d.toISOString().split('T')[0]
        if (resolution === 'month') return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
        return `${d.getFullYear()}`
      }
      const labelFor = (key: string) => {
        if (resolution === 'day') return new Date(key).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
        if (resolution === 'month') {
          const [y,m] = key.split('-')
          return `${m}/${y}`
        }
        return key
      }
      const buckets: Record<string, number> = {}
      ;(salesData || []).forEach((sale: any) => {
        const d = new Date(sale.sale_date)
        const key = bucketKey(d)
        buckets[key] = (buckets[key] || 0) + sale.total_amount
      })
      const dailySales = Object.keys(buckets).sort().map((k) => ({ date: labelFor(k), total: buckets[k] }))

      // Vendas por categoria
      const categorySales = salesData?.reduce((acc: any[], sale: any) => {
        sale.sale_items?.forEach((item: any) => {
          const product = products.find(p => p.id === item.product_id)
          if (product?.category) {
            const existing = acc.find(cat => cat.name === product.category)
            if (existing) {
              existing.value += item.unit_price * item.quantity
            } else {
              acc.push({ name: product.category, value: item.unit_price * item.quantity })
            }
          }
        })
        return acc
      }, []) || []

      // Despesas por categoria
      const categoryExpenses = expensesData?.reduce((acc: any[], expense: any) => {
        const existing = acc.find(cat => cat.name === expense.category)
        if (existing) {
          existing.value += expense.amount
        } else {
          acc.push({ name: expense.category, value: expense.amount })
        }
        return acc
      }, []) || []

      setReportData({
        totalSales,
        totalExpenses,
        profit,
        totalItems,
        dailySales,
        categorySales,
        categoryExpenses,
        lowStockProducts: lowStockData || []
      })
    } catch (error) {
      console.error('Erro ao carregar dados do relatório:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <div className="text-gray-500">Carregando relatórios...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-8 w-8 text-gray-600" />
              <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="current">Mês Atual</option>
                <option value="previous">Mês Anterior</option>
              </select>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="day">Dias</option>
                <option value="month">Meses</option>
                <option value="year">Anos</option>
              </select>
              <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="px-3 py-2 border rounded" />
              <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="px-3 py-2 border rounded" />
            </div>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Vendas</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {reportData.totalSales?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Despesas</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {reportData.totalExpenses?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Lucro</p>
                <p className={`text-2xl font-bold ${
                  (reportData.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  R$ {reportData.profit?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Itens Vendidos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reportData.totalItems || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos Simples */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Vendas por Dia */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendas por Dia (Últimos 7 dias)</h3>
            <div className="space-y-3">
              {reportData.dailySales?.map((day: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{day.date}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min((day.total / Math.max(...reportData.dailySales.map((d: any) => d.total))) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      R$ {day.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vendas por Categoria */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendas por Categoria</h3>
            <div className="space-y-3">
              {reportData.categorySales?.map((category: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{category.name}</span>
                  <span className="text-sm font-medium text-gray-900">
                    R$ {category.value.toFixed(2)}
                  </span>
                </div>
              )) || <p className="text-gray-500 text-center py-4">Nenhuma venda por categoria</p>}
            </div>
          </div>
        </div>

        {/* Despesas por Categoria */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Despesas por Categoria</h3>
            <div className="space-y-3">
              {reportData.categoryExpenses?.map((category: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{category.name}</span>
                  <span className="text-sm font-medium text-gray-900">
                    R$ {category.value.toFixed(2)}
                  </span>
                </div>
              )) || <p className="text-gray-500 text-center py-4">Nenhuma despesa registrada</p>}
            </div>
          </div>

          {/* Produtos com Baixo Estoque */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Produtos com Baixo Estoque</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {reportData.lowStockProducts?.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhum produto com estoque baixo</p>
              ) : (
                reportData.lowStockProducts.map((product: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">SKU: {product.sku || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600">{product.stock_quantity}</p>
                      <p className="text-xs text-gray-500">mín: {product.min_stock}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Tabela de Vendas Recentes */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Vendas Recentes</h3>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Itens
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pagamento
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sales.slice(0, 10).map((sale) => (
                    <tr key={sale.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(sale.sale_date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {sale.customer?.name || 'Cliente não identificado'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {/* Calcular total de itens */}
                        {sale.sale_items?.reduce((total, item) => total + item.quantity, 0) || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        R$ {sale.total_amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          sale.payment_method === 'cash' ? 'bg-green-100 text-green-800' :
                          sale.payment_method === 'card' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {sale.payment_method === 'cash' ? 'Dinheiro' :
                           sale.payment_method === 'card' ? 'Cartão' : 'Pix'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
