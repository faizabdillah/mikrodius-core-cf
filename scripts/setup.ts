#!/usr/bin/env bun
/**
 * Mikrodius Setup & Deploy Script
 * Interactive CLI for configuring and deploying to Cloudflare
 */

import { $ } from 'bun'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import * as readline from 'readline'

const CONFIG_PATH = join(import.meta.dir, '..', 'config.json')
const API_WRANGLER = join(import.meta.dir, '..', 'apps', 'api', 'wrangler.toml')
const WEB_ENV = join(import.meta.dir, '..', 'apps', 'web', '.env')

interface Config {
    project: { name: string; domain: string }
    cloudflare: { d1_database_id: string; d1_database_name: string; kv_namespace_id: string }
    secrets: { jwt_secret: string; google_client_id: string; google_client_secret: string }
    urls: { api: string; web: string; google_redirect: string }
}

function loadConfig(): Config {
    if (existsSync(CONFIG_PATH)) {
        return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'))
    }
    return {
        project: { name: 'mikrodius', domain: '' },
        cloudflare: { d1_database_id: '', d1_database_name: 'mikrodius-db', kv_namespace_id: '' },
        secrets: { jwt_secret: '', google_client_id: '', google_client_secret: '' },
        urls: { api: 'http://localhost:8787', web: 'http://localhost:5173', google_redirect: '' }
    }
}

function saveConfig(config: Config) {
    writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 4))
    console.log('✅ Config saved to config.json')
}

function isConfigComplete(config: Config): boolean {
    return !!(
        config.project.domain &&
        config.cloudflare.d1_database_id &&
        config.cloudflare.d1_database_name &&
        config.cloudflare.kv_namespace_id &&
        config.secrets.jwt_secret &&
        config.urls.api &&
        config.urls.web
    )
}

async function fetchD1Name(dbId: string): Promise<string | null> {
    try {
        const result = await $`wrangler d1 list --json`.quiet()
        const databases = JSON.parse(result.text())
        const db = databases.find((d: any) => d.uuid === dbId)
        return db?.name || null
    } catch {
        return null
    }
}

function generateSecret(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 44; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

async function prompt(question: string, defaultValue?: string): Promise<string> {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    const display = defaultValue ? `${question} [${defaultValue}]: ` : `${question}: `

    return new Promise((resolve) => {
        rl.question(display, (answer: string) => {
            rl.close()
            resolve(answer.trim() || defaultValue || '')
        })
    })
}

function updateWranglerToml(config: Config) {
    const content = `name = "mikrodius-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[vars]
JWT_SECRET = "${config.secrets.jwt_secret}"
GOOGLE_CLIENT_ID = "${config.secrets.google_client_id}"
GOOGLE_CLIENT_SECRET = "${config.secrets.google_client_secret}"
GOOGLE_REDIRECT_URI = "${config.urls.google_redirect}"

[[d1_databases]]
binding = "DB"
database_name = "${config.cloudflare.d1_database_name}"
database_id = "${config.cloudflare.d1_database_id}"

[[kv_namespaces]]
binding = "CACHE"
id = "${config.cloudflare.kv_namespace_id}"
`
    writeFileSync(API_WRANGLER, content)
    console.log('✅ Updated apps/api/wrangler.toml')
}

function updateWebEnv(config: Config) {
    const content = `VITE_API_URL=${config.urls.api}\n`
    writeFileSync(WEB_ENV, content)
    console.log('✅ Updated apps/web/.env')
}

async function runMigrations(dbName: string) {
    console.log('\n🗃️  Running database migrations...\n')
    try {
        await $`wrangler d1 execute ${dbName} --remote --file=packages/db/migrations/0001_init.sql`
        console.log('✅ Migrations applied')
        await $`wrangler d1 execute ${dbName} --remote --file=packages/db/seed.sql`
        console.log('✅ Seed data inserted')
    } catch (e) {
        console.log('⚠️  Migrations may have already been applied')
    }
}

async function deploy() {
    const rootDir = join(import.meta.dir, '..')
    const apiDir = join(rootDir, 'apps', 'api')
    const webDir = join(rootDir, 'apps', 'web')

    console.log('\n🚀 Deploying...\n')

    console.log('Deploying API to Cloudflare Workers...')
    await $`wrangler deploy`.cwd(apiDir)

    console.log('\nBuilding Web...')
    await $`bun run build`.cwd(webDir)

    console.log('Deploying Web to Cloudflare Pages...')
    try {
        await $`wrangler pages deploy dist --project-name=mikrodius-web --commit-dirty`.cwd(webDir)
    } catch (e) {
        console.log('\n⚠️  Pages deploy requires interactive mode or CLOUDFLARE_API_TOKEN')
        console.log('   Run this command manually:')
        console.log('   cd apps/web && npx wrangler pages deploy dist --project-name=mikrodius-web')
        return
    }

    console.log('\n✅ Deployment complete!')
}

async function setupCustomDomains(config: Config) {
    const apiDomain = config.urls.api.replace('https://', '').replace('http://', '')
    const webDomain = config.urls.web.replace('https://', '').replace('http://', '')

    // Skip if using default workers.dev/pages.dev domains
    if (apiDomain.includes('.workers.dev') || webDomain.includes('.pages.dev')) {
        console.log('\n📌 Using default Cloudflare domains, skipping custom domain setup')
        return
    }

    console.log('\n🌐 Setting up custom domains...\n')

    // Add custom domain to Workers (API)
    console.log(`Adding ${apiDomain} to mikrodius-api...`)
    try {
        await $`wrangler deployments triggers add --name mikrodius-api --hostname ${apiDomain}`.quiet()
        console.log(`✅ ${apiDomain} added to API worker`)
    } catch (e) {
        console.log(`⚠️  Could not add ${apiDomain} automatically.`)
        console.log(`   Add it manually: Cloudflare Dashboard → Workers → mikrodius-api → Settings → Triggers → Custom Domains`)
    }

    // Add custom domain to Pages (Web)
    console.log(`Adding ${webDomain} to mikrodius-web...`)
    try {
        await $`wrangler pages project edit mikrodius-web --domains ${webDomain}`.quiet()
        console.log(`✅ ${webDomain} added to Pages project`)
    } catch (e) {
        console.log(`⚠️  Could not add ${webDomain} automatically.`)
        console.log(`   Add it manually: Cloudflare Dashboard → Pages → mikrodius-web → Custom domains`)
    }
}

async function main() {
    console.log('\n🌐 Mikrodius Setup & Deploy\n')
    console.log('='.repeat(40))

    const args = process.argv.slice(2)
    const command = args[0]

    let config = loadConfig()

    // Auto-detect D1 database name if we have ID but no name
    if (config.cloudflare.d1_database_id && !config.cloudflare.d1_database_name) {
        console.log('\n🔍 Looking up D1 database name...')
        const dbName = await fetchD1Name(config.cloudflare.d1_database_id)
        if (dbName) {
            config.cloudflare.d1_database_name = dbName
            saveConfig(config)
            console.log(`   Found: ${dbName}`)
        }
    }

    // Check if config is complete
    const complete = isConfigComplete(config)

    if (command === 'deploy' || (complete && !command)) {
        // Quick deploy mode - config is ready, just sync and deploy
        console.log('\n📋 Config looks complete! Syncing and deploying...\n')
        console.log(`   Domain: ${config.project.domain}`)
        console.log(`   API: ${config.urls.api}`)
        console.log(`   Web: ${config.urls.web}`)
        console.log(`   D1 ID: ${config.cloudflare.d1_database_id.slice(0, 8)}...`)
        console.log(`   KV ID: ${config.cloudflare.kv_namespace_id.slice(0, 8)}...`)
        console.log(`   JWT: ${config.secrets.jwt_secret.slice(0, 10)}...`)

        updateWranglerToml(config)
        updateWebEnv(config)

        if (command !== 'deploy') {
            const proceed = await prompt('\nProceed with deploy? (Y/n)', 'Y')
            if (proceed.toLowerCase() === 'n') {
                console.log('Aborted.')
                return
            }
        }

        await runMigrations(config.cloudflare.d1_database_name)
        await deploy()
        await setupCustomDomains(config)

        console.log('\n✅ All done!')
        console.log(`\n🌍 Your app is live at:`)
        console.log(`   API: ${config.urls.api}`)
        console.log(`   Web: ${config.urls.web}`)
        return
    }

    if (command === 'migrate') {
        updateWranglerToml(config)
        await runMigrations(config.cloudflare.d1_database_name)
        return
    }

    if (command === 'sync') {
        updateWranglerToml(config)
        updateWebEnv(config)
        console.log('\n✅ Config synced to wrangler.toml and .env')
        return
    }

    if (command === 'domains') {
        await setupCustomDomains(config)
        return
    }

    // Interactive setup mode - config is incomplete
    console.log('\n📝 Interactive Setup (config incomplete)\n')
    console.log('Missing: ' + [
        !config.project.domain && 'domain',
        !config.cloudflare.d1_database_id && 'd1_database_id',
        !config.cloudflare.kv_namespace_id && 'kv_namespace_id',
        !config.secrets.jwt_secret && 'jwt_secret',
    ].filter(Boolean).join(', '))

    // Project
    config.project.domain = await prompt('Domain (e.g., testnet.box or subdomain)', config.project.domain)

    // Secrets
    console.log('\n🔐 Secrets\n')

    if (!config.secrets.jwt_secret) {
        config.secrets.jwt_secret = generateSecret()
        console.log(`Generated JWT Secret: ${config.secrets.jwt_secret.slice(0, 10)}...`)
    }

    if (!config.secrets.google_client_id) {
        config.secrets.google_client_id = await prompt('Google Client ID (or skip)')
    }
    if (!config.secrets.google_client_secret) {
        config.secrets.google_client_secret = await prompt('Google Client Secret (or skip)')
    }

    // URLs
    if (!config.urls.api || config.urls.api.includes('localhost')) {
        config.urls.api = await prompt('API URL', `https://api.${config.project.domain}`)
        config.urls.web = await prompt('Web URL', `https://app.${config.project.domain}`)
        config.urls.google_redirect = `${config.urls.api}/auth/google/callback`
    }

    saveConfig(config)
    updateWranglerToml(config)
    updateWebEnv(config)

    const doDeploy = await prompt('\n🚀 Deploy now? (Y/n)', 'Y')
    if (doDeploy.toLowerCase() !== 'n') {
        await runMigrations(config.cloudflare.d1_database_name)
        await deploy()
    }

    console.log('\n✅ Setup complete!')
}

main().catch(console.error)
