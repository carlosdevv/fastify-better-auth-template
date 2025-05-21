# Guia do Better-Auth

Este guia explica como o Better-Auth está configurado e como usá-lo em nosso projeto.

## O que é o Better-Auth?

Better-Auth é uma biblioteca moderna de autenticação para aplicações Node.js, especialmente otimizada para o Fastify. Ela fornece uma solução completa de autenticação com várias estratégias, gerenciamento de sessões, tokens JWT e muito mais.

## Configuração no Projeto

O Better-Auth está configurado no arquivo `src/auth.ts` com as seguintes configurações:

- **Nome da Aplicação**: "Template API"
- **Banco de Dados**: PostgreSQL via adaptador Prisma
- **Origens Confiáveis**: http://localhost:3333
- **Sessão**:
  - **Tempo de Expiração**: 7 dias (60 _ 60 _ 24 \* 7 segundos)
  - **Tempo para Atualização**: 1 dia (60 _ 60 _ 24 segundos)
  - **Cache de Cookies**: Habilitado com duração de 7 dias
- **Autenticação por Email/Senha**: Habilitada
- **Prefixo dos Cookies**: "template-api"

## Plugins Utilizados

O Better-Auth no projeto utiliza três plugins principais:

### 1. Plugin Bearer (`bearer()`)

- **Função**: Habilita autenticação via token Bearer em cabeçalhos HTTP
- **Uso Prático**: Permite autenticar requisições usando o formato `Authorization: Bearer <token>`
- **Vantagem**: Facilita a integração com clientes frontend e ferramentas de API

### 2. Plugin Admin (`admin()`)

- **Função**: Adiciona funcionalidades para gerenciamento de permissões administrativas
- **Uso Prático**: Permite controlar acesso a rotas administrativas com `fastify.isAdmin`
- **Vantagem**: Simplifica o controle de acesso baseado em papéis (RBAC)

### 3. Plugin OpenAPI (`openAPI()`)

- **Função**: Integra a documentação de autenticação com o Swagger/OpenAPI
- **Uso Prático**: Disponibiliza endpoints de autenticação na documentação em `/api/docs`
- **Vantagem**: Facilita o teste e o entendimento dos endpoints de autenticação

## Esquema do Banco de Dados

O Better-Auth utiliza as seguintes tabelas no banco de dados PostgreSQL (via Prisma):

- **user**: Armazena dados dos usuários (id, email, nome, etc.)
- **session**: Guarda informações sobre sessões ativas
- **account**: Armazena credenciais de autenticação
- **verification**: Usada para processos de verificação (como reset de senha)

## Integração com Fastify

O projeto utiliza o pacote `fastify-better-auth` para integrar o Better-Auth com o Fastify:

```typescript
// src/plugins/internal/authentication.ts
import FastifyBetterAuth from "fastify-better-auth";

async function authPlugin(fastify: FastifyInstance) {
  fastify.decorate("auth", auth);
  await fastify.register(FastifyBetterAuth, { auth });
}
```

## Decorators de Autenticação

O projeto implementa dois decorators principais para proteção de rotas:

### 1. `authenticate`

Verifica se o usuário está autenticado:

```typescript
// Exemplo de uso
fastify.route({
  method: "GET",
  url: "/profile",
  preHandler: [fastify.authenticate],
  handler: async (request, reply) => {
    // Acesso aos dados do usuário via request.session.user
    const user = request.session.user;
    return { profile: user };
  },
});
```

### 2. `isAdmin`

Verifica se o usuário é administrador:

```typescript
// Exemplo de uso
fastify.route({
  method: "GET",
  url: "/admin-only",
  preHandler: [fastify.authenticate, fastify.isAdmin],
  handler: async (request, reply) => {
    // Acesso restrito a administradores
    return { message: "Área administrativa" };
  },
});
```

## Fluxo de Autenticação

### 1. Registro de Usuário

```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "senha123",
  "name": "Nome do Usuário"
}
```

### 2. Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "senha123"
}
```

Resposta:

```json
{
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1...",
    "expiresIn": 60 * 60 * 24 * 7,
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "usuario@example.com",
      "name": "Nome do Usuário"
    }
  }
}
```

### 3. Uso do Access Token

Para acessar endpoints protegidos:

```http
GET /api/users
Authorization: Bearer eyJhbGciOiJIUzI1...
```

### 4. Logout

```http
POST /api/auth/logout
```

## Adaptador de Autenticação

O projeto implementa o padrão Adapter para interagir com o Better-Auth através da classe `BetterAuthUserAdapter`:

```typescript
// src/adapters/better-auth-user.adapter.ts
export class BetterAuthUserAdapter implements IAuthService {
  async signIn(data: LoginDTO): Promise<AuthResponse> {
    // Implementação usando auth.api.signInEmail
  }

  async signUp(data: CreateUserDTO): Promise<AuthResponse> {
    // Implementação usando auth.api.signUpEmail
  }

  async validateToken(token: string): Promise<UserInfo | null> {
    // Implementação usando auth.api.getSession
  }

  // Outros métodos...
}
```

## Gestão de Sessões Administrativas

O plugin Admin permite gerenciar sessões dos usuários:

### Revogar Sessões de Usuário

```http
POST /api/admin/revoke-session/:userId
Authorization: Bearer eyJhbGciOiJIUzI1...
```

### Revogar Todas as Sessões

```http
POST /api/admin/revoke-sessions
Authorization: Bearer eyJhbGciOiJIUzI1...
```

## Implementando Novas Funcionalidades

### Protegendo Uma Nova Rota

```typescript
fastify.route({
  method: "GET",
  url: "/dados-protegidos",
  preHandler: [fastify.authenticate], // Adicione este middleware
  handler: async (request, reply) => {
    // Sua lógica aqui
    return { dados: "Informações protegidas" };
  },
});
```

### Verificando o Usuário Atual

```typescript
// Acesso aos dados do usuário via request.session
const usuario = request.session.user;
if (usuario.id === idSolicitado || usuario.role === "ADMIN") {
  // Permitir acesso
}
```

## Considerações de Segurança

- Não armazene Access Tokens no localStorage (vulnerável a XSS)
- Não modifique o tempo de expiração do Access Token sem considerar os riscos
- Não desative os cookies HTTP-only para os Refresh Tokens
- Refresh Tokens são rotacionados após cada uso (implementado automaticamente)
- Utilize HTTPS em ambientes de produção
- Configure adequadamente as políticas CSP (Content Security Policy)
- Utilize o CORS de forma restritiva em produção

## Testes e Depuração

Para testar endpoints protegidos:

- Utilize a documentação OpenAPI disponível em `/api/docs`
- Use ferramentas como Postman/Insomnia com tokens Bearer
- Os logs do sistema incluem informações detalhadas sobre eventos de autenticação
