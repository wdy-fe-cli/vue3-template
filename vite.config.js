import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import PrettierPlugin from './src/plugins/prettier'
import { resolve } from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), PrettierPlugin],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
