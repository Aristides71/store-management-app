import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { useStore } from '../stores/store'
import { Customer } from '../types'

function CustomerForm({ initial, onClose, onSaved }: { initial?: Partial<Customer>, onClose: () => void, onSaved: (c: Customer) => void }) {
  const { store } = useAuthStore()
  const [form, setForm] = useState<Partial<Customer>>({
    name: initial?.name || '',
    phone: initial?.phone || '',
    email: initial?.email || '',
    address: initial?.address || '',
    cpf: initial?.cpf || '',
    notes: initial?.notes || ''
  })
  const [saving, setSaving] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const save = async () => {
    if (!store?.id) return
    if (!form.name || form.name.trim().length === 0) return
    setSaving(true)

    if (initial?.id) {
      const { data, error } = await supabase
        .from('customers')
        .update({
          name: form.name,
          phone: form.phone,
          email: form.email,
          address: form.address,
          cpf: form.cpf,
          notes: form.notes
        })
        .eq('id', initial.id)
        .select('*')
        .single()
      setSaving(false)
      if (!error && data) {
        onSaved(data as Customer)
        onClose()
      }
      return
    }

    const { data, error } = await supabase
      .from('customers')
      .insert([{ ...form, store_id: store.id }])
      .select('*')
      .single()
    setSaving(false)
    if (!error && data) {
      onSaved(data as Customer)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-xl p-6">
        <h2 className="text-xl font-semibold mb-4">{initial?.id ? 'Editar Cliente' : 'Novo Cliente'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Nome</label>
            <input name="name" value={form.name as string} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Telefone</label>
            <input name="phone" value={form.phone as string} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input name="email" value={form.email as string} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="text-sm text-gray-600">CPF</label>
            <input name="cpf" value={form.cpf as string} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2" />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-gray-600">Endereço</label>
            <input name="address" value={form.address as string} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2" />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-gray-600">Observações</label>
            <textarea name="notes" value={form.notes as string} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2" />
          </div>
        </div>
        <div className="mt-6 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded border">Cancelar</button>
          <button disabled={saving} onClick={save} className="px-4 py-2 rounded bg-blue-600 text-white">{saving ? 'Salvando...' : 'Salvar'}</button>
        </div>
      </div>
    </div>
  )
}

export default function CustomersPage() {
  const { store } = useAuthStore()
  const { customers, setCustomers, updateCustomer, addCustomer } = useStore()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState<{ initial?: Customer } | null>(null)

  const load = async () => {
    if (!store?.id) return
    setLoading(true)
    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('store_id', store.id)
      .ilike('name', `%${query}%`)
      .order('created_at', { ascending: false })
    setCustomers((data || []) as Customer[])
    setLoading(false)
  }

  useEffect(() => { load() }, [store?.id, query])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <button onClick={() => setShowForm({})} className="px-4 py-2 rounded bg-blue-600 text-white">Novo Cliente</button>
      </div>

      <div className="mb-4">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nome" className="w-full md:w-80 border rounded px-3 py-2" />
      </div>

      <div className="bg-white rounded-md shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Nome</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Telefone</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Email</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading && (
              <tr><td className="px-4 py-3" colSpan={4}>Carregando...</td></tr>
            )}
            {!loading && customers.length === 0 && (
              <tr><td className="px-4 py-3" colSpan={4}>Nenhum cliente encontrado</td></tr>
            )}
            {customers.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-2">{c.name}</td>
                <td className="px-4 py-2">{c.phone}</td>
                <td className="px-4 py-2">{c.email}</td>
                <td className="px-4 py-2 text-right">
                  <button className="px-3 py-1 rounded border" onClick={() => setShowForm({ initial: c })}>Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <CustomerForm
          initial={showForm.initial}
          onClose={() => setShowForm(null)}
          onSaved={(saved) => {
            if (showForm.initial) {
              updateCustomer(showForm.initial.id, saved)
            } else {
              addCustomer(saved)
            }
          }}
        />
      )}
    </div>
  )
}

