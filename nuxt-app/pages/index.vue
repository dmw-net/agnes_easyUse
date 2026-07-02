<template>
  <div>
    <!-- Hero 区块 -->
    <section class="relative pt-12 pb-20 md:pt-20 md:pb-30 px-4 md:px-8 overflow-hidden fade-in-up">
      <!-- 高级视觉：浮动渐变光球 -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute w-[500px] h-[500px] rounded-full -top-32 -left-32 opacity-40 animate-blob" style="background: radial-gradient(circle, rgba(46,167,255,0.4), transparent 70%); filter: blur(60px);"></div>
        <div class="absolute w-[400px] h-[400px] rounded-full top-48 right-16 opacity-30 animate-blob animation-delay-2000" style="background: radial-gradient(circle, rgba(147,129,255,0.35), transparent 70%); filter: blur(60px);"></div>
        <div class="absolute w-[350px] h-[350px] rounded-full -bottom-20 left-1/3 opacity-25 animate-blob animation-delay-4000" style="background: radial-gradient(circle, rgba(255,100,200,0.3), transparent 70%); filter: blur(60px);"></div>
      </div>

      <div class="relative z-10 max-w-4xl mx-auto text-center pt-30">
        <h1
          class="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold leading-tight mb-6 md:mb-12 text-gray-900 dark:text-white gradient-text"
          style="font-family: 'Inter Tight', sans-serif; letter-spacing: -0.035em;"
          v-html="t('hero.title').replace(/\n/g, '<br>')"
        ></h1>
        <p class="text-base md:text-xl text-gray-500 dark:text-white/65 mb-6 md:mb-8 leading-7 md:leading-8">
          {{ t('hero.subtitle') }}
        </p>

        <!-- 永久无限免费提示 -->
        <div class="flex justify-center mb-8 md:mb-12">
          <span
            class="inline-block text-base md:text-lg lg:text-xl font-bold tracking-wide
                   bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent"
          >
            {{ t('hero.freeBadge') }}
          </span>
        </div>

        <div class="flex gap-5 justify-center">
          <NuxtLink
            to="/create"
            class="px-12 py-5 rounded-[99px] text-lg font-semibold text-white transition hover:opacity-90 hover:scale-105 transform btn-glow"
            style="background: linear-gradient(135deg, #2EA7FF 0%, #9381FF 100%);"
          >
            {{ t('cta') }}
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 功能特色 -->
    <section class="px-8 py-[120px] border-t border-gray-200/50 dark:border-white/3 fade-in-up">
      <div class="max-w-7xl mx-auto">
        <h2
          class="text-4xl font-semibold mb-4 text-gray-900 dark:text-white text-center"
          style="font-family: 'Inter', sans-serif;"
        >
          {{ t('features.title') || '功能特色' }}
        </h2>
        <p class="text-gray-500 dark:text-white/65 mb-12 text-center">{{ t('features.subtitle') || '探索 AI 驱动的创造力' }}</p>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- 图片生成 -->
          <NuxtLink
            to="/create"
            class="rounded-2xl p-8 border border-gray-200/50 dark:border-white/3 bg-white/80 dark:bg-white/[0.01] hover:border-blue-400/30 transition backdrop-blur-xl text-center fade-in-up group group-card cursor-pointer hover:scale-[1.02] transform"
          >
            <div class="text-4xl mb-4">🖼️</div>
            <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white/90">{{ t('features.imageGen') || 'AI 图片生成' }}</h3>
            <p class="text-sm text-gray-500 dark:text-white/50">{{ t('features.imageGenDesc') || '基于 Agnes Image 2.0/2.1 Flash 模型，支持文生图、图生图、多图合成' }}</p>
          </NuxtLink>
          <!-- 视频生成 -->
          <NuxtLink
            to="/create?tab=video"
            class="rounded-2xl p-8 border border-gray-200/50 dark:border-white/3 bg-white/80 dark:bg-white/[0.01] hover:border-blue-400/30 transition backdrop-blur-xl text-center fade-in-up group group-card cursor-pointer hover:scale-[1.02] transform"
          >
            <div class="text-4xl mb-4">🎬</div>
            <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white/90">{{ t('features.videoGen') || 'AI 视频生成' }}</h3>
            <p class="text-sm text-gray-500 dark:text-white/50">{{ t('features.videoGenDesc') || '基于 Agnes Video V2.0 模型，支持文生视频、图生视频、关键帧动画' }}</p>
          </NuxtLink>
          <!-- 提示词优化 -->
          <NuxtLink
            to="/create"
            class="rounded-2xl p-8 border border-gray-200/50 dark:border-white/3 bg-white/80 dark:bg-white/[0.01] hover:border-blue-400/30 transition backdrop-blur-xl text-center fade-in-up group group-card cursor-pointer hover:scale-[1.02] transform"
          >
            <div class="text-4xl mb-4">✨</div>
            <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white/90">{{ t('features.promptOpt') || '提示词优化' }}</h3>
            <p class="text-sm text-gray-500 dark:text-white/50">{{ t('features.promptOptDesc') || '一键优化提示词，获得更好的 AI 生成效果' }}</p>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

onMounted(() => {
  if (process.client) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1 }
    )
    document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el))
  }
})
</script>

<style>
/* 浮动光球动画 */
@keyframes blob-float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%      { transform: translate(30px, -50px) scale(1.1); }
  66%      { transform: translate(-20px, 20px) scale(0.9); }
}
.animate-blob {
  animation: blob-float 20s ease-in-out infinite;
}

/* 全局平滑滚动 */
html { scroll-behavior: smooth; }

/* 自定义滚动条 */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(46,167,255,0.3); border-radius: 99px; }

/* 高级文字选中效果 */
::selection { background: rgba(46,167,255,0.25); color: inherit; }

/* 玻璃态辅助类 */
.glass {
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(30px) saturate(200%);
  -webkit-backdrop-filter: blur(30px) saturate(200%);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
}
/* 滚动入场动画 */
.fade-in-up {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-in-up.visible {
  opacity: 1;
  transform: translateY(0);
}

/* 功能卡片悬浮光效 */
.group-card {
  position: relative;
  overflow: hidden;
}
.group-card::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 20px;
  padding: 1px;
  background: linear-gradient(135deg, rgba(46,167,255,0.15), rgba(147,129,255,0.15), transparent 60%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}
.group-card:hover::before {
  opacity: 1;
}
/* 高级输入框聚焦光效 */
input:focus, textarea:focus, select:focus {
  box-shadow: 0 0 0 3px rgba(46,167,255,0.18);
  border-color: rgba(46,167,255,0.5) !important;
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
}

/* 高级按钮光晕效果 */
.btn-glow {
  position: relative;
  overflow: hidden;
}
.btn-glow::after {
  content: "";
  position: absolute;
  inset: -2px;
  background: linear-gradient(135deg, #2EA7FF, #9381FF, #2EA7FF);
  background-size: 200% 200%;
  border-radius: inherit;
  z-index: -1;
  animation: glow-move 3s linear infinite;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.btn-glow:hover::after {
  opacity: 0.6;
}
@keyframes glow-move {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
</style>
