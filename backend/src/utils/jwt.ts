import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { CONFIG } from '../config';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateToken(payload: JwtPayload): string {
  const secret: Secret = CONFIG.JWT_SECRET;
  const options: SignOptions = { expiresIn: '7d' };
  return jwt.sign(payload, secret, options);
}

export function verifyToken(token: string): JwtPayload {
  const secret: Secret = CONFIG.JWT_SECRET;
  return jwt.verify(token, secret) as JwtPayload;
}
