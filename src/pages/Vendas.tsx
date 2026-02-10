import { useState, useEffect } from 'react'
import { useStore } from '../stores/store'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'
import { Product, Customer, Sale, SaleItem } from '../types'
import { ShoppingCart, Plus, Minus, Trash2, User, DollarSign, CreditCard, Smartphone } from 'lucide-react'

export default function Vendas() {
  const { products, customers, setSales } = useStore()
  const { store, user } = useAuthStore()
  const [cart, setCart] = useState<Array<{ product: Product; quantity: number; discount: number }>>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'pix'>('cash')
  const [showCheckout, setShowCheckout] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredProducts = products.filter(product =>
    product.active && (
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id)
    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { product, quantity: 1, discount: 0 }])
    }
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.product.id !== productId))
    } else {
      setCart(cart.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      ))
    }
  }

  const updateDiscount = (productId: string, discount: number) => {
    setCart(cart.map(item =>
      item.product.id === productId
        ? { ...item, discount: Math.max(0, discount) }
        : item
    ))
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId))
  }

  const getTotal = () => {
    return cart.reduce((total, item) => {
      const subtotal = item.product.sale_price * item.quantity
      const discount = item.discount
      return total + (subtotal - discount)
    }, 0)
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const handleCheckout = async () => {
    if (!store || !user || cart.length === 0) return

    try {
      // Criar a venda
      const saleData = {
        customer_id: selectedCustomer?.id || null,
        store_id: store.id,
        user_id: user.id,
        total_amount: getTotal(),
        discount: cart.reduce((total, item) => total + item.discount, 0),
        payment_method: paymentMethod
      }

      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert(saleData)
        .select()
        .single()

      if (saleError) throw saleError

      // Criar os itens da venda
      const saleItems = cart.map(item => ({
        sale_id: sale.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.sale_price,
        discount: item.discount
      }))

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems)

      if (itemsError) throw itemsError

      // Atualizar estoque dos produtos
      for (const item of cart) {
        const { error: stockError } = await supabase
          .from('products')
          .update({
            stock_quantity: item.product.stock_quantity - item.quantity
          })
          .eq('id', item.product.id)
          .eq('store_id', store.id)

        if (stockError) throw stockError

        // Registrar transação de estoque
        const { error: transactionError } = await supabase
          .from('inventory_transactions')
          .insert({
            product_id: item.product.id,
            type: 'out',
            quantity: item.quantity,
            reason: `Venda #${sale.id}`,
            user_id: user.id,
            store_id: store.id
          })

        if (transactionError) throw transactionError
      }

      // Limpar carrinho e atualizar vendas
      setCart([])
      setSelectedCustomer(null)
      setShowCheckout(false)

      // Recarregar produtos para refletir novo estoque
      const { data: updatedProducts, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', store.id)

      if (productsError) throw productsError

      // Atualizar store com produtos atualizados
      const { setProducts } = useStore.getState()
      setProducts(updatedProducts || [])

      alert('Venda realizada com sucesso!')
    } catch (error) {
      console.error('Erro ao finalizar venda:', error)
      alert('Erro ao finalizar venda')
    }
  }

  if (showCheckout) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Finalizar Venda</h1>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Resumo do Carrinho */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Itens da Venda</h3>
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} × R$ {item.product.sale_price.toFixed(2)}
                        </p>
                        {item.discount > 0 && (
                          <p className="text-sm text-green-600">
                            Desconto: R$ {item.discount.toFixed(2)}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          R$ {((item.product.sale_price * item.quantity) - item.discount).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total:</span>
                    <span>R$ {getTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Seleção de Cliente */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cliente (opcional)
                </label>
                <select
                  value={selectedCustomer?.id || ''}
                  onChange={(e) => {
                    const customer = customers.find(c => c.id === e.target.value)
                    setSelectedCustomer(customer || null)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione um cliente</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                      {customer.phone && ` - ${customer.phone}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Forma de Pagamento */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Forma de Pagamento
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3 border rounded-lg flex flex-col items-center space-y-1 ${
                      paymentMethod === 'cash'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <DollarSign className="h-5 w-5" />
                    <span className="text-sm">Dinheiro</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 border rounded-lg flex flex-col items-center space-y-1 ${
                      paymentMethod === 'card'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <CreditCard className="h-5 w-5" />
                    <span className="text-sm">Cartão</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={`p-3 border rounded-lg flex flex-col items-center space-y-1 ${
                      paymentMethod === 'pix'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Smartphone className="h-5 w-5" />
                    <span className="text-sm">Pix</span>
                  </button>
                </div>
              </div>

              {/* Botão Finalizar */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCheckout(false)}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Finalizar Venda
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Produtos */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-900">Vendas</h1>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar produtos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="p-6">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum produto disponível</h3>
                    <p className="mt-1 text-sm text-gray-500">Adicione produtos antes de iniciar uma venda</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredProducts.map((product) => (
                      <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                          <span className="text-lg font-bold text-green-600">
                            R$ {product.sale_price.toFixed(2)}
                          </span>
                        </div>
                        
                        {product.description && (
                          <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                        )}
                        
                        <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                          <span>Estoque: {product.stock_quantity}</span>
                          {product.sku && <span>SKU: {product.sku}</span>}
                        </div>
                        
                        <button
                          onClick={() => addToCart(product)}
                          disabled={product.stock_quantity === 0}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Adicionar</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Carrinho */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg sticky top-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-6 w-6 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Carrinho ({getTotalItems()})
                  </h2>
                </div>
              </div>

              <div className="p-6">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">Carrinho vazio</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.product.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-sm font-medium text-gray-900">{item.product.name}</h4>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">
                            R$ {item.product.sale_price.toFixed(2)}
                          </span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <label className="text-xs text-gray-600">Desc:</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.discount}
                            onChange={(e) => updateDiscount(item.product.id, parseFloat(e.target.value) || 0)}
                            className="w-20 px-2 py-1 text-xs border border-gray-300 rounded"
                          />
                        </div>
                      </div>
                    ))}

                    <div className="pt-4 border-t border-gray-200">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal:</span>
                          <span>
                            R$ {cart.reduce((total, item) => total + (item.product.sale_price * item.quantity), 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Desconto:</span>
                          <span>
                            R$ {cart.reduce((total, item) => total + item.discount, 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-lg font-semibold">
                          <span>Total:</span>
                          <span className="text-green-600">
                            R$ {getTotal().toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setShowCheckout(true)}
                        className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center space-x-2"
                      >
                        <DollarSign className="h-4 w-4" />
                        <span>Finalizar Venda</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}