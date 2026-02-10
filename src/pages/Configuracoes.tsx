import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'
import { Store } from '../types'
import { Settings, Save, User, Store as StoreIcon, Mail, Phone, MapPin, IdCard } from 'lucide-react'

export default function Configuracoes() {
  const { store, setStore } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    address: '',
    phone: ''
  })
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name,
        cnpj: store.cnpj || '',
        address: store.address || '',
        phone: store.phone || ''
      })
    }
    
    // Obter email do usuário atual
    const getUserEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setUserEmail(user.email)
      }
    }
    getUserEmail()
  }, [store])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!store) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('stores')
        .update({
          name: formData.name,
          cnpj: formData.cnpj,
          address: formData.address,
          phone: formData.phone
        })
        .eq('id', store.id)

      if (error) throw error

      // Atualizar store no estado
      const updatedStore: Store = {
        ...store,
        name: formData.name,
        cnpj: formData.cnpj,
        address: formData.address,
        phone: formData.phone
      }
      setStore(updatedStore)

      alert('Configurações salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      alert('Erro ao salvar configurações')
    } finally {
      setLoading(false)
    }
  }

  const formatCNPJ = (value: string) => {
    const cnpj = value.replace(/\D/g, '')
    if (cnpj.length <= 14) {
      return cnpj
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1')
    }
    return cnpj
  }

  const formatPhone = (value: string) => {
    const phone = value.replace(/\D/g, '')
    if (phone.length <= 11) {
      return phone
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1')
    }
    return phone
  }

  const handleInputChange = (field: string, value: string) => {
    if (field === 'cnpj') {
      setFormData({ ...formData, cnpj: formatCNPJ(value) })
    } else if (field === 'phone') {
      setFormData({ ...formData, phone: formatPhone(value) })
    } else {
      setFormData({ ...formData, [field]: value })
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Settings className="h-6 w-6 text-gray-600" />
              <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
            </div>
          </div>

          <div className="p-6">
            {/* Informações da Loja */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <StoreIcon className="h-5 w-5" />
                <span>Informações da Loja</span>
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome da Loja *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CNPJ
                    </label>
                    <input
                      type="text"
                      value={formData.cnpj}
                      onChange={(e) => handleInputChange('cnpj', e.target.value)}
                      placeholder="00.000.000/0000-00"
                      maxLength={18}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="h-4 w-4" />
                    <span>{loading ? 'Salvando...' : 'Salvar Configurações'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Informações da Conta */}
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Informações da Conta</span>
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Settings className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Informações importantes</h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>• Suas informações de login são gerenciadas pelo sistema de autenticação do Supabase.</p>
                        <p>• Para alterar sua senha, use a opção "Esqueci minha senha" na tela de login.</p>
                        <p>• As configurações da loja afetam todos os usuários vinculados a esta loja.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}