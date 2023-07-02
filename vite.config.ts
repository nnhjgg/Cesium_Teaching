import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
    plugins: [
        vue({
            script: {
                defineModel: true
            }
        })
    ],
    resolve: {
        alias: {
            '@': path.resolve('src')
        }
    },
    build: {
        outDir: path.join(__dirname, 'dist'),
        emptyOutDir: true,
        minify: 'esbuild',
        assetsDir: '', // 相对路径 加载问题
        sourcemap: false,
        target: 'esnext',
        rollupOptions: {
            output: {
                manualChunks: (id: string) => {
                    if (id.includes('node_modules')) {
                        return 'vendor'
                    }
                }
            }
        }
    },
    optimizeDeps: {
        include: ['axios']
    },
    base: './',
    envDir: './env',
    server: {
        host: '0.0.0.0',
        port: 6768,
        open: true,
        base: './',
        strictPort: true
        // proxy: {
        //   '^/Application': {
        //     target: 'http://192.168.0.76:6789',
        //     changeOrigin: true,
        //     rewrite: (t) => t.replace(/^\/Application/, '')
        //   }
        // }
    }
})
