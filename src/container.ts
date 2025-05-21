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

const userModule = {
  userRepository: asClass(UserRepository).singleton(),
  userService: asClass(UserService).singleton(),
  userController: asClass(UserController).singleton(),
};

const authModule = {
  authService: asClass(BetterAuthUserAdapter).singleton(),
  authController: asClass(AuthController).singleton(),
};

container.register({
  ...userModule,
  ...authModule,
  // Database
  prisma: asValue(prisma),
});

export { container };
