import { auth } from '../auth.ts';
import { prisma } from '../db/index.ts';
import type { LoginDTO } from '../models/auth.model.ts';
import type { CreateUserDTO } from '../models/user.model.ts';
import type {
  AuthResponse,
  IAuthService,
  UserInfo,
} from '../services/interfaces/auth-service.interface.ts';

export class BetterAuthUserAdapter implements IAuthService {
  async signIn(data: LoginDTO): Promise<AuthResponse> {
    try {
      const result = await auth.api.signInEmail({
        body: {
          email: data.email,
          password: data.password,
        },
      });

      const sessionData = await auth.api.getSession({
        headers: new Headers({
          Authorization: `Bearer ${result.token}`,
        }),
      });

      if (!sessionData) {
        throw new Error('Failed to get session');
      }

      return {
        user: {
          id: sessionData.user.id,
          email: sessionData.user.email,
          name: sessionData.user.name || undefined,
          role: sessionData.user.role || 'USER',
          emailVerified: sessionData.user.emailVerified,
        },
        token: {
          accessToken: result.token,
          expiresIn: 15 * 60, // 15 minutes in seconds
        },
      };
    } catch (error) {
      console.error('Login error:', error);

      throw error;
    }
  }

  async signUp(data: CreateUserDTO): Promise<AuthResponse> {
    try {
      const result = await auth.api.signUpEmail({
        body: {
          name: data.name,
          email: data.email,
          password: data.password,
        },
      });

      if (!result.user) {
        throw new Error('Failed to create user');
      }

      return {
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name || undefined,
          emailVerified: result.user.emailVerified,
        },
      };
    } catch (error) {
      console.error('Sign up error:', error);

      throw error;
    }
  }

  async validateToken(token: string): Promise<UserInfo | null> {
    try {
      const sessionData = await auth.api.getSession({
        headers: new Headers({
          Authorization: `Bearer ${token}`,
        }),
      });

      if (!sessionData) {
        return null;
      }

      return {
        id: sessionData.user.id,
        email: sessionData.user.email,
        name: sessionData.user.name || undefined,
        role: sessionData.user.role || 'USER',
        emailVerified: sessionData.user.emailVerified || false,
      };
    } catch (error) {
      console.error('Token validation error:', error);
      throw error;
    }
  }

  async signOut(token: string): Promise<void> {
    try {
      await auth.api.signOut({
        headers: new Headers({
          Authorization: `Bearer ${token}`,
        }),
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async getToken(): Promise<string | null> {
    try {
      const response = await auth.api.getSession({
        headers: new Headers(),
      });

      if (!response) {
        return null;
      }

      return response.session.token || null;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  async revokeSession(userId: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          sessions: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const revokePromises = user.sessions.map(async (session) => {
        await auth.api.revokeSession({
          body: {
            token: session.token,
          },
          headers: new Headers(),
        });
      });

      await Promise.all(revokePromises);
    } catch (error) {
      console.error('Revoke session error:', error);
      throw error;
    }
  }

  async revokeAllSessions(): Promise<void> {
    try {
      await auth.api.revokeSessions({
        headers: new Headers(),
      });
    } catch (error) {
      console.error('Revoke all sessions error:', error);
      throw error;
    }
  }
}
