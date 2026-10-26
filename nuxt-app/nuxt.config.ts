// nuxt.config.ts

export default defineNuxtConfig({
  // 应用配置
  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      title: 'Agnes Easy Use',
      titleTemplate: '%s - Agnes Easy Use',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Agneseasyuse（Agnes Easy Use）是一个免费开源的 AI 创作平台，集成 AI 图片生成、视频生成与提示词优化，永久无限使用' },
        { name: 'keywords', content: 'Agneseasyuse, Agnes Easy Use, AgnesEasyUse, AI 图片生成, AI 视频生成, 提示词优化, 免费开源' },
        { name: 'author', content: 'dmw-net' },
        { name: 'robots', content: 'index, follow' },
        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'Agnes Easy Use - 免费AI创作平台' },
        { property: 'og:description', content: '免费开源的 AI 创作工具，支持图片生成、视频生成和提示词优化，永久无限使用' },
        { property: 'og:url', content: 'https://agneseasyuse.2025521.xyz/' },
        { property: 'og:site_name', content: 'Agnes Easy Use' },
        { property: 'og:locale', content: 'zh_CN' },
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Agnes Easy Use - 免费AI创作平台' },
        { name: 'twitter:description', content: '免费开源的 AI 创作工具，支持图片生成、视频生成和提示词优化，永久无限使用' },
        // 百度站点验证
        { name: 'baidu-site-verification', content: 'codeva-R3VtD9kAIf' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Inter+Tight:wght@700&display=swap' },
        { rel: 'canonical', href: 'https://agneseasyuse.2025521.xyz/' },
        { rel: 'icon', type: 'image/png', href: '/favicon.png', sizes: '128x128' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' }
      ]
    }
  },

  // 模块配置
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/image',
    '@nuxtjs/color-mode',
    '@nuxtjs/i18n',
    '@nuxtjs/sitemap'
  ],

  // ========== i18n 配置 (@nuxtjs/i18n v10) ==========
  // locale 文件唯一数据源：i18n/locales/*.json（模块默认读取位置）。
  // 注意：此前项目存在 locales/ + 自定义 useLocale.ts 的第二套 i18n，
  // 与模块的 useI18n 自动导入冲突导致新键回落为原始键路径，已删除统一到本模块。
  i18n: {
    locales: [
      { code: 'en', file: 'en.json' },
      { code: 'zh-CN', file: 'zh-CN.json' }
    ],
    defaultLocale: 'zh-CN',
    // 英文缺键时回落中文，避免界面出现原始键路径
    fallbackLocale: 'zh-CN',
    strategy: 'no_prefix',
    // 语言选择持久化：写入 cookie，刷新后保持（app.vue 另做旧 localStorage 迁移）
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    }
  },

  // ========= Sitemap 配置 =========
  sitemap: {
    hostname: 'https://agneseasyuse.2025521.xyz'
  } as any,

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
    // 国际站（agnes-ai.com）服务端兜底 Key
    agnesApiKey: process.env.AGNES_API_KEY || '',
    // 国内站（agnes-ai.cn）服务端兜底 Key
    agnesApiKeyCn: process.env.AGNES_API_KEY_CN || '',
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
