import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  clean: true,
  format: ['cjs', 'esm'],
  sourcemap: true,
  // Rollup chokes on import = statements in `packages/slate-dom-preview/src/utils/dom.ts`
  // when trying to build .d.ts, so have to use `tsc` for declarations and `tsup`
  // for other parts of the build.
  dts: false,
})
