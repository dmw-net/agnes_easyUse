/**
 * 视频任务状态查询 - 推荐方式（使用 video_id）
 * GET /api/video/status?video_id=xxx
 *
 * 文档: D:/zb/Desktop/test/aiGenerate/Agnes Video V2.0.md
 * Endpoint: https://apihub.agnes-ai.com/agnesapi?video_id=<VIDEO_ID>
 */

// 从 Agnes 响应中稳健提取视频地址。
// 不同版本/接口的字段名可能不同（remixed_from_video_id / video_url / url / output / ...），
// 这里做多字段 + 嵌套 + 全文扫描兜底，避免某个字段名不匹配就彻底拿不到视频。
function extractVideoUrl(data: any): string | null {
  if (!data || typeof data !== 'object') return null

  const candidates = [
    'remixed_from_video_id',
    'video_url',
    'videoUrl',
    'url',
    'output_url',
    'output',
    'download_url',
    'file_url',
    'cdn_url',
    'mp4_url',
    'result_url',
    'play_url',
    'media_url'
  ]
  for (const key of candidates) {
    const v = data[key]
    if (typeof v === 'string' && /^https?:\/\//.test(v)) return v
  }

  // 嵌套结构：data.video.url / data.result.url / data.data.url / data.outputs[0].url
  for (const outer of ['video', 'result', 'data', 'outputs', 'output']) {
    const node = data[outer]
    if (node && typeof node === 'object') {
      const inner = extractVideoUrl(node)
      if (inner) return inner
    }
  }

  // 兜底：扫描整个响应体，取第一个看起来是视频的 URL
  return scanFirstVideoUrl(data)
}

function scanFirstVideoUrl(data: any): string | null {
  try {
    const text = JSON.stringify(data)
    // 1) 优先匹配媒体直链（.mp4/.mov/.webm/.m3u8）
    const mediaRe = /https?:\/\/[^\s"'`}\\]+(?:\.mp4|\.mov|\.webm|\.m3u8)/i
    const m = text.match(mediaRe)
    if (m) return m[0]
    // 2) 其次匹配包含视频/存储关键字的 URL
    const kwRe = /https?:\/\/[^\s"'`}\\]*(?:videos?|agnes|googleapis|cloudfront|cdn|storage)[^\s"'`}\\]*/i
    const m2 = text.match(kwRe)
    if (m2) return m2[0]
    // 3) 最后匹配任意 https URL
    const any = text.match(/https?:\/\/[^\s"'`}\\]+/)
    if (any) return any[0]
  } catch {
    /* ignore */
  }
  return null
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { video_id, task_id, apiKey: clientApiKey } = query

  const id = video_id || task_id

  if (!id || typeof id !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required parameter: video_id or task_id'
    })
  }

  // 获取 API Key
  const config = useRuntimeConfig()
  const apiKey = (clientApiKey as string) || config.agnesApiKey || process.env.AGNES_API_KEY

  if (!apiKey) {
    throw createError({
      statusCode: 422,
      statusMessage: 'API_KEY_MISSING',
      data: { error: '请在设置页面配置 Agnes API Key' }
    })
  }

  // 设置 15 秒超时（轮询接口应快速响应）
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000)

  try {
    const url = `https://apihub.agnes-ai.com/agnesapi?video_id=${encodeURIComponent(id)}`

    console.log('[Video] Polling status for:', id)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      signal: controller.signal
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('[Video] Poll failed:', response.status, errorData)
      throw createError({
        statusCode: response.status,
        statusMessage: errorData.error?.message || `Agnes API request failed: ${response.statusText}`,
        data: errorData
      })
    }

    const data = await response.json()
    console.log('[Video] Raw Agnes status response:', JSON.stringify(data).slice(0, 2000))
    console.log('[Video] Status:', data.status, '| Progress:', data.progress, '| Extracted URL:', extractVideoUrl(data) || '(none)')

    return {
      id:             data.id || '',
      video_id:        data.video_id || '',
      status:          data.status || 'unknown',
      progress:        data.progress || 0,
      seconds:         data.seconds || 0,
      file_size:       data.file_size || '',
      resolution:      data.size || '',
      // 稳健提取视频地址：兼容 remixed_from_video_id / video_url / url / ... 多种字段
      video_url:       extractVideoUrl(data),
      error:           data.error || null,
      // 透传原始响应，便于前端手动解析兜底与排错
      raw:             data
    }

  } catch (error: any) {
    clearTimeout(timeoutId)

    if (error.name === 'AbortError') {
      console.error('[Video] Poll timeout after 15s')
      throw createError({
        statusCode: 504,
        statusMessage: '轮询超时，请稍后手动刷新'
      })
    }

    console.error('[Video] Poll error:', error.message || error)
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '状态查询失败，请稍后重试'
    })
  }
})
