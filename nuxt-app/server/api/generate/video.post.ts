/**
 * 视频生成 - 创建任务
 * POST /api/generate/video
 *
 * 文档: D:/zb/Desktop/test/aiGenerate/Agnes Video V2.0.md
 * Endpoint: https://apihub.agnes-ai.com/v1/videos
 *
 * API Key 来源优先级:
 *   1. 请求体中的 apiKey 字段（用户在设置页配置）
 *   2. 服务端环境变量 AGNES_API_KEY
 */

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const {
    prompt,
    model   = 'agnes-video-v2.0',
    image   = null,
    mode    = null,
    height  = 768,
    width   = 1152,
    num_frames      = 121,
    frame_rate      = 24,
    seed            = null,
    negative_prompt = '',
    apiKey: clientApiKey
  } = body

  // 验证 prompt
  if (!prompt || !prompt.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Prompt is required'
    })
  }

  try {
    // 获取 API Key
    const config = useRuntimeConfig()
    const apiKey = clientApiKey || config.agnesApiKey || process.env.AGNES_API_KEY

    if (!apiKey) {
      throw createError({
        statusCode: 422,
        statusMessage: 'API_KEY_MISSING',
        data: { error: '请在设置页面配置 Agnes API Key' }
      })
    }

    // 构建请求体（严格遵循 Agnes Video V2.0 规范）
    const requestBody: Record<string, any> = {
      model,
      prompt,
      height,
      width,
      num_frames,
      frame_rate
    }

    // 图生视频 / 多图视频：传入 image
    if (image) {
      requestBody.image = image
    }

    // 关键帧模式
    if (mode) {
      requestBody.mode = mode
    }

    // 负向提示词
    if (negative_prompt) {
      requestBody.negative_prompt = negative_prompt
    }

    // 随机种子
    if (seed !== null && seed !== '') {
      requestBody.seed = Number(seed)
    }

    console.log('[Video] Creating task:', { model, width, height, num_frames, frame_rate })

    const response = await fetch('https://apihub.agnes-ai.com/v1/videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('[Video] Create task failed:', response.status, errorData)
      throw createError({
        statusCode: response.status,
        statusMessage: errorData.error?.message || `Agnes API request failed: ${response.statusText}`,
        data: errorData
      })
    }

    const data = await response.json()
    console.log('[Video] Task created:', data.video_id || data.id)

    return {
      task_id:  data.id || data.task_id || '',
      video_id: data.video_id || '',
      status:   data.status || 'queued',
      progress: data.progress || 0,
      seconds:  data.seconds || '',
      size:    data.size || ''
    }

  } catch (error: any) {
    console.error('[Video] Create task error:', error)
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
})
