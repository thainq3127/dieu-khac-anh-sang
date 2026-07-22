'use server'

import { getTargetLangs } from './languages'
export type { LangCode } from './languages'

const LANGUAGE_NAMES: Record<string, string> = {
  vi: 'Vietnamese',
  en: 'English',
  ru: 'Russian',
  zh: 'Chinese',
}

const GOOGLE_LANG_MAP: Record<string, string> = {
  vi: 'vi',
  en: 'en',
  ru: 'ru',
  zh: 'zh-CN',
}

/**
 * Call Gemini API using fetch with retry logic for rate limits.
 */
async function callGemini(prompt: string, systemInstruction?: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not defined in environment variables.')
    throw new Error('Gemini API key is missing. Please configure GEMINI_API_KEY in .env.local.')
  }

  const model = 'gemini-3.1-flash-lite'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const body = {
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.1,
    },
    ...(systemInstruction
      ? {
          systemInstruction: {
            parts: [
              {
                text: systemInstruction
              }
            ]
          }
        }
      : {})
  }

  const retries = 3
  let delay = 1000

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (res.status === 429) {
        console.warn(`Gemini API model ${model} rate limited (429). Retrying in ${delay}ms... (Attempt ${attempt + 1}/${retries})`)
        if (attempt === retries - 1) {
          throw new Error('GEMINI_RATE_LIMIT')
        }
        await new Promise((r) => setTimeout(r, delay))
        delay *= 2
        continue
      }

      if (!res.ok) {
        const errorText = await res.text()
        if (res.status === 429 || errorText.includes('RESOURCE_EXHAUSTED') || errorText.includes('rate limit')) {
          throw new Error('GEMINI_RATE_LIMIT')
        }
        throw new Error(`HTTP ${res.status}: ${errorText}`)
      }

      const data = await res.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      return text.trim()
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err)
      if (errMsg.includes('GEMINI_RATE_LIMIT')) {
        throw err
      }
      if (attempt === retries - 1) {
        throw err
      }
      console.warn(`Gemini API model ${model} call failed: ${err}. Retrying in ${delay}ms... (Attempt ${attempt + 1}/${retries})`)
      await new Promise((r) => setTimeout(r, delay))
      delay *= 1.5
    }
  }

  throw new Error('Gemini API call failed.')
}

/**
 * Translate using Google Translate web API.
 */
async function translateTextGoogle(
  text: string,
  fromLang: string,
  toLang: string,
): Promise<string> {
  if (!text.trim()) return text
  if (fromLang === toLang) return text

  const sl = GOOGLE_LANG_MAP[fromLang] || fromLang
  const tl = GOOGLE_LANG_MAP[toLang] || toLang

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t`
  const body = new URLSearchParams()
  body.append('q', text)

  const retries = 4
  let delay = 500

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      })

      if (res.status === 429) {
        await new Promise((r) => setTimeout(r, delay))
        delay *= 2
        continue
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()
      const translated = (data[0] as Array<[string]>)
        .map((seg: [string]) => seg[0])
        .join('')

      return translated
    } catch (err) {
      if (attempt === retries - 1) {
        console.error(`Google Translation error after retries (${fromLang} → ${toLang}):`, err)
        return text
      }
      await new Promise((r) => setTimeout(r, delay))
      delay *= 1.5
    }
  }
  return text
}

/**
 * Translate HTML using Google Translate web API.
 */
async function translateHTMLGoogle(
  html: string,
  fromLang: string,
  toLang: string,
): Promise<string> {
  if (!html.trim()) return html
  if (fromLang === toLang) return html

  const sl = GOOGLE_LANG_MAP[fromLang] || fromLang
  const tl = GOOGLE_LANG_MAP[toLang] || toLang

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t`
  const body = new URLSearchParams()
  body.append('q', html)

  const retries = 4
  let delay = 500

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      })

      if (res.status === 429) {
        await new Promise((r) => setTimeout(r, delay))
        delay *= 2
        continue
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()
      const translated = (data[0] as Array<[string]>)
        .map((seg: [string]) => seg[0])
        .join('')

      return translated
    } catch (err) {
      if (attempt === retries - 1) {
        console.error(`Google HTML Translation error after retries (${fromLang} → ${toLang}):`, err)
        return html
      }
      await new Promise((r) => setTimeout(r, delay))
      delay *= 1.5
    }
  }
  return html
}

/**
 * Translate a single text string from one language to another.
 * Supports both google and gemini engines.
 */
export async function translateText(
  text: string,
  fromLang: string,
  toLang: string,
  engine: 'google' | 'gemini' = 'gemini',
): Promise<string> {
  if (!text.trim()) return text
  if (fromLang === toLang) return text

  if (engine === 'gemini') {
    const fromName = LANGUAGE_NAMES[fromLang] || fromLang
    const toName = LANGUAGE_NAMES[toLang] || toLang

    const systemInstruction = `You are a professional translator. Translate the text from ${fromName} to ${toName}.
Keep the translation natural, fluent, and accurate. Do not add any explanation, commentary, preamble, notes, or markdown formatting.
Output ONLY the raw translated text.`

    try {
      const translated = await callGemini(text, systemInstruction)
      return translated || text
    } catch (err) {
      console.error(`Gemini translation error (${fromLang} → ${toLang}):`, err)
      const errMsg = err instanceof Error ? err.message : String(err)
      if (errMsg.includes('GEMINI_RATE_LIMIT')) {
        throw err
      }
      return text
    }
  } else {
    return translateTextGoogle(text, fromLang, toLang)
  }
}

/**
 * Translate HTML content while preserving tags.
 * Supports both google and gemini engines.
 */
export async function translateHTML(
  html: string,
  fromLang: string,
  toLang: string,
  engine: 'google' | 'gemini' = 'gemini',
): Promise<string> {
  if (!html.trim()) return html
  if (fromLang === toLang) return html

  if (engine === 'gemini') {
    const fromName = LANGUAGE_NAMES[fromLang] || fromLang
    const toName = LANGUAGE_NAMES[toLang] || toLang

    const systemInstruction = `You are a professional translator. Translate the HTML content from ${fromName} to ${toName}.
You MUST preserve all HTML tags, tag structure, class names, IDs, and attributes exactly as they are. Translate ONLY the text content inside the HTML.
Do NOT translate code, tags, or attributes. Do NOT wrap the output in markdown code blocks (such as \`\`\`html).
Output ONLY the raw translated HTML.`

    try {
      const translated = await callGemini(html, systemInstruction)
      
      let cleaned = translated
      if (cleaned.startsWith('```html')) {
        cleaned = cleaned.slice(7)
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.slice(3)
      }
      if (cleaned.endsWith('```')) {
        cleaned = cleaned.slice(0, -3)
      }
      
      return cleaned.trim() || html
    } catch (err) {
      console.error(`Gemini HTML translation error (${fromLang} → ${toLang}):`, err)
      const errMsg = err instanceof Error ? err.message : String(err)
      if (errMsg.includes('GEMINI_RATE_LIMIT')) {
        throw err
      }
      return html
    }
  } else {
    return translateHTMLGoogle(html, fromLang, toLang)
  }
}

/**
 * Batch translate multiple texts at once.
 */
export async function translateBatch(
  texts: string[],
  fromLang: string,
  toLang: string,
  isHTML = false,
  engine: 'google' | 'gemini' = 'gemini',
): Promise<string[]> {
  const results: string[] = []
  const fn = isHTML ? translateHTML : translateText

  for (let i = 0; i < texts.length; i++) {
    const translated = await fn(texts[i], fromLang, toLang, engine)
    results.push(translated)
    if (i < texts.length - 1) {
      await new Promise((r) => setTimeout(r, engine === 'gemini' ? 200 : 350))
    }
  }

  return results
}

// Keys that should never be translated (config/layout/media fields)
const NON_TRANSLATABLE_KEYS = new Set([
  'theme', 'imagePosition', 'mediaType', 'chapterNumber', 'id',
  'parallax', 'bodyColumns', 'miniCardsLayout', 'columns', 'cardStyle',
  'contentAlign', 'src', 'href', 'variant', 'is3d', 'fancyboxGroup',
  'sort_order', 'is_visible', 'block_type', 'page_id',
  'images', 'galleryBelow',
])

const URL_KEYS = new Set(['src', 'href', 'image', 'cover_image', 'seo_image'])

function isLocalizedObject(val: unknown): val is Record<string, string> {
  if (!val || typeof val !== 'object' || Array.isArray(val)) return false
  const obj = val as Record<string, unknown>
  return ('vi' in obj || 'en' in obj || 'ru' in obj || 'zh' in obj)
}

/**
 * Recursively translate all localized fields in a content object.
 */
export async function translateContentObject(
  content: Record<string, unknown>,
  fromLang: string,
  engine: 'google' | 'gemini' = 'gemini',
): Promise<Record<string, unknown>> {
  const targets = getTargetLangs(fromLang)
  const result = { ...content }

  for (const key of Object.keys(result)) {
    if (NON_TRANSLATABLE_KEYS.has(key) || URL_KEYS.has(key)) continue

    const val = result[key]

    if (isLocalizedObject(val)) {
      const sourceText = (val[fromLang] as string) || ''
      if (!sourceText.trim()) continue

      const translated: Record<string, string> = { ...val }
      for (const lang of targets) {
        translated[lang] = await translateText(sourceText, fromLang, lang, engine)
        await new Promise((r) => setTimeout(r, engine === 'gemini' ? 200 : 350))
      }
      result[key] = translated
      continue
    }

    if (Array.isArray(val)) {
      const newArr = [...val]
      for (let i = 0; i < newArr.length; i++) {
        const item = newArr[i]
        
        if (isLocalizedObject(item)) {
          const sourceText = ((item as Record<string, string>)[fromLang]) || ''
          if (!sourceText.trim()) continue
          
          const translated: Record<string, string> = { ...(item as Record<string, string>) }
          for (const lang of targets) {
            translated[lang] = await translateText(sourceText, fromLang, lang, engine)
            await new Promise((r) => setTimeout(r, engine === 'gemini' ? 200 : 350))
          }
          newArr[i] = translated
        }
        else if (item && typeof item === 'object' && !Array.isArray(item)) {
          newArr[i] = await translateContentObject(
            item as Record<string, unknown>,
            fromLang,
            engine,
          )
        }
      }
      result[key] = newArr
      continue
    }

    if (val && typeof val === 'object' && !Array.isArray(val)) {
      const obj = val as Record<string, unknown>
      if (Array.isArray(obj[fromLang])) {
        const sourceArr = obj[fromLang] as string[]
        const translated: Record<string, string[]> = { ...obj } as Record<string, string[]>
        for (const lang of targets) {
          const langArr: string[] = []
          for (const text of sourceArr) {
            if (text.trim()) {
              langArr.push(await translateText(text, fromLang, lang, engine))
              await new Promise((r) => setTimeout(r, engine === 'gemini' ? 200 : 350))
            } else {
              langArr.push(text)
            }
          }
          translated[lang] = langArr
        }
        result[key] = translated
      }
    }
  }

  return result
}
