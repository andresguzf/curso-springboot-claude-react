import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        // Librerías en chunks propios con nombre: cambian poco, así el navegador las mantiene en
        // caché aunque cambie el código de la app. Las páginas ya van en chunks propios (lazy).
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
            { name: 'router', test: /node_modules[\\/]react-router[\\/]/ },
            { name: 'query', test: /node_modules[\\/]@tanstack[\\/]/ },
            { name: 'zod', test: /node_modules[\\/]zod[\\/]/ },
            { name: 'forms', test: /node_modules[\\/](react-hook-form|@hookform)[\\/]/ },
          ],
        },
      },
    },
  },
  server: {
    // En desarrollo, /api se reenvía al backend de Spring Boot: frontend y API comparten
    // origen, las cookies SameSite=Strict viajan solas y no hace falta CORS.
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
