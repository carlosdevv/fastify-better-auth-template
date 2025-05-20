import type { SignUpDTO as CreateUserDTO, LoginDTO } from '../../models/auth.model.ts';

export interface TokenInfo {
  accessToken: string;
  expiresIn: number;
}

export interface UserInfo {
  id: string;
  email: string;
  name?: string;
  role?: string;
  emailVerified: boolean;
}

export interface AuthResponse {
  token?: TokenInfo;
  user: UserInfo;
}

export interface IAuthService {
  signIn(data: LoginDTO): Promise<AuthResponse | null>;
  signUp(data: CreateUserDTO): Promise<AuthResponse | null>;
  validateToken(token: string): Promise<UserInfo | null>;
  signOut(token: string): Promise<void>;
  revokeSession(userId: string): Promise<void>;
  revokeAllSessions(): Promise<void>;
  getToken(): Promise<string | null>;
}
