import { defineConfig } from 'vite'

export default defineConfig({
  base: '/dna-inline/', // Repository name
  build: {
    outDir: 'dist', // Changed from 'src' to 'dist'
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['three']
  }
}) 