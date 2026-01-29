import { Hono } from 'hono'
import { authMiddleware, JWTPayload } from '../middleware/auth'

type Bindings = {
    DB: D1Database
    CACHE: KVNamespace
}

type Variables = {
    user: JWTPayload
}

const workspaces = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// All routes require auth
workspaces.use('/*', authMiddleware)

// List user's workspaces
workspaces.get('/', async (c) => {
    const user = c.get('user')

    const result = await c.env.DB.prepare(
        'SELECT w.*, n.name as node_name, n.region FROM workspaces w LEFT JOIN nodes n ON w.node_id = n.id WHERE w.user_id = ?'
    ).bind(user.sub).all()

    return c.json({ workspaces: result.results })
})

// Create workspace
workspaces.post('/', async (c) => {
    const user = c.get('user')
    const { name, slug } = await c.req.json()

    if (!name || !slug) {
        return c.json({ error: 'Name and slug required' }, 400)
    }

    // Check slug uniqueness
    const existing = await c.env.DB.prepare(
        'SELECT id FROM workspaces WHERE slug = ?'
    ).bind(slug).first()

    if (existing) {
        return c.json({ error: 'Slug already taken' }, 400)
    }

    const id = crypto.randomUUID()

    await c.env.DB.prepare(
        'INSERT INTO workspaces (id, user_id, name, slug, package, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(id, user.sub, name, slug, 'starter', 'active', Math.floor(Date.now() / 1000)).run()

    return c.json({ id, name, slug, package: 'starter', status: 'active' }, 201)
})

// Get single workspace
workspaces.get('/:id', async (c) => {
    const user = c.get('user')
    const id = c.req.param('id')

    const workspace = await c.env.DB.prepare(
        'SELECT w.*, n.name as node_name, n.acs_url, n.radius_url FROM workspaces w LEFT JOIN nodes n ON w.node_id = n.id WHERE w.id = ? AND w.user_id = ?'
    ).bind(id, user.sub).first()

    if (!workspace) {
        return c.json({ error: 'Workspace not found' }, 404)
    }

    return c.json(workspace)
})

// Update workspace
workspaces.put('/:id', async (c) => {
    const user = c.get('user')
    const id = c.req.param('id')
    const { name, nodeId } = await c.req.json()

    // Verify ownership
    const existing = await c.env.DB.prepare(
        'SELECT id FROM workspaces WHERE id = ? AND user_id = ?'
    ).bind(id, user.sub).first()

    if (!existing) {
        return c.json({ error: 'Workspace not found' }, 404)
    }

    const updates: string[] = []
    const values: any[] = []

    if (name) {
        updates.push('name = ?')
        values.push(name)
    }
    if (nodeId) {
        updates.push('node_id = ?')
        values.push(nodeId)
    }

    if (updates.length === 0) {
        return c.json({ error: 'No fields to update' }, 400)
    }

    values.push(id)
    await c.env.DB.prepare(
        `UPDATE workspaces SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...values).run()

    return c.json({ success: true })
})

// Delete workspace
workspaces.delete('/:id', async (c) => {
    const user = c.get('user')
    const id = c.req.param('id')

    const result = await c.env.DB.prepare(
        'DELETE FROM workspaces WHERE id = ? AND user_id = ?'
    ).bind(id, user.sub).run()

    if (result.meta.changes === 0) {
        return c.json({ error: 'Workspace not found' }, 404)
    }

    return c.json({ success: true })
})

export default workspaces
