import { afterEach, beforeEach, vi } from 'vitest';

beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});
