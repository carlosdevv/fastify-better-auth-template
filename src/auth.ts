import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin, bearer, openAPI } from 'better-auth/plugins';
import { prisma } from './db/index.ts';

const auth = betterAuth({
  appName: 'Template API',
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  trustedOrigins: ['http://localhost:3333'],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 1 week
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 1 week
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    cookiePrefix: 'template-api',
  },
  plugins: [
    bearer(),
    admin(),
    openAPI({
      path: '/docs',
    }),
  ],
});

export type User = typeof auth.$Infer.Session.user;
export type Session = typeof auth.$Infer.Session;

export { auth };
