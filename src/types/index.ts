export interface User {
  id: string
  email: string
  role: 'admin' | 'clerk'
  created_at: string
}

export interface Store {
  id: string
  name: string
  cnpj?: string
  address?: string
  phone?: string
  owner_id: string
  created_at: string
}

export interface Customer {
  id: string
  name: string
  phone?: string
  email?: string
  address?: string
  cpf?: string
  notes?: string
  store_id: string
  created_at: string
}

export interface Product {
  id: string
  name: string
  description?: string
  sku?: string
  category?: string
  cost_price: number
  sale_price: number
  min_stock: number
  store_id: string
  active: boolean
  created_at: string
  stock_quantity?: number
}

export interface Sale {
  id: string
  customer_id?: string
  store_id: string
  user_id: string
  total_amount: number
  discount: number
  payment_method: 'cash' | 'card' | 'pix'
  sale_date: string
  customer?: Customer
  sale_items?: SaleItem[]
}

export interface SaleItem {
  id: string
  sale_id: string
  product_id: string
  quantity: number
  unit_price: number
  discount: number
  product?: Product
}

export interface Expense {
  id: string
  description: string
  amount: number
  category: string
  expense_date: string
  recurring: boolean
  store_id: string
  user_id: string
  created_at: string
}

export interface InventoryTransaction {
  id: string
  product_id: string
  type: 'in' | 'out'
  quantity: number
  reason?: string
  user_id: string
  store_id: string
  created_at: string
  product?: Product
}