import { Hono } from 'hono'
import { createToken, getJwtSecret } from '../middleware/auth'

type Bindings = {
    DB: D1Database
    GOOGLE_CLIENT_ID: string
    GOOGLE_CLIENT_SECRET: string
    GOOGLE_REDIRECT_URI: string
}

const auth = new Hono<{ Bindings: Bindings }>()

// Login
auth.post('/login', async (c) => {
    const { email, password } = await c.req.json()

    if (!email || !password) {
        return c.json({ error: 'Email and password required' }, 400)
    }

    const user = await c.env.DB.prepare(
        'SELECT id, email, password_hash, name FROM users WHERE email = ?'
    ).bind(email).first()

    if (!user) {
        return c.json({ error: 'Invalid credentials' }, 401)
    }

    if (user.password_hash !== password) {
        return c.json({ error: 'Invalid credentials' }, 401)
    }

    const token = await createToken(c, {
        sub: user.id as string,
        email: user.email as string,
    })

    return c.json({
        token,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
        },
    })
})

// Register
auth.post('/register', async (c) => {
    const { email, password, name } = await c.req.json()

    if (!email || !password) {
        return c.json({ error: 'Email and password required' }, 400)
    }

    const existing = await c.env.DB.prepare(
        'SELECT id FROM users WHERE email = ?'
    ).bind(email).first()

    if (existing) {
        return c.json({ error: 'Email already registered' }, 400)
    }

    const id = crypto.randomUUID()

    await c.env.DB.prepare(
        'INSERT INTO users (id, email, password_hash, name, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(id, email, password, name || null, Math.floor(Date.now() / 1000)).run()

    const token = await createToken(c, { sub: id, email })

    return c.json({
        token,
        user: { id, email, name },
    })
})

// Get current user profile
auth.get('/me', async (c) => {
    const authHeader = c.req.header('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
        return c.json({ error: 'Unauthorized' }, 401)
    }

    const { verify } = await import('hono/jwt')
    const token = authHeader.slice(7)

    try {
        const payload = await verify(token, getJwtSecret(c), 'HS256')

        const user = await c.env.DB.prepare(
            'SELECT id, email, name, created_at FROM users WHERE id = ?'
        ).bind(payload.sub).first()

        if (!user) {
            return c.json({ error: 'User not found' }, 404)
        }

        const workspaces = await c.env.DB.prepare(
            'SELECT id, name, slug, package, status FROM workspaces WHERE user_id = ?'
        ).bind(payload.sub).all()

        return c.json({
            user,
            workspaces: workspaces.results,
        })
    } catch {
        return c.json({ error: 'Invalid token' }, 401)
    }
})

// Google OAuth - Redirect to Google
auth.get('/google', (c) => {
    const clientId = c.env.GOOGLE_CLIENT_ID
    const redirectUri = c.env.GOOGLE_REDIRECT_URI || `${new URL(c.req.url).origin}/auth/google/callback`

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'offline',
        prompt: 'consent',
    })

    return c.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
})

// Google OAuth - Callback
auth.get('/google/callback', async (c) => {
    const code = c.req.query('code')
    const error = c.req.query('error')

    if (error) {
        return c.redirect('http://localhost:5173/login?error=google_denied')
    }

    if (!code) {
        return c.redirect('http://localhost:5173/login?error=no_code')
    }

    const clientId = c.env.GOOGLE_CLIENT_ID
    const clientSecret = c.env.GOOGLE_CLIENT_SECRET
    const redirectUri = c.env.GOOGLE_REDIRECT_URI || `${new URL(c.req.url).origin}/auth/google/callback`

    try {
        // Exchange code for tokens
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            }),
        })

        const tokenData = await tokenRes.json() as { access_token?: string; error?: string }

        if (!tokenData.access_token) {
            return c.redirect('http://localhost:5173/login?error=token_failed')
        }

        // Get user info from Google
        const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        })

        const googleUser = await userRes.json() as { email: string; name?: string; sub: string }

        // Find or create user
        let user = await c.env.DB.prepare(
            'SELECT id, email, name FROM users WHERE email = ?'
        ).bind(googleUser.email).first()

        if (!user) {
            const id = crypto.randomUUID()
            await c.env.DB.prepare(
                'INSERT INTO users (id, email, password_hash, name, created_at) VALUES (?, ?, ?, ?, ?)'
            ).bind(id, googleUser.email, `google:${googleUser.sub}`, googleUser.name || null, Math.floor(Date.now() / 1000)).run()

            user = { id, email: googleUser.email, name: googleUser.name || null }
        }

        // Create JWT
        const token = await createToken(c, {
            sub: user.id as string,
            email: user.email as string,
        })

        // Redirect to frontend with token
        return c.redirect(`http://localhost:5173/auth/callback?token=${token}`)
    } catch (err) {
        console.error('Google OAuth error:', err)
        return c.redirect('http://localhost:5173/login?error=oauth_failed')
    }
})

export default auth
