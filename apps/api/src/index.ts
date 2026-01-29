import { Hono } from 'hono'
import { cors } from 'hono/cors'

import auth from './routes/auth'
import workspaces from './routes/workspaces'
import subscribers from './routes/subscribers'
import plans from './routes/plans'
import invoices from './routes/invoices'
import tags from './routes/tags'

type Bindings = {
    DB: D1Database
    CACHE: KVNamespace
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS
app.use('/*', cors())

// Health check
app.get('/', (c) => c.json({ message: 'Mikrodius API', version: '1.0.0' }))
app.get('/health', (c) => c.json({ status: 'ok' }))

// Package config (public, cached)
app.get('/config/packages', async (c) => {
    const cached = await c.env.CACHE.get('packages', 'json')
    if (cached) return c.json(cached)

    const result = await c.env.DB.prepare('SELECT * FROM packages').all()
    const packages: Record<string, any> = {}
    for (const row of result.results) {
        packages[row.name as string] = {
            max_nas: row.max_nas,
            max_subscribers: row.max_subscribers,
            max_devices: row.max_devices,
            rate_limit: row.rate_limit,
        }
    }
    await c.env.CACHE.put('packages', JSON.stringify(packages), { expirationTtl: 3600 })
    return c.json(packages)
})

// Routes
app.route('/auth', auth)
app.route('/workspaces', workspaces)
app.route('/subscribers', subscribers)
app.route('/plans', plans)
app.route('/invoices', invoices)
app.route('/tags', tags)

export default app
