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
    images  = null,   // 兼容前端可能传 images（复数）
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

    // —— 图片处理：将 base64 数据上传到 tmpfiles.org 获取公网 URL
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

    // —— 构建请求体（严格遵循 Agnes Video V2.0 规范）
    const requestBody: Record<string, any> = {
      model,
      prompt,
      height,
      width,
      num_frames,
      frame_rate
    }

    // —— 根据模式正确设置 image 字段
    // text2video：不传 image
    // image2video（单张）：image 字段直接放 URL（顶层）
    // multi（多张）：extra_body.image 放 URL 数组（不设置 mode）
    // keyframes（多张）：extra_body.image 放 URL 数组 + extra_body.mode = "keyframes"
    if (publicImageUrls.length === 1 && mode !== 'keyframes') {
      // 单张图片（图生视频）
      requestBody.image = publicImageUrls[0]
    } else if (publicImageUrls.length > 1 || mode === 'keyframes') {
      // 多张图片或关键帧：放 extra_body
      requestBody.extra_body = { image: publicImageUrls }
      if (mode === 'keyframes') {
        requestBody.extra_body.mode = 'keyframes'
      }
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
