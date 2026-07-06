/**
 * 视频生成 - 创建任务
 * POST /api/generate/video
 *
 * 文档: D:/zb/Desktop/test/aiGenerate/Agnes Video V2.0.md
 * Endpoint: https://apihub.agnes-ai.com/v1/videos
 *
 * API Key 来源优先级：
 *   1. 请求体中的 apiKey 字段（用户在设置页配置）
 *   2. 服务端环境变量 AGNES_API_KEY
 */

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const {
    prompt,
    model   = 'agnes-video-v2.0',
    image   = null,
    images  = null,
    mode    = null,
    height  = 768,
    width   = 1152,
    num_frames      = 121,
    frame_rate      = 24,
    seed            = null,
    negative_prompt = '',
    apiKey: clientApiKey
  } = body

  if (!prompt || !prompt.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Prompt is required'
    })
  }

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

  // 图片处理：直接以 base64 data URI 传给 Agnes（不再依赖外部图床）
  // 原因：tmpfiles.org 链接生命周期短且连接不稳定，Agnes 服务端拉取时频繁出现
  //       "Download image URL failed: Connection reset by peer"。
  //       litellm / OpenAI 兼容接口原生支持 data URI，会内联解码、无需联网下载，
  //       从而彻底消除外部图床导致的下载失败。
  let publicImageUrls: string[] = []
  const imageData = images || image
  if (imageData) {
    const base64List = Array.isArray(imageData) ? imageData : [imageData]
    const validList = base64List.filter(
      (b64: string) => typeof b64 === 'string' && /^data:image\/[\w+-]+;base64,/.test(b64)
    )
    if (validList.length !== base64List.length) {
      throw createError({
        statusCode: 400,
        statusMessage: 'INVALID_IMAGE_DATA',
        data: { error: '图片数据格式不正确，应为 base64 图片（data:image/...;base64,）' }
      })
    }
    publicImageUrls = validList
    console.log(`[Video] Using ${publicImageUrls.length} inline base64 image(s), no external host needed`)
  }

  // 构建请求体
  const requestBody: Record<string, any> = {
    model,
    prompt,
    height,
    width,
    num_frames,
    frame_rate
  }

  if (publicImageUrls.length === 1 && mode !== 'keyframes') {
    requestBody.image = publicImageUrls[0]
  } else if (publicImageUrls.length > 1 || mode === 'keyframes') {
    requestBody.extra_body = { image: publicImageUrls }
    if (mode === 'keyframes') {
      requestBody.extra_body.mode = 'keyframes'
    }
  }

  if (negative_prompt) {
    requestBody.negative_prompt = negative_prompt
  }

  if (seed !== null && seed !== '') {
    requestBody.seed = Number(seed)
  }

  // 设置 60 秒超时
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 60000)

  try {
    console.log('[Video] Creating task:', { model, width, height, num_frames, frame_rate })

    const response = await fetch('https://apihub.agnes-ai.com/v1/videos', {
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
    clearTimeout(timeoutId)

    if (error.name === 'AbortError') {
      console.error('[Video] Create task timeout after 60s')
      throw createError({
        statusCode: 504,
        statusMessage: '请求超时，Agnes API 未在 60 秒内响应，请稍后重试'
      })
    }

    console.error('[Video] Create task error:', error.message || error)
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '视频任务创建失败，请稍后重试'
    })
  }
})
