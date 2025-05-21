import type { FastifyReply, FastifyRequest } from 'fastify';
import type { LoginDTO, SignUpDTO } from '../models/auth.model.ts';
import type { IAuthService } from '../services/interfaces/auth-service.interface.ts';
import type { IAuthController } from './interfaces/auth-controller.interface.ts';

export class AuthController implements IAuthController {
  private readonly authService: IAuthService;

  constructor({ authService }: { authService: IAuthService }) {
    this.authService = authService;
  }

  async signIn(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as LoginDTO;
      const response = await this.authService.signIn(body);

      return reply.status(200).send({
        message: 'Login successful',
        data: response,
      });
    } catch (error) {
      request.log.error(error);
      throw error;
    }
  }

  async signUp(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as SignUpDTO;
      const response = await this.authService.signUp(body);

      return reply.status(201).send({
        message: 'Signup successful',
        data: response,
      });
    } catch (error) {
      request.log.error(error);

      throw error;
    }
  }

  async signOut(request: FastifyRequest, reply: FastifyReply) {
    try {
      const authHeader = request.headers.authorization;

      if (!authHeader) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'Authorization header is required',
        });
      }

      const token = authHeader.split(' ')[1];

      await this.authService.signOut(token);

      return reply.status(200).send({
        message: 'Signout successful',
      });
    } catch (error) {
      request.log.error('Signout error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
      });
    }
  }

  async revokeSession(
    request: FastifyRequest<{ Params: { userId: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const { userId } = request.params;
      await this.authService.revokeSession(userId);

      return reply.status(200).send({
        success: true,
        message: 'Session revoked successfully',
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Error revoking session',
      });
    }
  }

  async revokeAllSessions(request: FastifyRequest, reply: FastifyReply) {
    try {
      await this.authService.revokeAllSessions();

      return reply.status(200).send({
        success: true,
        message: 'All sessions revoked successfully',
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Error revoking all sessions',
      });
    }
  }
}
