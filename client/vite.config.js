import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // ДОЛЖНО БЫТЬ ТУТ

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // И ТУТ
  ],
})