import jwt from 'jsonwebtoken';
import type { UserRoleCode } from '@/types/auth';

const JWT_SECRET = process.env.JWT_SECRET!;

// BREAKING CHANGE: "role" (single string) replaced with "roles" (string[]),
// since users can now hold multiple roles via the user_roles -> roles
// relation. Update any code reading payload.role to use payload.roles
// (e.g. payload.roles.includes('ADMIN')) instead.
export interface JwtPayload {
  userId: string;
  email: string;
  roles: UserRoleCode[];
}

export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
  });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
