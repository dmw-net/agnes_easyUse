<template>
  <div class="min-h-screen bg-white dark:bg-[#050508] text-gray-900 dark:text-white transition-colors duration-300 px-8 py-20">
    <div class="max-w-2xl mx-auto">
      <h1
        class="text-4xl font-bold mb-8 text-gray-900 dark:text-white/90"
        style="font-family: 'Inter', sans-serif;"
      >
        {{ t('settings.title') }}
      </h1>
      <p class="text-gray-500 dark:text-white/65 mb-12 leading-7">
        {{ t('settings.desc') }}
      </p>

      <!-- Agnes API Key —— 醒目渐变描边卡片 -->
      <div class="relative mb-8 rounded-3xl p-[1.5px] overflow-hidden" style="background: linear-gradient(135deg, #2EA7FF, #9381FF, #2EA7FF); background-size: 200% 200%; animation: border-glow 4s linear infinite;">
        <!-- 内部背景 -->
        <div class="rounded-[calc(1.5rem-1.5px)] p-6 md:p-8 bg-white dark:bg-[#0a0a18] transition-colors duration-300">
          <h2 class="text-xl md:text-2xl font-semibold mb-2 text-gray-900 dark:text-white/95" style="font-family: 'Inter', sans-serif;">{{ t('settings.agnesTitle') }}</h2>
          <p class="text-gray-500 dark:text-white/65 text-sm mb-5 leading-7">
            {{ t('settings.agnesDesc') }}<br />
            {{ t('settings.apiEndpoint') }}<code class="text-xs bg-gray-100 dark:bg-white/5 px-2 py-1 rounded">https://apihub.agnes-ai.com</code>
          </p>

          <!-- 获取 API Key 醒目按钮 -->
          <a
            href="https://platform.agnes-ai.com/settings/apiKeys"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center gap-2 px-5 py-2.5 mb-5 rounded-[99px] text-sm font-semibold text-white transition hover:opacity-90 hover:scale-[1.03] transform"
            style="background: linear-gradient(135deg, #2EA7FF 0%, #9381FF 100%);"
          >
            🔑 {{ locale === 'zh-CN' ? '获取 Agnes API Key' : 'Get Agnes API Key' }}
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
          </a>

          <div class="flex gap-3 flex-wrap">
            <input
              v-model="agnesKey"
              :type="showKey ? 'text' : 'password'"
              :placeholder="t('settings.keyPlaceholder')"
              class="flex-1 min-w-[200px] bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:border-blue-500 transition text-sm"
              style="font-family: 'Inter', sans-serif;"
            />
            <button
              @click="showKey = !showKey"
              class="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 text-gray-500 dark:text-white/65 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-white/30 transition text-sm whitespace-nowrap"
            >
              {{ showKey ? '🙈 ' + t('settings.hide') : '👁️ ' + t('settings.show') }}
            </button>
            <button
              @click="saveKey('agnes')"
              class="px-6 py-2.5 rounded-[99px] text-sm font-semibold text-white transition hover:opacity-90 hover:scale-[1.03] transform"
              style="background: linear-gradient(135deg, #2EA7FF 0%, #9381FF 100%);"
            >
              {{ t('settings.save') }}
            </button>
          </div>
          <p v-if="savedMessage === 'agnes'" class="text-green-500 dark:text-green-400 text-sm mt-3">
            ✅ {{ t('settings.saved') }}
          </p>
        </div>
      </div>

      <!-- 安全提示 -->
      <div class="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 transition-colors duration-300 mb-8">
        <h3 class="text-lg font-semibold mb-2 text-blue-600 dark:text-blue-400">{{ t('settings.securityTitle') }}</h3>
        <ul class="text-gray-600 dark:text-white/65 text-sm space-y-1">
          <li v-for="(tip, idx) in securityTips" :key="idx">• {{ tip }}</li>
        </ul>
      </div>

      <!-- 提示信息 -->
      <div class="mt-8 p-4 rounded-xl border border-yellow-300 dark:border-yellow-500/20 bg-yellow-50 dark:bg-yellow-500/10 transition-colors duration-300">
        <h3 class="text-lg font-semibold mb-2 text-yellow-600 dark:text-yellow-400">{{ t('settings.demoTitle') }}</h3>
        <p class="text-gray-600 dark:text-white/65 text-sm">
          {{ t('settings.demoDesc') }}
        </p>
      </div>

      <!-- 已配置的模型 -->
      <div class="mt-8">
        <h3 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white/90" style="font-family: 'Inter', sans-serif;">{{ t('settings.configuredModels') }}</h3>
        <div class="space-y-3">
          <div
            v-for="model in configuredModels"
            :key="model.name"
            class="p-4 rounded-xl border border-gray-200/50 dark:border-white/3 flex justify-between items-center bg-white/80 dark:bg-white/[0.01] transition-colors duration-300"
          >
            <div>
              <div class="font-semibold text-gray-900 dark:text-white/90" style="font-family: 'Inter', sans-serif;">{{ model.label }}</div>
              <div class="text-sm text-gray-400 dark:text-white/40 mt-1">{{ model.name }}</div>
            </div>
            <div
              :class="model.configured ? 'text-green-500 dark:text-green-400' : 'text-yellow-500 dark:text-yellow-400'"
              class="text-sm font-medium"
            >
              {{ model.configured ? t('settings.configured') : t('settings.notConfigured') }}
            </div>
          </div>
        </div>
      </div>

      <!-- 赞赏支持 -->
      <div
        id="sponsor"
        class="mt-8 rounded-2xl overflow-visible transition-colors duration-300"
        style="background: linear-gradient(135deg, rgba(46,167,255,0.06), rgba(147,129,255,0.06)); border: 1px solid rgba(147,129,255,0.12);"
      >
        <div class="p-6">
          <h2 class="text-xl font-semibold mb-1 text-gray-900 dark:text-white/90" style="font-family: 'Inter', sans-serif;">{{ t('sponsor.title') }}</h2>
          <p class="text-gray-500 dark:text-white/65 text-sm mb-5 leading-7">
            {{ t('sponsor.desc') }}
          </p>

          <!-- 引导文案 -->
          <div class="space-y-2 mb-6">
            <p class="text-gray-600 dark:text-white/70 text-sm leading-7">{{ t('sponsor.guide1') }}</p>
            <p class="text-gray-600 dark:text-white/70 text-sm leading-7">{{ t('sponsor.guide2') }}</p>
            <p class="text-gray-400 dark:text-white/50 text-sm leading-7">{{ t('sponsor.guide3') }}</p>
          </div>

          <!-- 微信 + 支付宝 独立卡片 -->
          <div class="flex flex-wrap justify-center gap-5">
            <!-- 微信赞赏卡片 -->
            <div
              v-if="sponsorWechatOk"
              class="relative"
              @mouseenter="!isMobile && (wechatQrShow = true, alipayQrShow = false)"
              @mouseleave="wechatQrShow = false"
            >
              <div
                class="px-6 py-3 rounded-xl border border-gray-200/60 dark:border-white/8 bg-white dark:bg-white/[0.03] cursor-pointer transition-all duration-300 text-sm font-semibold text-gray-700 dark:text-white/80 hover:border-green-400/30 hover:shadow-md"
                @click="isMobile && (wechatQrShow = !wechatQrShow, alipayQrShow = false)"
              >
                {{ t('sponsor.wechatCard') || '微信赞赏' }}
              </div>
              <!-- 桌面端：hover 弹出层 -->
              <transition name="qr-pop">
                <div
                  v-if="wechatQrShow"
                  class="hidden md:block absolute left-0 right-0 mx-auto top-full mt-3 z-20 bg-white dark:bg-[#16162a] rounded-xl border border-green-400/30 p-6 shadow-2xl w-[320px]"
                >
                  <img
                    :src="sponsorWechatSrc"
                    :alt="t('sponsor.wechatAlt')"
                    class="w-[280px] rounded-lg"
                  />
                </div>
              </transition>
            </div>

            <!-- 支付宝赞赏卡片 -->
            <div
              v-if="sponsorAlipayOk"
              class="relative"
              @mouseenter="!isMobile && (alipayQrShow = true, wechatQrShow = false)"
              @mouseleave="alipayQrShow = false"
            >
              <div
                class="px-6 py-3 rounded-xl border border-gray-200/60 dark:border-white/8 bg-white dark:bg-white/[0.03] cursor-pointer transition-all duration-300 text-sm font-semibold text-gray-700 dark:text-white/80 hover:border-blue-400/30 hover:shadow-md"
                @click="isMobile && (alipayQrShow = !alipayQrShow, wechatQrShow = false)"
              >
                {{ t('sponsor.alipayCard') || '支付宝赞赏' }}
              </div>
              <!-- 桌面端：hover 弹出层 -->
              <transition name="qr-pop">
                <div
                  v-if="alipayQrShow"
                  class="hidden md:block absolute left-0 right-0 mx-auto top-full mt-3 z-20 bg-white dark:bg-[#16162a] rounded-xl border border-blue-400/30 p-6 shadow-2xl w-[320px]"
                >
                  <img
                    :src="sponsorAlipaySrc"
                    :alt="t('sponsor.alipayAlt')"
                    class="w-[280px] rounded-lg"
                  />
                </div>
              </transition>
            </div>

            <!-- 两张码都没有 -->
            <div v-if="!sponsorWechatOk && !sponsorAlipayOk" class="text-center py-6 w-full">
              <p class="text-gray-400 dark:text-white/50 text-sm">{{ t('sponsor.comingSoon') }}</p>
            </div>
          </div>

          <!-- 移动端：二维码居中弹窗 -->
          <teleport to="body">
            <transition name="qr-modal">
              <div
                v-if="(wechatQrShow || alipayQrShow) && isMobile"
                class="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 md:hidden"
                @click="wechatQrShow = false; alipayQrShow = false"
              >
                <div
                  class="bg-white dark:bg-[#1a1a2e] rounded-2xl p-6 shadow-2xl"
                  @click.stop
                >
                  <img
                    v-if="wechatQrShow"
                    :src="sponsorWechatSrc"
                    :alt="t('sponsor.wechatAlt')"
                    class="w-[280px] rounded-xl"
                  />
                  <img
                    v-if="alipayQrShow"
                    :src="sponsorAlipaySrc"
                    :alt="t('sponsor.alipayAlt')"
                    class="w-[280px] rounded-xl"
                  />
                  <p class="text-xs text-center text-gray-500 dark:text-white/50 mt-3">{{ wechatQrShow ? t('sponsor.wechatAlt') : t('sponsor.alipayAlt') }}</p>
                  <button
                    @click="wechatQrShow = false; alipayQrShow = false"
                    class="mt-3 w-full py-2 rounded-xl text-sm text-gray-500 hover:text-gray-900 dark:text-white/50 dark:hover:text-white transition"
                  >关闭</button>
                </div>
              </div>
            </transition>
          </teleport>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApiKey } from '~/composables/useApiKey'

const { t, locale } = useI18n()
const { setApiKey, getApiKey } = useApiKey()

const agnesKey = ref(getApiKey('agnes') || '')
const showKey = ref(false)
const savedMessage = ref('')

// 赞赏码相关
const sponsorWechatOk = ref(false)
const sponsorAlipayOk = ref(false)
const sponsorWechatSrc = ref('/docs/sponsor-wechat.jpg')
const sponsorAlipaySrc = ref('/docs/sponsor-alipay.jpg')
const sponsorChecked = ref(false)
const wechatQrShow = ref(false)
const alipayQrShow = ref(false)

// 检测是否为移动端触屏设备
const isMobile = ref(false)
onMounted(() => {
  isMobile.value = 'ontouchstart' in window || window.innerWidth < 768
  window.addEventListener('resize', () => {
    isMobile.value = 'ontouchstart' in window || window.innerWidth < 768
  })
})

const checkSponsorImages = () => {
  if (sponsorChecked.value) return
  sponsorChecked.value = true

  const wechatImg = new Image()
  wechatImg.onload = () => { sponsorWechatOk.value = true }
  wechatImg.onerror = () => { sponsorWechatOk.value = false }
  wechatImg.src = sponsorWechatSrc.value

  const alipayImg = new Image()
  alipayImg.onload = () => { sponsorAlipayOk.value = true }
  alipayImg.onerror = () => { sponsorAlipayOk.value = false }
  alipayImg.src = sponsorAlipaySrc.value
}

// 安全提示（静态数组，根据 locale 切换，避免依赖 i18n 内部属性）
const securityTips = computed(() => {
  const loc = locale.value
  if (loc === 'en') {
    return [
      'API Key is stored only in your browser (localStorage)',
      'We never upload your API Key to any server',
      'All API calls go through a server-side proxy (Key is never exposed to frontend)',
      'Rotate your API Key periodically for security',
      'Get API Key: Visit Agnes AI Documentation'
    ]
  }
  return [
    'API Key 仅存储在你的浏览器（localStorage）中',
    '我们从未将你的 API Key 上传到任何服务器',
    '所有 API 调用均通过服务端代理（Key 不会暴露给前端）',
    '定期轮换 API Key 以保证安全',
    '获取 API Key：访问 Agnes AI 文档'
  ]
})

// 已配置的模型列表
const configuredModels = computed(() => [
  {
    label: t('settings.modelImage20'),
    name: 'agnes-image-2.0-flash',
    configured: !!agnesKey.value
  },
  {
    label: t('settings.modelImage21'),
    name: 'agnes-image-2.1-flash',
    configured: !!agnesKey.value
  },
  {
    label: t('settings.modelVideo20'),
    name: 'agnes-video-v2.0',
    configured: !!agnesKey.value
  }
])

const saveKey = (provider: string) => {
  const key = provider === 'agnes' ? agnesKey.value : ''

  if (!key) {
    alert(t('settings.keyPlaceholder'))
    return
  }

  if (key.length < 10) {
    alert(t('settings.keyPlaceholder') + '（长度不足）')
    return
  }

  setApiKey(provider, key)
  savedMessage.value = provider

  setTimeout(() => {
    savedMessage.value = ''
  }, 3000)
}

onMounted(() => {
  checkSponsorImages()
})
</script>

<style scoped>
/* 渐变描边呼吸动画 */
@keyframes border-glow {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* fade 过渡：提示文字淡出 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* qr-pop 过渡：二维码弹出淡入 + 轻微缩放 */
.qr-pop-enter-active {
  transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.qr-pop-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.qr-pop-enter-from {
  opacity: 0;
  transform: scale(0.92) translateY(10px);
}
.qr-pop-leave-to {
  opacity: 0;
  transform: scale(0.97) translateY(-6px);
}
/* 移动端二维码弹窗过渡 */
.qr-modal-enter-active {
  transition: opacity 0.3s ease;
}
.qr-modal-leave-active {
  transition: opacity 0.2s ease;
}
.qr-modal-enter-from,
.qr-modal-leave-to {
  opacity: 0;
}
.qr-modal-enter-active > div {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.qr-modal-leave-active > div {
  transition: transform 0.2s ease;
}
.qr-modal-enter-from > div {
  transform: scale(0.9);
}
.qr-modal-leave-to > div {
  transform: scale(0.95);
}
</style>
