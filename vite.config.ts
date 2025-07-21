import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  root: 'client', // your source files are in the "client" folder
  build: {
    outDir: '../dist', // build output goes to "dist" at root level
    emptyOutDir: true // cleans the dist folder before building
  },
  server: {
    port: 3000,
    open: true
  }
})
