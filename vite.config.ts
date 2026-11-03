import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: [
        'react', 'react-dom', 'react/jsx-runtime',
        '@plainfold/design-tokens',
        'react-hook-form', '@hookform/resolvers', '@hookform/resolvers/zod',
        'zod', 'lucide-react',
      ],
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    // design-tokens pulls in @plainfold/store, whose optional peer dexie is not installed; no test uses the store
    server: { deps: { inline: [/@plainfold\//] } },
    alias: { dexie: resolve(__dirname, 'src/__tests__/dexieStub.ts') },
  },
})
