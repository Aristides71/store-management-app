import { create } from 'zustand'
import { Customer, Product, Sale, SaleItem, Expense } from '../types'

interface StoreState {
  customers: Customer[]
  products: Product[]
  sales: Sale[]
  expenses: Expense[]
  loading: boolean
  setCustomers: (customers: Customer[]) => void
  setProducts: (products: Product[]) => void
  setSales: (sales: Sale[]) => void
  setExpenses: (expenses: Expense[]) => void
  setLoading: (loading: boolean) => void
  addCustomer: (customer: Customer) => void
  updateCustomer: (id: string, customer: Partial<Customer>) => void
  addProduct: (product: Product) => void
  updateProduct: (id: string, product: Partial<Product>) => void
  addSale: (sale: Sale) => void
  addExpense: (expense: Expense) => void
}

export const useStore = create<StoreState>((set) => ({
  customers: [],
  products: [],
  sales: [],
  expenses: [],
  loading: false,
  setCustomers: (customers) => set({ customers }),
  setProducts: (products) => set({ products }),
  setSales: (sales) => set({ sales }),
  setExpenses: (expenses) => set({ expenses }),
  setLoading: (loading) => set({ loading }),
  addCustomer: (customer) => set((state) => ({ customers: [...state.customers, customer] })),
  updateCustomer: (id, customer) => set((state) => ({
    customers: state.customers.map(c => c.id === id ? { ...c, ...customer } : c)
  })),
  addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
  updateProduct: (id, product) => set((state) => ({
    products: state.products.map(p => p.id === id ? { ...p, ...product } : p)
  })),
  addSale: (sale) => set((state) => ({ sales: [sale, ...state.sales] })),
  addExpense: (expense) => set((state) => ({ expenses: [expense, ...state.expenses] })),
}))