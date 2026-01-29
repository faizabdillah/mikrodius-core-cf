import { Context, Next } from 'hono'
import { verify, sign } from 'hono/jwt'

export type JWTPayload = {
    sub: string
    email: string
    workspaceId?: string
    nodeId?: string
    package?: string
    exp: number
}

export function getJwtSecret(c: Context): string {
    return (c.env as any).JWT_SECRET || 'dev-secret-change-in-production'
}

export async function authMiddleware(c: Context, next: Next) {
    const authHeader = c.req.header('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
        return c.json({ error: 'Unauthorized' }, 401)
    }

    const token = authHeader.slice(7)
    try {
        const payload = await verify(token, getJwtSecret(c), 'HS256') as JWTPayload
        c.set('user', payload)
        await next()
    } catch {
        return c.json({ error: 'Invalid token' }, 401)
    }
}

export async function createToken(c: Context, payload: Omit<JWTPayload, 'exp'>): Promise<string> {
    return await sign(
        { ...payload, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 }, // 7 days
        getJwtSecret(c)
    )
}
