import { Hono } from 'hono'
import { authMiddleware, JWTPayload } from '../middleware/auth'

type Bindings = {
    DB: D1Database
}

type Variables = {
    user: JWTPayload
}

const tags = new Hono<{ Bindings: Bindings; Variables: Variables }>()

tags.use('/*', authMiddleware)

// List tags for a workspace
tags.get('/workspace/:workspaceId', async (c) => {
    const user = c.get('user')
    const workspaceId = c.req.param('workspaceId')

    const workspace = await c.env.DB.prepare(
        'SELECT id FROM workspaces WHERE id = ? AND user_id = ?'
    ).bind(workspaceId, user.sub).first()

    if (!workspace) {
        return c.json({ error: 'Workspace not found' }, 404)
    }

    const result = await c.env.DB.prepare(
        'SELECT * FROM tags WHERE workspace_id = ?'
    ).bind(workspaceId).all()

    return c.json({ tags: result.results })
})

// Create tag
tags.post('/workspace/:workspaceId', async (c) => {
    const user = c.get('user')
    const workspaceId = c.req.param('workspaceId')
    const { name, color } = await c.req.json()

    const workspace = await c.env.DB.prepare(
        'SELECT id FROM workspaces WHERE id = ? AND user_id = ?'
    ).bind(workspaceId, user.sub).first()

    if (!workspace) {
        return c.json({ error: 'Workspace not found' }, 404)
    }

    if (!name) {
        return c.json({ error: 'Tag name required' }, 400)
    }

    const id = crypto.randomUUID()

    await c.env.DB.prepare(
        'INSERT INTO tags (id, workspace_id, name, color) VALUES (?, ?, ?, ?)'
    ).bind(id, workspaceId, name, color || '#6b7280').run()

    return c.json({ id, name, color: color || '#6b7280' }, 201)
})

// Delete tag
tags.delete('/:id', async (c) => {
    const user = c.get('user')
    const id = c.req.param('id')

    const result = await c.env.DB.prepare(`
    DELETE FROM tags
    WHERE id = ? AND workspace_id IN (SELECT id FROM workspaces WHERE user_id = ?)
  `).bind(id, user.sub).run()

    if (result.meta.changes === 0) {
        return c.json({ error: 'Tag not found' }, 404)
    }

    // Also delete subscriber_tags associations
    await c.env.DB.prepare('DELETE FROM subscriber_tags WHERE tag_id = ?').bind(id).run()

    return c.json({ success: true })
})

// Add tag to subscriber
tags.post('/subscriber/:subscriberId/:tagId', async (c) => {
    const user = c.get('user')
    const subscriberId = c.req.param('subscriberId')
    const tagId = c.req.param('tagId')

    // Verify ownership
    const subscriber = await c.env.DB.prepare(`
    SELECT s.id FROM subscribers s
    JOIN workspaces w ON s.workspace_id = w.id
    WHERE s.id = ? AND w.user_id = ?
  `).bind(subscriberId, user.sub).first()

    if (!subscriber) {
        return c.json({ error: 'Subscriber not found' }, 404)
    }

    try {
        await c.env.DB.prepare(
            'INSERT INTO subscriber_tags (subscriber_id, tag_id) VALUES (?, ?)'
        ).bind(subscriberId, tagId).run()
    } catch {
        // Already exists, that's fine
    }

    return c.json({ success: true })
})

// Remove tag from subscriber
tags.delete('/subscriber/:subscriberId/:tagId', async (c) => {
    const user = c.get('user')
    const subscriberId = c.req.param('subscriberId')
    const tagId = c.req.param('tagId')

    // Verify ownership
    const subscriber = await c.env.DB.prepare(`
    SELECT s.id FROM subscribers s
    JOIN workspaces w ON s.workspace_id = w.id
    WHERE s.id = ? AND w.user_id = ?
  `).bind(subscriberId, user.sub).first()

    if (!subscriber) {
        return c.json({ error: 'Subscriber not found' }, 404)
    }

    await c.env.DB.prepare(
        'DELETE FROM subscriber_tags WHERE subscriber_id = ? AND tag_id = ?'
    ).bind(subscriberId, tagId).run()

    return c.json({ success: true })
})

export default tags
