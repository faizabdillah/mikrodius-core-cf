import { Hono } from 'hono'
import { authMiddleware, JWTPayload } from '../middleware/auth'

type Bindings = {
    DB: D1Database
}

type Variables = {
    user: JWTPayload
}

const plans = new Hono<{ Bindings: Bindings; Variables: Variables }>()

plans.use('/*', authMiddleware)

// List plans for a workspace
plans.get('/workspace/:workspaceId', async (c) => {
    const user = c.get('user')
    const workspaceId = c.req.param('workspaceId')

    // Verify workspace ownership
    const workspace = await c.env.DB.prepare(
        'SELECT id FROM workspaces WHERE id = ? AND user_id = ?'
    ).bind(workspaceId, user.sub).first()

    if (!workspace) {
        return c.json({ error: 'Workspace not found' }, 404)
    }

    const result = await c.env.DB.prepare(
        'SELECT * FROM plans WHERE workspace_id = ?'
    ).bind(workspaceId).all()

    return c.json({ plans: result.results })
})

// Create plan
plans.post('/workspace/:workspaceId', async (c) => {
    const user = c.get('user')
    const workspaceId = c.req.param('workspaceId')
    const { name, downloadRate, uploadRate, quotaBytes, price, validityDays } = await c.req.json()

    // Verify workspace ownership
    const workspace = await c.env.DB.prepare(
        'SELECT id FROM workspaces WHERE id = ? AND user_id = ?'
    ).bind(workspaceId, user.sub).first()

    if (!workspace) {
        return c.json({ error: 'Workspace not found' }, 404)
    }

    if (!name) {
        return c.json({ error: 'Plan name required' }, 400)
    }

    const id = crypto.randomUUID()

    await c.env.DB.prepare(`
    INSERT INTO plans (id, workspace_id, name, download_rate, upload_rate, quota_bytes, price, validity_days)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
        id, workspaceId, name,
        downloadRate || null, uploadRate || null, quotaBytes || null,
        price || null, validityDays || null
    ).run()

    return c.json({ id, name }, 201)
})

// Get single plan
plans.get('/:id', async (c) => {
    const user = c.get('user')
    const id = c.req.param('id')

    const plan = await c.env.DB.prepare(`
    SELECT p.* FROM plans p
    JOIN workspaces w ON p.workspace_id = w.id
    WHERE p.id = ? AND w.user_id = ?
  `).bind(id, user.sub).first()

    if (!plan) {
        return c.json({ error: 'Plan not found' }, 404)
    }

    return c.json(plan)
})

// Update plan
plans.put('/:id', async (c) => {
    const user = c.get('user')
    const id = c.req.param('id')
    const body = await c.req.json()

    // Verify ownership
    const existing = await c.env.DB.prepare(`
    SELECT p.id FROM plans p
    JOIN workspaces w ON p.workspace_id = w.id
    WHERE p.id = ? AND w.user_id = ?
  `).bind(id, user.sub).first()

    if (!existing) {
        return c.json({ error: 'Plan not found' }, 404)
    }

    const allowedFields = ['name', 'download_rate', 'upload_rate', 'quota_bytes', 'price', 'validity_days']
    const updates: string[] = []
    const values: any[] = []

    for (const field of allowedFields) {
        const camelField = field.replace(/_([a-z])/g, (_, l) => l.toUpperCase())
        if (body[camelField] !== undefined) {
            updates.push(`${field} = ?`)
            values.push(body[camelField])
        }
    }

    if (updates.length === 0) {
        return c.json({ error: 'No fields to update' }, 400)
    }

    values.push(id)
    await c.env.DB.prepare(
        `UPDATE plans SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...values).run()

    return c.json({ success: true })
})

// Delete plan
plans.delete('/:id', async (c) => {
    const user = c.get('user')
    const id = c.req.param('id')

    const result = await c.env.DB.prepare(`
    DELETE FROM plans
    WHERE id = ? AND workspace_id IN (SELECT id FROM workspaces WHERE user_id = ?)
  `).bind(id, user.sub).run()

    if (result.meta.changes === 0) {
        return c.json({ error: 'Plan not found' }, 404)
    }

    return c.json({ success: true })
})

export default plans
