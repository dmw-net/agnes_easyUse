<template>
  <div class="relative w-full" ref="selectRef">
    <!-- 触发按钮 -->
    <button
      type="button"
      @click.stop="toggleDropdown"
      :disabled="disabled"
      class="
        select-trigger
        w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm text-left
        bg-white text-gray-900 border border-gray-200
        hover:not-disabled:border-blue-300
        focus-visible:outline-none focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-400/15
        transition-all duration-150 cursor-pointer select-none
        dark:bg-white/5 dark:text-white/90 dark:border-white/10
        dark:hover:not-disabled:border-blue-500/50 dark:hover:not-disabled:bg-white/[0.08]
        dark:focus-visible:border-blue-400/60 dark:focus-visible:ring-blue-400/15
      "
      :class="{
        'border-blue-400 ring-2 ring-blue-400/15': isOpen,
        'opacity-50 cursor-not-allowed': disabled,
        'dark:border-blue-400/60 dark:ring-blue-400/15': isOpen
      }"
    >
      <span class="select-value">{{ currentLabel }}</span>
      <svg
        class="select-arrow text-gray-400 dark:text-white/40 ml-2 shrink-0 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        width="12" height="12" viewBox="0 0 12 12" fill="none"
      >
        <path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <!-- 下拉选项面板 -->
    <Transition name="select-dropdown">
      <div
        v-if="isOpen"
        class="
          select-dropdown
          absolute left-0 right-0 top-full mt-1 z-50
          rounded-xl overflow-y-auto max-h-[240px] p-1
          bg-white border border-gray-200 shadow-lg shadow-gray-900/8
          dark:bg-[#16162a] dark:border-white/[0.06]
          dark:shadow-xl dark:shadow-black/45
        "
      >
        <button
          v-for="(option, index) in normalizedOptions"
          :key="String(option.value)"
          type="button"
          @click.stop="selectOption(option)"
          @mouseenter="hoveredIndex = index"
          class="
            select-option
            w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm
            text-gray-700 hover:bg-gray-100
            transition-colors duration-120 border-none outline-none text-left cursor-pointer
            dark:text-white/85 dark:hover:bg-white/[0.07]
            font-medium text-blue-700 dark:text-blue-400
            dark:hover:bg-blue-500/10
          "
          :class="{
            'bg-blue-50 dark:bg-blue-500/10': isSelected(option),
            '!bg-blue-50 dark:!bg-blue-500/10': isSelected(option)
          }"
        >
          <span :class="{ 'font-medium text-blue-700 dark:text-blue-400': isSelected(option) }">
            {{ option.label }}
          </span>
          <svg
            v-if="isSelected(option)"
            class="shrink-0 ml-2 opacity-80"
            width="14" height="14" viewBox="0 0 14 14" fill="none"
          >
            <path d="M3 7L5.5 9.5L11 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// ---- Props ----
interface Option {
  label: string
  value: string | number
}

const props = withDefaults(defineProps<{
  modelValue: string | number
  options: Array<Option | string>
  disabled?: boolean
}>(), {
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

// ---- Refs ----
const selectRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const hoveredIndex = ref(-1)

// ---- Computed ----
const normalizedOptions = computed<Option[]>(() =>
  props.options.map(opt =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  )
)

const currentLabel = computed(() => {
  const found = normalizedOptions.value.find(o => o.value === props.modelValue)
  return found?.label ?? ''
})

function isSelected(option: Option): boolean {
  return option.value === props.modelValue
}

// ---- Methods ----
function toggleDropdown() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    hoveredIndex.value = normalizedOptions.value.findIndex(o => o.value === props.modelValue)
  }
}

function selectOption(option: Option) {
  emit('update:modelValue', option.value)
  isOpen.value = false
  hoveredIndex.value = -1
}

function closeDropdown() {
  if (isOpen.value) {
    isOpen.value = false
    hoveredIndex.value = -1
  }
}

// ---- 点击外部关闭 ----
function handleClickOutside(e: MouseEvent) {
  if (selectRef.value && !selectRef.value.contains(e.target as Node)) {
    closeDropdown()
  }
}

// ---- 键盘导航 ----
function handleKeydown(e: KeyboardEvent) {
  if (!isOpen.value) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault()
      toggleDropdown()
    }
    return
  }

  switch (e.key) {
    case 'Escape':
      e.preventDefault()
      closeDropdown()
      break
    case 'ArrowDown':
      e.preventDefault()
      hoveredIndex.value = Math.min(hoveredIndex.value + 1, normalizedOptions.value.length - 1)
      break
    case 'ArrowUp':
      e.preventDefault()
      hoveredIndex.value = Math.max(hoveredIndex.value - 1, 0)
      break
    case 'Enter':
    case ' ':
      e.preventDefault()
      if (hoveredIndex.value >= 0 && normalizedOptions.value[hoveredIndex.value]) {
        selectOption(normalizedOptions.value[hoveredIndex.value])
      } else {
        closeDropdown()
      }
      break
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* 过渡动画 */
.select-dropdown-enter-active {
  animation: selectDropIn 150ms ease-out;
}
.select-dropdown-leave-active {
  animation: selectDropOut 100ms ease-in;
}

@keyframes selectDropIn {
  from {
    opacity: 0;
    transform: translateY(-6px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes selectDropOut {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(-4px) scale(0.98);
  }
}
</style>
