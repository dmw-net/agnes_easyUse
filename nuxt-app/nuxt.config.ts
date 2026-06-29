// nuxt.config.ts

export default defineNuxtConfig({
  // 应用配置
  app: {
    head: {
      title: 'AI Genesis - AI图片视频生成平台',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '集成AI图片生成、视频生成和提示词优化功能的现代化Web平台' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Inter+Tight:wght@700&display=swap' }
      ]
    }
  },

  // 模块配置
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/image',
    '@nuxtjs/color-mode',
  ],

  // ========== 主题切换 (color-mode) ==========
  colorMode: {
    classSuffix: '',
    storageKey: 'color-mode',
    storage: 'localStorage',
    preference: 'dark',
  },

  // Tailwind CSS 配置
  tailwindcss: {
    configPath: 'tailwind.config.js',
    cssPath: '~/assets/styles/main.css'
  },

  // 运行时配置
  runtimeConfig: {
    agnesApiKey: process.env.AGNES_API_KEY || '',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    }
  },

  // 构建配置 (Cloudflare Pages)
  nitro: {
    preset: 'cloudflare-pages'
  },

  typescript: {
    strict: true
  },

  devtools: { enabled: true }
})
