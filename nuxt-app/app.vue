<!-- app.vue - 根布局组件 -->
<template>
  <div class="min-h-screen bg-white text-gray-900 dark:bg-[#050508] dark:text-white/90 transition-colors duration-300">
    <!-- Header 导航栏 -->
    <header class="fixed top-0 left-0 w-full h-16 md:h-20 bg-white/95 dark:bg-[#050508]/95 border-b border-gray-200/50 dark:border-white/[0.04] z-[100] backdrop-blur-md transition-colors duration-300">
      <div class="max-w-[1440px] h-full mx-auto px-4 md:px-10 flex items-center justify-between">
        <!-- Logo -->
        <div class="text-xl md:text-2xl font-bold font-heading tracking-tight">{{ t('brand') }}</div>

        <!-- 桌面端导航链接 -->
        <nav class="hidden md:flex items-center gap-6 lg:gap-8">
          <NuxtLink to="/" class="text-gray-500 dark:text-[#A0A0B0] hover:text-gray-900 dark:hover:text-white transition text-sm font-medium">{{ t('nav.home') }}</NuxtLink>
          <NuxtLink to="/create" class="text-gray-500 dark:text-[#A0A0B0] hover:text-gray-900 dark:hover:text-white transition text-sm font-medium">{{ t('nav.create') || '创作' }}</NuxtLink>
          <NuxtLink to="/settings" class="text-gray-500 dark:text-[#A0A0B0] hover:text-gray-900 dark:hover:text-white transition text-sm font-medium">{{ t('nav.settings') }}</NuxtLink>
        </nav>

        <!-- 右侧工具栏：语言切换 + 主题切换 + CTA -->
        <div class="flex items-center gap-2 md:gap-3">
          <!-- 语言切换按钮 -->
          <button
            @click="toggleLocale"
            class="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center text-sm font-bold text-gray-700 dark:text-white/80 hover:bg-gray-200 dark:hover:bg-white/10 transition-all duration-200"
            :title="currentLocale === 'zh-CN' ? '切换到英文' : '切换到中文'"
          >
            {{ currentLocale === 'zh-CN' ? '中' : 'EN' }}
          </button>

          <!-- 主题切换按钮 -->
          <button
            @click="toggleTheme"
            class="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center text-base hover:bg-gray-200 dark:hover:bg-white/10 transition-all duration-200"
            :title="isDark ? '切换到浅色模式' : '切换到深色模式'"
          >
            {{ isDark ? '🌙' : '☀️' }}
          </button>

          <!-- 反馈建议按钮 -->
          <a
            href="https://github.com/dmw-net/agnes_easyUse/issues"
            target="_blank"
            rel="noopener"
            class="hidden sm:flex px-4 md:px-6 py-2 rounded-[99px] text-sm font-semibold text-white transition hover:opacity-90 ml-1 md:ml-2"
            style="background: linear-gradient(135deg, #2EA7FF 0%, #9381FF 100%);"
          >
            {{ t('nav.feedback') }}
          </a>

          <!-- 移动端汉堡菜单按钮 -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="flex md:hidden w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/5 items-center justify-center hover:bg-gray-200 dark:hover:bg-white/10 transition"
            :title="mobileMenuOpen ? '关闭菜单' : '打开菜单'"
          >
            <!-- 汉堡图标 -->
            <svg v-if="!mobileMenuOpen" class="w-5 h-5 text-gray-700 dark:text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <!-- 关闭图标 -->
            <svg v-else class="w-5 h-5 text-gray-700 dark:text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- 移动端菜单面板 -->
    <transition name="mobile-menu">
      <div
        v-if="mobileMenuOpen"
        class="fixed inset-0 z-[110] bg-black/40 md:hidden"
        @click="mobileMenuOpen = false"
      >
        <div
          class="fixed top-0 right-0 w-[280px] max-w-[85vw] h-full bg-white dark:bg-[#0d0d1a] shadow-2xl p-6 flex flex-col gap-6"
          @click.stop
        >
          <!-- 菜单头部 -->
          <div class="flex items-center justify-between">
            <div class="text-xl font-bold font-heading tracking-tight">{{ t('brand') }}</div>
            <button @click="mobileMenuOpen = false" class="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 transition">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- 菜单链接 -->
          <nav class="flex flex-col gap-2 mt-4">
            <NuxtLink
              to="/"
              @click="mobileMenuOpen = false"
              class="px-4 py-3 rounded-xl text-base font-medium text-gray-700 dark:text-white/80 hover:bg-gray-100 dark:hover:bg-white/5 transition"
            >{{ t('nav.home') }}</NuxtLink>
            <NuxtLink
              to="/create"
              @click="mobileMenuOpen = false"
              class="px-4 py-3 rounded-xl text-base font-medium text-gray-700 dark:text-white/80 hover:bg-gray-100 dark:hover:bg-white/5 transition"
            >{{ t('nav.create') || '创作' }}</NuxtLink>
            <NuxtLink
              to="/settings"
              @click="mobileMenuOpen = false"
              class="px-4 py-3 rounded-xl text-base font-medium text-gray-700 dark:text-white/80 hover:bg-gray-100 dark:hover:bg-white/5 transition"
            >{{ t('nav.settings') }}</NuxtLink>
          </nav>

          <!-- 菜单底部 反馈建议 -->
          <div class="mt-auto pt-6 border-t border-gray-200/50 dark:border-white/5">
            <a
              href="https://github.com/dmw-net/agnes_easyUse/issues"
              target="_blank"
              rel="noopener"
              class="block w-full text-center px-6 py-3 rounded-[99px] text-sm font-semibold text-white transition hover:opacity-90"
              style="background: linear-gradient(135deg, #2EA7FF 0%, #9381FF 100%);"
            >
              {{ t('nav.feedback') }}
            </a>
          </div>
        </div>
      </div>
    </transition>

    <!-- 主内容区 -->
    <main class="pt-16 md:pt-20">
      <NuxtPage />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-50 dark:bg-[#050508] border-t border-gray-200/50 dark:border-white/5 pt-16 md:pt-20 pb-10 px-4 md:px-20 transition-colors duration-300">
      <div class="max-w-[1280px] mx-auto">
        <!-- 上排：品牌 + 导航 -->
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-10 md:gap-16">
          <!-- 品牌区 -->
          <div class="max-w-sm">
            <div class="text-xl md:text-2xl font-bold font-heading tracking-tight">{{ t('brand') }}</div>
            <p class="mt-3 text-sm leading-relaxed text-gray-500 dark:text-[rgba(255,255,255,0.45)]">{{ t('footer.tagline') }}</p>
            <div class="flex flex-wrap gap-2 mt-5">
              <span class="px-3 py-1 rounded-full text-xs text-gray-500 dark:text-[rgba(255,255,255,0.55)] bg-gray-100 dark:bg-white/5 transition-colors">{{ t('footer.tagImage') }}</span>
              <span class="px-3 py-1 rounded-full text-xs text-gray-500 dark:text-[rgba(255,255,255,0.55)] bg-gray-100 dark:bg-white/5 transition-colors">{{ t('footer.tagVideo') }}</span>
              <span class="px-3 py-1 rounded-full text-xs text-gray-500 dark:text-[rgba(255,255,255,0.55)] bg-gray-100 dark:bg-white/5 transition-colors">{{ t('footer.tagPrompt') }}</span>
              <span class="px-3 py-1 rounded-full text-xs text-gray-500 dark:text-[rgba(255,255,255,0.55)] bg-gray-100 dark:bg-white/5 transition-colors">{{ t('footer.tagTheme') }}</span>
            </div>
          </div>

          <!-- 导航链接区 -->
          <div class="flex gap-12 sm:gap-16">
            <div class="flex flex-col gap-3">
              <div class="text-sm font-semibold text-gray-900 dark:text-white/90 mb-1">{{ t('footer.columnProduct') }}</div>
              <a href="https://github.com/dmw-net/agnes_easyUse" target="_blank" rel="noopener" class="text-gray-400 dark:text-[rgba(255,255,255,0.65)] hover:text-gray-900 dark:hover:text-white transition text-sm">{{ t('footer.product') }}</a>
              <a href="https://github.com/dmw-net/agnes_easyUse#readme" target="_blank" rel="noopener" class="text-gray-400 dark:text-[rgba(255,255,255,0.65)] hover:text-gray-900 dark:hover:text-white transition text-sm">{{ t('footer.docs') }}</a>
              <NuxtLink to="/settings#sponsor" class="text-gray-400 dark:text-[rgba(255,255,255,0.65)] hover:text-gray-900 dark:hover:text-white transition text-sm">{{ t('sponsor.title') }}</NuxtLink>
            </div>
            <div class="flex flex-col gap-3">
              <div class="text-sm font-semibold text-gray-900 dark:text-white/90 mb-1">{{ t('footer.columnCommunity') }}</div>
              <a href="https://github.com/dmw-net/agnes_easyUse" target="_blank" rel="noopener" class="text-gray-400 dark:text-[rgba(255,255,255,0.65)] hover:text-gray-900 dark:hover:text-white transition text-sm">{{ t('footer.github') }}</a>
              <a href="https://github.com/dmw-net/agnes_easyUse/issues" target="_blank" rel="noopener" class="text-gray-400 dark:text-[rgba(255,255,255,0.65)] hover:text-gray-900 dark:hover:text-white transition text-sm">{{ t('footer.contact') }}</a>
              <a href="https://github.com/dmw-net/agnes_easyUse/blob/main/LICENSE" target="_blank" rel="noopener" class="text-gray-400 dark:text-[rgba(255,255,255,0.65)] hover:text-gray-900 dark:hover:text-white transition text-sm">{{ t('footer.license') }}</a>
            </div>
          </div>
        </div>

        <!-- 分隔线 -->
        <div class="h-px bg-gray-200/60 dark:bg-white/5 my-8 md:my-10"></div>

        <!-- 友情链接（轻量单行） -->
        <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
          <span class="text-gray-400 dark:text-[rgba(255,255,255,0.35)]">{{ t('footer.recommendTitle') }}</span>
          <a href="https://tools.2025521.xyz/" target="_blank" rel="noopener" class="inline-flex items-center gap-1 text-gray-500 dark:text-[rgba(255,255,255,0.55)] hover:text-[#0052FF] dark:hover:text-[#4D7CFF] transition">
            <span class="bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] bg-clip-text text-transparent font-medium">{{ t('footer.dmwName') }}</span>
            <span>— {{ t('footer.dmwDescShort') }}</span>
            <span aria-hidden="true">→</span>
          </a>
        </div>

        <!-- 底部版权行（仅一次） -->
        <div class="flex flex-col md:flex-row items-center justify-between gap-3">
          <div class="text-gray-400 dark:text-[rgba(255,255,255,0.3)] text-xs">{{ t('footer.copyright') }}</div>
          <div class="text-gray-400 dark:text-[rgba(255,255,255,0.3)] text-xs">{{ t('footer.builtWith') }}</div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// ========= i18n =========
const { t, locale, setLocale } = useI18n()
const currentLocale = computed(() => locale.value)

// 切换语言
const toggleLocale = () => {
  const newLocale = currentLocale.value === 'zh-CN' ? 'en' : 'zh-CN'
  setLocale(newLocale as 'zh-CN' | 'en')
}

// ========= 主题切换 (color-mode) =========
const colorMode = useColorMode()
const isDark = computed(() => colorMode.preference === 'dark')

// 切换主题
const toggleTheme = () => {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

// ========= 移动端菜单 =========
const mobileMenuOpen = ref(false)
</script>

<style scoped>
/* 移动菜单过渡动画 */
.mobile-menu-enter-active {
  transition: opacity 0.3s ease;
}
.mobile-menu-leave-active {
  transition: opacity 0.2s ease;
}
.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
}
.mobile-menu-enter-active > div {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.mobile-menu-leave-active > div {
  transition: transform 0.2s ease;
}
.mobile-menu-enter-from > div {
  transform: translateX(100%);
}
.mobile-menu-leave-to > div {
  transform: translateX(100%);
}
</style>
