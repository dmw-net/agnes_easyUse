<template>
  <div class="min-h-screen bg-white dark:bg-[#030014] text-gray-900 dark:text-white transition-colors duration-300 px-8 py-20">
    <div class="max-w-2xl mx-auto">
      <h1
        class="text-4xl font-bold mb-8 text-gray-900 dark:text-white"
        style="font-family: 'Inter', sans-serif;"
      >
        {{ t('settings.title') }}
      </h1>
      <p class="text-gray-500 dark:text-white/65 mb-12 leading-7">
        {{ t('settings.desc') }}
      </p>

      <!-- Agnes API Key -->
      <div
        class="p-6 mb-6 rounded-2xl border border-gray-200/50 dark:border-white/5 transition-colors duration-300"
        style="background: rgba(255,255,255,0.8); dark:background: rgba(255,255,255,0.02); backdrop-filter: blur(50px);"
      >
        <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white" style="font-family: 'Inter', sans-serif;">{{ t('settings.agnesTitle') }}</h2>
        <p class="text-gray-500 dark:text-white/65 text-sm mb-4">
          {{ t('settings.agnesDesc') }}<br />
          {{ t('settings.apiEndpoint') }}<code class="text-xs bg-gray-100 dark:bg-white/5 px-2 py-1 rounded">https://apihub.agnes-ai.com</code>
        </p>
        <div class="flex gap-4">
          <input
            v-model="agnesKey"
            :type="showKey ? 'text' : 'password'"
            :placeholder="t('settings.keyPlaceholder')"
            class="flex-1 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg px-4 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:border-blue-500 transition"
            style="font-family: 'Inter', sans-serif;"
          />
          <button
            @click="showKey = !showKey"
            class="px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 text-gray-500 dark:text-white/65 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-white/30 transition text-sm"
          >
            {{ showKey ? '🙈 ' + t('settings.hide') : '👁️ ' + t('settings.show') }}
          </button>
          <button
            @click="saveKey('agnes')"
            class="px-6 py-2 rounded-[99px] text-sm font-semibold text-white transition hover:opacity-90"
            style="background: linear-gradient(135deg, #2EA7FF 0%, #9381FF 100%);"
          >
            {{ t('settings.save') }}
          </button>
        </div>
        <p v-if="savedMessage === 'agnes'" class="text-green-500 dark:text-green-400 text-sm mt-2">
          ✅ {{ t('settings.saved') }}
        </p>

        <!-- 安全提示 -->
        <div class="mt-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 transition-colors duration-300">
          <h3 class="text-lg font-semibold mb-2 text-blue-600 dark:text-blue-400">{{ t('settings.securityTitle') }}</h3>
          <ul class="text-gray-600 dark:text-white/65 text-sm space-y-1">
            <li v-for="(tip, idx) in securityTips" :key="idx">• {{ tip }}</li>
          </ul>
        </div>
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
        <h3 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white" style="font-family: 'Inter', sans-serif;">{{ t('settings.configuredModels') }}</h3>
        <div class="space-y-3">
          <div
            v-for="model in configuredModels"
            :key="model.name"
            class="p-4 rounded-xl border border-gray-200/50 dark:border-white/5 flex justify-between items-center transition-colors duration-300"
            style="background: rgba(255,255,255,0.8); dark:background: rgba(255,255,255,0.02);"
          >
            <div>
              <div class="font-semibold text-gray-900 dark:text-white" style="font-family: 'Inter', sans-serif;">{{ model.label }}</div>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApiKey } from '~/composables/useApiKey'

const { t } = useI18n()
const { setApiKey, getApiKey } = useApiKey()

const agnesKey = ref(getApiKey('agnes') || '')
const showKey = ref(false)
const savedMessage = ref('')

// 安全提示（从语言包动态获取）
const securityTips = computed(() => t('settings.securityTips'))

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
  // 初始化
})
</script>
