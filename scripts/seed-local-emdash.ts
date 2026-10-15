/**
 * Reset the local EmDash database/media (miniflare D1 + R2 under
 * .wrangler/state) and apply .emdash/seed.json through the dev-bypass setup
 * endpoint. Local only: nothing here touches remote Cloudflare resources.
 *
 * Usage:
 *   pnpm seed:local                 # reset, seed, verify, stop the dev server
 *   pnpm seed:local --keep-running  # leave `astro dev` running afterwards
 *   pnpm seed:local --no-reset      # keep existing state (seed skips existing entries)
 *
 * The seed is bundled into a virtual module when `astro dev` starts, so the
 * dev server must be (re)started after .emdash/seed.json changes — this
 * script always starts its own.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const LOCAL_STATE_DIR = path.join(ROOT, '.wrangler/state')
const READY_TIMEOUT_MS = 180_000

interface SeedLocalOptions {
  port?: number
  reset?: boolean
  keepRunning?: boolean
}

interface ContentItem {
  id: string
  slug: string
  status: string
  data?: Record<string, unknown>
  [key: string]: unknown
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const astro = (...args: string[]) =>
  execFileSync('pnpm', ['exec', 'astro', ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    env: { ...process.env, FORCE_COLOR: '0' },
  })

/**
 * Astro 7 runs `astro dev --background` as a managed daemon (lock file,
 * `astro dev status|logs|stop`), which is easier to drive than a child
 * process tree (pnpm → astro → workerd).
 */
const startDevServer = (port: number) => {
  const status = astro('dev', 'status')
  if (/Dev server running at/.test(status)) {
    throw new Error(
      `a dev server is already running for this project; stop it first (pnpm astro dev stop):\n${status}`
    )
  }
  astro('dev', '--background', '--port', String(port))
  const match = /(http:\/\/localhost:\d+)/.exec(astro('dev', 'status'))
  if (!match) throw new Error('could not determine the dev server URL')
  return match[1]
}

const stopDevServer = () => {
  try {
    astro('dev', 'stop')
  } catch (error) {
    console.warn('Failed to stop the dev server:', error)
  }
}

const waitForReady = async (baseUrl: string) => {
  const deadline = Date.now() + READY_TIMEOUT_MS
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/_emdash/api/health`)
      if (response.status < 500) return
    } catch {
      // not listening yet
    }
    await sleep(1000)
  }
  throw new Error(
    `dev server at ${baseUrl} not ready after ${READY_TIMEOUT_MS}ms`
  )
}

const api = async <T>(baseUrl: string, pathname: string, token: string) => {
  const response = await fetch(`${baseUrl}${pathname}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const body = (await response.json()) as { data?: T; error?: unknown }
  if (!response.ok) {
    throw new Error(
      `GET ${pathname} → ${response.status}: ${JSON.stringify(body)}`
    )
  }
  return body.data as T
}

export const seedLocal = async ({
  port = 4321,
  reset = true,
  keepRunning = false,
}: SeedLocalOptions = {}) => {
  if (!existsSync(path.join(ROOT, '.env'))) {
    console.warn(
      'Warning: no .env file (see .env.example); EmDash may fail to start.'
    )
  }
  if (reset) {
    console.log(
      `Resetting local D1/R2 state: ${path.relative(ROOT, LOCAL_STATE_DIR)}`
    )
    rmSync(LOCAL_STATE_DIR, { recursive: true, force: true })
  }

  const baseUrl = startDevServer(port)
  process.once('SIGINT', () => {
    stopDevServer()
    process.exit(130)
  })

  try {
    await waitForReady(baseUrl)

    console.log(`Applying seed via ${baseUrl}/_emdash/api/setup/dev-bypass`)
    const response = await fetch(
      `${baseUrl}/_emdash/api/setup/dev-bypass?token=1`,
      {
        method: 'POST',
      }
    )
    const result = (await response.json()) as {
      data?: { token?: string }
      error?: unknown
    }
    if (!response.ok || !result.data?.token) {
      throw new Error(
        `dev-bypass failed (${response.status}): ${JSON.stringify(result)}`
      )
    }
    const token = result.data.token

    const posts = await api<{ items: ContentItem[] }>(
      baseUrl,
      '/_emdash/api/content/posts?limit=100',
      token
    )
    console.table(
      posts.items.map((item) => ({
        slug: item.slug,
        status: item.status,
        title: item.data?.title,
        date: item.data?.date,
      }))
    )
    // Seed progress (media downloads/uploads) is logged by the dev server.
    const seedLog = astro('dev', 'logs')
      .split('\n')
      .filter((line) => /seed|Downloading|Uploaded|Reused|\$media/i.test(line))
    console.log(seedLog.join('\n'))
    console.log(`Seeded ${posts.items.length} posts. Dev token: ${token}`)
    return { baseUrl, token, posts: posts.items }
  } finally {
    if (keepRunning) {
      console.log(
        `Dev server left running at ${baseUrl} (stop: pnpm astro dev stop).`
      )
    } else {
      stopDevServer()
    }
  }
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url)
if (isMain) {
  const { values } = parseArgs({
    options: {
      port: { type: 'string', default: '4321' },
      'no-reset': { type: 'boolean', default: false },
      'keep-running': { type: 'boolean', default: false },
    },
  })
  try {
    await seedLocal({
      port: Number(values.port),
      reset: !values['no-reset'],
      keepRunning: values['keep-running'],
    })
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}
