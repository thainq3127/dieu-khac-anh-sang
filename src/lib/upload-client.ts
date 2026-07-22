export async function uploadMediaFile(filePath: string, file: File) {
  const body = new FormData()
  body.set('bucket', 'media')
  body.set('path', filePath)
  body.set('cacheControl', '3600')
  body.set('upsert', 'false')
  body.set('file', file)

  const res = await fetch('/api/data/storage', {
    method: 'POST',
    body,
  })

  if (!res.ok) {
    throw new Error(await res.text())
  }

  const data = await res.json() as { path?: string; key?: string }
  if (!data.path && !data.key) {
    throw new Error('Upload response missing storage path')
  }

  return data.path || data.key!
}
