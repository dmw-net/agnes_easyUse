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

  const response = await fetch('https://tmpfiles.org/api/v1/upload', {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': String(body.length),
    },
    body,
  })

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

  // tmpfiles.org 返回的 URL 格式: https://tmpfiles.org/f/xxxxx
  // 需要改成直链格式: https://tmpfiles.org/f/xxxxx (本身就是直链，但有时需要加 ?download)
  // 实际测试：https://tmpfiles.org/f/xxxxx 可以直接访问图片
  return url
}
