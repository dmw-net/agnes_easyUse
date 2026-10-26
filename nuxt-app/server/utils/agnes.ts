/**
 * Agnes AI 站点注册表 —— 国际站 / 国内站统一抽象
 *
 * Agnes AI 提供两个相互独立的站点，账号与 API Key 不互通：
 *
 *   站点    | 控制台/文档          | API Base URL               | 状态查询
 *   --------|----------------------|----------------------------|--------------------------
 *   国际站  | agnes-ai.com         | https://apihub.agnes-ai.com | {origin}/agnesapi
 *   国内站  | agnes-ai.cn          | https://api.agnes-ai.cn     | {origin}/agnesapi
 *
 * 两站模型阵容一致，但 API Key 按站点独立签发，
 * 调用时必须使用对应站点的 Key 与 Base URL。
 */

export type AgnesSiteId = 'com' | 'cn'

export interface AgnesSiteConfig {
  /** API 请求源（不含路径） */
  origin: string
  /** 控制台 API Key 管理页 */
  consoleUrl: string
  /** 文档站 */
  docsUrl: string
}

export const AGNES_SITES: Record<AgnesSiteId, AgnesSiteConfig> = {
  com: {
    origin: 'https://apihub.agnes-ai.com',
    consoleUrl: 'https://platform.agnes-ai.com/settings/apiKeys',
    docsUrl: 'https://agnes-ai.com/zh-Hans/docs/overview'
  },
  cn: {
    origin: 'https://api.agnes-ai.cn',
    consoleUrl: 'https://platform.agnes-ai.cn/settings/apiKeys',
    docsUrl: 'https://agnes-ai.cn/zh-Hans/docs/overview'
  }
}

/** 宽松解析站点标识：仅接受 'cn'，其余一律回落国际站 'com' */
export function resolveAgnesSite(site: unknown): AgnesSiteId {
  return site === 'cn' ? 'cn' : 'com'
}

/** 取站点 API 源 */
export function agnesOrigin(site: unknown): string {
  return AGNES_SITES[resolveAgnesSite(site)].origin
}

/**
 * 解析 API Key，优先级：
 *   1. 前端显式传入的 clientKey（用户在设置页按站点配置）
 *   2. 服务端环境变量：国内站 AGNES_API_KEY_CN，国际站 AGNES_API_KEY
 *      （同时读取 runtimeConfig 映射，兼容 Cloudflare Pages 部署）
 */
export function resolveAgnesApiKey(clientKey: unknown, site: unknown): string {
  if (typeof clientKey === 'string' && clientKey.length > 0) return clientKey
  const siteId = resolveAgnesSite(site)
  let configKey = ''
  try {
    const config = useRuntimeConfig() as any
    configKey = siteId === 'cn' ? (config.agnesApiKeyCn || '') : (config.agnesApiKey || '')
  } catch { /* 非 Nitro 上下文时忽略 */ }
  if (configKey) return configKey
  if (siteId === 'cn') {
    return process.env.AGNES_API_KEY_CN || ''
  }
  return process.env.AGNES_API_KEY || ''
}

/** Key 缺失时抛出的统一错误 */
export function throwApiKeyMissing() {
  throw createError({
    statusCode: 422,
    statusMessage: 'API_KEY_MISSING',
    data: { error: '请在设置页面选择站点并配置对应的 Agnes API Key' }
  })
}
