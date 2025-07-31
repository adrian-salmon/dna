import { defineConfig } from 'vite'

export default defineConfig({
  base: '/dna/', // Updated to match personal repository name
  build: {
    outDir: 'dist',
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