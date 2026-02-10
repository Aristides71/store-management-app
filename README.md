# Store Management App

Aplicativo completo de gerenciamento empresarial para lojas e empreendimentos, desenvolvido com React, TypeScript e Supabase.

## 🚀 Funcionalidades

- **Dashboard** - Visão geral com métricas e gráficos
- **Gestão de Clientes** - Cadastro completo com histórico de compras
- **Controle de Produtos** - Estoque com entrada/saída automática
- **Sistema de Vendas** - Interface de caixa com finalização rápida
- **Despesas Financeiras** - Controle de custos e impostos
- **Relatórios** - Análises e gráficos de desempenho
- **Multi-loja** - Suporte para várias lojas com permissões diferenciadas

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Supabase (BaaS)
- **Banco de Dados:** PostgreSQL
- **Estilização:** TailwindCSS
- **Gerenciamento de Estado:** Zustand
- **Deploy:** Render

## 📋 Pré-requisitos

- Node.js (v18 ou superior)
- Conta no Supabase
- Conta no GitHub
- Conta no Render

## 🔧 Configuração Local

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/store-management-app.git
cd store-management-app
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### 4. Execute o projeto
```bash
npm run dev
```

## 🗄️ Configuração do Banco de Dados (Supabase)

### 1. Crie um projeto no Supabase
- Acesse [supabase.com](https://supabase.com)
- Crie um novo projeto
- Copie a URL e a chave anônima

### 2. Execute as migrations
No painel SQL do Supabase, execute os seguintes comandos:

```sql
-- Tabela de usuários (gerenciada pelo Supabase Auth)

-- Tabela de lojas
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(20),
    address TEXT,
    phone VARCHAR(20),
    owner_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de clientes
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    cpf VARCHAR(14),
    notes TEXT,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de produtos
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100) UNIQUE,
    category VARCHAR(100),
    cost_price DECIMAL(10,2) DEFAULT 0,
    sale_price DECIMAL(10,2) NOT NULL,
    min_stock INTEGER DEFAULT 0,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de vendas
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    total_amount DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    payment_method VARCHAR(20) CHECK (payment_method IN ('cash', 'card', 'pix')),
    sale_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de itens da venda
CREATE TABLE sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0
);

-- Tabela de despesas
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    expense_date DATE NOT NULL,
    recurring BOOLEAN DEFAULT false,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de transações de estoque
CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    type VARCHAR(10) CHECK (type IN ('in', 'out')),
    quantity INTEGER NOT NULL,
    reason TEXT,
    user_id UUID REFERENCES auth.users(id),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Configure as permissões RLS
```sql
-- Habilitar RLS nas tabelas
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY "Users can view their stores" ON stores FOR SELECT 
    USING (auth.uid() = owner_id);

CREATE POLICY "Store users can manage customers" ON customers FOR ALL 
    USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

CREATE POLICY "Store users can manage products" ON products FOR ALL 
    USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

CREATE POLICY "Store users can manage sales" ON sales FOR ALL 
    USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

CREATE POLICY "Store users can manage expenses" ON expenses FOR ALL 
    USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

CREATE POLICY "Store users can manage inventory" ON inventory_transactions FOR ALL 
    USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));
```

## 🚀 Deploy no Render

### 1. Configure o repositório no GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/seu-usuario/store-management-app.git
git push -u origin main
```

### 2. Configure o deploy no Render
1. Acesse [render.com](https://render.com)
2. Conecte sua conta do GitHub
3. Crie um novo Static Site
4. Selecione o repositório do projeto
5. Configure:
   - **Name:** store-management-app
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
   - **Environment Variables:** Adicione as variáveis do Supabase

### 3. Configure as variáveis de ambiente no Render
- `VITE_SUPABASE_URL`: Sua URL do Supabase
- `VITE_SUPABASE_ANON_KEY`: Sua chave anônima do Supabase

## 📱 Funcionalidades por Módulo

### Dashboard
- Métricas de vendas do dia
- Produtos com estoque baixo
- Clientes atendidos
- Gráficos de vendas semanais

### Clientes
- Cadastro completo (nome, telefone, email, endereço, CPF)
- Histórico de compras
- Busca e filtros avançados
- Exportação de dados

### Produtos
- Cadastro com SKU, categoria, preços
- Controle de estoque mínimo
- Entrada/saída manual de estoque
- Histórico de movimentações

### Vendas
- Interface de caixa rápida
- Busca de produtos e clientes
- Cálculo automático de totais
- Múltiplas formas de pagamento (dinheiro, cartão, pix)

### Despesas
- Categorização de despesas
- Despesas recorrentes
- Controle por período
- Relatórios financeiros

### Relatórios
- Vendas por período
- Produtos mais vendidos
- Fluxo de caixa
- Análise de margem de lucro

## 🔒 Segurança

- Autenticação via Supabase Auth
- Autorização com Row Level Security (RLS)
- Validação de dados no frontend e backend
- Logs de auditoria para operações financeiras

## 📞 Suporte

Para dúvidas e suporte, abra uma issue no GitHub ou entre em contato.

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.