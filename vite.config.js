import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        cadastro: resolve(__dirname, 'pages/cadastro/index.html'),
        login: resolve(__dirname, 'pages/login/index.html'),
      },
    },
  },
})