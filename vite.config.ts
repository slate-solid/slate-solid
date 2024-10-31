import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import path from 'node:path'
// import devtools from 'solid-devtools/vite'

const packagesPath = path.join(__dirname, 'packages')

export default defineConfig({
  base: '/slate-solid', // Needed for gh-pages
  plugins: [
    /*
    Uncomment the following line to enable solid-devtools.
    For more info see https://github.com/thetarnav/solid-devtools/tree/main/packages/extension#readme
    Also uncomment the overlay in index.tsx
    */
    // devtools(),
    solidPlugin(),
  ],
  server: {
    port: 3001,
  },
  build: {
    target: 'esnext',
  },
  resolve: {
    alias: [
      // TODO: This should be dev only
      {
        find: /^@slate-solid\/(.*)/,
        replacement: `${packagesPath}/$1/src`,
      },
      {
        find: /^slate-dom$/,
        replacement: `${packagesPath}/slate-dom-preview/src`,
      },
    ],
  },
})
