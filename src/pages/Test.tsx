import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'

export default function TestPage() {
  const { store } = useAuthStore()
  const [msg, setMsg] = useState('')

  const addSampleCustomer = async () => {
    if (!store?.id) { setMsg('Crie a loja primeiro no Supabase.'); return }
    const { data, error } = await supabase
      .from('customers')
      .insert([{ name: 'Cliente Demo', phone: '(00) 0000-0000', email: 'demo@loja.test', store_id: store.id }])
      .select('*')
      .single()
    if (error) setMsg('Erro ao criar cliente: ' + error.message)
    else setMsg('Cliente criado: ' + data.name)
  }

  const addSampleProduct = async () => {
    if (!store?.id) { setMsg('Crie a loja primeiro no Supabase.'); return }
    const { data, error } = await supabase
      .from('products')
      .insert([{ name: 'Produto Demo', category: 'Demo', sale_price: 99.9, cost_price: 50, min_stock: 1, stock_quantity: 10, store_id: store.id }])
      .select('*')
      .single()
    if (error) setMsg('Erro ao criar produto: ' + error.message)
    else setMsg('Produto criado: ' + data.name)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Teste Rápido</h1>
      <p className="text-gray-600 mb-6">Gere dados de exemplo e acesse as páginas.</p>
      <div className="flex gap-3 mb-6">
        <button onClick={addSampleCustomer} className="px-4 py-2 rounded bg-blue-600 text-white">Criar cliente demo</button>
        <button onClick={addSampleProduct} className="px-4 py-2 rounded bg-green-600 text-white">Criar produto demo</button>
      </div>
      {msg && <div className="mb-6 p-3 rounded bg-blue-50 text-blue-700">{msg}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Link to="/clientes" className="px-4 py-3 rounded border bg-white">Ir para Clientes</Link>
        <Link to="/produtos" className="px-4 py-3 rounded border bg-white">Ir para Produtos</Link>
      </div>
    </div>
  )
}

