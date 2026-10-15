import handler, {
  createScheduledHandler,
  PluginBridge,
} from '@emdash-cms/cloudflare/worker'

export { PluginBridge }

export default {
  ...handler,
  // Runs the cron trigger in wrangler.jsonc for scheduled publishing.
  scheduled: createScheduledHandler(),
} satisfies ExportedHandler
