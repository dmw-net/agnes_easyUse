<template>
  <div class="min-h-screen">
    <!-- 页面标题区 -->
    <section class="relative pt-28 pb-12 px-8 overflow-hidden">
      <div class="absolute inset-0 opacity-40"
        style="background: radial-gradient(circle at 50% 30%, rgba(94,167,255,0.4) 0%, transparent 70%);"
      ></div>
      <div class="relative z-10 max-w-4xl mx-auto text-center">
        <h1 class="text-5xl font-bold mb-4 text-gray-900 dark:text-white"
          style="font-family: 'Inter Tight', sans-serif; letter-spacing: -0.03em;"
        >{{ t('create.title') }}</h1>
        <p class="text-lg text-gray-500 dark:text-white/65">{{ t('create.subtitle') }}</p>
      </div>
    </section>

    <!-- Tab 切换 -->
    <section class="px-8 pb-8">
      <div class="max-w-7xl mx-auto">
        <div class="flex gap-2 p-1 rounded-2xl bg-gray-100 dark:bg-white/[0.04] border border-gray-200/50 dark:border-white/5 w-fit">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            @click="activeTab = tab.value"
            :disabled="imageLoading || videoLoading"
            :class="[
              'px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-300',
              activeTab === tab.value
                ? 'text-white shadow-lg'
                : 'text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white/70'
            ]"
            :style="activeTab === tab.value ? 'background: linear-gradient(135deg, #2EA7FF 0%, #9381FF 100%);' : ''"
          >
            <span class="mr-2">{{ tab.icon }}</span>
            {{ tab.label }}
          </button>
        </div>
      </div>
    </section>

    <!-- 图片生成 Tab 内容 -->
    <section v-if="activeTab === 'image'" id="image-gen" class="px-8 pb-[120px]">
      <div class="max-w-7xl mx-auto">
        <h2 class="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">{{ t('imageGen.title') }}</h2>
        <p class="text-gray-500 dark:text-white/65 mb-8">{{ t('imageGen.subtitle') }}</p>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- 左侧：操作区 -->
          <div class="space-y-6">
            <!-- 模型选择 -->
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-white/65 mb-2">{{ t('imageGen.model') }}</label>
              <div class="flex gap-3">
                <button
                  @click="onModelChange('agnes-image-2.0-flash')"
                  :disabled="imageLoading"
                  :class="[
                    'px-5 py-2.5 rounded-xl text-sm font-semibold transition border-2 disabled:opacity-50 disabled:cursor-not-allowed',
                    imageModel === 'agnes-image-2.0-flash'
                      ? 'border-blue-400 bg-blue-500/10 text-blue-400'
                      : 'border-transparent bg-gray-100 dark:bg-white/[0.04] text-gray-600 dark:text-white/50 hover:border-gray-300 dark:hover:border-white/10'
                  ]"
                >{{ t('imageGen.model20') }}</button>
                <button
                  @click="onModelChange('agnes-image-2.1-flash')"
                  :disabled="imageLoading"
                  :class="[
                    'px-5 py-2.5 rounded-xl text-sm font-semibold transition border-2 disabled:opacity-50 disabled:cursor-not-allowed',
                    imageModel === 'agnes-image-2.1-flash'
                      ? 'border-blue-400 bg-blue-500/10 text-blue-400'
                      : 'border-transparent bg-gray-100 dark:bg-white/[0.04] text-gray-600 dark:text-white/50 hover:border-gray-300 dark:hover:border-white/10'
                  ]"
                >{{ t('imageGen.model21') }}</button>
              </div>
              <p class="text-xs text-gray-400 dark:text-white/40 mt-2">{{ imageModel === 'agnes-image-2.0-flash' ? t('imageGen.desc20') : t('imageGen.desc21') }}</p>
            </div>

            <!-- 生成模式 -->
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-white/65 mb-2">{{ t('imageGen.mode') }}</label>
              <div class="flex gap-3">
                <button @click="genMode = 'text2img'" :disabled="imageLoading" :class="modeBtnClass('text2img')">{{ t('imageGen.modeText2Img') }}</button>
                <button @click="genMode = 'image2img'" :disabled="imageLoading" :class="modeBtnClass('image2img')">{{ t('imageGen.modeImage2Img') }}</button>
                <button v-if="imageModel === 'agnes-image-2.0-flash'" @click="genMode = 'multiimg'" :disabled="imageLoading" :class="modeBtnClass('multiimg')">{{ t('imageGen.modeMultiImg') }}</button>
              </div>
            </div>

            <!-- 图片上传 -->
            <div v-if="genMode !== 'text2img'">
              <label class="block text-sm font-medium text-gray-500 dark:text-white/65 mb-2">{{ t('imageGen.uploadLabel') }}</label>
              <div
                @dragover.prevent="onDragOver"
                @dragleave="onDragLeave"
                @drop.prevent="onDrop"
                @click="!imageLoading && triggerFileInput()"
                :class="[
                  'relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition',
                  imageLoading ? 'opacity-50 cursor-not-allowed' : '',
                  dragOver ? 'border-blue-400 bg-blue-500/10' : 'border-gray-300 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-400/50 bg-gray-50 dark:bg-white/[0.02]'
                ]"
              >
                <input ref="fileInputRef" type="file" :accept="genMode === 'multiimg' ? 'image/*' : 'image/*'" :multiple="genMode === 'multiimg'" class="hidden" @change="onFileChange" :disabled="imageLoading" />
                <div class="flex flex-col items-center gap-2 text-gray-400 dark:text-white/40">
                  <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.08-7.777 5.25 5.25 0 0110.217 0A4.5 4.5 0 0113.5 19.5h-6.75z" /></svg>
                  <p class="text-sm">{{ t('imageGen.uploadHint') }}</p>
                </div>
              </div>
              <div class="mt-3 flex items-center gap-2">
                <input v-model="imageUrlInput" :placeholder="t('imageGen.orUseUrl') + ' (https://...)'" :disabled="imageLoading"
                  class="flex-1 px-3 py-2 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 disabled:opacity-50" />
                <button @click="addImageUrl" :disabled="!imageUrlInput.trim() || imageLoading"
                  :class="(!imageUrlInput.trim() || imageLoading) ? 'opacity-40 cursor-not-allowed' : 'hover:bg-blue-500/20'"
                  class="px-3 py-2 rounded-lg text-xs font-medium border border-blue-500/30 text-blue-500 dark:text-blue-400 transition disabled:opacity-50"
                  style="background: rgba(46,167,255,0.08);"
                >{{ t('imageGen.add') || '添加' }}</button>
              </div>
              <div v-if="uploadedImages.length > 0" class="mt-3 flex flex-wrap gap-2">
                <div v-for="(img, idx) in uploadedImages" :key="idx" class="relative group w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-white/10">
                  <img :src="img.preview" alt="preview" class="w-full h-full object-cover" />
                  <button @click="removeImage(idx)" :disabled="imageLoading" class="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/80 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition disabled:opacity-50">{{ '✕' }}</button>
                </div>
              </div>
            </div>

            <!-- 提示词 -->
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-white/65 mb-2">{{ t('imageGen.prompt') }}</label>
              <div class="relative">
                <textarea v-model="imagePrompt" :placeholder="t('imageGen.promptPlaceholder')" :disabled="imageLoading"
                  class="w-full min-h-[100px] p-4 pr-20 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-y bg-white dark:bg-white/[0.05] border border-gray-200 dark:border-white/10 focus:border-blue-400 transition disabled:opacity-50"
                ></textarea>
                <button @click="optimizePrompt" :disabled="optimizing || !imagePrompt.trim() || imageLoading"
                  :class="(optimizing || !imagePrompt.trim() || imageLoading) ? 'opacity-30 cursor-not-allowed' : 'hover:bg-blue-500/20 hover:border-blue-500/50'"
                  class="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg text-xs font-medium border border-blue-500/20 transition flex items-center gap-1 disabled:opacity-50"
                  style="background: rgba(46,167,255,0.08);"
                ><span v-if="optimizing" class="animate-spin">⏳</span><span v-else>✨</span> {{ optimizing ? t('imageGen.optimizing') : t('imageGen.optimize') }}</button>
              </div>
            </div>

            <!-- 图片尺寸 -->
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-white/65 mb-2">{{ t('imageGen.size') }}</label>
              <div class="flex gap-3">
                <button v-for="size in imageSizes" :key="size.value" @click="imageSize = size.value" :disabled="imageLoading"
                  :class="[
                    'px-4 py-2.5 rounded-xl text-sm font-semibold transition border-2 disabled:opacity-50 disabled:cursor-not-allowed',
                    imageSize === size.value ? 'border-blue-400 bg-blue-500/10 text-blue-400' : 'border-transparent bg-gray-100 dark:bg-white/[0.04] text-gray-600 dark:text-white/50'
                  ]"
                >{{ size.label }}</button>
              </div>
            </div>

            <!-- 生成按钮 -->
            <button @click="generateImage" :disabled="imageLoading || !imagePrompt.trim() || (genMode !== 'text2img' && uploadedImages.length === 0)"
              :class="(imageLoading || !imagePrompt.trim() || (genMode !== 'text2img' && uploadedImages.length === 0)) ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 hover:scale-[1.02] transform'"
              class="w-full px-8 py-4 rounded-[99px] text-base font-semibold text-white transition flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              style="background: linear-gradient(135deg, #2EA7FF 0%, #9381FF 100%);"
            >
              <span v-if="imageLoading" class="animate-spin">⏳</span>
              {{ imageLoading ? t('imageGen.generating') : t('imageGen.generate') }}
            </button>

            <!-- 演示模式提示 -->
            <div v-if="!hasApiKey" class="p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10">
              <div class="flex items-start gap-3">
                <span class="text-yellow-500 text-lg">⚠️</span>
                <div>
                  <p class="text-yellow-600 dark:text-yellow-400 text-sm font-medium mb-1">{{ t('imageGen.demoWarningTitle') || '演示模式' }}</p>
                  <p class="text-yellow-600 dark:text-yellow-400/80 text-sm">{{ t('imageGen.demoWarning') }}</p>
                  <NuxtLink to="/settings" class="inline-block mt-2 text-sm font-medium text-yellow-600 dark:text-yellow-400 hover:underline">{{ t('imageGen.goToSettings') || '前往设置 →' }}</NuxtLink>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：生成结果 -->
          <div class="lg:sticky lg:top-24 self-start">
            <div class="rounded-2xl p-6 border border-gray-200/50 dark:border-white/5 bg-white/80 dark:bg-white/[0.02] min-h-[400px] flex flex-col backdrop-blur-xl">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ t('imageGen.result') }}</h3>
                <button v-if="imageResult || imageError" @click="clearResult" class="text-xs text-gray-400 dark:text-white/40 hover:text-red-500 dark:hover:text-red-400 transition">{{ t('imageGen.clearResult') || '清空结果' }}</button>
              </div>

              <div v-if="!imageResult && !imageError && !imageLoading" class="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-white/30">
                <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24" class="mb-3 opacity-40"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-6.75 0l3.75 3.75m-3.75-3.75l-3.75-3.75M12 3v18" /></svg>
                <p class="text-sm">{{ t('imageGen.waitingForGeneration') || '等待生成...' }}</p>
              </div>

              <div v-if="imageLoading" class="flex-1 flex flex-col items-center justify-center">
                <div class="relative w-16 h-16 mb-4">
                  <div class="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
                  <div class="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                  <div class="absolute inset-2 flex items-center justify-center"><span class="text-xl">🎨</span></div>
                </div>
                <p class="text-gray-600 dark:text-white/70 font-medium text-sm">{{ t('imageGen.generating') }}</p>
                <p class="text-sm text-blue-400 dark:text-blue-300 mt-1">{{ t('imageGen.generatingTime', { time: generationTime }) }}</p>
                <div class="mt-4 w-40 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                </div>
              </div>

              <div v-if="imageError" class="text-red-500 text-sm p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <div class="flex items-center gap-2 mb-1"><span>❌</span><span class="font-medium">{{ t('imageGen.errorOccurred') || '发生错误' }}</span></div>
                <p class="text-sm">{{ imageError }}</p>
              </div>

              <div v-if="imageResult && !imageLoading" class="flex-1 flex flex-col">
                <div v-if="generationTime > 0" class="flex items-center gap-2 text-sm text-gray-500 dark:text-white/50 mb-3">
                  <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span>{{ t('imageGen.time', { time: generationTime }) }}</span>
                </div>
                <div v-if="imageResult.url" class="text-center flex-1 flex flex-col">
                  <div class="relative group flex-1 flex items-center justify-center bg-gray-100 dark:bg-white/[0.02] rounded-xl overflow-hidden mb-3">
                    <img :src="imageResult.url" alt="Generated image" class="max-w-full max-h-[350px] object-contain rounded-xl" @load="onImageLoad" />
                    <div v-if="imageLoaded" class="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/60 text-white text-xs flex items-center gap-1"><span>✓</span>{{ t('imageGen.imageLoaded') || '图片加载完成' }}</div>
                  </div>
                  <a :href="imageResult.url" target="_blank" download
                    class="inline-block px-6 py-2.5 rounded-[99px] text-sm font-semibold text-white transition hover:opacity-90"
                    style="background: linear-gradient(135deg, #2EA7FF 0%, #9381FF 100%);">📥 {{ t('imageGen.download') }}</a>
                </div>
                <div v-if="imageResult.b64_json" class="text-center flex-1 flex flex-col">
                  <div class="relative group flex-1 flex items-center justify-center bg-gray-100 dark:bg-white/[0.02] rounded-xl overflow-hidden mb-3">
                    <img :src="'data:image/png;base64,' + imageResult.b64_json" alt="Generated image" class="max-w-full max-h-[350px] object-contain rounded-xl" />
                  </div>
                  <button @click="downloadBase64Image"
                    class="inline-block px-6 py-2.5 rounded-[99px] text-sm font-semibold text-white transition hover:opacity-90"
                    style="background: linear-gradient(135deg, #2EA7FF 0%, #9381FF 100%);">📥 {{ t('imageGen.download') }}</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 历史记录 -->
        <div id="history" class="mt-16 pt-12 border-t border-gray-200/50 dark:border-white/5">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">{{ t('history.title') }}</h2>
            <button v-if="history.length > 0" @click="onClearAllHistory"
              class="px-4 py-2 rounded-lg text-sm font-medium text-red-500 border border-red-500/30 hover:bg-red-500/10 transition">{{ t('history.clearAll') }}</button>
          </div>
          <div v-if="history.length === 0" class="text-center py-16 text-gray-400 dark:text-white/30">
            <p class="text-base mb-1">{{ t('history.empty') }}</p>
            <p class="text-sm">{{ t('history.emptyDesc') }}</p>
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div v-for="record in history" :key="record.id"
              class="rounded-2xl p-5 border border-gray-200/50 dark:border-white/5 bg-white/80 dark:bg-white/[0.02] hover:border-blue-400/30 transition backdrop-blur-xl">
              <div v-if="record.resultUrl" class="mb-3 rounded-xl overflow-hidden bg-gray-100 dark:bg-white/[0.02] h-40 flex items-center justify-center">
                <img :src="record.resultUrl" alt="Generated" class="max-w-full max-h-full object-contain" />
              </div>
              <p class="text-sm text-gray-700 dark:text-white/70 mb-2 overflow-hidden" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">{{ record.prompt }}</p>
              <div class="flex flex-wrap gap-2 mb-3">
                <span class="px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-white/[0.04] text-gray-600 dark:text-white/50">{{ record.model }}</span>
                <span class="px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-white/[0.04] text-gray-600 dark:text-white/50">{{ record.size }}</span>
                <span class="px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-white/[0.04] text-gray-600 dark:text-white/50">{{ t('history.time', { time: record.generationTime }) }}</span>
              </div>
              <p class="text-xs text-gray-400 dark:text-white/30 mb-3">{{ formatTime(record.timestamp) }}</p>
              <div class="flex items-center gap-2">
                <button v-if="record.resultUrl" @click="viewHistoryResult(record)" class="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-blue-500/30 text-blue-500 dark:text-blue-400 hover:bg-blue-500/10 transition">{{ t('history.viewResult') }}</button>
                <button @click="useHistoryPrompt(record)" class="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-green-500/30 text-green-500 dark:text-green-400 hover:bg-green-500/10 transition">{{ t('history.usePrompt') }}</button>
                <button @click="deleteHistoryRecord(record.id)" class="px-3 py-1.5 rounded-lg text-xs font-medium border border-red-500/30 text-red-500 dark:text-red-400 hover:bg-red-500/10 transition">{{ t('history.delete') }}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 视频生成 Tab 内容 -->
    <section v-if="activeTab === 'video'" id="video-gen" class="px-8 pb-[120px]">
      <div class="max-w-7xl mx-auto">
        <h2 class="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">{{ t('videoGen.title') }}</h2>
        <p class="text-gray-500 dark:text-white/65 mb-8">{{ t('videoGen.subtitle') }}</p>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- 左侧：操作区 -->
          <div class="space-y-6">
            <div v-if="!hasApiKey" class="border border-yellow-400/30 bg-yellow-400/5 rounded-xl p-4 flex items-start gap-3">
              <span class="text-yellow-400 text-lg">⚠️</span>
              <div class="flex-1">
                <p class="text-yellow-200/90 text-sm">{{ t('imageGen.demoWarning') }}</p>
                <NuxtLink to="/settings" class="text-yellow-400 hover:underline text-sm font-medium">{{ t('imageGen.goSettings') }} →</NuxtLink>
              </div>
            </div>

            <!-- 生成模式 -->
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-white/65 mb-2">{{ t('videoGen.modeLabel') }}</label>
              <div class="flex gap-2">
                <button v-for="m in videoModes" :key="m.value" @click="videoMode = m.value; uploadedVideos = []"
                  :disabled="videoLoading"
                  class="px-4 py-2 rounded-xl text-sm font-medium transition"
                  :class="videoMode === m.value ? 'text-white shadow-sm' : 'bg-gray-100 dark:bg-white/[0.04] text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white/80'"
                  :style="videoMode === m.value ? 'background: linear-gradient(135deg, #2EA7FF 0%, #9381FF 100%);' : ''"
                >{{ m.label }}</button>
              </div>
            </div>

            <!-- 提示词 -->
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-white/65 mb-2">{{ t('videoGen.promptLabel') }}</label>
              <textarea v-model="videoPrompt" :placeholder="t('videoGen.promptPlaceholder')" :disabled="videoLoading"
                class="w-full min-h-[90px] p-4 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-y bg-white dark:bg-white/[0.05] border border-gray-200 dark:border-white/10 focus:border-blue-400 transition disabled:opacity-50"
              ></textarea>
            </div>

            <!-- 图片上传 -->
            <div v-if="videoMode !== 'text2video'">
              <label class="block text-sm font-medium text-gray-500 dark:text-white/65 mb-2">{{ videoMode === 'keyframes' ? t('videoGen.keyframesLabel') : t('videoGen.imageLabel') }}</label>
              <div @click="triggerVideoUpload" @dragover.prevent @drop.prevent="onVideoImageDrop"
                class="border-2 border-dashed border-gray-300 dark:border-white/10 rounded-xl p-5 text-center cursor-pointer hover:border-blue-400/50 hover:bg-white/[0.02] transition"
                :class="{ 'opacity-50 cursor-not-allowed': videoLoading }"
              >
                <input ref="videoFileInput" type="file" accept="image/*" :multiple="videoMode === 'multi' || videoMode === 'keyframes'" class="hidden" @change="onVideoImageSelect" :disabled="videoLoading" />
                <p class="text-gray-400 dark:text-white/40 text-sm">{{ videoMode === 'multi' || videoMode === 'keyframes' ? t('videoGen.dropImagesHint') : t('videoGen.dropImageHint') }}</p>
              </div>
              <div v-if="uploadedVideos.length > 0" class="flex flex-wrap gap-2 mt-3">
                <div v-for="(img, idx) in uploadedVideos" :key="idx" class="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10">
                  <img :src="img.dataUrl" class="w-full h-full object-cover" />
                  <button @click="uploadedVideos.splice(idx, 1)" :disabled="videoLoading" class="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/80 text-white text-xs flex items-center justify-center hover:bg-red-500 transition disabled:opacity-50">{{ '×' }}</button>
                </div>
              </div>
              <div class="mt-3 flex gap-2">
                <input v-model="videoImageUrl" :placeholder="t('imageGen.imageUrlPlaceholder')" :disabled="videoLoading"
                  class="flex-1 px-3 py-2 rounded-xl text-sm text-gray-900 dark:text-white bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 focus:outline-none focus:border-blue-400 disabled:opacity-50" />
                <button @click="addVideoImageByUrl" :disabled="!videoImageUrl.trim() || videoLoading"
                  class="px-4 py-2 rounded-xl text-sm font-medium bg-white/[0.06] hover:bg-white/[0.10] text-white/80 hover:text-white transition disabled:opacity-50">{{ t('imageGen.addUrlBtn') }}</button>
              </div>
            </div>

            <!-- 视频参数 -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-white/65 mb-2">{{ t('videoGen.durationLabel') }}</label>
                <select v-model="videoDuration" :disabled="videoLoading"
                  class="w-full px-3 py-2 rounded-xl text-sm text-gray-900 dark:text-white bg-white dark:bg-white/[0.05] border border-gray-200 dark:border-white/10 focus:outline-none focus:border-blue-400 disabled:opacity-50">
                  <option value="3">~3s (81 frames)</option>
                  <option value="5">~5s (121 frames)</option>
                  <option value="10">~10s (241 frames)</option>
                  <option value="18">~18s (441 frames)</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-white/65 mb-2">{{ t('videoGen.aspectLabel') }}</label>
                <select v-model="videoAspect" :disabled="videoLoading"
                  class="w-full px-3 py-2 rounded-xl text-sm text-gray-900 dark:text-white bg-white dark:bg-white/[0.05] border border-gray-200 dark:border-white/10 focus:outline-none focus:border-blue-400 disabled:opacity-50">
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
              <label class="block text-sm font-medium text-gray-500 dark:text-white/65 mb-2">{{ t('videoGen.negativeLabel') }}</label>
              <input v-model="videoNegative" :placeholder="t('videoGen.negativePlaceholder')" :disabled="videoLoading"
                class="w-full px-4 py-2.5 rounded-xl text-sm text-gray-900 dark:text-white bg-white dark:bg-white/[0.05] border border-gray-200 dark:border-white/10 focus:outline-none focus:border-blue-400 transition disabled:opacity-50" />
            </div>

            <!-- 生成按钮 -->
            <button @click="generateVideo" :disabled="!canGenerateVideo || videoLoading"
              class="w-full py-4 rounded-[99px] text-base font-semibold text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              :style="!canGenerateVideo || videoLoading ? {} : 'background: linear-gradient(135deg, #2EA7FF 0%, #9381FF 100%);'"
            >
              <svg v-if="videoLoading" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
              {{ videoLoading ? t('videoGen.generating') : t('videoGen.generateBtn') }}
            </button>

            <!-- 轮询状态 -->
            <div v-if="videoLoading" class="text-center">
              <p class="text-sm text-gray-500 dark:text-white/40 mb-2">{{ t('videoGen.pollingStatus', { status: videoStatus, progress: videoProgress }) }}</p>
              <div class="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-500" :style="`width: ${videoProgress}%; background: linear-gradient(90deg, #2EA7FF, #9381FF);`"></div>
              </div>
            </div>
          </div>

          <!-- 右侧：结果区 -->
          <div class="lg:sticky lg:top-24 self-start">
            <div class="rounded-2xl p-6 border border-gray-200/50 dark:border-white/5 bg-white/80 dark:bg-white/[0.02] backdrop-blur-xl">
              <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{{ t('videoGen.resultTitle') }}</h3>

              <div v-if="videoLoading" class="text-center py-10">
                <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400 mb-3"></div>
                <p class="text-gray-500 dark:text-white/40 text-sm">{{ t('videoGen.processing') }}</p>
              </div>

              <div v-else-if="videoError" class="text-center py-8">
                <div class="text-red-400/90 text-sm bg-red-400/5 border border-red-400/20 rounded-xl p-4">⚠️ {{ videoError }}</div>
              </div>

              <div v-else-if="videoResultUrl" class="space-y-4">
                <video :src="videoResultUrl" controls class="w-full rounded-xl border border-gray-200 dark:border-white/10"></video>
                <a :href="videoResultUrl" target="_blank" download
                  class="block w-full text-center py-2.5 rounded-xl text-sm font-medium bg-white/[0.06] hover:bg-white/[0.10] text-white/80 hover:text-white transition">⬇ {{ t('videoGen.downloadBtn') }}</a>
                <p v-if="videoSeconds" class="text-center text-xs text-gray-400 dark:text-white/30">{{ t('videoGen.durationInfo', { seconds: videoSeconds, size: videoSize }) }}</p>
              </div>

              <div v-else class="text-center py-10">
                <div class="text-gray-400 dark:text-white/20 text-sm">{{ t('videoGen.emptyState') }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// ========= i18n =========
const { t } = useI18n()

// ========= Tab =========
type Tab = 'image' | 'video'
type VideoMode = 'text2video' | 'image2video' | 'multi' | 'keyframes'

const activeTab = ref<Tab>('image')
const tabs = computed<{ value: Tab; label: string; icon: string }[]>(() => [
  { value: 'image', label: t('create.imageTab') || '图片生成', icon: '🖼️' },
  { value: 'video', label: t('create.videoTab') || '视频生成', icon: '🎬' },
])

// ============================================================
//  图片生成（从 index.vue 完整迁移）
// ============================================================
const imagePrompt = ref('')
const imageModel = ref<'agnes-image-2.0-flash' | 'agnes-image-2.1-flash'>('agnes-image-2.0-flash')
const imageSize = ref('1024x768')
const imageLoading = ref(false)
const imageResult = ref<{ url?: string; b64_json?: string } | null>(null)
const imageError = ref<string | null>(null)
const hasApiKey = ref(false)
const generationTime = ref(0)
const optimizing = ref(false)
let timerInterval: ReturnType<typeof setInterval> | null = null
const optimizeSuccess = ref(false)
const imageLoaded = ref(false)
const estimatedTime = ref(0)

const genMode = ref<'text2img' | 'image2img' | 'multiimg'>('text2img')
const uploadedImages = ref<Array<{ name: string; dataUrl: string; preview: string }>>([])
const dragOver = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const imageUrlInput = ref('')

const imageSizes = [
  { label: '1024×768 (Landscape)', value: '1024x768' },
  { label: '1024×1024 (Square)',   value: '1024x1024' },
  { label: '768×1024 (Portrait)',  value: '768x1024' },
]

const modeBtnClass = (mode: string) =>
  [
    'px-5 py-2.5 rounded-xl text-sm font-semibold transition border-2 disabled:opacity-50 disabled:cursor-not-allowed',
    genMode.value === mode
      ? 'border-blue-400 bg-blue-500/10 text-blue-400'
      : 'border-transparent bg-gray-100 dark:bg-white/[0.04] text-gray-600 dark:text-white/50 hover:border-gray-300 dark:hover:border-white/10'
  ].join(' ')

// —— 模型切换
const onModelChange = (model: 'agnes-image-2.0-flash' | 'agnes-image-2.1-flash') => {
  imageModel.value = model
  if (model === 'agnes-image-2.1-flash' && genMode.value === 'multiimg') {
    genMode.value = 'text2img'
  }
}

// —— 文件上传
const triggerFileInput = () => fileInputRef.value?.click()
const onDragOver = () => { dragOver.value = true }
const onDragLeave = () => { dragOver.value = false }
const onDrop = (e: DragEvent) => {
  dragOver.value = false
  const files = e.dataTransfer?.files
  if (files) addFiles(Array.from(files))
}
const onFileChange = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (files) addFiles(Array.from(files))
  if (fileInputRef.value) fileInputRef.value.value = ''
}
const addFiles = (files: File[]) => {
  const max = genMode.value === 'multiimg' ? 10 : 1
  const remaining = max - uploadedImages.value.length
  if (remaining <= 0) return
  files.slice(0, remaining).forEach(file => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      uploadedImages.value.push({ name: file.name, dataUrl, preview: dataUrl })
    }
    reader.readAsDataURL(file)
  })
}
const addImageUrl = () => {
  const url = imageUrlInput.value.trim()
  if (!url) return
  try { new URL(url) } catch { imageError.value = 'Invalid URL'; setTimeout(() => { imageError.value = null }, 3000); return }
  uploadedImages.value.push({ name: url.split('/').pop() || 'image', dataUrl: url, preview: url })
  imageUrlInput.value = ''
}
const removeImage = (idx: number) => uploadedImages.value.splice(idx, 1)

// —— 历史记录
interface HistoryRecord {
  id: string; prompt: string; model: string; size: string
  resultUrl?: string; revisedPrompt?: string; timestamp: number; generationTime: number
}
const history = ref<HistoryRecord[]>([])
const STORAGE_KEY = 'ai-genesis-history'
const loadHistory = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) history.value = JSON.parse(stored)
  } catch (e) { console.error('Failed to load history:', e) }
}
const saveHistory = () => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history.value)) } catch (e) { console.error(e) }
}
const addHistoryRecord = (record: Omit<HistoryRecord, 'id' | 'timestamp'>) => {
  const newRecord: HistoryRecord = {
    ...record,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    timestamp: Date.now()
  }
  history.value.unshift(newRecord)
  if (history.value.length > 100) history.value = history.value.slice(0, 100)
  saveHistory()
}
const deleteHistoryRecord = (id: string) => {
  if (process.client && !confirm(t('history.deleteConfirm') || '确定要删除这条记录吗？')) return
  history.value = history.value.filter(r => r.id !== id)
  saveHistory()
}
const onClearAllHistory = () => {
  if (process.client && !confirm(t('history.clearConfirm') || '确定要清空所有历史记录吗？此操作不可撤销。')) return
  history.value = []
  localStorage.removeItem(STORAGE_KEY)
}
const useHistoryPrompt = (record: HistoryRecord) => {
  imagePrompt.value = record.revisedPrompt || record.prompt
}
const viewHistoryResult = (record: HistoryRecord) => {
  if (record.resultUrl && process.client) window.open(record.resultUrl, '_blank')
}
const formatTime = (timestamp: number) => {
  const d = new Date(timestamp)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// —— API Key
const getStoredApiKey = (): string => {
  try {
    const stored = localStorage.getItem('ai-genesis-api-keys')
    if (stored) return JSON.parse(stored).agnes || ''
  } catch (e) {}
  return ''
}

// —— 生成图片
const generateImage = async () => {
  if (!imagePrompt.value.trim() || imageLoading.value) return
  if (genMode.value !== 'text2img' && uploadedImages.value.length === 0) return
  const apiKey = getStoredApiKey()
  if (!apiKey) {
    imageError.value = t('imageGen.apiKeyRequired') || '请先在设置页面配置 Agnes API Key'
    setTimeout(() => { imageError.value = null }, 5000)
    return
  }
  imageLoading.value = true
  imageResult.value = null
  imageError.value = null
  generationTime.value = 0
  optimizeSuccess.value = false
  imageLoaded.value = false
  const tickStart = Date.now()
  timerInterval = setInterval(() => {
    generationTime.value = Math.round((Date.now() - tickStart) / 100) / 10
  }, 100)
  try {
    const body: any = {
      model: imageModel.value,
      prompt: imagePrompt.value,
      size: imageSize.value,
      return_base64: false,
      apiKey: getStoredApiKey()
    }
    if (genMode.value !== 'text2img' && uploadedImages.value.length > 0) {
      body.image = uploadedImages.value.map((img: any) => img.dataUrl)
    }
    const response = await $fetch<{ url?: string; b64_json?: string; revised_prompt?: string }>('/api/generate/image', {
      method: 'POST',
      body
    })
    imageResult.value = response
    if (response.url || response.b64_json) {
      addHistoryRecord({
        prompt: imagePrompt.value,
        model: imageModel.value,
        size: imageSize.value,
        resultUrl: response.url,
        revisedPrompt: response.revised_prompt,
        generationTime: generationTime.value
      })
    }
  } catch (error: any) {
    imageError.value = error.data?.statusMessage || error.message || 'Image generation failed'
  } finally {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null }
    imageLoading.value = false
  }
}

// —— 优化提示词
const optimizePrompt = async () => {
  if (!imagePrompt.value.trim() || optimizing.value) return
  const apiKey = getStoredApiKey()
  if (!apiKey) {
    imageError.value = t('imageGen.apiKeyRequired') || '请先配置 API Key'
    setTimeout(() => { imageError.value = null }, 5000)
    return
  }
  optimizing.value = true
  optimizeSuccess.value = false
  try {
    const response = await $fetch<{ optimized_prompt: string }>('/api/optimize-prompt', {
      method: 'POST',
      body: { prompt: imagePrompt.value, apiKey }
    })
    imagePrompt.value = response.optimized_prompt
    optimizeSuccess.value = true
    setTimeout(() => { optimizeSuccess.value = false }, 3000)
  } catch (error: any) {
    imageError.value = error.data?.statusMessage || error.message || 'Optimization failed'
    setTimeout(() => { imageError.value = null }, 3000)
  } finally {
    optimizing.value = false
  }
}
const copyPrompt = async () => {
  try { await navigator.clipboard.writeText(imagePrompt.value) } catch (err) { console.error(err) }
}
const clearResult = () => {
  imageResult.value = null
  imageError.value = null
  generationTime.value = 0
  estimatedTime.value = 0
  imageLoaded.value = false
}
const downloadBase64Image = () => {
  if (!imageResult.value?.b64_json) return
  const link = document.createElement('a')
  link.href = 'data:image/png;base64,' + imageResult.value.b64_json
  link.download = 'agnes-generated-image.png'
  link.click()
}
const onImageLoad = () => {
  imageLoaded.value = true
  setTimeout(() => { imageLoaded.value = false }, 3000)
}

// ============================================================
//  视频生成
// ============================================================
const videoPrompt = ref('')
const videoMode = ref<VideoMode>('text2video')
const videoModes = computed<{ value: VideoMode; label: string }[]>(() => [
  { value: 'text2video', label: t('videoGen.modeText2Video') || '文生视频' },
  { value: 'image2video', label: t('videoGen.modeImage2Video') || '图生视频' },
  { value: 'multi', label: t('videoGen.modeMulti') || '多图视频' },
  { value: 'keyframes', label: t('videoGen.modeKeyframes') || '关键帧动画' },
])
const videoDuration = ref('5')
const videoAspect = ref('16:9')
const videoNegative = ref('')
const videoLoading = ref(false)
const videoResultUrl = ref('')
const videoError = ref('')
const videoStatus = ref('')
const videoProgress = ref(0)
const videoSeconds = ref(0)
const videoSize = ref('')
const uploadedVideos = ref<Array<{ name: string; dataUrl: string }>>([])
const videoImageUrl = ref('')
const videoFileInput = ref<HTMLInputElement | null>(null)
const canGenerateVideo = computed(() =>
  videoPrompt.value.trim() && (videoMode.value === 'text2video' || uploadedVideos.value.length > 0)
)

const triggerVideoUpload = () => videoFileInput.value?.click()
const onVideoImageDrop = (e: DragEvent) => {
  e.preventDefault()
  const files = e.dataTransfer?.files
  if (files) addVideoFiles(Array.from(files))
}
const onVideoImageSelect = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (files) addVideoFiles(Array.from(files))
  if (videoFileInput.value) videoFileInput.value.value = ''
}
const addVideoFiles = (files: File[]) => {
  files.forEach(file => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadedVideos.value.push({ name: file.name, dataUrl: e.target?.result as string })
    }
    reader.readAsDataURL(file)
  })
}
const addVideoImageByUrl = () => {
  const url = videoImageUrl.value.trim()
  if (!url) return
  try { new URL(url) } catch { videoError.value = 'Invalid URL'; return }
  uploadedVideos.value.push({ name: url.split('/').pop() || 'image', dataUrl: url })
  videoImageUrl.value = ''
}

let videoPollInterval: ReturnType<typeof setInterval> | null = null
const generateVideo = async () => {
  if (!canGenerateVideo.value || videoLoading.value) return
  const apiKey = getStoredApiKey()
  if (!apiKey) {
    videoError.value = t('imageGen.apiKeyRequired') || '请先配置 API Key'
    return
  }
  videoLoading.value = true
  videoResultUrl.value = ''
  videoError.value = ''
  videoStatus.value = 'pending'
  videoProgress.value = 0

  try {
    const body: any = {
      prompt: videoPrompt.value,
      mode: videoMode.value,
      duration: videoDuration.value,
      aspect_ratio: videoAspect.value,
      negative_prompt: videoNegative.value || undefined,
      apiKey
    }
    if (videoMode.value !== 'text2video' && uploadedVideos.value.length > 0) {
      body.images = uploadedVideos.value.map((v: any) => v.dataUrl)
    }
    const res = await $fetch<{ video_id: string }>('/api/generate/video', {
      method: 'POST',
      body
    })
    const videoId = res.video_id
    if (!videoId) throw new Error('No video_id returned')

    videoPollInterval = setInterval(async () => {
      try {
        const status = await $fetch<{
          status: string; progress?: number; video_url?: string
          seconds?: number; file_size?: string
        }>('/api/video/status?video_id=' + videoId)

        videoStatus.value = status.status
        videoProgress.value = status.progress || 0

        if (status.status === 'completed' && status.video_url) {
          videoResultUrl.value = status.video_url
          videoSeconds.value = status.seconds || 0
          videoSize.value = status.file_size || ''
          videoLoading.value = false
          if (videoPollInterval) { clearInterval(videoPollInterval); videoPollInterval = null }
        } else if (status.status === 'failed') {
          videoError.value = 'Video generation failed'
          videoLoading.value = false
          if (videoPollInterval) { clearInterval(videoPollInterval); videoPollInterval = null }
        }
      } catch (err: any) {
        videoError.value = err.message || 'Polling failed'
        videoLoading.value = false
        if (videoPollInterval) { clearInterval(videoPollInterval); videoPollInterval = null }
      }
    }, 3000)
  } catch (error: any) {
    videoError.value = error.data?.statusMessage || error.message || 'Video generation failed'
    videoLoading.value = false
  }
}

// ============================================================
//  生命周期
// ============================================================
onMounted(() => {
  loadHistory()
  try {
    const stored = localStorage.getItem('ai-genesis-api-keys')
    if (stored) hasApiKey.value = !!JSON.parse(stored).agnes
  } catch (e) { hasApiKey.value = false }
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
  if (videoPollInterval) clearInterval(videoPollInterval)
})
</script>

<style scoped>
/* 优化深色模式下滑块背景 */
input[type="range"]::-webkit-slider-runnable-track {
  background: transparent;
}
</style>
