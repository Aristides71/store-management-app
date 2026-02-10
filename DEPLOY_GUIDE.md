# 🚀 Guia Completo de Deploy: GitHub + Render

Este guia irá ensinar você a fazer deploy do seu Store Management App no Render usando GitHub.

## 📋 Pré-requisitos

- [ ] Conta no GitHub
- [ ] Conta no Render (gratuito)
- [ ] Projeto configurado localmente
- [ ] Supabase configurado (verifique `SUPABASE_SETUP.md`)

## 🔧 Passo 1: Configurar GitHub

### 1.1 Criar Repositório no GitHub

1. Acesse [github.com](https://github.com)
2. Clique no "+" no canto superior direito
3. Selecione "New repository"
4. Configure:
   - **Repository name**: `store-management-app`
   - **Description**: `Sistema de gerenciamento empresarial para lojas`
   - **Public** (recomendado para deploy gratuito)
   - **Initialize repository**: ❌ NÃO marque nenhuma opção
5. Clique em "Create repository"

### 1.2 Conectar seu Projeto Local ao GitHub

No terminal, dentro da pasta do seu projeto:

```bash
# Adicionar o repositório remoto
git remote add origin https://github.com/SEU_USUARIO/store-management-app.git

# Subir o código para o GitHub
git push -u origin main
```

Substitua `SEU_USUARIO` pelo seu nome de usuário do GitHub.

## 🚀 Passo 2: Configurar Deploy no Render

### 2.1 Criar Conta no Render

1. Acesse [render.com](https://render.com)
2. Faça login com sua conta do GitHub
3. Verifique seu email

### 2.2 Criar Web Service

1. No dashboard do Render, clique em "New" → "Web Service"
2. Conecte sua conta do GitHub (se ainda não estiver conectada)
3. Procure por `store-management-app` na lista de repositórios
4. Configure o deploy:

#### Configurações Básicas:
- **Name**: `store-management-app`
- **Branch**: `main`
- **Root Directory**: `./`
- **Build Command**: `npm run build:render`
- **Publish Directory**: `dist`

#### Environment Variables:
Adicione as variáveis do seu Supabase:
- `VITE_SUPABASE_URL`: Cole sua URL do Supabase
- `VITE_SUPABASE_ANON_KEY`: Cole sua chave anônima do Supabase

#### Advanced Settings:
- **Instance Type**: Free (Starter)
- **Auto Deploy**: Yes (recomendado)

5. Clique em "Create Web Service"

### 2.3 Aguardar Deploy

O Render irá:
1. Clonar seu repositório
2. Instalar dependências
3. Compilar o projeto
4. Fazer deploy

**Tempo estimado**: 2-5 minutos

## ✅ Passo 3: Verificar Deploy

### 3.1 Verificar Status

1. No dashboard do Render, clique no seu serviço
2. Verifique os logs do deploy
3. Aguarde o status ficar "Live"

### 3.2 Acessar Aplicação

1. Clique no link gerado (ex: `https://store-management-app.onrender.com`)
2. Você verá a tela de login do seu app!

## 🔧 Passo 4: Configurar Deploy Automático

### 4.1 Ativar Auto Deploy

1. No dashboard do Render, vá para seu serviço
2. Clique em "Settings"
3. Em "Deploy Hooks", clique em "Generate"
4. Copie o webhook URL

### 4.2 Configurar no GitHub

1. Vá para seu repositório no GitHub
2. Clique em "Settings" → "Webhooks"
3. Clique em "Add webhook"
4. Cole o webhook URL do Render
5. Content type: `application/json`
6. Events: Selecione "Just the push event"
7. Clique em "Add webhook"

Agora, toda vez que você fizer push para o GitHub, o Render fará deploy automaticamente!

## 🔄 Fluxo de Trabalho Completo

```mermaid
graph TD
    A[Desenvolvimento Local] -->|git add .| B[Stage Changes]
    B -->|git commit -m "mensagem"| C[Commit Local]
    C -->|git push origin main| D[Push to GitHub]
    D -->|Webhook Trigger| E[Render Deploy]
    E -->|Build & Deploy| F[Aplicação Online]
    F -->|Teste| A
```

## 🛠️ Comandos Úteis

```bash
# Status do Git
git status

# Ver logs de commits
git log --oneline

# Ver branches
git branch -a

# Push para GitHub
git push origin main

# Pull atualizações
git pull origin main
```

## 🚨 Solução de Problemas

### Problema: Deploy falhou

1. Verifique os logs no Render
2. Confirme que todas as variáveis de ambiente estão configuradas
3. Teste o build localmente: `npm run build`

### Problema: Página em branco

1. Verifique o console do navegador (F12)
2. Confirme que as variáveis do Supabase estão corretas
3. Verifique se o banco de dados está configurado

### Problema: Erro de CORS

1. No Supabase, vá para "Authentication" → "Settings"
2. Em "Site URL", adicione sua URL do Render
3. Salve as alterações

## 📊 Monitoramento

### Render Dashboard
- **Metrics**: Monitorar uso de recursos
- **Logs**: Ver logs de acesso e erros
- **Deploys**: Histórico de deploys

### Supabase Dashboard
- **Usage**: Monitorar uso do banco de dados
- **Logs**: Ver queries e erros
- **Performance**: Analisar performance

## 🔒 Segurança

### Ambiente de Produção
- Use HTTPS (Render fornece automaticamente)
- Configure CORS no Supabase
- Use senhas fortes para o Supabase
- Ative 2FA no GitHub e Render

### Variáveis de Ambiente
- Nunca commite o arquivo `.env`
- Use variáveis de ambiente no Render
- Rotacione chaves regularmente

## 🎯 Próximos Passos

1. **Customizar Domínio**: Configure um domínio personalizado
2. **SSL**: O Render fornece SSL automático
3. **Backup**: Configure backup do banco de dados
4. **Monitoramento**: Configure alertas de erro
5. **Performance**: Otimize para melhor performance

## 📞 Suporte

Se precisar de ajuda:
1. Verifique os logs do Render
2. Confira a documentação do [Render](https://render.com/docs)
3. Confira a documentação do [Supabase](https://supabase.com/docs)
4. Abra uma issue no GitHub

## 🎉 Parabéns!

Seu Store Management App está agora online e pronto para uso! 🚀

**URL do seu app**: `https://store-management-app.onrender.com`

Lembre-se de:
- Configurar o Supabase (ver `SUPABASE_SETUP.md`)
- Criar seu primeiro usuário administrador
- Começar a usar o sistema!

---

**Deploy automatizado configurado com sucesso!** ✅

Toda vez que você fizer push para o GitHub, o Render fará deploy automaticamente.