<template>
  <div class="min-h-screen bg-[#030014] text-white">
    <!-- 操作区 + 结果区：左右布局 -->
    <section id="video-gen" class="max-w-7xl mx-auto px-8 py-12">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">

        <!-- ========== 左侧：操作区 ========== -->
        <div class="space-y-6">

          <!-- 标题 -->
          <div>
            <h2 class="text-3xl font-bold" style="font-family: 'Inter Tight', sans-serif;">
              {{ t('videoGen.title') }}
            </h2>
            <p class="text-white/40 text-sm mt-2">{{ t('videoGen.subtitle') }}</p>
          </div>

          <!-- 演示模式警告 -->
          <div
            v-if="!hasApiKey"
            class="border border-yellow-400/30 bg-yellow-400/5 rounded-xl p-4 flex items-start gap-3"
          >
            <span class="text-yellow-400 text-lg">⚠️</span>
            <div class="flex-1">
              <p class="text-yellow-200/90 text-sm">{{ t('imageGen.demoWarning') }}</p>
              <NuxtLink to="/settings" class="text-yellow-400 hover:underline text-sm font-medium">
                {{ t('imageGen.goSettings') }} →
              </NuxtLink>
            </div>
          </div>

          <!-- 生成模式切换 -->
          <div>
            <label class="block text-sm font-medium text-white/65 mb-2">{{ t('videoGen.modeLabel') }}</label>
            <div class="flex gap-2">
              <button
                v-for="m in videoModes"
                :key="m.value"
                @click="videoMode = m.value; uploadedVideos = []"
                :disabled="videoLoading"
                class="px-4 py-2 rounded-lgl text-sm font-medium transition"
                :class="
                  videoMode === m.value
                    ? 'text-white shadow-sm'
                    : 'bg-white/[0.04] text-white/50 hover:text-white/80 hover:bg-white/[0.08]'
                "
                :style="videoMode === m.value ? 'background: linear-gradient(135deg, #2EA7FF 0%, #9381FF 100%);' : ''"
              >
                {{ m.label }}
              </button>
            </div>
          </div>

          <!-- 提示词输入 -->
          <div>
            <label class="block text-sm font-medium text-white/65 mb-2">{{ t('videoGen.promptLabel') }}</label>
            <textarea
              v-model="videoPrompt"
              :placeholder="t('videoGen.promptPlaceholder')"
              :disabled="videoLoading"
              class="w-full min-h-[100px] p-4 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-y bg-white dark:bg-white/[0.05] border border-gray-200 dark:border-white/10 focus:border-blue-400 dark:focus:border-blue-400 dark:focus:shadow-[0_0_0_3px_rgba(46,167,255,0.15)] transition disabled:opacity-50 disabled:cursor-not-allowed"
            ></textarea>
            <p class="text-xs text-white/30 mt-1">{{ t('videoGen.promptHint') }}</p>
          </div>

          <!-- 图片上传（图生视频 / 多图 / 关键帧） -->
          <div v-if="videoMode !== 'text2video'">
            <label class="block text-sm font-medium text-white/65 mb-2">
              {{ videoMode === 'keyframes' ? t('videoGen.keyframesLabel') : t('videoGen.imageLabel') }}
            </label>
            <!-- 上传区域 -->
            <div
              @click="triggerVideoUpload"
              @dragover.prevent
              @drop.prevent="onVideoImageDrop"
              class="border-2 border-dashed border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400/50 hover:bg-white/[0.02] transition"
              :class="{ 'opacity-50 cursor-not-allowed': videoLoading }"
            >
              <input
                ref="videoFileInput"
                type="file"
                accept="image/*"
                :multiple="videoMode === 'multi' || videoMode === 'keyframes'"
                class="hidden"
                @change="onVideoImageSelect"
                :disabled="videoLoading"
              />
              <p class="text-white/40 text-sm">
                {{ videoMode === 'multi' || videoMode === 'keyframes'
                  ? t('videoGen.dropImagesHint')
                  : t('videoGen.dropImageHint') }}
              </p>
            </div>
            <!-- 已上传图片预览 -->
            <div v-if="uploadedVideos.length > 0" class="flex flex-wrap gap-2 mt-3">
              <div
                v-for="(img, idx) in uploadedVideos"
                :key="idx"
                class="relative w-20 h-20 rounded-lgl overflow-hidden border border-white/10"
              >
                <img :src="img.dataUrl" class="w-full h-full object-cover" />
                <button
                  @click="uploadedVideos.splice(idx, 1)"
                  :disabled="videoLoading"
                  class="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/80 text-white text-xs flex items-center justify-center hover:bg-red-500 transition disabled:opacity-50"
                >×</button>
              </div>
            </div>
            <!-- URL 输入 -->
            <div class="mt-3 flex gap-2">
              <input
                v-model="videoImageUrl"
                :placeholder="t('imageGen.imageUrlPlaceholder')"
                :disabled="videoLoading"
                class="flex-1 px-3 py-2 rounded-lgl text-sm text-gray-900 dark:text-white bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 focus:outline-none focus:border-blue-400 disabled:opacity-50"
              />
              <button
                @click="addVideoImageByUrl"
                :disabled="!videoImageUrl.trim() || videoLoading"
                class="px-4 py-2 rounded-lgl text-sm font-medium bg-white/[0.06] hover:bg-white/[0.10] text-white/80 hover:text-white transition disabled:opacity-50"
              >{{ t('imageGen.addUrlBtn') }}</button>
            </div>
          </div>

          <!-- 视频参数 -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-white/65 mb-2">{{ t('videoGen.durationLabel') }}</label>
              <select
                v-model="videoDuration"
                :disabled="videoLoading"
                class="w-full px-3 py-2 rounded-lgl text-sm text-gray-900 dark:text-white bg-white dark:bg-white/[0.05] border border-gray-200 dark:border-white/10 focus:outline-none focus:border-blue-400 disabled:opacity-50"
              >
                <option value="3">~3s (81 frames)</option>
                <option value="5">~5s (121 frames)</option>
                <option value="10">~10s (241 frames)</option>
                <option value="18">~18s (441 frames)</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-white/65 mb-2">{{ t('videoGen.aspectLabel') }}</label>
              <select
                v-model="videoAspect"
                :disabled="videoLoading"
                class="w-full px-3 py-2 rounded-lgl text-sm text-gray-900 dark:text-white bg-white dark:bg-white/[0.05] border border-gray-200 dark:border-white/10 focus:outline-none focus:border-blue-400 disabled:opacity-50"
              >
                <option value="16:9">16:9 横屏</option>
                <option value="9:16">9:16 竖屏</option>
                <option value="1:1">1:1 方形</option>
                <option value="4:3">4:3 传统</option>
                <option value="3:4">3:4 竖向</option>
              </select>
            </div>
          </div>

          <!-- 负向提示词 -->
          <div>
            <label class="block text-sm font-medium text-white/65 mb-2">{{ t('videoGen.negativeLabel') }}</label>
            <input
              v-model="videoNegative"
              :placeholder="t('videoGen.negativePlaceholder')"
              :disabled="videoLoading"
              class="w-full px-4 py-2 rounded-xl text-sm text-gray-900 dark:text-white bg-white dark:bg-white/[0.05] border border-gray-200 dark:border-white/10 focus:outline-none focus:border-blue-400 disabled:opacity-50"
            />
          </div>

          <!-- 生成按钮 -->
          <button
            @click="generateVideo"
            :disabled="!canGenerateVideo || videoLoading"
            class="w-full py-3 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            :style="!canGenerateVideo || videoLoading ? {} : 'background: linear-gradient(135deg, #2EA7FF 0%, #9381FF 100%);'"
          >
            <svg v-if="videoLoading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            {{ videoLoading ? t('videoGen.generating') : t('videoGen.generateBtn') }}
          </button>

          <!-- 轮询状态 -->
          <div v-if="videoLoading" class="text-center">
            <p class="text-sm text-white/40 mb-2">
              {{ t('videoGen.pollingStatus', { status: videoStatus, progress: videoProgress }) }}
            </p>
            <div class="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                :style="`width: ${videoProgress}%; background: linear-gradient(90deg, #2EA7FF, #9381FF);`"
              ></div>
            </div>
          </div>

        </div><!-- /左侧操作区 -->

        <!-- ========== 右侧：结果区 ========== -->
        <div class="lg:sticky lg:top-24 self-start">
          <div class="rounded-2xl p-6 border border-white/5" style="background: rgba(255,255,255,0.02); backdrop-filter: blur(50px);">
            <h3 class="text-lg font-semibold mb-4">{{ t('videoGen.resultTitle') }}</h3>

            <!-- 加载中 -->
            <div v-if="videoLoading" class="text-center py-12">
              <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400 mb-4"></div>
              <p class="text-white/40 text-sm">{{ t('videoGen.processing') }}</p>
            </div>

            <!-- 错误 -->
            <div v-else-if="videoError" class="text-center py-8">
              <div class="text-red-400/90 text-sm bg-red-400/5 border border-red-400/20 rounded-xl p-4">
                ⚠️ {{ videoError }}
              </div>
            </div>

            <!-- 视频结果 -->
            <div v-else-if="videoResultUrl" class="space-y-4">
              <video
                :src="videoResultUrl"
                controls
                class="w-full rounded-xl border border-white/10"
              ></video>
              <a
                :href="videoResultUrl"
                target="_blank"
                download
                class="block w-full text-center py-2 rounded-lgl text-sm font-medium bg-white/[0.06] hover:bg-white/[0.10] text-white/80 hover:text-white transition"
              >
                ⬇ {{ t('videoGen.downloadBtn') }}
              </a>
              <p v-if="videoSeconds" class="text-center text-xs text-white/30">
                {{ t('videoGen.durationInfo', { seconds: videoSeconds, size: videoSize }) }}
              </p>
            </div>

            <!-- 空状态 -->
            <div v-else class="text-center py-12">
              <div class="text-white/20 text-sm">{{ t('videoGen.emptyState') }}</div>
            </div>

          </div>
        </div><!-- /右侧结果区 -->

      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'

const { t, locale } = useI18n()

// ========= 模式 =========
const videoModes = [
  { value: 'text2video',  label: '文生视频' },
  { value: 'image2video', label: '图生视频' },
  { value: 'multi',       label: '多图视频' },
  { value: 'keyframes',  label: '关键帧' },
]
const videoMode = ref('text2video')
const uploadedVideos = ref<{ file: File, dataUrl: string }[]>([])
const videoFileInput = ref<HTMLInputElement | null>(null)
const videoImageUrl = ref('')

// ========= 表单状态 =========
const videoPrompt    = ref('')
const videoDuration  = ref('5')
const videoAspect    = ref('16:9')
const videoNegative  = ref('')
const videoLoading   = ref(false)
const videoError     = ref<string | null>(null)
const videoResultUrl = ref('')
const videoTaskId    = ref('')
const videoId        = ref('')
const videoStatus    = ref('')
const videoProgress  = ref(0)
const videoSeconds   = ref('')
const videoSize      = ref('')
let   pollTimer: ReturnType<typeof setInterval> | null = null

const hasApiKey = ref(false)
const canGenerateVideo = computed(() => {
  if (!videoPrompt.value.trim()) return false
  if (videoMode.value !== 'text2video' && uploadedVideos.value.length === 0 && !videoImageUrl.value.trim()) return false
  return true
})

// ========= 图片上传 =========
const triggerVideoUpload = () => {
  if (videoLoading.value) return
  videoFileInput.value?.click()
}
const onVideoImageSelect = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  Array.from(files).forEach(f => readVideoImageFile(f))
  ;(e.target as HTMLInputElement).value = ''
}
const onVideoImageDrop = (e: DragEvent) => {
  if (videoLoading.value) return
  const files = e.dataTransfer?.files
  if (files) Array.from(files).forEach(f => readVideoImageFile(f))
}
const readVideoImageFile = (file: File) => {
  if (!file.type.startsWith('image/')) return
  const reader = new FileReader()
  reader.onload = () => {
    uploadedVideos.value.push({ file, dataUrl: reader.result as string })
  }
  reader.readAsDataURL(file)
}
const addVideoImageByUrl = () => {
  const url = videoImageUrl.value.trim()
  if (!url) return
  uploadedVideos.value.push({ file: new File([], ''), dataUrl: url })
  videoImageUrl.value = ''
}

// ========= 计算视频参数 =========
const getVideoParams = () => {
  const duration = Number(videoDuration.value)
  const num_frames = duration <= 3 ? 81 : duration <= 5 ? 121 : duration <= 10 ? 241 : 441
  const frame_rate = 24
  let width = 1152, height = 768
  switch (videoAspect.value) {
    case '16:9':  width = 1152; height = 648;  break
    case '9:16':  width = 576;  height = 1024; break
    case '1:1':   width = 1024; height = 1024; break
    case '4:3':   width = 1024; height = 768;  break
    case '3:4':   width = 768;  height = 1024; break
  }
  return { num_frames, frame_rate, width, height }
}

// ========= 获取 API Key =========
const getStoredApiKey = (): string => {
  if (process.client) {
    try {
      const raw = localStorage.getItem('ai-genesis-api-keys')
      if (raw) {
        const keys = JSON.parse(raw)
        return keys.agnes || ''
      }
    } catch {}
  }
  return ''
}

// ========= 生成视频 =========
const generateVideo = async () => {
  if (!canGenerateVideo.value || videoLoading.value) return
  videoLoading.value   = true
  videoError.value     = null
  videoResultUrl.value = ''
  videoProgress.value  = 0
  videoStatus.value    = 'queued'

  // 停止之前的轮询
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null }

  try {
    const { num_frames, frame_rate, width, height } = getVideoParams()
    const body: any = {
      model:      'agnes-video-v2.0',
      prompt:      videoPrompt.value,
      height,
      width,
      num_frames,
      frame_rate,
      apiKey:      getStoredApiKey()
    }
    if (videoNegative.value.trim()) {
      body.negative_prompt = videoNegative.value
    }
    // 图片参数
    if (videoMode.value !== 'text2video' && uploadedVideos.value.length > 0) {
      const urls = uploadedVideos.value.map(v => v.dataUrl.startsWith('data:') ? v.dataUrl : v.dataUrl)
      if (videoMode.value === 'keyframes') {
        body.extra_body = { image: urls, mode: 'keyframes' }
      } else {
        body.image = videoMode.value === 'multi' ? urls : urls[0]
      }
    }
    // 多图模式兼容
    if (videoMode.value === 'multi' && uploadedVideos.value.length > 1) {
      body.extra_body = { image: uploadedVideos.value.map(v => v.dataUrl) }
      delete body.image
    }

    // 1. 创建任务
    const task = await $fetch<{
      task_id:  string
      video_id:  string
      status:    string
      progress:  number
      seconds:   string
      size:      string
    }>('/api/generate/video', {
      method: 'POST',
      body
    })

    videoTaskId.value = task.task_id || ''
    videoId.value   = task.video_id || ''
    videoStatus.value = task.status || 'queued'
    videoProgress.value = task.progress || 0
    videoSeconds.value = task.seconds || ''
    videoSize.value    = task.size || ''

    if (!videoId.value) throw new Error('No video_id returned')

    // 2. 开始轮询
    pollTimer = setInterval(pollVideoStatus, 5000)

  } catch (error: any) {
    console.error('[Video] Generate failed:', error)
    videoError.value = error.data?.statusMessage || error.message || '视频生成失败'
    videoLoading.value = false
  }
}

// ========= 轮询状态 =========
const pollVideoStatus = async () => {
  if (!videoId.value) return
  try {
    const result = await $fetch<{
      status:    string
      progress:  number
      seconds:   string
      size:      string
      video_url:  string | null
      error:      any
    }>('/api/video/status', {
      query: { video_id: videoId.value, apiKey: getStoredApiKey() }
    })

    videoStatus.value   = result.status || ''
    videoProgress.value = result.progress || 0
    videoSeconds.value  = result.seconds || ''
    videoSize.value     = result.size || ''

    if (result.status === 'completed') {
      if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
      videoResultUrl.value = result.video_url || ''
      videoLoading.value   = false
    } else if (result.status === 'failed') {
      if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
      videoError.value   = result.error?.message || '视频生成失败'
      videoLoading.value = false
    }
  } catch (error: any) {
    console.error('[Video] Poll failed:', error)
    // 轮询失败不中断，继续轮询
  }
}

// ========= 检查 API Key =========
onMounted(() => {
  const key = getStoredApiKey()
  hasApiKey.value = !!key
})

onUnmounted(() => {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
})
</script>
