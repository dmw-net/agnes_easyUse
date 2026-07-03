/**
 * 提示词优化 API - 使用 Agnes 2.0 Flash 文本模型
 * 文档: D:/zb/Desktop/test/aiGenerate/Agnes 2.0 Flash.md
 *
 * API Key 来源优先级：
 *   1. 请求体中的 apiKey 字段（用户在设置页配置，从前端传入）
 *   2. 服务端环境变量 AGNES_API_KEY（部署时配置）
 */

export default defineEventHandler(async (event) => {
  // 读取请求体
  const body = await readBody(event)
  const { prompt, type = 'image', apiKey: clientApiKey } = body

  // 验证参数
  if (!prompt || prompt.trim().length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Prompt is required'
    })
  }

  // 获取 API Key：优先使用前端传入的，其次使用服务端环境变量
  const config = useRuntimeConfig()
  const apiKey = clientApiKey || config.agnesApiKey || process.env.AGNES_API_KEY

  if (!apiKey) {
    console.warn('[Optimize] No Agnes API key configured for prompt optimization')
    throw createError({
      statusCode: 422,
      statusMessage: 'API_KEY_MISSING',
      data: { error: '请在设置页面配置 Agnes API Key' }
    })
  }

  // 根据类型生成不同的 system prompt
  const isVideo = type === 'video'
  const systemPrompt = isVideo
    ? `You are a professional AI video generation prompt optimization expert. Your task is to optimize the user's simple description into a high-quality, detailed prompt for AI video generation.

Optimization principles for video prompts:
1. Add motion descriptions: camera movement (pan, tilt, dolly, orbit), character actions, object transformations
2. Specify temporal elements: start state → action → end state, timing of key events
3. Include visual details: lighting changes, color palette, atmosphere, weather
4. Add cinematic quality terms: cinematic lighting, 4K, smooth motion, 24fps, professional videography
5. Preserve the user's core intent without changing the main subject
6. Structure: "Subject + Action/Motion + Camera Movement + Environment + Lighting/Mood + Quality Tags"
7. For video, describe what happens OVER TIME, not just a static scene

Output format:
- Output the optimized prompt directly in English
- Do NOT add explanations or prefixes
- The prompt should be detailed, cinematic, and optimized for video generation models

Example:
Input: a cat walking on the beach
Output: A fluffy orange cat walking slowly along a sunset beach, gentle waves lapping at paw prints, camera slowly dollying behind the cat, warm golden hour lighting, sea breeze ruffling fur, cinematic composition, smooth motion, 24fps, 4K, high detail`
    : `You are a professional AI image generation prompt optimization expert. Your task is to optimize the user's simple description into a high-quality, detailed prompt for AI image generation.

Optimization principles:
1. Add visual details: lighting, materials, colors, composition, style
2. Specify art style: photography, oil painting, watercolor, cyberpunk, anime, etc.
3. Add quality terms: high definition, rich detail, professional photography, cinematic quality, etc.
4. Structure: "Subject Description + Environment/Background + Art Style + Technical Parameters"
5. Preserve the user's core intent without changing it
6. Output in English for better AI understanding

Output format:
- Output the optimized prompt directly
- Do NOT add explanations or prefixes
- The prompt should be detailed, professional, and easy for AI to understand

Example:
Input: a cat sitting on the moon
Output: A cute cat sitting on the crescent moon, fluffy fur, glowing eyes, starry night sky background, ethereal lighting, dreamy atmosphere, digital art, highly detailed, 8K resolution, cinematic composition, magical realism style`

  // 构建请求体（调用 Agnes 2.0 Flash 文本模型）
  const requestBody = {
    model: 'agnes-2.0-flash',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: isVideo
          ? `Please optimize the following AI video generation prompt:\n\n${prompt}`
          : `Please optimize the following AI image generation prompt:\n\n${prompt}`
      }
    ],
    temperature: 0.7,
    max_tokens: 1024
  }

  // 设置 30 秒超时（AbortController）
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000)

  try {
    console.log('[Optimize] Calling Agnes API:', 'https://apihub.agnes-ai.com/v1/chat/completions')

    // 调用 Agnes API
    const response = await fetch('https://apihub.agnes-ai.com/v1/chat/completions', {
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
      console.error('[Optimize] Agnes API error:', response.status, JSON.stringify(errorData))
      throw createError({
        statusCode: response.status,
        statusMessage: errorData.error?.message || `Agnes API request failed: ${response.statusText}`,
        data: errorData
      })
    }

    const data = await response.json()

    // 成功响应格式: { id, object, created, model, choices: [{ index, message: { role, content }, finish_reason }], usage }
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('[Optimize] Invalid Agnes API response:', JSON.stringify(data))
      throw createError({
        statusCode: 502,
        statusMessage: 'Agnes API 返回了无效响应数据'
      })
    }

    const optimizedPrompt = data.choices[0].message.content.trim()

    console.log('[Optimize] Success, usage:', JSON.stringify(data.usage || {}))

    return {
      optimized_prompt: optimizedPrompt,
      model: 'agnes-2.0-flash',
      usage: data.usage
    }

  } catch (error: any) {
    clearTimeout(timeoutId)

    // 超时错误：AbortController 触发的 abort
    if (error.name === 'AbortError') {
      console.error('[Optimize] Request timeout after 30s')
      throw createError({
        statusCode: 504,
        statusMessage: '请求超时，Agnes API 未在 30 秒内响应，请稍后重试'
      })
    }

    console.error('[Optimize] Failed:', error.message || error)

    if (error.statusCode) {
      throw error // 已经是 createError 创建的错误
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || '提示词优化失败，请稍后重试'
    })
  }
})
