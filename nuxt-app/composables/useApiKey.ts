/**
 * API Key 管理组合式函数
 * 支持 Agnes AI API Key 管理
 * 存储位置：localStorage (仅浏览器端)
 */
import { ref, readonly } from 'vue'

export interface ApiKeys {
  agnes?: string
  [key: string]: string | undefined
}

export const useApiKey = () => {
  // 从 localStorage 读取 API Keys
  const loadKeys = (): ApiKeys => {
    if (process.client) {
      const stored = localStorage.getItem('ai-genesis-api-keys')
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

  // 保存 API Keys 到 localStorage
  const saveKeys = (keys: ApiKeys) => {
    if (process.client) {
      localStorage.setItem('ai-genesis-api-keys', JSON.stringify(keys))
    }
  }

  // 响应式状态
  const apiKeys = ref<ApiKeys>(loadKeys())

  // 设置 API Key
  const setApiKey = (provider: string, key: string) => {
    apiKeys.value[provider] = key
    saveKeys(apiKeys.value)
  }

  // 获取 API Key
  const getApiKey = (provider: string): string | undefined => {
    return apiKeys.value[provider]
  }

  // 删除 API Key
  const removeApiKey = (provider: string) => {
    delete apiKeys.value[provider]
    saveKeys(apiKeys.value)
  }

  // 检查是否有某个提供商的 API Key
  const hasApiKey = (provider: string): boolean => {
    return !!apiKeys.value[provider]
  }

  // 清除所有 API Keys
  const clearAllKeys = () => {
    apiKeys.value = {}
    if (process.client) {
      localStorage.removeItem('ai-genesis-api-keys')
    }
  }

  // 验证 API Key 格式 (基础验证)
  const validateApiKey = (provider: string, key: string): boolean => {
    if (!key) return false

    switch (provider) {
      case 'agnes':
        // Agnes API Key 格式（根据实际情况调整）
        return key.length > 10
      default:
        return key.length > 10
    }
  }

  return {
    apiKeys: readonly(apiKeys),
    setApiKey,
    getApiKey,
    removeApiKey,
    hasApiKey,
    clearAllKeys,
    validateApiKey
  }
}
