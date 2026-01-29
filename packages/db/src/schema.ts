import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

// Package definitions (single source of truth for limits)
export const packages = sqliteTable('packages', {
    name: text('name').primaryKey(), // starter, basic, pro, business, enterprise
    maxNas: integer('max_nas').notNull(),
    maxSubscribers: integer('max_subscribers').notNull(),
    maxDevices: integer('max_devices').notNull(),
    rateLimit: integer('rate_limit').notNull(),
    priceCents: integer('price_cents').notNull(),
})

// Users (SaaS customers)
export const users = sqliteTable('users', {
    id: text('id').primaryKey(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    name: text('name'),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// Workspaces (tenants) - users can have multiple
export const workspaces = sqliteTable('workspaces', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    nodeId: text('node_id'),
    package: text('package').default('starter').references(() => packages.name),
    status: text('status').default('active'),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// Nodes (ACS/RADIUS server pairs)
export const nodes = sqliteTable('nodes', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    region: text('region'),
    acsUrl: text('acs_url').notNull(),
    radiusUrl: text('radius_url').notNull(),
    adminSecret: text('admin_secret').notNull(),
})

// Plans (internet packages within a workspace)
export const plans = sqliteTable('plans', {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
    name: text('name').notNull(),
    downloadRate: integer('download_rate'),
    uploadRate: integer('upload_rate'),
    quotaBytes: integer('quota_bytes'),
    price: integer('price'),
    validityDays: integer('validity_days'),
})

// Subscribers
export const subscribers = sqliteTable('subscribers', {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
    planId: text('plan_id').references(() => plans.id),
    username: text('username').notNull(),
    name: text('name'),
    email: text('email'),
    whatsapp: text('whatsapp'),
    address: text('address'),
    notes: text('notes'),
    status: text('status').default('active'),
    expireAt: integer('expire_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// Invoices
export const invoices = sqliteTable('invoices', {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
    subscriberId: text('subscriber_id').references(() => subscribers.id),
    amount: integer('amount').notNull(),
    status: text('status').default('pending'),
    dueDate: integer('due_date', { mode: 'timestamp' }),
    paidAt: integer('paid_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// Tags for CRM
export const tags = sqliteTable('tags', {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
    name: text('name').notNull(),
    color: text('color'),
})

// Subscriber tags (many-to-many)
export const subscriberTags = sqliteTable('subscriber_tags', {
    subscriberId: text('subscriber_id').notNull().references(() => subscribers.id),
    tagId: text('tag_id').notNull().references(() => tags.id),
})
