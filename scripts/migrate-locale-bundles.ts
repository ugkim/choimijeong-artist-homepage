import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

if (!process.argv.includes('--from-legacy')) {
  throw new Error('이 스크립트는 구형 분리 데이터를 최초 1회 변환할 때만 사용합니다. 실행하려면 --from-legacy를 명시하세요.')
}

type JsonObject = Record<string, any>

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const read = (path: string): JsonObject => JSON.parse(readFileSync(join(root, path), 'utf8'))
const byId = (items: JsonObject[]) => new Map(items.map(item => [item.id, item]))
const siteConfig = read('content/site.json')

function createBundle(locale: string) {
  const localizedSite = read(`content/locales/${locale}/site.json`)
  const artworkBase = read('content/artworks/index.json').artworks
  const artworkText = byId(read(`content/locales/${locale}/artworks.json`).artworks)
  const categoryBase = read('content/artworks/categories.json').categories
  const categoryText = byId(read(`content/locales/${locale}/categories.json`).categories)
  const aboutBase = read('content/about/index.json')
  const aboutText = read(`content/locales/${locale}/about.json`)
  const cvBase = read('content/cv/index.json')
  const cvText = read(`content/locales/${locale}/cv.json`)
  const cvSections = byId(cvText.sections)
  const cvEntries = byId(cvText.entries)
  const newsBase = read('content/news/index.json')
  const newsText = read(`content/locales/${locale}/news.json`)
  const newsItems = byId(newsText.items)
  const contactBase = read('content/contact/index.json')
  const contactText = read(`content/locales/${locale}/contact.json`)

  return {
    meta: {
      schemaVersion: 1,
      locale,
      defaultLocale: siteConfig.defaultLocale,
      availableLocales: siteConfig.availableLocales
    },
    site: { settings: siteConfig, content: localizedSite },
    artworks: artworkBase.map((item: JsonObject) => ({ ...item, externalVideo: item.externalVideo ?? null, description: '', ...artworkText.get(item.id) })),
    categories: categoryBase.map((item: JsonObject) => ({ ...item, ...categoryText.get(item.id) })),
    about: { settings: aboutBase, content: aboutText },
    cv: {
      pageTitle: cvText.pageTitle,
      downloadLabel: cvText.downloadLabel,
      pdf: cvBase.pdf,
      sections: cvBase.sections.map((item: JsonObject) => ({ ...item, ...cvSections.get(item.id) })),
      entries: cvBase.entries.map((item: JsonObject) => ({
        ...item,
        title: '', venue: '', location: '', description: '',
        ...cvEntries.get(item.id)
      }))
    },
    news: {
      pageTitle: newsText.pageTitle,
      description: newsText.description,
      allLabel: newsText.allLabel,
      readMore: newsText.readMore,
      externalLink: newsText.externalLink,
      backToNews: newsText.backToNews,
      previous: newsText.previous,
      next: newsText.next,
      categories: newsText.categories,
      items: newsBase.items.map((item: JsonObject) => ({ ...item, ...newsItems.get(item.id) }))
    },
    contact: { settings: contactBase, content: contactText }
  }
}

mkdirSync(join(root, 'content/data'), { recursive: true })
for (const locale of siteConfig.availableLocales) {
  writeFileSync(join(root, `content/data/${locale}.json`), `${JSON.stringify(createBundle(locale), null, 2)}\n`)
}

console.log(`Created canonical locale bundles for: ${siteConfig.availableLocales.join(', ')}`)
