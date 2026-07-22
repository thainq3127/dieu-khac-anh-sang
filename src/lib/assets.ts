const SUPABASE_MEDIA_BASE_RE = /^https?:\/\/[^/]+\/storage\/v1\/object\/public\/media\/?/i

function configuredAssetBases() {
  return [process.env.NEXT_PUBLIC_ASSET_BASE_URL, process.env.S3_PUBLIC_BASE_URL]
    .filter((value): value is string => Boolean(value))
    .map((value) => value.replace(/\/+$/, ''))
}

function isDataOrBlobUrl(value: string) {
  return /^(data|blob):/i.test(value)
}

function isHttpUrl(value: string) {
  return /^https?:\/\//i.test(value)
}

function stripConfiguredAssetBase(value: string) {
  for (const base of configuredAssetBases()) {
    if (value === base) return ''
    if (value.startsWith(`${base}/`)) {
      return value.slice(base.length + 1)
    }
  }
  return null
}

function stripKnownStorageBase(value: string) {
  const configured = stripConfiguredAssetBase(value)
  if (configured !== null) return configured

  if (SUPABASE_MEDIA_BASE_RE.test(value)) {
    return value.replace(SUPABASE_MEDIA_BASE_RE, '')
  }

  return null
}

function normalizeStoragePath(value: string) {
  let path = value.trim().replace(/\\/g, '/').replace(/^\/+/, '')
  if (path.startsWith('media/')) path = path.slice('media/'.length)
  return path
}

export function assetUrlToStoragePath(value?: string | null) {
  if (!value) return ''

  const trimmed = value.trim()
  if (!trimmed) return ''

  const stripped = stripKnownStorageBase(trimmed)
  if (stripped !== null) return normalizeStoragePath(stripped)

  if (isDataOrBlobUrl(trimmed) || isHttpUrl(trimmed) || trimmed.startsWith('/')) {
    return trimmed
  }

  return normalizeStoragePath(trimmed)
}

export function resolveAssetUrl(value?: string | null) {
  if (!value) return ''

  const trimmed = value.trim()
  if (!trimmed) return ''

  if (isDataOrBlobUrl(trimmed)) return trimmed

  const stripped = stripKnownStorageBase(trimmed)
  if (stripped === null && (isHttpUrl(trimmed) || trimmed.startsWith('/'))) {
    return trimmed
  }

  const path = normalizeStoragePath(stripped ?? trimmed)
  if (!path) return ''

  const base = configuredAssetBases()[0]
  return base ? `${base}/${path}` : `/${path}`
}

export function resolveAssetContent<T>(value: T): T {
  if (typeof value === 'string') {
    const normalized = assetUrlToStoragePath(value)
    if (normalized.startsWith('uploads/') || normalized.startsWith('migrated/')) {
      return resolveAssetUrl(normalized) as T
    }
    return value
  }

  if (Array.isArray(value)) {
    return value.map((item) => resolveAssetContent(item)) as T
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, resolveAssetContent(item)]),
    ) as T
  }

  return value
}

function replaceImageSrc(html: string, transform: (src: string) => string) {
  return html.replace(/(<img\b[^>]*\bsrc=)(["'])([^"']+)(\2)/gi, (_match, prefix, quote, src, suffix) => {
    return `${prefix}${quote}${transform(src)}${suffix}`
  })
}

export function storedAssetHtmlToPublicUrls(html?: string | null) {
  if (!html) return ''
  return replaceImageSrc(html, resolveAssetUrl)
}

export function publicAssetHtmlToStoragePaths(html?: string | null) {
  if (!html) return ''
  return replaceImageSrc(html, assetUrlToStoragePath)
}
