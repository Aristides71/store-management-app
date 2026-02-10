import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import AuthProvider from './components/AuthProvider'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

// Componente para proteger rotas
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    )
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />
}

// Layout principal com sidebar
function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/clientes"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
                    <p className="text-gray-600">Módulo de clientes em desenvolvimento...</p>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/produtos"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
                    <p className="text-gray-600">Módulo de produtos em desenvolvimento...</p>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendas"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900">Vendas</h1>
                    <p className="text-gray-600">Módulo de vendas em desenvolvimento...</p>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/despesas"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900">Despesas</h1>
                    <p className="text-gray-600">Módulo de despesas em desenvolvimento...</p>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/relatorios"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
                    <p className="text-gray-600">Módulo de relatórios em desenvolvimento...</p>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/configuracoes"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
                    <p className="text-gray-600">Módulo de configurações em desenvolvimento...</p>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  )
}