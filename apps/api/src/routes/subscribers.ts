import { Hono } from 'hono'
import { authMiddleware, JWTPayload } from '../middleware/auth'

type Bindings = {
    DB: D1Database
}

type Variables = {
    user: JWTPayload
}

const subscribers = new Hono<{ Bindings: Bindings; Variables: Variables }>()

subscribers.use('/*', authMiddleware)

// List subscribers for a workspace
subscribers.get('/workspace/:workspaceId', async (c) => {
    const user = c.get('user')
    const workspaceId = c.req.param('workspaceId')

    // Verify workspace ownership
    const workspace = await c.env.DB.prepare(
        'SELECT id FROM workspaces WHERE id = ? AND user_id = ?'
    ).bind(workspaceId, user.sub).first()

    if (!workspace) {
        return c.json({ error: 'Workspace not found' }, 404)
    }

    const result = await c.env.DB.prepare(`
    SELECT s.*, p.name as plan_name 
    FROM subscribers s 
    LEFT JOIN plans p ON s.plan_id = p.id 
    WHERE s.workspace_id = ?
    ORDER BY s.created_at DESC
  `).bind(workspaceId).all()

    return c.json({ subscribers: result.results })
})

// Create subscriber
subscribers.post('/workspace/:workspaceId', async (c) => {
    const user = c.get('user')
    const workspaceId = c.req.param('workspaceId')
    const { username, name, email, whatsapp, address, notes, planId } = await c.req.json()

    // Verify workspace ownership
    const workspace = await c.env.DB.prepare(
        'SELECT id, package FROM workspaces WHERE id = ? AND user_id = ?'
    ).bind(workspaceId, user.sub).first()

    if (!workspace) {
        return c.json({ error: 'Workspace not found' }, 404)
    }

    if (!username) {
        return c.json({ error: 'Username required' }, 400)
    }

    // Check subscriber limit
    const countResult = await c.env.DB.prepare(
        'SELECT COUNT(*) as count FROM subscribers WHERE workspace_id = ?'
    ).bind(workspaceId).first()

    const packageLimits = await c.env.DB.prepare(
        'SELECT max_subscribers FROM packages WHERE name = ?'
    ).bind(workspace.package).first()

    if (packageLimits && packageLimits.max_subscribers !== -1) {
        if ((countResult?.count as number) >= (packageLimits.max_subscribers as number)) {
            return c.json({ error: 'Subscriber limit reached. Upgrade your plan.' }, 403)
        }
    }

    const id = crypto.randomUUID()

    await c.env.DB.prepare(`
    INSERT INTO subscribers (id, workspace_id, username, name, email, whatsapp, address, notes, plan_id, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
  `).bind(
        id, workspaceId, username, name || null, email || null,
        whatsapp || null, address || null, notes || null, planId || null,
        Math.floor(Date.now() / 1000)
    ).run()

    return c.json({ id, username, status: 'active' }, 201)
})

// Get single subscriber
subscribers.get('/:id', async (c) => {
    const user = c.get('user')
    const id = c.req.param('id')

    const subscriber = await c.env.DB.prepare(`
    SELECT s.*, p.name as plan_name, w.name as workspace_name
    FROM subscribers s
    LEFT JOIN plans p ON s.plan_id = p.id
    JOIN workspaces w ON s.workspace_id = w.id
    WHERE s.id = ? AND w.user_id = ?
  `).bind(id, user.sub).first()

    if (!subscriber) {
        return c.json({ error: 'Subscriber not found' }, 404)
    }

    // Get subscriber tags
    const tags = await c.env.DB.prepare(`
    SELECT t.id, t.name, t.color
    FROM tags t
    JOIN subscriber_tags st ON t.id = st.tag_id
    WHERE st.subscriber_id = ?
  `).bind(id).all()

    return c.json({ ...subscriber, tags: tags.results })
})

// Update subscriber
subscribers.put('/:id', async (c) => {
    const user = c.get('user')
    const id = c.req.param('id')
    const body = await c.req.json()

    // Verify ownership
    const existing = await c.env.DB.prepare(`
    SELECT s.id FROM subscribers s
    JOIN workspaces w ON s.workspace_id = w.id
    WHERE s.id = ? AND w.user_id = ?
  `).bind(id, user.sub).first()

    if (!existing) {
        return c.json({ error: 'Subscriber not found' }, 404)
    }

    const allowedFields = ['name', 'email', 'whatsapp', 'address', 'notes', 'plan_id', 'status', 'expire_at']
    const updates: string[] = []
    const values: any[] = []

    for (const field of allowedFields) {
        if (body[field] !== undefined) {
            updates.push(`${field} = ?`)
            values.push(body[field])
        }
    }

    if (updates.length === 0) {
        return c.json({ error: 'No fields to update' }, 400)
    }

    values.push(id)
    await c.env.DB.prepare(
        `UPDATE subscribers SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...values).run()

    return c.json({ success: true })
})

// Suspend subscriber
subscribers.post('/:id/suspend', async (c) => {
    const user = c.get('user')
    const id = c.req.param('id')

    const result = await c.env.DB.prepare(`
    UPDATE subscribers SET status = 'suspended'
    WHERE id = ? AND workspace_id IN (SELECT id FROM workspaces WHERE user_id = ?)
  `).bind(id, user.sub).run()

    if (result.meta.changes === 0) {
        return c.json({ error: 'Subscriber not found' }, 404)
    }

    return c.json({ success: true, status: 'suspended' })
})

// Activate subscriber
subscribers.post('/:id/activate', async (c) => {
    const user = c.get('user')
    const id = c.req.param('id')

    const result = await c.env.DB.prepare(`
    UPDATE subscribers SET status = 'active'
    WHERE id = ? AND workspace_id IN (SELECT id FROM workspaces WHERE user_id = ?)
  `).bind(id, user.sub).run()

    if (result.meta.changes === 0) {
        return c.json({ error: 'Subscriber not found' }, 404)
    }

    return c.json({ success: true, status: 'active' })
})

// Delete subscriber
subscribers.delete('/:id', async (c) => {
    const user = c.get('user')
    const id = c.req.param('id')

    const result = await c.env.DB.prepare(`
    DELETE FROM subscribers
    WHERE id = ? AND workspace_id IN (SELECT id FROM workspaces WHERE user_id = ?)
  `).bind(id, user.sub).run()

    if (result.meta.changes === 0) {
        return c.json({ error: 'Subscriber not found' }, 404)
    }

    return c.json({ success: true })
})

export default subscribers
