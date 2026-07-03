// nuxt.config.ts

export default defineNuxtConfig({
  // 应用配置
  app: {
    head: {
      title: 'Agnes Easy Use',
      titleTemplate: '%s - AI 图片视频生成平台',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '集成 AI 图片生成、视频生成和提示词优化功能的现代化 Web 平台，免费开源，永久无限使用' },
        { name: 'keywords', content: 'AI, 图片生成, 视频生成, Agnes, 提示词优化, 免费, 开源' },
        { name: 'author', content: 'dmw-net' },
        { name: 'robots', content: 'index, follow' },
        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'Agnes Easy Use - AI 图片视频生成平台' },
        { property: 'og:description', content: '免费开源的 AI 创作工具，支持图片生成、视频生成和提示词优化' },
        { property: 'og:url', content: 'https://agneseasyuse.2025521.xyz/' },
        { property: 'og:site_name', content: 'Agnes Easy Use' },
        { property: 'og:locale', content: 'zh_CN' },
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Agnes Easy Use - AI 图片视频生成平台' },
        { name: 'twitter:description', content: '免费开源的 AI 创作工具，支持图片生成、视频生成和提示词优化' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Inter+Tight:wght@700&display=swap' },
        { rel: 'canonical', href: 'https://agneseasyuse.2025521.xyz/' }
      ]
    }
  },

  // 模块配置
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/image',
    '@nuxtjs/color-mode',
    '@nuxtjs/sitemap'
  ],

  // ========= Sitemap 配置 =========
  sitemap: {
    hostname: 'https://agneseasyuse.2025521.xyz'
  },

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
