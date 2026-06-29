<!-- app.vue - 根布局组件 -->
<template>
  <div class="min-h-screen bg-white text-gray-900 dark:bg-[#030014] dark:text-white transition-colors duration-300">
    <!-- Header 导航栏 -->
    <header class="fixed top-0 left-0 w-full h-20 bg-white/95 dark:bg-[#030014]/95 border-b border-gray-200/50 dark:border-white/[0.06] z-[100] backdrop-blur-md transition-colors duration-300">
      <div class="max-w-[1440px] h-full mx-auto px-10 flex items-center justify-between">
        <!-- Logo -->
        <div class="text-2xl font-bold font-heading tracking-tight">{{ t('brand') }}</div>

        <!-- 导航链接 -->
        <nav class="flex items-center gap-8">
          <NuxtLink to="/" class="text-gray-500 dark:text-[#A0A0B0] hover:text-gray-900 dark:hover:text-white transition text-sm font-medium">{{ t('nav.home') }}</NuxtLink>
          <NuxtLink to="/create" class="text-gray-500 dark:text-[#A0A0B0] hover:text-gray-900 dark:hover:text-white transition text-sm font-medium">{{ t('nav.create') || '创作' }}</NuxtLink>
          <NuxtLink to="/prompts" class="text-gray-500 dark:text-[#A0A0B0] hover:text-gray-900 dark:hover:text-white transition text-sm font-medium">{{ t('nav.prompts') }}</NuxtLink>
          <NuxtLink to="/settings" class="text-gray-500 dark:text-[#A0A0B0] hover:text-gray-900 dark:hover:text-white transition text-sm font-medium">{{ t('nav.settings') }}</NuxtLink>
        </nav>

        <!-- 右侧工具栏：语言切换 + 主题切换 + CTA -->
        <div class="flex items-center gap-3">
          <!-- 语言切换 -->
          <div class="flex items-center bg-gray-100 dark:bg-white/5 rounded-lg p-0.5 gap-0.5">
            <button
              v-for="lang in locales"
              :key="lang.code"
              @click="switchLocale(lang.code)"
              :class="currentLocale === lang.code
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white'"
              class="px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200"
            >
              {{ lang.name }}
            </button>
          </div>

          <!-- 主题切换 -->
          <div class="flex items-center bg-gray-100 dark:bg-white/5 rounded-lg p-0.5 gap-0.5">
            <button
              v-for="theme in themes"
              :key="theme.value"
              @click="setTheme(theme.value)"
              :class="colorMode.preference === theme.value
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white'"
              class="px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-200"
              :title="theme.label"
            >
              {{ theme.icon }}
            </button>
          </div>

          <!-- CTA 按钮 -->
          <button
            @click="scrollToCreate"
            class="px-6 py-2 rounded-[99px] text-sm font-semibold text-white transition hover:opacity-90 ml-2"
            style="background: linear-gradient(135deg, #2EA7FF 0%, #9381FF 100%);"
          >
            {{ t('cta') }}
          </button>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="pt-20">
      <NuxtPage />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-50 dark:bg-[#030014] border-t border-gray-200/50 dark:border-white/5 py-20 px-20 transition-colors duration-300">
      <div class="max-w-[1280px] mx-auto flex flex-col items-center gap-12">
        <div class="text-2xl font-bold font-heading tracking-tight">{{ t('brand') }}</div>
        <div class="flex gap-16">
          <a href="#" class="text-gray-400 dark:text-[rgba(255,255,255,0.65)] hover:text-gray-900 dark:hover:text-white transition text-sm">{{ t('footer.product') }}</a>
          <a href="#" class="text-gray-400 dark:text-[rgba(255,255,255,0.65)] hover:text-gray-900 dark:hover:text-white transition text-sm">{{ t('footer.docs') }}</a>
          <a href="#" class="text-gray-400 dark:text-[rgba(255,255,255,0.65)] hover:text-gray-900 dark:hover:text-white transition text-sm">{{ t('footer.contact') }}</a>
        </div>
        <div class="text-gray-400 dark:text-[rgba(255,255,255,0.3)] text-xs mt-12">{{ t('footer.copyright') }}</div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { navigateTo } from '#app'

// ========== i18n ==========
const { t, locale, setLocale } = useI18n()
const locales = [
  { code: 'zh-CN', name: '中文' },
  { code: 'en',     name: 'EN' },
]
const currentLocale = computed(() => locale.value)
const switchLocale = (code: string) => setLocale(code as 'zh-CN' | 'en')

// ========== 主题切换 (color-mode) ==========
const colorMode = useColorMode()
  const themes = [
    { value: 'light',  label: '浅色', icon: '☀️' },
    { value: 'dark',   label: '深色', icon: '🌙' },
  ]
const setTheme = (val: string) => {
  colorMode.preference = val
}

// ========== 跳转到创作页 ==========
const scrollToCreate = () => {
  if (process.client) {
    navigateTo('/create')
  }
}
</script>
