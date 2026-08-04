import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue }
type JsonObject = { [key: string]: JsonValue }

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const dataRoot = join(root, 'content/data')
const errors: string[] = []

function readJson(path: string): JsonObject | null {
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as JsonObject
  } catch (error) {
    errors.push(`${path}: JSON 문법 오류 - ${error instanceof Error ? error.message : String(error)}`)
    return null
  }
}

function isObject(value: JsonValue): value is JsonObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function compareStructure(source: JsonValue, target: JsonValue, path: string, locale: string): void {
  if (Array.isArray(source)) {
    if (!Array.isArray(target)) {
      errors.push(`[${locale}] ${path}: 배열이어야 합니다.`)
      return
    }
    const keyed = source.every(item => isObject(item) && typeof item.id === 'string')
    if (keyed) {
      const sourceMap = new Map(source.map(item => [(item as JsonObject).id as string, item]))
      const targetMap = new Map(target.filter(isObject).map(item => [item.id as string, item]))
      for (const id of sourceMap.keys()) if (!targetMap.has(id)) errors.push(`[${locale}] ${path}: 기본 언어의 ID가 없습니다: ${id}`)
      for (const id of targetMap.keys()) if (!sourceMap.has(id)) errors.push(`[${locale}] ${path}: 기본 언어에 없는 ID가 있습니다: ${id}`)
      for (const [id, item] of sourceMap) {
        const translated = targetMap.get(id)
        if (translated) compareStructure(item, translated, `${path}[id=${id}]`, locale)
      }
      return
    }
    if (source.length !== target.length) errors.push(`[${locale}] ${path}: 배열 길이가 다릅니다 (${source.length} != ${target.length}).`)
    for (let index = 0; index < Math.min(source.length, target.length); index += 1) {
      compareStructure(source[index]!, target[index]!, `${path}[${index}]`, locale)
    }
    return
  }

  if (isObject(source)) {
    if (!isObject(target)) {
      errors.push(`[${locale}] ${path}: 객체여야 합니다.`)
      return
    }
    const sourceKeys = Object.keys(source).sort()
    const targetKeys = Object.keys(target).sort()
    for (const key of sourceKeys) if (!(key in target)) errors.push(`[${locale}] ${path}.${key}: 키가 없습니다.`)
    for (const key of targetKeys) if (!(key in source)) errors.push(`[${locale}] ${path}.${key}: 기본 언어에 없는 키입니다.`)
    for (const key of sourceKeys) if (key in target) compareStructure(source[key]!, target[key]!, `${path}.${key}`, locale)
    return
  }

  const sourceType = source === null ? 'null' : typeof source
  const targetType = target === null ? 'null' : typeof target
  if (sourceType !== targetType) errors.push(`[${locale}] ${path}: 자료형이 다릅니다 (${sourceType} != ${targetType}).`)
}

const fallbackPath = join(dataRoot, 'ko.json')
const fallback = readJson(fallbackPath)
if (fallback) {
  const meta = fallback.meta
  const defaultLocale = isObject(meta) && typeof meta.defaultLocale === 'string' ? meta.defaultLocale : 'ko'
  const locales = isObject(meta) && Array.isArray(meta.availableLocales)
    ? meta.availableLocales.filter((locale): locale is string => typeof locale === 'string')
    : [defaultLocale]
  const defaultPath = join(dataRoot, `${defaultLocale}.json`)
  const source = defaultPath === fallbackPath ? fallback : readJson(defaultPath)

  if (source) {
    for (const locale of locales) {
      const path = join(dataRoot, `${locale}.json`)
      if (!existsSync(path)) {
        errors.push(`[${locale}] 번역 파일이 없습니다: content/data/${locale}.json`)
        continue
      }
      const target = locale === defaultLocale ? source : readJson(path)
      if (!target) continue
      compareStructure(source, target, '$', locale)
      const targetMeta = target.meta
      if (!isObject(targetMeta) || targetMeta.locale !== locale) errors.push(`[${locale}] $.meta.locale 값은 '${locale}'이어야 합니다.`)
    }

    const site = source.site
    const settings = isObject(site) ? site.settings : null
    if (!isObject(settings) || settings.defaultLocale !== defaultLocale) errors.push(`기본 파일의 site.settings.defaultLocale은 '${defaultLocale}'이어야 합니다.`)
    const artworks = source.artworks
    if (Array.isArray(artworks)) {
      for (const item of artworks.filter(isObject)) {
        if (typeof item.id !== 'string' || !item.id.trim()) errors.push('모든 작품에는 비어 있지 않은 id가 필요합니다.')
        const video = item.externalVideo
        if (video !== null && (!isObject(video) || typeof video.provider !== 'string' || typeof video.url !== 'string' || !video.url.trim())) {
          errors.push(`작품 ${String(item.id)}: 외부 영상은 null이거나 provider와 url이 모두 있어야 합니다.`)
        }
      }
    }
  }
}

if (errors.length) {
  console.error(`\n콘텐츠 검증 실패 (${errors.length}건)\n${errors.map(error => `- ${error}`).join('\n')}\n`)
  process.exit(1)
}

console.log('콘텐츠 검증 완료: 모든 언어의 JSON 문법, 키 구조, 배열 ID와 자료형이 일치합니다.')
