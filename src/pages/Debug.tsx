import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function DebugPage() {
  const url = import.meta.env.VITE_SUPABASE_URL
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY
  const [result, setResult] = useState<string>('')

  const testSession = async () => {
    setResult('Testando conexão com Supabase...')
    try {
      const p = supabase.auth.getSession()
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000))
      const res: any = await Promise.race([p, timeout])
      if (res?.data) {
        setResult('OK: getSession respondeu')
      } else {
        setResult('Falha: getSession não respondeu (timeout)')
      }
    } catch (e: any) {
      setResult('Erro: ' + e.message)
    }
  }

  const testAuthEndpoint = async () => {
    setResult('Testando endpoint de auth...')
    try {
      const controller = new AbortController()
      const t = setTimeout(() => controller.abort(), 8000)
      const resp = await fetch(`${url}/auth/v1/settings`, {
        headers: { apikey: String(anon) },
        signal: controller.signal
      })
      clearTimeout(t)
      setResult(`Auth settings status: ${resp.status}`)
    } catch (e: any) {
      setResult('Erro no auth endpoint: ' + (e.name === 'AbortError' ? 'Timeout' : e.message))
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Debug de Ambiente</h1>
      <div className="space-y-3">
        <div>
          <span className="font-medium">VITE_SUPABASE_URL:</span>
          <span className="ml-2">{url ? url : 'NÃO DEFINIDO'}</span>
        </div>
        <div>
          <span className="font-medium">VITE_SUPABASE_ANON_KEY:</span>
          <span className="ml-2">{anon ? (String(anon).slice(0,8) + '...') : 'NÃO DEFINIDO'}</span>
        </div>
        <div className="flex gap-2 mt-2">
          <button onClick={testSession} className="px-4 py-2 bg-blue-600 text-white rounded">Testar conexão</button>
          <button onClick={testAuthEndpoint} className="px-4 py-2 bg-green-600 text-white rounded">Testar auth endpoint</button>
        </div>
        {result && <div className="mt-3 p-3 bg-gray-100 rounded">{result}</div>}
        <div className="mt-6 text-sm text-gray-600">
          <p>Verifique no Supabase: Settings → API os valores corretos para URL e Anon Key.</p>
          <p>Em Authentication → Settings, inclua <code>http://localhost:5173</code> em Site URL.</p>
        </div>
      </div>
    </div>
  )
}
