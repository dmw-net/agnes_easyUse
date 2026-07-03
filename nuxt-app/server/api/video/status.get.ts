/**
 * 视频任务状态查询 - 推荐方式（使用 video_id）
 * GET /api/video/status?video_id=xxx
 *
 * 文档: D:/zb/Desktop/test/aiGenerate/Agnes Video V2.0.md
 * Endpoint: https://apihub.agnes-ai.com/agnesapi?video_id=<VIDEO_ID>
 */

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
    console.log('[Video] Status:', data.status, '| Progress:', data.progress, '| URL field:', data.remixed_from_video_id || '(none)')

    return {
      id:             data.id || '',
      video_id:        data.video_id || '',
      status:          data.status || 'unknown',
      progress:        data.progress || 0,
      seconds:         data.seconds || 0,
      file_size:       data.file_size || '',
      resolution:      data.size || '',
      video_url:       data.remixed_from_video_id || null,
      error:           data.error || null
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
