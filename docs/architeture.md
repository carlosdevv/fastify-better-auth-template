# Arquitetura do Aplicativo

Este documento explica a arquitetura, padrões e conceitos utilizados no desenvolvimento deste aplicativo. É um guia para desenvolvedores que estão começando a trabalhar com o projeto ou que precisam entender seus fundamentos arquiteturais.

## Estrutura de Diretórios

```
src/
├── adapters/        # Adaptadores para serviços externos
├── config/          # Configurações do aplicativo
├── controllers/     # Controladores das rotas
├── db/              # Configuração do banco de dados
├── errors/          # Tratamento de erros centralizado
├── models/          # Definições de tipos e schemas
├── plugins/         # Plugins Fastify
│   ├── external/    # Plugins de terceiros
│   └── internal/    # Plugins desenvolvidos internamente
├── repositories/    # Camada de acesso ao banco de dados
├── routes/          # Definição das rotas da API
├── services/        # Lógica de negócio
├── app.ts           # Configuração do aplicativo Fastify
├── auth.ts          # Configuração do Better-Auth
├── container.ts     # Configuração do container de DI
└── server.ts        # Ponto de entrada da aplicação
```

## Padrões Arquiteturais

### 1. Arquitetura em Camadas

O aplicativo segue uma arquitetura em camadas clássica:

```
Cliente → Controllers → Services → Repositories → Banco de Dados
```

- **Controllers**: Lidam com requisições HTTP e respostas
- **Services**: Contêm a lógica de negócio
- **Repositories**: Fornecem acesso ao banco de dados
- **Adapters**: Fornecem integração com serviços externos

### 2. Injeção de Dependências (DI)

#### O que é DI?

Injeção de Dependências é um padrão de design onde as dependências de um componente são "injetadas" de fora, em vez de serem criadas internamente. Isso promove:

1. **Desacoplamento**: Classes não dependem diretamente de implementações concretas
2. **Testabilidade**: Facilita testes unitários com mocks
3. **Flexibilidade**: Permite trocar implementações sem alterar o código cliente

#### Como Implementamos DI?

Usamos a biblioteca [Awilix](https://github.com/jeffijoe/awilix) para gerenciar as dependências. Os componentes são registrados no container e são resolvidos automaticamente:

```typescript
// src/container.ts
import { InjectionMode, asClass, asValue, createContainer } from 'awilix';
import { BetterAuthUserAdapter } from './adapters/better-auth-user.adapter.ts';
import { AuthController } from './controllers/auth.controller.ts';
import { UserController } from './controllers/user.controller.ts';
import { prisma } from './db/index.ts';
import { UserRepository } from './repositories/user-repository.ts';
import { UserService } from './services/user.service.ts';

const container = createContainer({
  injectionMode: InjectionMode.CLASSIC,
});

container.register({
  // Database
  prisma: asValue(prisma),
  
  // Repositories
  userRepository: asClass(UserRepository).singleton(),
  
  // Services
  userService: asClass(UserService).singleton(),
  authService: asClass(BetterAuthUserAdapter).singleton(),

  // Controllers
  userController: asClass(UserController).singleton(),
  authController: asClass(AuthController).singleton(),
});
```

#### Registro de Componentes

- **asValue**: Registra um valor já instanciado (como a instância `prisma`)
- **asClass**: Registra uma classe que será instanciada automaticamente
- **asFunction**: Registra uma função que será chamada automaticamente
- **singleton()**: Garante que apenas uma instância será criada e reutilizada
- **transient()**: Garante que uma nova instância será criada sempre que solicitada

#### Injeção Via Construtor

Os componentes recebem suas dependências através de construtores que usam objetos nomeados, permitindo que o Awilix os resolva automaticamente:

```typescript
// Exemplo: src/controllers/user.controller.ts
export class UserController implements IUserController {
  private readonly userService: IUserService;

  constructor({ userService }: { userService: IUserService }) {
    this.userService = userService;
  }
  
  // Métodos...
}
```

#### Resolução de Dependências

Quando um componente é solicitado, o Awilix automaticamente:
1. Identifica suas dependências a partir dos parâmetros do construtor
2. Resolve recursivamente cada dependência
3. Instancia o componente passando as dependências resolvidas

```typescript
// src/routes/index.ts
export async function registerRoutes(fastify: FastifyInstance) {
  // Resolve controllers diretamente do container
  const userController = container.resolve('userController');
  const authController = container.resolve('authController');
  
  // Usa os controllers já instanciados para configurar rotas
  // ...
}
```

#### Por que Usar DI?

1. **Facilita testes**: Podemos substituir dependências reais por mocks
2. **Melhora a manutenção**: Reduz acoplamento entre componentes
3. **Centraliza a configuração**: Todas as dependências são definidas em um único lugar
4. **Promove interfaces bem definidas**: Classes dependem de interfaces, não implementações

### 3. Configuração de Rotas

As rotas são organizadas em módulos funcionais, cada um recebendo os controllers necessários via DI:

```typescript
// src/routes/api/user.routes.ts
export function setupUserRoutes(fastify: FastifyInstance, userController: UserController) {
  fastify.route({
    method: 'GET',
    url: '/',
    // Configuração...
    handler: userController.getUsers.bind(userController),
  });
  
  // Outras rotas...
}
```

E registradas no arquivo principal de rotas:

```typescript
// src/routes/index.ts
export async function registerRoutes(fastify: FastifyInstance) {
  const userController = container.resolve('userController');
  const authController = container.resolve('authController');

  fastify.register(
    async (instance) => {
      setupUserRoutes(instance, userController);
    },
    { prefix: '/api/users' },
  );
  
  // Outras rotas...
}
```

### 4. Sistema de Tratamento de Erros

#### Estrutura de Erros

O aplicativo usa um sistema centralizado de erros definido em `src/errors/`:

- `app-error.ts`: Define a classe base `AppError` e enums para domínios e tipos de erro
- `common-errors.ts`: Define erros específicos (NotFound, Unauthorized, etc.)

#### Principais Conceitos

1. **Domínios de Erro**: Categoriza os erros por área funcional
   ```typescript
   export enum ErrorDomain {
     AUTH = 'AUTH',
     USER = 'USER',
     ADMIN = 'ADMIN',
     SYSTEM = 'SYSTEM',
     VALIDATION = 'VALIDATION',
     EXTERNAL = 'EXTERNAL',
   }
   ```

2. **Tipos de Erro**: Categoriza os erros por natureza
   ```typescript
   export enum ErrorType {
     NOT_FOUND = 'NOT_FOUND',
     UNAUTHORIZED = 'UNAUTHORIZED',
     FORBIDDEN = 'FORBIDDEN',
     // ...outros tipos
   }
   ```

3. **Códigos de Erro**: Gerados automaticamente no formato `DOMAIN-TYPE-TIMESTAMP`

#### Como Usar o Sistema de Erros

Para lançar um erro em sua lógica de negócios:

```typescript
import { ErrorDomain } from '../errors/app-error';
import { NotFoundError } from '../errors/common-errors';

// Em um serviço ou controlador
if (!user) {
  throw new NotFoundError(
    'Usuário não encontrado',
    ErrorDomain.USER,
    { userId: requestedId }
  );
}
```

### 5. Plugins Fastify

O aplicativo usa o sistema de plugins do Fastify para estender sua funcionalidade:

#### Estrutura de Plugins

- `plugins/external/`: Plugins de terceiros (Swagger, Sensible, etc.)
- `plugins/internal/`: Plugins desenvolvidos internamente (autenticação, admin, etc.)

#### Plugins Principais

1. **Authentication**: Integra o Better-Auth com o Fastify
2. **Session**: Gerencia sessões de usuário
3. **Admin**: Implementa o controle de acesso para administradores
4. **DB**: Configura a conexão com o banco de dados

### 6. Padrão de Adaptadores

#### O que é um Adaptador?

O padrão Adapter permite que interfaces incompatíveis trabalhem juntas. Em nosso aplicativo, usamos adaptadores para:

1. Integrar serviços externos
2. Abstrair detalhes de implementação
3. Facilitar testes e mocks

#### Exemplo de Adaptador

O `BetterAuthUserAdapter` implementa a interface `IAuthService` e adapta as funcionalidades do Better-Auth:

```typescript
export class BetterAuthUserAdapter implements IAuthService {
  private readonly prisma: PrismaClient;

  constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma;
  }

  async signIn(data: LoginDTO): Promise<AuthResponse> {
    // Implementa signIn usando Better-Auth
  }
  
  // Outros métodos...
}
```

## Fluxo de Requisições

1. **Entrada**: A requisição chega ao servidor via `server.ts`
2. **Roteamento**: O Fastify direciona para a rota apropriada
3. **Middlewares/Plugins**: Executam autenticação, validação, etc.
4. **Controller**: Processa a requisição e chama os serviços necessários
5. **Service**: Executa a lógica de negócio
6. **Repository/Adapter**: Acessa dados ou serviços externos
7. **Resposta**: O resultado retorna pelo mesmo caminho

## Adicionando um Novo Domínio de Negócio

Para adicionar um novo domínio (ex: "Produtos"):

1. **Modelo**: Crie tipos e schemas em `src/models/product.model.ts`
2. **Interface do Repositório**: Defina em `src/repositories/interfaces/product-repository.interface.ts`
3. **Repositório**: Implemente em `src/repositories/product.repository.ts`
4. **Interface do Serviço**: Defina em `src/services/interfaces/product-service.interface.ts`
5. **Serviço**: Implemente em `src/services/product.service.ts`
6. **Controlador**: Crie em `src/controllers/product.controller.ts`
7. **Rotas**: Configure em `src/routes/api/product.routes.ts`
8. **Erros**: Se necessário, adicione o domínio em `ErrorDomain`
9. **DI**: Registre os componentes em `src/container.ts`
10. **Configuração de Rotas**: Atualize `src/routes/index.ts`
11. **Testes**: Crie testes unitários e de integração

### Exemplo Completo

#### 1. Interface do Repositório
```typescript
// src/repositories/interfaces/product-repository.interface.ts
import type { Prisma, Product } from '@prisma/client';

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findMany(): Promise<Product[]>;
  create(data: Prisma.ProductCreateInput): Promise<Product>;
  update(id: string, data: Prisma.ProductUpdateInput): Promise<Product>;
  delete(id: string): Promise<Product>;
}
```

#### 2. Implementação do Repositório
```typescript
// src/repositories/product.repository.ts
import type { Prisma, PrismaClient, Product } from '@prisma/client';
import type { IProductRepository } from './interfaces/product-repository.interface';

export class ProductRepository implements IProductRepository {
  private readonly prisma: PrismaClient;

  constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma;
  }

  async findById(id: string): Promise<Product | null> {
    return this.prisma.product.findUnique({ where: { id } });
  }
  
  // Outros métodos...
}
```

#### 3. Interface do Serviço
```typescript
// src/services/interfaces/product-service.interface.ts
import type { Product } from '@prisma/client';
import type { CreateProductDTO, UpdateProductDTO } from '../../models/product.model';

export interface IProductService {
  getProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product>;
  // Outros métodos...
}
```

#### 4. Implementação do Serviço
```typescript
// src/services/product.service.ts
import type { Product } from '@prisma/client';
import { ErrorDomain } from '../errors/app-error';
import { NotFoundError } from '../errors/common-errors';
import type { IProductRepository } from '../repositories/interfaces/product-repository.interface';
import type { IProductService } from './interfaces/product-service.interface';

export class ProductService implements IProductService {
  private readonly productRepository: IProductRepository;

  constructor({ productRepository }: { productRepository: IProductRepository }) {
    this.productRepository = productRepository;
  }

  async getProducts(): Promise<Product[]> {
    return this.productRepository.findMany();
  }
  
  // Outros métodos...
}
```

#### 5. Controlador
```typescript
// src/controllers/product.controller.ts
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { IProductService } from '../services/interfaces/product-service.interface';

export class ProductController {
  private readonly productService: IProductService;

  constructor({ productService }: { productService: IProductService }) {
    this.productService = productService;
  }

  async getProducts(request: FastifyRequest, reply: FastifyReply) {
    // Implementação...
  }
  
  // Outros métodos...
}
```

#### 6. Configuração de Rotas
```typescript
// src/routes/api/product.routes.ts
import type { FastifyInstance } from 'fastify';
import type { ProductController } from '../../controllers/product.controller';

export function setupProductRoutes(fastify: FastifyInstance, productController: ProductController) {
  fastify.route({
    method: 'GET',
    url: '/',
    // Configuração...
    handler: productController.getProducts.bind(productController),
  });
  
  // Outras rotas...
}
```

#### 7. Registro no Container
```typescript
// src/container.ts - Adicionar ao container existente
container.register({
  // Componentes existentes...
  productRepository: asClass(ProductRepository).singleton(),
  productService: asClass(ProductService).singleton(),
  productController: asClass(ProductController).singleton(),
});
```

#### 8. Atualização do Registro de Rotas
```typescript
// src/routes/index.ts - Adicionar ao registerRoutes
export async function registerRoutes(fastify: FastifyInstance) {
  // Resolução de controllers existentes...
  const productController = container.resolve('productController');
  
  // Registro de rotas existentes...
  
  fastify.register(
    async (instance) => {
      setupProductRoutes(instance, productController);
    },
    { prefix: '/api/products' },
  );
}
```

## Melhores Práticas

1. **Mantenha as Responsabilidades Separadas**:
   - Controllers: Apenas tratam requisições HTTP
   - Services: Contêm toda a lógica de negócio
   - Repositories: Lidam apenas com acesso a dados

2. **Tratamento de Erros**:
   - Use os erros padronizados do sistema
   - Sempre especifique um domínio apropriado
   - Adicione detalhes úteis para depuração

3. **Validação de Dados**:
   - Valide todos os inputs do usuário
   - Use schemas Zod para validar requisições
   - Converta schemas Zod para JSON Schema para documentação

4. **Injeção de Dependências**:
   - Registre todos os componentes no container
   - Use interface para definir contratos entre componentes 
   - Prefira injeção via construtor com objetos nomeados
   - Use singleton para a maioria dos componentes

5. **Testes**:
   - Escreva testes unitários para Services e Repositories
   - Use mocks para dependências externas
   - Teste cenários de erro além dos casos de sucesso

6. **Logs**:
   - Use o logger do Fastify (`request.log` ou `fastify.log`)
   - Inclua contexto suficiente para depuração
   - Use níveis de log apropriados (info, warn, error)

## Conclusão

Esta arquitetura foi projetada para ser:

- **Modular**: Componentes isolados e independentes
- **Extensível**: Fácil adicionar novos recursos
- **Testável**: Facilita a escrita de testes
- **Manutenível**: Estrutura clara e consistente

Ao seguir estes padrões e conceitos, você ajudará a manter a qualidade e consistência do código em todo o projeto.
