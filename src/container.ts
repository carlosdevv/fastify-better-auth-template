import { InjectionMode, asClass, createContainer } from 'awilix';
import { BetterAuthUserAdapter } from './adapters/better-auth-user.adapter.ts';
import { UserService } from './services/user.service.ts';

const container = createContainer({
  injectionMode: InjectionMode.CLASSIC,
});

container.register({
  // Services
  userService: asClass(UserService).singleton(),
  authService: asClass(BetterAuthUserAdapter).singleton(),
});

export { container };
