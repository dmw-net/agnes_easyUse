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

  // 优先使用 video_id（推荐方式）
  const id = video_id || task_id

  if (!id || typeof id !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required parameter: video_id or task_id'
    })
  }

  try {
    const config = useRuntimeConfig()
    const apiKey = (clientApiKey as string) || config.agnesApiKey || process.env.AGNES_API_KEY

    if (!apiKey) {
      throw createError({
        statusCode: 422,
        statusMessage: 'API_KEY_MISSING',
        data: { error: '请在设置页面配置 Agnes API Key' }
      })
    }

    // 使用推荐方式：video_id 查询
    const url = `https://apihub.agnes-ai.com/agnesapi?video_id=${encodeURIComponent(id)}`
    
    console.log('[Video] Polling status for:', id)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    })

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
    console.log('[Video] Status:', data.status, '| Progress:', data.progress)

    return {
      id:             data.id || '',
      video_id:        data.video_id || '',
      status:          data.status || 'unknown',
      progress:        data.progress || 0,
      seconds:         data.seconds || '',
      size:            data.size || '',
      video_url:       data.remixed_from_video_id || null,
      error:           data.error || null
    }

  } catch (error: any) {
    console.error('[Video] Poll error:', error)
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
})
