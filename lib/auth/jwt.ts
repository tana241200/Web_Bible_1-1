import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
export interface JwtPayload {
  userId: string;
  email: string;
  role:
    | 'ADMIN'
    | 'MEMBER'
    | 'PRE_REGISTERED_MENTOR';
}

export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
  });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}