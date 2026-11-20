import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // En desarrollo, /api se reenvía al backend de Spring Boot: frontend y API comparten
    // origen, las cookies SameSite=Strict viajan solas y no hace falta CORS.
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
