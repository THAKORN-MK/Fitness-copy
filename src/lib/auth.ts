import jwt from 'jsonwebtoken'

export interface JWTPayload {
  userId: string
  email: string
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  )
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(
    token,
    process.env.JWT_SECRET || 'your-secret-key'
  ) as JWTPayload
}

export function getTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}