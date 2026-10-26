/**
 * API Key 管理组合式函数
 * 支持 Agnes AI 国际站 / 国内站双站点 API Key 管理
 * 存储位置：localStorage (仅浏览器端)
 *
 * 存储结构：
 *   ai-genesis-api-site  → 'com' | 'cn'（当前激活站点，默认 'com'）
 *   ai-genesis-api-keys  → { com?: string; cn?: string; agnes?: string }
 *                          （agnes 为旧版单站点结构的 Key，作为两站点的兜底回填）
 */
import { ref, readonly } from 'vue'

export type AgnesSite = 'com' | 'cn'

const KEYS_STORAGE = 'ai-genesis-api-keys'
const SITE_STORAGE = 'ai-genesis-api-site'

export interface ApiKeys {
  com?: string
  cn?: string
  /** 旧版单站点结构的 Key（已停止写入，仅作迁移兜底） */
  agnes?: string
  [key: string]: string | undefined
}

const parseKeys = (): ApiKeys => {
  if (process.client) {
    const stored = localStorage.getItem(KEYS_STORAGE)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (e) {
        console.error('Failed to parse API keys:', e)
      }
    }
  }
  return {}
}

export const useApiKey = () => {
  // 响应式状态
  const apiKeys = ref<ApiKeys>(parseKeys())

  // ---------- 站点 ----------
  const getSite = (): AgnesSite => {
    if (process.client) {
      return localStorage.getItem(SITE_STORAGE) === 'cn' ? 'cn' : 'com'
    }
    return 'com'
  }

  const setSite = (site: AgnesSite) => {
    apiKeys.value[site] = apiKeys.value[site]
    if (process.client) {
      localStorage.setItem(SITE_STORAGE, site)
    }
  }

  // ---------- Key 读写（按站点） ----------
  const saveKeys = () => {
    if (process.client) {
      localStorage.setItem(KEYS_STORAGE, JSON.stringify(apiKeys.value))
    }
  }

  /** 读取指定站点的 Key；站点无 Key 时回退旧版 agnes Key（迁移兜底） */
  const getSiteKey = (site: AgnesSite): string => {
    return apiKeys.value[site] || apiKeys.value.agnes || ''
  }

  const setSiteKey = (site: AgnesSite, key: string) => {
    apiKeys.value[site] = key
    saveKeys()
  }

  const removeSiteKey = (site: AgnesSite) => {
    delete apiKeys.value[site]
    saveKeys()
  }

  /** 当前激活站点是否有可用 Key */
  const hasSiteKey = (site: AgnesSite): boolean => !!getSiteKey(site)

  // ---------- 兼容旧接口（provider 形式） ----------
  const setApiKey = (provider: string, key: string) => {
    apiKeys.value[provider] = key
    saveKeys()
  }

  const getApiKey = (provider: string): string | undefined => {
    return apiKeys.value[provider]
  }

  const removeApiKey = (provider: string) => {
    delete apiKeys.value[provider]
    saveKeys()
  }

  const hasApiKey = (provider: string): boolean => {
    return !!apiKeys.value[provider]
  }

  const clearAllKeys = () => {
    apiKeys.value = {}
    if (process.client) {
      localStorage.removeItem(KEYS_STORAGE)
    }
  }

  // 验证 API Key 格式 (基础验证)
  const validateApiKey = (provider: string, key: string): boolean => {
    if (!key) return false
    return key.length > 10
  }

  return {
    apiKeys: readonly(apiKeys),
    // 站点
    getSite,
    setSite,
    // 按站点
    getSiteKey,
    setSiteKey,
    removeSiteKey,
    hasSiteKey,
    // 兼容旧接口
    setApiKey,
    getApiKey,
    removeApiKey,
    hasApiKey,
    clearAllKeys,
    validateApiKey
  }
}
