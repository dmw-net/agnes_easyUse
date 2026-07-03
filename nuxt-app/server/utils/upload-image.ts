/**
 * 将 base64 图片数据上传到 tmpfiles.org，返回公网 URL
 * tmpfiles.org 无需 API Key，文件保留 60 分钟
 *
 * @param base64Data - data:image/xxx;base64,... 格式的数据
 * @returns 公网可访问的图片 URL
 */
export async function uploadBase64ToTmpfiles(base64Data: string): Promise<string> {
  // 解析 base64 数据和文件类型
  const matches = base64Data.match(/^data:(image\/\w+);base64,(.+)$/)
  if (!matches) {
    throw new Error('Invalid base64 image data')
  }

  const mimeType = matches[1]       // e.g. "image/png"
  const base64 = matches[2]
  const ext = mimeType.split('/')[1].replace('jpeg', 'jpg') // png / jpg / webp
  const buffer = Buffer.from(base64, 'base64')

  // 构造 multipart form-data
  const boundary = '----FormBoundary' + Math.random().toString(36).slice(2)
  const filename = `upload_${Date.now()}.${ext}`

  const partHeader = [
    `--${boundary}`,
    `Content-Disposition: form-data; name="file"; filename="${filename}"`,
    `Content-Type: ${mimeType}`,
    '',
  ].join('\r\n')

  const partFooter = [
    '',
    `--${boundary}--`,
    '',
  ].join('\r\n')

  const body = Buffer.concat([
    Buffer.from(partHeader, 'utf8'),
    buffer,
    Buffer.from(partFooter, 'utf8'),
  ])

  // 设置 30 秒超时
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch('https://tmpfiles.org/api/v1/upload', {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': String(body.length),
      },
      body,
      signal: controller.signal
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      const text = await response.text().catch(() => 'unknown error')
      throw new Error(`tmpfiles.org upload failed: ${response.status} ${text}`)
    }

    const result = await response.json()
    // 返回格式: { status: "ok", data: { url: "https://tmpfiles.org/..." } }
    const url = (result as any)?.data?.url
    if (!url) {
      throw new Error(`tmpfiles.org returned unexpected response: ${JSON.stringify(result)}`)
    }

    return url
  } catch (err: any) {
    clearTimeout(timeoutId)
    if (err.name === 'AbortError') {
      throw new Error('tmpfiles.org 上传超时（30秒）')
    }
    throw err
  }
}
