/**
 * 轻量 i18n composable — 纯前端实现，无 Windows 路径 bug
 *
 * 用法（完全兼容之前的 useI18n() API）：
 *   const { t, locale, setLocale } = useI18n()
 *   t('imageGen.title')   // 支持点号嵌套 key
 *   setLocale('en')        // 切换语言
 */
import { ref, computed, watch } from 'vue'

import zhCN from '~/locales/zh-CN.json'
import en   from '~/locales/en.json'

// ========= 状态 =========
const locale = ref<string>('zh-CN')
const messages: Record<string, Record<string, any>> = {
  'zh-CN': zhCN,
  'en':     en,
}

// 客户端从 localStorage 恢复语言偏好
if (process.client) {
  const saved = localStorage.getItem('i18n-locale')
  if (saved && messages[saved]) {
    locale.value = saved
  }
}

// ========= 核心：点号路径读取 =========
function getNested(obj: any, path: string): string {
  const keys = path.split('.')
  let current: any = obj
  for (const key of keys) {
    if (current === null || current === undefined) return path
    current = current[key]
  }
  return typeof current === 'string' ? current : path
}

// ========= t() 函数 =========
function t(key: string, values?: Record<string, string | number>): string {
  const msg = messages[locale.value]
  if (!msg) return key
  let result = getNested(msg, key)
  // 简单模板替换：{time} => values.time
  if (values) {
    result = result.replace(/\{([^}]+)\}/g, (_, k) => String(values[k] ?? `{${k}}`))
  }
  return result
}

// ========= 切换语言 =========
function setLocale(code: string) {
  if (!messages[code]) return
  locale.value = code
  if (process.client) {
    localStorage.setItem('i18n-locale', code)
  }
}

// ========= 导出（单例，多组件共享） =========
export function useI18n() {
  return { t, locale, setLocale }
}
