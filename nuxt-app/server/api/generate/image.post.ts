/**
 * 图片生成 API - 使用 Agnes Image 2.0/2.1/2.5 Flash
 * 文档: https://agnes-ai.com/zh-Hans/docs/agnes-image-25-flash
 *       https://agnes-ai.cn/zh-Hans/docs/agnes-image-25-flash
 *
 * 支持国际站（agnes-ai.com）/ 国内站（agnes-ai.cn）双站点，
 * 通过请求体 site 字段路由（'com' | 'cn'，默认 'com'）。
 *
 * 尺寸契约（按模型区分）：
 *   - 2.1 / 2.5 Flash：档位式 size（1K/2K/3K/4K）+ ratio 宽高比
 *   - 2.0 Flash：精确尺寸（如 1024x768），档位写法亦兼容
 *
 * API Key 来源优先级：
 *   1. 请求体中的 apiKey 字段（用户在设置页配置，从前端传入）
 *   2. 服务端环境变量（国际站 AGNES_API_KEY / 国内站 AGNES_API_KEY_CN）
 */

const ALLOWED_IMAGE_MODELS = ['agnes-image-2.0-flash', 'agnes-image-2.1-flash', 'agnes-image-2.5-flash']
const SIZE_TIER_RE = /^\d+[Kk]$/
const SIZE_EXACT_RE = /^\d{2,5}x\d{2,5}$/
const ALLOWED_RATIOS = ['1:1', '3:4', '4:3', '16:9', '9:16', '2:3', '3:2', '21:9']

export default defineEventHandler(async (event) => {
  // 读取请求体
  const body = await readBody(event)
  const {
    prompt,
    model = 'agnes-image-2.5-flash',
    size = '1K',
    ratio = null,
    image = null,
    return_base64 = false,
    site = 'com',
    apiKey: clientApiKey
  } = body

  // 验证参数
  if (!prompt || prompt.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Prompt is required'
    })
  }

  // 验证模型名称
  if (!ALLOWED_IMAGE_MODELS.includes(model)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid model. Allowed models: ${ALLOWED_IMAGE_MODELS.join(', ')}`
    })
  }

  // 验证尺寸：档位（1K/2K/3K/4K）或精确宽高（1024x768）
  if (!SIZE_TIER_RE.test(size) && !SIZE_EXACT_RE.test(size)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid size. Use a tier like "1K"/"2K"/"3K"/"4K" or an exact size like "1024x768"'
    })
  }

  // 验证宽高比（可选）
  if (ratio && !ALLOWED_RATIOS.includes(ratio)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid ratio. Allowed ratios: ${ALLOWED_RATIOS.join(', ')}`
    })
  }

  // 站点与 API Key
  const siteId = resolveAgnesSite(site)
  const origin = agnesOrigin(siteId)
  const apiKey = resolveAgnesApiKey(clientApiKey, siteId)

  if (!apiKey) {
    console.warn('[Image] No Agnes API key configured for site:', siteId)
    throwApiKeyMissing()
  }

  // 构建请求体。
  // 输入图片统一放 extra_body.image（官方文档明确要求，
  // 顶层 image 会被服务端忽略；2.0/2.1/2.5 三个模型同此契约）。
  const requestBody: any = {
    model,
    prompt,
    size
  }
  if (ratio) {
    requestBody.ratio = ratio
  }

  requestBody.extra_body = {
    response_format: 'url'
  }

  if (image && Array.isArray(image) && image.length > 0) {
    requestBody.extra_body.image = image
  }

  // 超时设置：Agnes 图片生成根据复杂度/尺寸/负载可能耗时几十秒甚至更久，
  // 官方建议客户端超时为 60s–360s。此处设为 300s（5 分钟），避免长任务被误杀。
  // 注意：Cloudflare Pages Functions 按 CPU 预算计时，纯 await 等待几乎不耗 CPU，
  // 可安全长时间挂起等待响应，因此此处放大超时不会触达平台限制。
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 300000)

  try {
    const endpoint = `${origin}/v1/images/generations`
    console.log('[Image] Calling Agnes API:', endpoint, '| site:', siteId)
    console.log('[Image] Model:', model, '| Size:', size, ratio ? `| Ratio: ${ratio}` : '')

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('[Image] Agnes API error:', response.status, JSON.stringify(errorData))
      throw createError({
        statusCode: response.status,
        statusMessage: errorData.error?.message || errorData.detail || `Agnes API request failed: ${response.statusText}`,
        data: errorData
      })
    }

    const data = await response.json()

    if (!data.data || !data.data[0]) {
      console.error('[Image] Invalid Agnes API response:', JSON.stringify(data))
      throw createError({
        statusCode: 502,
        statusMessage: 'Agnes API 返回了无效响应数据'
      })
    }

    const result = data.data[0]
    console.log('[Image] Success')

    return {
      url: result.url || null,
      b64_json: result.b64_json || null,
      revised_prompt: result.revised_prompt || null
    }

  } catch (error: any) {
    clearTimeout(timeoutId)

    if (error.name === 'AbortError') {
      console.error('[Image] Request timeout after 300s')
      throw createError({
        statusCode: 504,
        statusMessage: '图片生成超时（已超过 5 分钟），可能是提示词过于复杂或服务端负载较高，请尝试简化提示词后重试'
      })
    }

    console.error('[Image] Generation failed:', error.message || error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || '图片生成失败，请稍后重试'
    })
  }
})
