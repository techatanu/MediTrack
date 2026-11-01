import User from '../../src/models/User.js';
import { signToken } from '../../src/utils/token.js';

let ipCounter = 0;
// Each call gets its own client IP so per-IP rate limits don't leak between tests.
export const freshIp = () => {
  ipCounter += 1;
  return `10.0.${Math.floor(ipCounter / 250)}.${(ipCounter % 250) + 1}`;
};

let userCounter = 0;
export const createUser = async (overrides = {}) => {
  userCounter += 1;
  const password = overrides.password ?? 'correct-horse-battery';
  const user = await User.create({
    firstName: 'Test',
    email: `user${userCounter}@example.com`,
    ...overrides,
    password,
  });
  return { user, password, token: signToken(user) };
};

export const bearer = (token) => ({ Authorization: `Bearer ${token}` });
