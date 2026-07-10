// Minimal ambient declaration: eslint-plugin-tailwindcss ships no types,
// which trips `// @ts-check` in eslint.config.mjs. Typed to match how the
// config consumes it (`configs['flat/recommended'][0]` spread into a block).
declare module 'eslint-plugin-tailwindcss' {
  const plugin: {
    configs: Record<string, Array<Record<string, unknown>>>
  }
  export default plugin
}
