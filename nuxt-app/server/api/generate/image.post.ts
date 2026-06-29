/**
 * 图片生成 API - 使用 Agnes Image 2.0/2.1 Flash
 * 文档: D:/zb/Desktop/test/aiGenerate/Agnes Image 2.0 Flash.md
 *       D:/zb/Desktop/test/aiGenerate/Agnes Image 2.1 Flash.md
 *
 * API Key 来源优先级:
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
    apiKey: clientApiKey   // 前端传入的 API Key
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

  try {
    // 获取 API Key：优先使用前端传入的，其次使用服务端环境变量
    const config = useRuntimeConfig()
    const apiKey = clientApiKey || config.agnesApiKey || process.env.AGNES_API_KEY

    if (!apiKey) {
      console.warn('No Agnes API key configured')
      throw createError({
        statusCode: 422,
        statusMessage: 'API_KEY_MISSING',
        data: { error: '请在设置页面配置 Agnes API Key' }
      })
    }

    // 构建请求体（严格遵循 Agnes API 规范）
    const requestBody: any = {
      model,
      prompt,
      size
    }

    // 图生图需要 image 参数（公网 URL 或 Data URI Base64）
    if (image && Array.isArray(image) && image.length > 0) {
      requestBody.image = image
    }

    // URL 输出模式（推荐）
    requestBody.extra_body = {
      response_format: 'url'
    }

    console.log('Calling Agnes API:', 'https://apihub.agnes-ai.com/v1/images/generations')
    console.log('Model:', model, '| Size:', size)

    // 调用 Agnes API
    const response = await fetch('https://apihub.agnes-ai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Agnes API error:', response.status, errorData)
      throw createError({
        statusCode: response.status,
        statusMessage: errorData.error?.message || `Agnes API request failed: ${response.statusText}`,
        data: errorData
      })
    }

    const data = await response.json()

    // 返回生成的图片 URL 或 Base64 数据
    // 成功响应格式:
    // URL 输出: { created: 1780000000, data: [{ url: "https://...", b64_json: null, revised_prompt: null }] }
    // Base64 输出: { created: 1780000000, data: [{ url: null, b64_json: "iVBORw0...", revised_prompt: null }] }

    if (!data.data || !data.data[0]) {
      console.error('Invalid Agnes API response:', JSON.stringify(data))
      throw createError({
        statusCode: 502,
        statusMessage: 'Agnes API 返回了无效响应数据'
      })
    }

    const result = data.data[0]

    return {
      url: result.url || null,
      b64_json: result.b64_json || null,
      revised_prompt: result.revised_prompt || null
    }

  } catch (error: any) {
    console.error('Image generation failed:', error)

    if (error.statusCode) {
      throw error // 已经是 createError 创建的错误
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
})
