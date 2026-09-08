/**
 * 视频生成 - 创建任务
 * POST /api/generate/video
 *
 * 支持两套模型契约：
 *   1. agnes-video-v2.0      → 文档: D:/zb/Desktop/test/aiGenerate/Agnes Video V2.0.md
 *      参数：height / width / num_frames / frame_rate / image / images(extra_body) / mode
 *   2. agnes-video-2.5-flash → 文档: https://agnes-ai.com/zh-Hans/docs/agnes-video-25-flash
 *      参数：mode(text|keyframe|reference) / seconds("4"-"12") / size(固定 "720P")
 *            aspect_ratio / first_frame / last_frame / images(≤5)
 *
 * API Key 来源优先级：
 *   1. 请求体中的 apiKey 字段（用户在设置页配置）
 *   2. 服务端环境变量 AGNES_API_KEY
 */

// ============ 常量 ============
const ALLOWED_MODELS = ['agnes-video-v2.0', 'agnes-video-2.5-flash']

// 2.5 Flash 约束（官方校验：违反会直接 HTTP 400 且不会创建任务）
const V25_SIZE = '720P'
const V25_MIN_SECONDS = 4
const V25_MAX_SECONDS = 12
const V25_MAX_IMAGES = 5
const V25_ASPECT_RATIOS = ['21:9', '16:9', '4:3', '1:1', '3:4', '9:16']
const V25_MODES = ['text', 'keyframe', 'reference']

const DATA_URI_RE = /^data:image\/[\w+-]+;base64,/

/** 校验单张图片输入：允许 data URI 或公网 http(s) 图片地址 */
function isValidImageInput(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 &&
    (DATA_URI_RE.test(value) || /^https?:\/\//i.test(value))
}

/** 统一把入参收敛成字符串数组，并做逐项校验 */
function normalizeImages(input: unknown): string[] {
  if (!input) return []
  const list = Array.isArray(input) ? input : [input]
  if (list.some((item: unknown) => !isValidImageInput(item))) {
    throw createError({
      statusCode: 400,
      statusMessage: 'INVALID_IMAGE_DATA',
      data: { error: '图片数据格式不正确，应为 base64 图片（data:image/...;base64,）或公网 http(s) 图片地址' }
    })
  }
  return list as string[]
}

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
    // —— 2.5 Flash 专属参数 ——
    seconds      = null,
    aspect_ratio = '16:9',
    first_frame  = null,
    last_frame   = null,
    apiKey: clientApiKey
  } = body

  if (!prompt || !prompt.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Prompt is required'
    })
  }

  if (!ALLOWED_MODELS.includes(model)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid model. Allowed models: ${ALLOWED_MODELS.join(', ')}`
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

  const isV25 = model === 'agnes-video-2.5-flash'

  // 构建请求体
  const requestBody: Record<string, any> = isV25
    ? buildV25Body({ prompt, mode, seconds, aspect_ratio, first_frame, last_frame, image, images, seed })
    : buildV20Body({ prompt, height, width, num_frames, frame_rate, negative_prompt, seed, image, images, mode })

  // 设置 60 秒超时
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 60000)

  try {
    console.log('[Video] Creating task:', { model, ...(isV25
      ? { mode: requestBody.mode, seconds: requestBody.seconds, aspect_ratio: requestBody.aspect_ratio }
      : { width, height, num_frames, frame_rate }
    ) })

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
        // 2.5 Flash 的校验错误返回 { detail: "..." } 而非 OpenAI 风格的 error.message
        statusMessage: errorData.error?.message || errorData.detail || `Agnes API request failed: ${response.statusText}`,
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
      size:    data.size || '',
      // 回传模型名，供状态查询时决定是否携带 model_name（2.5 Flash 的
      // keyframe / reference 模式必须带 model_name 才能查到结果）
      model
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

// ============================================================
//  agnes-video-v2.0 请求体（保持既有行为不变）
// ============================================================
function buildV20Body(params: {
  prompt: string
  height: number
  width: number
  num_frames: number
  frame_rate: number
  negative_prompt: string
  seed: any
  image: any
  images: any
  mode: any
}): Record<string, any> {
  const { prompt, height, width, num_frames, frame_rate, negative_prompt, seed, image, images, mode } = params

  const requestBody: Record<string, any> = {
    model: 'agnes-video-v2.0',
    prompt,
    height,
    width,
    num_frames,
    frame_rate
  }

  // 图片直接以 base64 data URI 内联传给 Agnes（不依赖外部图床）：
  // tmpfiles.org 链接生命周期短，Agnes 拉取时频繁出现
  // "Download image URL failed: Connection reset by peer"。
  const imageData = images || image
  if (imageData) {
    const list = Array.isArray(imageData) ? imageData : [imageData]
    // v2.0 链路沿用原有严格校验（仅接受 data URI）
    if (list.some((b64: unknown) => typeof b64 !== 'string' || !DATA_URI_RE.test(b64))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'INVALID_IMAGE_DATA',
        data: { error: '图片数据格式不正确，应为 base64 图片（data:image/...;base64,）' }
      })
    }
    if (list.length === 1 && mode !== 'keyframes') {
      requestBody.image = list[0]
    } else {
      requestBody.extra_body = { image: list }
      if (mode === 'keyframes') {
        requestBody.extra_body.mode = 'keyframes'
      }
    }
  }

  if (negative_prompt) {
    requestBody.negative_prompt = negative_prompt
  }

  if (seed !== null && seed !== '') {
    requestBody.seed = Number(seed)
  }

  return requestBody
}

// ============================================================
//  agnes-video-2.5-flash 请求体
// ============================================================
function buildV25Body(params: {
  prompt: string
  mode: any
  seconds: any
  aspect_ratio: any
  first_frame: any
  last_frame: any
  image: any
  images: any
  seed: any
}): Record<string, any> {
  const { prompt, mode, seconds, aspect_ratio, first_frame, last_frame, image, images, seed } = params

  // —— mode 校验 ——
  if (!mode || !V25_MODES.includes(mode)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid mode for agnes-video-2.5-flash. Allowed: ${V25_MODES.join(', ')}`
    })
  }

  // —— 画幅比例校验（默认 16:9）——
  const ratio = V25_ASPECT_RATIOS.includes(aspect_ratio) ? aspect_ratio : '16:9'

  // —— 时长校验：字符串 "4"–"12"，超出范围直接收敛到边界，避免 400 ——
  const rawSeconds = Number(seconds)
  const safeSeconds = Number.isFinite(rawSeconds)
    ? Math.min(V25_MAX_SECONDS, Math.max(V25_MIN_SECONDS, Math.trunc(rawSeconds)))
    : 5

  const requestBody: Record<string, any> = {
    model: 'agnes-video-2.5-flash',
    prompt,
    mode,
    seconds: String(safeSeconds),
    // Flash 版本固定 720P，传其他值会返回 HTTP 400: size must be 720P
    size: V25_SIZE,
    aspect_ratio: ratio,
    n: 1
  }

  // —— 媒体字段按模式装配（模式与字段互斥，传错会被 400 拒绝）——
  if (mode === 'keyframe') {
    const first = normalizeImages(first_frame ?? image)[0] || null
    const last = normalizeImages(last_frame)[0] || null
    if (!first && !last) {
      throw createError({
        statusCode: 400,
        statusMessage: 'keyframe 模式需要至少提供一张首帧或尾帧图片',
        data: { error: '请上传首帧或尾帧图片' }
      })
    }
    if (first) requestBody.first_frame = first
    if (last) requestBody.last_frame = last
  } else if (mode === 'reference') {
    const list = normalizeImages(images ?? image)
    if (list.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'reference 模式需要至少提供一张参考图片',
        data: { error: '请上传参考图片' }
      })
    }
    if (list.length > V25_MAX_IMAGES) {
      throw createError({
        statusCode: 400,
        statusMessage: `reference 模式最多支持 ${V25_MAX_IMAGES} 张参考图片`,
        data: { error: `当前 ${list.length} 张，请移除至 ${V25_MAX_IMAGES} 张以内` }
      })
    }
    requestBody.images = list
  }

  if (seed !== null && seed !== '' && seed !== undefined) {
    requestBody.seed = Number(seed)
  }

  return requestBody
}
