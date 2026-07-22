/* eslint-disable @typescript-eslint/no-explicit-any */
import { resolveAssetContent } from './assets'

export function translateContent(content: Record<string, any>, locale: string): Record<string, any> {
  const t = (val: any): any => {
    if (!val) return val
    if (typeof val === 'object') {
      // Check array FIRST — arrays are objects but should never be treated as multilingual maps
      if (Array.isArray(val)) {
        return val.map(t)
      }
      if ('vi' in val || 'en' in val || 'ru' in val || 'zh' in val) {
        return val[locale] ?? val['vi'] ?? ''
      }
      const res: Record<string, any> = {}
      for (const k in val) {
        res[k] = t(val[k])
      }
      return res
    }
    return val
  }
  return resolveAssetContent(t(content)) as Record<string, any>
}
