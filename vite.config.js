import { defineConfig } from 'vite'
import { resolve } from 'path'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        cadastro: resolve(__dirname, 'pages/cadastro/index.html'),
        login: resolve(__dirname, 'pages/login/index.html'),
        perfil: resolve(__dirname, 'pages/perfil/index.html'),
        editar: resolve(__dirname, 'pages/perfil/editar/index.html'),
      },
    },
  },
})