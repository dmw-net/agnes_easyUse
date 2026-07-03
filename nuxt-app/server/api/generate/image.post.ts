/**
 * 图片生成 API - 使用 Agnes Image 2.0/2.1 Flash
 * 文档: D:/zb/Desktop/test/aiGenerate/Agnes Image 2.0 Flash.md
 *        D:/zb/Desktop/test/aiGenerate/Agnes Image 2.1 Flash.md
 *
 * API Key 来源优先级：
 *   1. 请求体中的 apiKey 字段（用户在设置页配置，从前端传入）
 *   2. 服务端环境变量 AGNES_API_KEY（部署时配置）
 */

export default defineEventHandler(async (event) => {
  // 读取请求体
  const body = await readBody(event)
  const {
    prompt,
    model = 'agnes-image-2.0-flash',
    size = '1024x768',
    image = null,
    return_base64 = false,
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
  const allowedModels = ['agnes-image-2.0-flash', 'agnes-image-2.1-flash']
  if (!allowedModels.includes(model)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid model. Allowed models: ${allowedModels.join(', ')}`
    })
  }

  // 获取 API Key
  const config = useRuntimeConfig()
  const apiKey = clientApiKey || config.agnesApiKey || process.env.AGNES_API_KEY

  if (!apiKey) {
    console.warn('[Image] No Agnes API key configured')
    throw createError({
      statusCode: 422,
      statusMessage: 'API_KEY_MISSING',
      data: { error: '请在设置页面配置 Agnes API Key' }
    })
  }

  // 构建请求体
  const requestBody: any = {
    model,
    prompt,
    size
  }

  if (image && Array.isArray(image) && image.length > 0) {
    requestBody.image = image
  }

  requestBody.extra_body = {
    response_format: 'url'
  }

  // 设置 60 秒超时
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 60000)

  try {
    console.log('[Image] Calling Agnes API:', 'https://apihub.agnes-ai.com/v1/images/generations')
    console.log('[Image] Model:', model, '| Size:', size)

    const response = await fetch('https://apihub.agnes-ai.com/v1/images/generations', {
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
        statusMessage: errorData.error?.message || `Agnes API request failed: ${response.statusText}`,
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
      console.error('[Image] Request timeout after 60s')
      throw createError({
        statusCode: 504,
        statusMessage: '请求超时，Agnes API 未在 60 秒内响应，请稍后重试'
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
