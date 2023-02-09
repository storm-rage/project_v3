import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'


export default defineConfig({
  plugins: [
    vue()
  ],
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      '~': path.resolve(__dirname, './'),
      'vue': 'vue/dist/vue.esm-bundler.js' // 定义vue的别名，如果使用其他的插件，可能会用到别名
    },
  },
  build: {
    outDir: "dist",
  },
  server: {
    host: "0.0.0.0",
    port: 8920,
    proxy: {
      '/qqMap': {
        target: 'https://apis.map.qq.com/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/qqMap/, '')
      },
      '/AMap': {
        target: 'https://uri.amap.com/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/AMap/, '')
      }
    }
  }
})
