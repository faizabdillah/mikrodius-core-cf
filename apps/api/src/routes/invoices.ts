import { Hono } from 'hono'
import { authMiddleware, JWTPayload } from '../middleware/auth'

type Bindings = {
    DB: D1Database
}

type Variables = {
    user: JWTPayload
}

const invoices = new Hono<{ Bindings: Bindings; Variables: Variables }>()

invoices.use('/*', authMiddleware)

// List invoices for a workspace
invoices.get('/workspace/:workspaceId', async (c) => {
    const user = c.get('user')
    const workspaceId = c.req.param('workspaceId')
    const status = c.req.query('status')

    // Verify workspace ownership
    const workspace = await c.env.DB.prepare(
        'SELECT id FROM workspaces WHERE id = ? AND user_id = ?'
    ).bind(workspaceId, user.sub).first()

    if (!workspace) {
        return c.json({ error: 'Workspace not found' }, 404)
    }

    let query = `
    SELECT i.*, s.username as subscriber_username, s.name as subscriber_name
    FROM invoices i
    LEFT JOIN subscribers s ON i.subscriber_id = s.id
    WHERE i.workspace_id = ?
  `
    const bindings: any[] = [workspaceId]

    if (status) {
        query += ' AND i.status = ?'
        bindings.push(status)
    }

    query += ' ORDER BY i.created_at DESC'

    const result = await c.env.DB.prepare(query).bind(...bindings).all()

    return c.json({ invoices: result.results })
})

// Create invoice
invoices.post('/workspace/:workspaceId', async (c) => {
    const user = c.get('user')
    const workspaceId = c.req.param('workspaceId')
    const { subscriberId, amount, dueDate } = await c.req.json()

    // Verify workspace ownership
    const workspace = await c.env.DB.prepare(
        'SELECT id FROM workspaces WHERE id = ? AND user_id = ?'
    ).bind(workspaceId, user.sub).first()

    if (!workspace) {
        return c.json({ error: 'Workspace not found' }, 404)
    }

    if (!amount) {
        return c.json({ error: 'Amount required' }, 400)
    }

    const id = crypto.randomUUID()

    await c.env.DB.prepare(`
    INSERT INTO invoices (id, workspace_id, subscriber_id, amount, status, due_date, created_at)
    VALUES (?, ?, ?, ?, 'pending', ?, ?)
  `).bind(
        id, workspaceId, subscriberId || null, amount,
        dueDate || null, Math.floor(Date.now() / 1000)
    ).run()

    return c.json({ id, amount, status: 'pending' }, 201)
})

// Get single invoice
invoices.get('/:id', async (c) => {
    const user = c.get('user')
    const id = c.req.param('id')

    const invoice = await c.env.DB.prepare(`
    SELECT i.*, s.username as subscriber_username, s.name as subscriber_name, s.email as subscriber_email
    FROM invoices i
    LEFT JOIN subscribers s ON i.subscriber_id = s.id
    JOIN workspaces w ON i.workspace_id = w.id
    WHERE i.id = ? AND w.user_id = ?
  `).bind(id, user.sub).first()

    if (!invoice) {
        return c.json({ error: 'Invoice not found' }, 404)
    }

    return c.json(invoice)
})

// Mark invoice as paid
invoices.post('/:id/pay', async (c) => {
    const user = c.get('user')
    const id = c.req.param('id')

    const result = await c.env.DB.prepare(`
    UPDATE invoices SET status = 'paid', paid_at = ?
    WHERE id = ? AND workspace_id IN (SELECT id FROM workspaces WHERE user_id = ?)
  `).bind(Math.floor(Date.now() / 1000), id, user.sub).run()

    if (result.meta.changes === 0) {
        return c.json({ error: 'Invoice not found' }, 404)
    }

    return c.json({ success: true, status: 'paid' })
})

// Cancel invoice
invoices.post('/:id/cancel', async (c) => {
    const user = c.get('user')
    const id = c.req.param('id')

    const result = await c.env.DB.prepare(`
    UPDATE invoices SET status = 'cancelled'
    WHERE id = ? AND workspace_id IN (SELECT id FROM workspaces WHERE user_id = ?)
  `).bind(id, user.sub).run()

    if (result.meta.changes === 0) {
        return c.json({ error: 'Invoice not found' }, 404)
    }

    return c.json({ success: true, status: 'cancelled' })
})

// Delete invoice
invoices.delete('/:id', async (c) => {
    const user = c.get('user')
    const id = c.req.param('id')

    const result = await c.env.DB.prepare(`
    DELETE FROM invoices
    WHERE id = ? AND workspace_id IN (SELECT id FROM workspaces WHERE user_id = ?)
  `).bind(id, user.sub).run()

    if (result.meta.changes === 0) {
        return c.json({ error: 'Invoice not found' }, 404)
    }

    return c.json({ success: true })
})

export default invoices
