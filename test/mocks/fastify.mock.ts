import { vi } from 'vitest';

export const createFastifyRequestMock = (overrides = {}) => {
  return {
    params: {},
    query: {},
    body: {},
    headers: {},
    log: {
      info: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      warn: vi.fn(),
    },
    session: {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
      },
    },
    ...overrides,
  };
};

export const createFastifyReplyMock = () => {
  const replyMock = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    code: vi.fn().mockReturnThis(),
    header: vi.fn().mockReturnThis(),
    headers: vi.fn().mockReturnThis(),
    type: vi.fn().mockReturnThis(),
    errorResponse: vi.fn().mockReturnThis(),
  };
  return replyMock;
};
