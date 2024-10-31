import { defineConfig, type PluginOption } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import path from 'node:path'
import devtools from 'solid-devtools/vite'

const packagesPath = path.join(__dirname, 'packages')

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  const plugins: PluginOption[] = isDev
    ? [devtools({ autoname: true }), solidPlugin()]
    : [solidPlugin()]

  const alias = isDev
    ? [
        // TODO: This should be dev only
        {
          find: /^@slate-solid\/(.*)/,
          replacement: `${packagesPath}/$1/src`,
        },
        {
          find: /^slate-dom$/,
          replacement: `${packagesPath}/slate-dom-preview/src`,
        },
      ]
    : []

  return {
    base: '/slate-solid', // Needed for gh-pages
    plugins,
    server: {
      port: 3001,
    },
    build: {
      target: 'esnext',
    },
    resolve: {
      alias,
    },
  }
})
