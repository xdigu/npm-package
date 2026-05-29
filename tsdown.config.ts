import { defineConfig } from 'tsdown/config'

export default defineConfig({
  entry: 'src/index.ts',
  format: ['cjs', 'esm'],
  target: 'node12',
  nodeProtocol: "strip",
  dts: true,
  exports: true,
  fixedExtension: true
})