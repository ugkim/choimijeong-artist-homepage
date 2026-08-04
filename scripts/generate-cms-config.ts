import { readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

type Value = null | boolean | number | string | Value[] | { [key: string]: Value }
type ObjectValue = { [key: string]: Value }
const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const data = JSON.parse(readFileSync(join(root, 'content/data/ko.json'), 'utf8')) as ObjectValue

const labels: Record<string, string> = {
  meta: '데이터 설정', site: '홈페이지', settings: '공통 설정', content: '표시 문구', artworks: '작품', categories: '카테고리',
  about: '작가 소개', cv: 'CV', news: '소식', contact: '연락처', id: '고정 ID', slug: 'URL 주소', title: '제목',
  name: '이름', description: '설명', image: '이미지', thumbnail: '썸네일', alt: '이미지 설명', medium: '재료', dimensions: '크기',
  year: '연도', order: '표시 순서', published: '공개', featured: '대표 항목', externalVideo: '외부 영상 · 선택사항',
  provider: '영상 제공자', url: 'URL', locale: '현재 파일 언어 코드', defaultLocale: '기본 언어 코드', availableLocales: '사용 언어 코드',
  sections: '섹션', entries: '경력 항목', items: '목록', biography: '약력 문단', statement: '작가 노트 문단',
  pageTitle: '페이지 제목', introduction: '소개', summary: '요약', pdf: '언어별 PDF'
}
const imageKeys = new Set(['image', 'thumbnail', 'portraitImage', 'studioImage', 'aboutImage', 'ogImage', 'src'])
const dateKeys = new Set(['publishedAt', 'endAt'])
const selectOptions: Record<string, string[]> = {
  defaultLocale: ['ko', 'en'], cropMode: ['contain', 'cover'], sortDirection: ['desc', 'asc'], provider: ['youtube', 'vimeo'],
  type: ['paragraph', 'heading', 'image', 'quote', 'video', 'externalLink']
}
const numberKeys = new Set(['schemaVersion', 'year', 'endYear', 'order', 'imageWidth', 'imageHeight', 'copyrightStartYear', 'itemsPerPage', 'mobileColumns', 'desktopColumns'])
const longTextKeys = new Set(['description', 'introduction', 'artistNote', 'aboutSummary', 'biography', 'statement', 'quote', 'inquiryNotice', 'text', 'summary'])

const indent = (level: number) => '  '.repeat(level)
const scalar = (value: unknown) => typeof value === 'string' ? `'${value.replaceAll("'", "''")}'` : String(value)
const line = (level: number, value: string) => `${indent(level)}${value}`
const isObject = (value: Value): value is ObjectValue => value !== null && typeof value === 'object' && !Array.isArray(value)

function unionObjects(items: ObjectValue[]): { value: ObjectValue; optional: Set<string> } {
  const keys = new Set(items.flatMap(item => Object.keys(item)))
  const value: ObjectValue = {}
  const optional = new Set<string>()
  for (const key of keys) {
    const candidates = items.map(item => item[key]).filter(item => item !== undefined)
    value[key] = candidates.find(item => item !== null && (!Array.isArray(item) || item.length)) ?? candidates[0] ?? null
    if (candidates.length !== items.length || candidates.some(item => item === null || item === '')) optional.add(key)
  }
  return { value, optional }
}

function emptyArraySample(path: string): ObjectValue | null {
  if (path.endsWith('.cv.entries')) return { id: '', sectionId: '', title: '', venue: '', location: '', description: '', year: null, endYear: null, order: 1, published: true, url: null }
  return null
}

function nullObjectSample(key: string): ObjectValue | null {
  if (key === 'externalVideo') return { provider: '', url: '' }
  return null
}

function field(key: string, value: Value, level: number, path: string, optional = false): string[] {
  const label = labels[key] ?? key
  const prefix = line(level, `- label: ${scalar(label)}`)
  const lines = [prefix, line(level + 1, `name: ${key}`)]
  const required = optional ? [line(level + 1, 'required: false')] : []
  const objectSample = value === null ? nullObjectSample(key) : null

  if (isObject(value) || objectSample) {
    const object = isObject(value) ? value : objectSample!
    lines.push(line(level + 1, 'widget: object'), ...required, line(level + 1, 'collapsed: true'), line(level + 1, 'fields:'))
    for (const [childKey, childValue] of Object.entries(object)) lines.push(...field(childKey, childValue, level + 2, `${path}.${childKey}`, childValue === null || childValue === ''))
    return lines
  }

  if (Array.isArray(value)) {
    lines.push(line(level + 1, 'widget: list'), ...required)
    const objectItems = value.filter(isObject)
    const sample = objectItems.length ? unionObjects(objectItems) : { value: emptyArraySample(path), optional: new Set<string>() }
    if (sample.value) {
      lines.push(line(level + 1, 'summary: "{{fields.id}} — {{fields.title}}"'), line(level + 1, 'fields:'))
      for (const [childKey, childValue] of Object.entries(sample.value)) lines.push(...field(childKey, childValue, level + 2, `${path}[].${childKey}`, sample.optional.has(childKey) || childValue === null || childValue === ''))
    } else {
      lines.push(line(level + 1, 'field:'), line(level + 2, `label: ${scalar(label)}`), line(level + 2, 'name: value'), line(level + 2, 'widget: string'))
    }
    return lines
  }

  if (selectOptions[key]) {
    lines.push(line(level + 1, 'widget: select'), line(level + 1, `options: [${selectOptions[key].join(', ')}]`), ...required)
  } else if (dateKeys.has(key)) {
    lines.push(line(level + 1, 'widget: datetime'), line(level + 1, 'format: YYYY-MM-DD'), line(level + 1, 'time_format: false'), ...required)
  } else if (imageKeys.has(key)) {
    lines.push(line(level + 1, 'widget: image'), ...required)
  } else if (typeof value === 'boolean') {
    lines.push(line(level + 1, 'widget: boolean'), ...required)
  } else if (typeof value === 'number' || numberKeys.has(key)) {
    lines.push(line(level + 1, 'widget: number'), line(level + 1, 'value_type: int'), ...required)
  } else {
    lines.push(line(level + 1, `widget: ${longTextKeys.has(key) ? 'text' : 'string'}`), ...required)
  }
  return lines
}

const fields = Object.entries(data).flatMap(([key, value]) => field(key, value, 5, `$.${key}`))
const config = [
  'backend:', '  name: git-gateway', '  branch: main', '',
  'media_folder: public/uploads', 'public_folder: /uploads', 'locale: ko', '',
  'collections:', '  - name: site_data', '    label: 사이트 데이터', '    files:',
  '      - name: default_ko', '        label: 1. 기본 언어 · 한국어 전체 데이터', '        file: content/data/ko.json', '        fields:',
  ...fields,
  '      - name: translation_en', '        label: 2. 번역 · English 전체 데이터', '        file: content/data/en.json', '        fields:',
  ...fields,
  ''
].join('\n')

writeFileSync(join(root, 'public/admin/config.yml'), config)
console.log('Decap CMS 설정 생성 완료: 기본 언어와 번역 언어가 각각 하나의 전체 데이터 화면으로 구성되었습니다.')
