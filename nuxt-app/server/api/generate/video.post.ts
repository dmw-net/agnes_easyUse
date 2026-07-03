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

import { uploadBase64ToTmpfiles } from '../../utils/upload-image'

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

  // 图片处理：将 base64 数据上传到 tmpfiles.org 获取公网 URL
  let publicImageUrls: string[] = []
  const imageData = images || image
  if (imageData) {
    const base64List = Array.isArray(imageData) ? imageData : [imageData]
    console.log(`[Video] Uploading ${base64List.length} image(s) to tmpfiles.org...`)
    try {
      publicImageUrls = await Promise.all(
        base64List.map((b64: string) => uploadBase64ToTmpfiles(b64))
      )
      console.log('[Video] Images uploaded:', publicImageUrls)
    } catch (uploadErr: any) {
      console.error('[Video] Image upload failed:', uploadErr.message)
      throw createError({
        statusCode: 400,
        statusMessage: 'IMAGE_UPLOAD_FAILED',
        data: { error: `图片上传失败：${uploadErr.message}` }
      })
    }
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
