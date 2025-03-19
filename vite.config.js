import { defineConfig } from 'vite'

export default defineConfig({
  base: '/dna-inline/', // Repository name
  build: {
    outDir: 'src', // Output directly to src directory
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