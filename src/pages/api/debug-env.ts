import type { APIRoute } from 'astro'

export const prerender = false

export const GET: APIRoute = async ({ locals }) => {
  const runtime = (locals as Record<string, unknown>).runtime
  const cf = (locals as Record<string, unknown>).cf

  return new Response(
    JSON.stringify({
      localsKeys: Object.keys(locals),
      runtimeType: typeof runtime,
      runtimeKeys: runtime && typeof runtime === 'object' ? Object.keys(runtime) : null,
      runtimeEnvKeys:
        runtime &&
        typeof runtime === 'object' &&
        'env' in runtime &&
        runtime.env &&
        typeof runtime.env === 'object'
          ? Object.keys(runtime.env)
          : null,
      cfType: typeof cf,
      hasProcessEnv: typeof process !== 'undefined' && typeof process.env === 'object',
      processEnvKeys:
        typeof process !== 'undefined' && typeof process.env === 'object'
          ? Object.keys(process.env).filter((k) => k.startsWith('BEEHIIV'))
          : null,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}
