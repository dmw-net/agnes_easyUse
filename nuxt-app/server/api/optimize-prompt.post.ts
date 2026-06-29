/**
 * 提示词优化 API - 使用 Agnes 2.0 Flash 文本模型
 * 文档: D:/zb/Desktop/test/aiGenerate/Agnes 2.0 Flash.md
 *
 * API Key 来源优先级:
 *   1. 请求体中的 apiKey 字段（用户在设置页配置，从前端传入）
 *   2. 服务端环境变量 AGNES_API_KEY（部署时配置）
 */

export default defineEventHandler(async (event) => {
  // 读取请求体
  const body = await readBody(event)
  const { prompt, apiKey: clientApiKey } = body

  // 验证参数
  if (!prompt || prompt.trim().length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Prompt is required'
    })
  }

  try {
    // 获取 API Key：优先使用前端传入的，其次使用服务端环境变量
    const config = useRuntimeConfig()
    const apiKey = clientApiKey || config.agnesApiKey || process.env.AGNES_API_KEY

    if (!apiKey) {
      console.warn('No Agnes API key configured for prompt optimization')
      throw createError({
        statusCode: 422,
        statusMessage: 'API_KEY_MISSING',
        data: { error: '请在设置页面配置 Agnes API Key' }
      })
    }

    // 构建请求体（调用 Agnes 2.0 Flash 文本模型）
    const requestBody = {
      model: 'agnes-2.0-flash',
      messages: [
        {
          role: 'system',
          content: `你是一位专业的 AI 绘画提示词优化专家。你的任务是将用户的简单描述优化为高质量、详细的 AI 绘画提示词。

优化原则：
1. 补充视觉细节：光照、材质、色彩、构图、风格
2. 明确艺术风格：摄影、油画、水彩、赛博朋克、二次元等
3. 添加质量词：高清、细节丰富、专业摄影、电影级画质等
4. 结构化输出：按"主体描述 + 环境背景 + 艺术风格 + 技术参数"组织
5. 保持原意：不改变用户的核心意图

输出格式：
- 直接输出优化后的提示词
- 不要添加解释或前缀
- 提示词应该详细、专业、易于 AI 理解

示例：
输入：一只坐在月亮上的猫
输出：A cute cat sitting on the crescent moon, fluffy fur, glowing eyes, starry night sky background, ethereal lighting, dreamy atmosphere, digital art, highly detailed, 8K resolution, cinematic composition, magical realism style`
        },
        {
          role: 'user',
          content: `请优化以下 AI 绘画提示词：\n\n${prompt}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1024
    }

    console.log('Calling Agnes API for prompt optimization:', 'https://apihub.agnes-ai.com/v1/chat/completions')

    // 调用 Agnes API
    const response = await fetch('https://apihub.agnes-ai.com/v1/chat/completions', {
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

    // 返回优化的提示词
    // 成功响应格式: { id, object, created, model, choices: [{ index, message: { role, content }, finish_reason }], usage }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid Agnes API response:', JSON.stringify(data))
      throw createError({
        statusCode: 502,
        statusMessage: 'Agnes API 返回了无效响应数据'
      })
    }

    const optimizedPrompt = data.choices[0].message.content.trim()

    return {
      optimized_prompt: optimizedPrompt,
      model: 'agnes-2.0-flash',
      usage: data.usage
    }

  } catch (error: any) {
    console.error('Prompt optimization failed:', error)

    if (error.statusCode) {
      throw error // 已经是 createError 创建的错误
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
})
