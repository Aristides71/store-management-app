# 🗄️ Guia de Configuração do Supabase

Este guia irá ajudá-lo a configurar o Supabase para o seu Store Management App.

## 📋 Passo a Passo

### 1. Criar Conta e Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Clique em "Start your project" ou "Sign In"
3. Faça login com sua conta do GitHub ou crie uma nova conta
4. Clique em "New Project"
5. Preencha as informações:
   - **Name**: `store-management-app`
   - **Database Password**: Crie uma senha forte (guarde esta senha!)
   - **Region**: Escolha a região mais próxima de você (ex: `us-east-1`)
   - **Pricing Plan**: Start (gratuito)

6. Aguarde alguns minutos para o projeto ser criado

### 2. Obter as Credenciais

1. Após o projeto ser criado, clique em "Settings" no sidebar
2. Vá para "API" na seção de configurações
3. Copie as seguintes informações:
   - **Project URL** (ex: `https://seu-projeto.supabase.co`)
   - **anon public** key (chave pública)

### 3. Configurar o Projeto Local

1. No seu projeto, crie um arquivo `.env` na raiz:
```env
VITE_SUPABASE_URL=sua_project_url_aqui
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

2. Substitua os valores pelos que você copiou do Supabase

### 4. Criar as Tabelas no Banco de Dados

1. No dashboard do Supabase, clique em "SQL Editor" no sidebar
2. Copie e cole o seguinte código SQL:

```sql
-- Tabela de Lojas
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(20),
    address TEXT,
    phone VARCHAR(20),
    owner_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Clientes
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

-- Tabela de Produtos
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

-- Tabela de Vendas
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

-- Tabela de Itens da Venda
CREATE TABLE sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0
);

-- Tabela de Despesas
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

-- Tabela de Transações de Estoque
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

3. Clique em "Run" para executar o SQL

### 5. Configurar Segurança (RLS - Row Level Security)

Execute este SQL adicional para configurar as permissões de segurança:

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

-- Conceder permissões básicas
GRANT SELECT ON customers TO anon;
GRANT ALL PRIVILEGES ON customers TO authenticated;
GRANT SELECT ON products TO anon;
GRANT ALL PRIVILEGES ON products TO authenticated;
GRANT SELECT ON sales TO anon;
GRANT ALL PRIVILEGES ON sales TO authenticated;
GRANT SELECT ON expenses TO anon;
GRANT ALL PRIVILEGES ON expenses TO authenticated;
```

### 6. Criar Primeiro Usuário (Administrador)

1. Vá para "Authentication" no sidebar do Supabase
2. Clique em "Add User"
3. Insira o email e senha do administrador
4. O primeiro usuário criado será o dono da loja

### 7. Criar Primeira Loja

Execute este SQL para criar a primeira loja (substitua `SEU_USER_ID` pelo ID do usuário que você acabou de criar):

```sql
-- Obter o ID do primeiro usuário
SELECT id FROM auth.users LIMIT 1;

-- Criar a primeira loja (substitua SEU_USER_ID pelo ID obtido)
INSERT INTO stores (name, cnpj, address, phone, owner_id)
VALUES (
    'Minha Loja', 
    '00.000.000/0000-00', 
    'Endereço da loja', 
    '(00) 0000-0000',
    'SEU_USER_ID_AQUI'
);
```

## ✅ Verificação Final

1. **Variáveis de ambiente configuradas** ✓
2. **Tabelas criadas no Supabase** ✓
3. **RLS configurado** ✓
4. **Primeiro usuário criado** ✓
5. **Primeira loja criada** ✓

## 🚀 Próximos Passos

1. Reinicie o servidor de desenvolvimento: `npm run dev`
2. Acesse `http://localhost:5175`
3. Faça login com o usuário administrador
4. Comece a usar o sistema!

## 📞 Suporte

Se encontrar problemas:
1. Verifique as variáveis de ambiente
2. Confirme que as tabelas foram criadas
3. Verifique os logs no console do navegador
4. Consulte a documentação do Supabase

## 🔗 Links Úteis

- [Documentação do Supabase](https://supabase.com/docs)
- [Supabase Dashboard](https://app.supabase.com)
- [Render Deploy Guide](https://render.com/docs/deploy-static-site)