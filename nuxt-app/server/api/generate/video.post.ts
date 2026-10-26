/**
 * 视频生成 - 创建任务
 * POST /api/generate/video
 *
 * 支持国际站（agnes-ai.com）/ 国内站（agnes-ai.cn）双站点，
 * 通过请求体 site 字段路由（'com' | 'cn'，默认 'com'）。
 *
 * 模型契约（两站一致，均为 OpenAI Videos 兼容异步任务接口）：
 *   1. agnes-video-2.5       → 全量版，size 支持 720P/1080P/1K/2K（按分辨率计费）
 *   2. agnes-video-2.5-flash → 固定 720P，限时免费；reference 图片 ≤5
 *
 * 公共参数：mode(text|keyframe|reference) / seconds("4"-"12") / aspect_ratio
 *           first_frame / last_frame（keyframe）；images（reference）
 *
 * 旧模型 agnes-video-v2.0 已从官方文档下线，本接口不再支持。
 *
 * API Key 来源优先级：
 *   1. 请求体中的 apiKey 字段（用户在设置页配置）
 *   2. 服务端环境变量（国际站 AGNES_API_KEY / 国内站 AGNES_API_KEY_CN）
 */

// ============ 常量 ============
const ALLOWED_MODELS = ['agnes-video-2.5', 'agnes-video-2.5-flash']

const V25_MIN_SECONDS = 4
const V25_MAX_SECONDS = 12
const V25_ASPECT_RATIOS = ['21:9', '16:9', '4:3', '1:1', '3:4', '9:16']
const V25_MODES = ['text', 'keyframe', 'reference']

// 全量版 size 档位；Flash 固定 720P
const V25_FULL_SIZES = ['720P', '1080P', '1K', '2K']
const FLASH_SIZE = '720P'
// reference 模式图片上限：Flash 官方限制 5 张（超限直接 400）；
// 全量版按计费规则第 6 张起收费，这里放行到 10 张
const FLASH_MAX_IMAGES = 5
const FULL_MAX_IMAGES = 10

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
    model   = 'agnes-video-2.5-flash',
    mode    = null,
    seconds = null,
    aspect_ratio = '16:9',
    // —— size 档位（全量版可选，Flash 服务端固定 720P）——
    size    = null,
    seed    = null,
    // —— 模式专用媒体字段 ——
    first_frame  = null,
    last_frame   = null,
    image   = null,
    images  = null,
    site = 'com',
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

  // 站点与 API Key
  const siteId = resolveAgnesSite(site)
  const origin = agnesOrigin(siteId)
  const apiKey = resolveAgnesApiKey(clientApiKey, siteId)

  if (!apiKey) {
    console.warn('[Video] No Agnes API key configured for site:', siteId)
    throwApiKeyMissing()
  }

  const isFlash = model === 'agnes-video-2.5-flash'

  // 构建请求体
  const requestBody = buildBody({
    model, prompt, mode, seconds, aspect_ratio, size, seed,
    first_frame, last_frame, image, images, isFlash
  })

  // 设置 60 秒超时
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 60000)

  try {
    console.log('[Video] Creating task:', {
      site: siteId, model,
      mode: requestBody.mode, seconds: requestBody.seconds,
      size: requestBody.size, aspect_ratio: requestBody.aspect_ratio
    })

    const response = await fetch(`${origin}/v1/videos`, {
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
        // 2.5 系列的校验错误返回 { detail: "..." } 或 { message: "..." } 而非 OpenAI 风格的 error.message
        statusMessage: errorData.error?.message || errorData.detail || errorData.message || `Agnes API request failed: ${response.statusText}`,
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
      size:     data.size || '',
      // 回传模型名，供状态查询时携带 model_name
      //（2.5 系列的 keyframe / reference 模式必须带 model_name 才能查到结果）
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
//  agnes-video-2.5 / 2.5-flash 请求体（共用契约，差异仅在 size 档位与图片上限）
// ============================================================
function buildBody(params: {
  model: string
  prompt: string
  mode: any
  seconds: any
  aspect_ratio: any
  size: any
  seed: any
  first_frame: any
  last_frame: any
  image: any
  images: any
  isFlash: boolean
}): Record<string, any> {
  const { model, prompt, mode, seconds, aspect_ratio, size, seed, first_frame, last_frame, image, images, isFlash } = params

  // —— mode 校验 ——
  if (!mode || !V25_MODES.includes(mode)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid mode. Allowed: ${V25_MODES.join(', ')}`
    })
  }

  // —— 画幅比例校验（默认 16:9）——
  const ratio = V25_ASPECT_RATIOS.includes(aspect_ratio) ? aspect_ratio : '16:9'

  // —— size 档位：
  //    Flash 固定 720P（传其他值返回 400: size must be 720P）
  //    全量版支持 720P/1080P/1K/2K，默认 720P
  let sizeTier: string
  if (isFlash) {
    sizeTier = FLASH_SIZE
  } else {
    sizeTier = V25_FULL_SIZES.includes(size) ? size : '720P'
  }

  // —— 时长校验：字符串 "4"–"12"，非法值收敛到边界，避免 400 ——
  const rawSeconds = Number(seconds)
  const safeSeconds = Number.isFinite(rawSeconds)
    ? Math.min(V25_MAX_SECONDS, Math.max(V25_MIN_SECONDS, Math.trunc(rawSeconds)))
    : 5

  const requestBody: Record<string, any> = {
    model,
    prompt,
    mode,
    seconds: String(safeSeconds),
    size: sizeTier,
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
    const maxImages = isFlash ? FLASH_MAX_IMAGES : FULL_MAX_IMAGES
    if (list.length > maxImages) {
      throw createError({
        statusCode: 400,
        statusMessage: `reference 模式最多支持 ${maxImages} 张参考图片`,
        data: { error: `当前 ${list.length} 张，请移除至 ${maxImages} 张以内` }
      })
    }
    requestBody.images = list
  }

  if (seed !== null && seed !== '' && seed !== undefined) {
    requestBody.seed = Number(seed)
  }

  return requestBody
}
