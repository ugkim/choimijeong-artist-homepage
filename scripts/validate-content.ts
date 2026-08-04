import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

interface ExternalVideo { provider: string; url: string }
interface ArtworkBase {
  id: string; slug: string; year: number | null; image: string; thumbnail?: string
  imageWidth: number; imageHeight: number; featured: boolean; published: boolean; order: number
  externalVideo: ExternalVideo | null; categoryId: string; seriesId?: string
  objectPosition?: string; cropMode?: 'contain' | 'cover'; backgroundColor?: string
}
interface Translation { id: string; title: string; medium: string; dimensions: string; description?: string; alt: string }
interface CategoryBase { id: string; order: number; published: boolean }
interface CategoryTranslation { id: string; name: string }
interface AboutConfig { portraitImage: string; studioImage: string; featuredArtworkId: string | null; showArtistNote: boolean; showBiography: boolean; showStatement: boolean }
interface AboutTranslation { pageTitle: string; introduction: string; biography: string[]; statementTitle: string; statement: string[]; quote: string; quoteAttribution: string; downloadCv: string }
interface CvSectionBase { id: string; order: number; published: boolean }
interface CvEntryBase { id: string; sectionId: string; year: number | null; endYear: number | null; order: number; published: boolean; url: string | null }
interface CvConfig { sections: CvSectionBase[]; entries: CvEntryBase[]; pdf: Record<string, string> }
interface CvTranslation { pageTitle: string; sections: { id: string; title: string }[]; entries: { id: string; title: string; venue: string; location: string; description: string }[]; downloadLabel: string }
interface NewsBase { id: string; slug: string; categoryId: string; publishedAt: string; endAt: string | null; thumbnail: string; image: string; imageWidth: number; imageHeight: number; published: boolean; featured: boolean; order: number; externalUrl: string | null; externalVideo: ExternalVideo | null; relatedArtworkIds: string[] }
interface NewsBlock { type: string; text?: string; src?: string; alt?: string; attribution?: string; provider?: string; url?: string; label?: string; title?: string }
interface NewsTranslation { pageTitle: string; description: string; categories: { id: string; name: string }[]; items: { id: string; title: string; summary: string; content: NewsBlock[]; venue: string; location: string; alt: string }[] }
interface ContactConfig { email: string; phone: string; instagram: string; youtube: string; vimeo: string; threads: string; addressMapUrl: string; showEmail: boolean; showPhone: boolean }
interface ArtworkCollection<T> { artworks: T[] }
interface CategoryCollection<T> { categories: T[] }
interface SiteConfig { defaultLocale: string; availableLocales: string[]; heroArtworkId: string | null; menu: { id: string; path: string }[]; socials: Record<string,string> }

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const errors: string[] = []
const warnings: string[] = []
const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp'])
const readJson = <T>(path: string): T => JSON.parse(readFileSync(path, 'utf8')) as T
const requiredString = (value: unknown, label: string) => { if (typeof value !== 'string' || !value.trim()) errors.push(`${label} is required.`) }
const duplicates = <T>(items: T[], key: (item: T) => string | number, label: string) => {
  const seen = new Set<string | number>()
  for (const item of items) { const value = key(item); if (seen.has(value)) errors.push(`Duplicate ${label}: ${value}`); seen.add(value) }
}
const validExternalVideo = ({ provider, url }: ExternalVideo) => provider === 'youtube' ? /^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(url) : provider === 'vimeo' && /^https:\/\/(www\.)?vimeo\.com\//.test(url)
const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`))

const site = readJson<SiteConfig>(join(root, 'content/site.json'))
const base = readJson<ArtworkCollection<ArtworkBase>>(join(root, 'content/artworks/index.json')).artworks
const categories = readJson<CategoryCollection<CategoryBase>>(join(root, 'content/artworks/categories.json')).categories
const about = readJson<AboutConfig>(join(root, 'content/about/index.json'))
const cv = readJson<CvConfig>(join(root, 'content/cv/index.json'))
const news = readJson<{ items: NewsBase[] }>(join(root, 'content/news/index.json')).items
const contact = readJson<ContactConfig>(join(root, 'content/contact/index.json'))
const defaultNews = readJson<NewsTranslation>(join(root, `content/locales/${site.defaultLocale}/news.json`))
if (!Array.isArray(base)) errors.push('content/artworks/index.json must contain an artworks array.')
if (!Array.isArray(categories)) errors.push('content/artworks/categories.json must contain a categories array.')
duplicates(base, item => item.id, 'artwork id')
duplicates(base, item => item.slug, 'artwork slug')
duplicates(base, item => item.order, 'artwork order')
duplicates(categories, item => item.id, 'category id')
duplicates(categories, item => item.order, 'category order')
duplicates(news, item => item.id, 'News id')
duplicates(news, item => item.slug, 'News slug')
const newsIds = new Set(news.map(item => item.id))
const newsCategoryIds = new Set(defaultNews.categories.map(item => item.id))

for (const [index, category] of categories.entries()) {
  const label = `categories[${index}]`
  requiredString(category.id, `${label}.id`)
  if (!Number.isInteger(category.order)) errors.push(`${label}.order must be an integer.`)
}
const categoryIds = new Set(categories.map(item => item.id))

for (const [field, value] of [['portraitImage', about.portraitImage], ['studioImage', about.studioImage]] as const) {
  requiredString(value, `about.${field}`)
  if (value && !allowedExtensions.has(extname(value).toLowerCase())) errors.push(`about.${field} has an unsupported extension.`)
}

duplicates(cv.sections, item => item.id, 'CV section id')
duplicates(cv.sections, item => item.order, 'CV section order')
duplicates(cv.entries, item => item.id, 'CV entry id')
const cvSectionIds = new Set(cv.sections.map(item => item.id))
const cvEntryIds = new Set(cv.entries.map(item => item.id))
for (const [index, section] of cv.sections.entries()) {
  const label = `cv.sections[${index}]`
  requiredString(section.id, `${label}.id`)
  if (!Number.isInteger(section.order)) errors.push(`${label}.order must be an integer.`)
}
for (const [index, entry] of cv.entries.entries()) {
  const label = `cv.entries[${index}]`
  requiredString(entry.id, `${label}.id`); requiredString(entry.sectionId, `${label}.sectionId`)
  if (!cvSectionIds.has(entry.sectionId)) errors.push(`${label}.sectionId does not exist: ${entry.sectionId}`)
  if (entry.year !== null && !Number.isInteger(entry.year)) errors.push(`${label}.year must be an integer or null.`)
  if (entry.endYear !== null && !Number.isInteger(entry.endYear)) errors.push(`${label}.endYear must be an integer or null.`)
  if (!Number.isInteger(entry.order)) errors.push(`${label}.order must be an integer.`)
  if (entry.url && !/^https?:\/\//.test(entry.url)) errors.push(`${label}.url must be an absolute http(s) URL or null.`)
}
for (const [locale, path] of Object.entries(cv.pdf)) {
  if (path && (!path.startsWith('/uploads/') || extname(path).toLowerCase() !== '.pdf')) errors.push(`cv.pdf.${locale} must be an /uploads/*.pdf path or empty.`)
}

for (const [index, artwork] of base.entries()) {
  const label = `artworks[${index}]`
  requiredString(artwork.id, `${label}.id`); requiredString(artwork.slug, `${label}.slug`); requiredString(artwork.image, `${label}.image`); requiredString(artwork.categoryId, `${label}.categoryId`)
  if (!categoryIds.has(artwork.categoryId)) errors.push(`${label}.categoryId does not exist: ${artwork.categoryId}`)
  if (!Number.isInteger(artwork.imageWidth) || artwork.imageWidth <= 0) errors.push(`${label}.imageWidth must be a positive integer.`)
  if (!Number.isInteger(artwork.imageHeight) || artwork.imageHeight <= 0) errors.push(`${label}.imageHeight must be a positive integer.`)
  if (!Number.isInteger(artwork.order)) errors.push(`${label}.order must be an integer.`)
  if (!allowedExtensions.has(extname(artwork.image).toLowerCase())) errors.push(`${label}.image has an unsupported extension.`)
  if (artwork.thumbnail && !allowedExtensions.has(extname(artwork.thumbnail).toLowerCase())) errors.push(`${label}.thumbnail has an unsupported extension.`)
  if (artwork.externalVideo) {
    const { provider, url } = artwork.externalVideo
    const valid = provider === 'youtube' ? /^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(url) : provider === 'vimeo' && /^https:\/\/(www\.)?vimeo\.com\//.test(url)
    if (!valid) errors.push(`${label}.externalVideo is not a valid ${provider} URL.`)
  }
}

const baseIds = new Set(base.map(item => item.id))
for (const [index, item] of news.entries()) {
  const label = `news.items[${index}]`
  requiredString(item.id, `${label}.id`); requiredString(item.slug, `${label}.slug`); requiredString(item.categoryId, `${label}.categoryId`)
  if (!newsCategoryIds.has(item.categoryId)) errors.push(`${label}.categoryId does not exist: ${item.categoryId}`)
  if (!validDate(item.publishedAt)) errors.push(`${label}.publishedAt must use YYYY-MM-DD.`)
  if (item.endAt && !validDate(item.endAt)) errors.push(`${label}.endAt must use YYYY-MM-DD or null.`)
  if (item.endAt && validDate(item.publishedAt) && validDate(item.endAt) && item.endAt < item.publishedAt) errors.push(`${label}.endAt cannot be earlier than publishedAt.`)
  requiredString(item.image, `${label}.image`); requiredString(item.thumbnail, `${label}.thumbnail`)
  if (!allowedExtensions.has(extname(item.image).toLowerCase()) || !allowedExtensions.has(extname(item.thumbnail).toLowerCase())) errors.push(`${label} has an unsupported image extension.`)
  if (!Number.isInteger(item.imageWidth) || item.imageWidth <= 0 || !Number.isInteger(item.imageHeight) || item.imageHeight <= 0) errors.push(`${label} image dimensions must be positive integers.`)
  if (item.externalUrl && !/^https?:\/\//.test(item.externalUrl)) errors.push(`${label}.externalUrl must be an absolute http(s) URL or null.`)
  if (item.externalVideo && !validExternalVideo(item.externalVideo)) errors.push(`${label}.externalVideo is invalid.`)
  if (!Array.isArray(item.relatedArtworkIds)) errors.push(`${label}.relatedArtworkIds must be an array.`)
  else for (const id of item.relatedArtworkIds) if (!baseIds.has(id)) errors.push(`${label}.relatedArtworkIds references missing artwork: ${id}`)
}
if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) errors.push('contact.email is invalid.')
for (const field of ['instagram','youtube','vimeo','threads','addressMapUrl'] as const) if (contact[field] && !/^https?:\/\//.test(contact[field])) errors.push(`contact.${field} must be an absolute http(s) URL or empty.`)
const requiredMenuPaths = new Set(['/','/artworks','/about','/cv','/news','/contact'])
for (const item of site.menu) { requiredString(item.id,'site.menu.id'); if (!item.path.startsWith('/')) errors.push(`site.menu path must start with /: ${item.path}`); requiredMenuPaths.delete(item.path) }
for (const path of requiredMenuPaths) errors.push(`site.menu is missing required path: ${path}`)
const localeRoot = join(root, 'content/locales')
const localeDirectories = existsSync(localeRoot) ? readdirSync(localeRoot, { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => entry.name) : []
for (const locale of site.availableLocales) {
  if (!localeDirectories.includes(locale)) errors.push(`Missing locale directory: content/locales/${locale}`)
}

for (const locale of localeDirectories) {
  const file = join(localeRoot, locale, 'artworks.json')
  if (!existsSync(file)) { warnings.push(`[${locale}] Missing artworks.json`); continue }
  const translated = readJson<ArtworkCollection<Translation>>(file).artworks
  duplicates(translated, item => item.id, `${locale} artwork id`)
  const translatedIds = new Set(translated.map(item => item.id))
  for (const [index, item] of translated.entries()) {
    const label = `${locale}.artworks[${index}]`
    requiredString(item.id, `${label}.id`); requiredString(item.title, `${label}.title`); requiredString(item.medium, `${label}.medium`)
    requiredString(item.dimensions, `${label}.dimensions`); requiredString(item.alt, `${label}.alt`)
    if (!baseIds.has(item.id)) errors.push(`[${locale}] Translation id does not exist in common data: ${item.id}`)
  }
  for (const id of baseIds) {
    if (!translatedIds.has(id)) {
      const message = `[${locale}] Missing translation for artwork id: ${id}`
      if (locale === site.defaultLocale) errors.push(message); else warnings.push(message)
    }
  }

  const categoryFile = join(localeRoot, locale, 'categories.json')
  if (!existsSync(categoryFile)) {
    const message = `[${locale}] Missing categories.json`
    if (locale === site.defaultLocale) errors.push(message); else warnings.push(message)
    continue
  }
  const translatedCategories = readJson<CategoryCollection<CategoryTranslation>>(categoryFile).categories
  duplicates(translatedCategories, item => item.id, `${locale} category id`)
  const translatedCategoryIds = new Set(translatedCategories.map(item => item.id))
  for (const [index, item] of translatedCategories.entries()) {
    const label = `${locale}.categories[${index}]`
    requiredString(item.id, `${label}.id`); requiredString(item.name, `${label}.name`)
    if (!categoryIds.has(item.id)) errors.push(`[${locale}] Category translation id does not exist in common data: ${item.id}`)
  }
  for (const id of categoryIds) {
    if (!translatedCategoryIds.has(id)) {
      const message = `[${locale}] Missing translation for category id: ${id}`
      if (locale === site.defaultLocale) errors.push(message); else warnings.push(message)
    }
  }

  const aboutFile = join(localeRoot, locale, 'about.json')
  if (!existsSync(aboutFile)) {
    const message = `[${locale}] Missing about.json`
    if (locale === site.defaultLocale) errors.push(message); else warnings.push(message)
  } else {
    const localizedAbout = readJson<AboutTranslation>(aboutFile)
    requiredString(localizedAbout.pageTitle, `${locale}.about.pageTitle`)
    requiredString(localizedAbout.introduction, `${locale}.about.introduction`)
    requiredString(localizedAbout.statementTitle, `${locale}.about.statementTitle`)
    requiredString(localizedAbout.downloadCv, `${locale}.about.downloadCv`)
    if (!Array.isArray(localizedAbout.biography)) errors.push(`${locale}.about.biography must be an array.`)
    else localizedAbout.biography.forEach((paragraph, index) => requiredString(paragraph, `${locale}.about.biography[${index}]`))
    if (!Array.isArray(localizedAbout.statement)) errors.push(`${locale}.about.statement must be an array.`)
    else localizedAbout.statement.forEach((paragraph, index) => requiredString(paragraph, `${locale}.about.statement[${index}]`))
  }

  const cvFile = join(localeRoot, locale, 'cv.json')
  if (!existsSync(cvFile)) {
    const message = `[${locale}] Missing cv.json`
    if (locale === site.defaultLocale) errors.push(message); else warnings.push(message)
  } else {
    const localizedCv = readJson<CvTranslation>(cvFile)
    requiredString(localizedCv.pageTitle, `${locale}.cv.pageTitle`); requiredString(localizedCv.downloadLabel, `${locale}.cv.downloadLabel`)
    duplicates(localizedCv.sections, item => item.id, `${locale} CV section translation id`)
    duplicates(localizedCv.entries, item => item.id, `${locale} CV entry translation id`)
    const translatedSectionIds = new Set(localizedCv.sections.map(item => item.id))
    const translatedEntryIds = new Set(localizedCv.entries.map(item => item.id))
    for (const [index, item] of localizedCv.sections.entries()) {
      requiredString(item.id, `${locale}.cv.sections[${index}].id`); requiredString(item.title, `${locale}.cv.sections[${index}].title`)
      if (!cvSectionIds.has(item.id)) errors.push(`[${locale}] CV section translation id does not exist in common data: ${item.id}`)
    }
    for (const [index, item] of localizedCv.entries.entries()) {
      requiredString(item.id, `${locale}.cv.entries[${index}].id`); requiredString(item.title, `${locale}.cv.entries[${index}].title`)
      if (!cvEntryIds.has(item.id)) errors.push(`[${locale}] CV entry translation id does not exist in common data: ${item.id}`)
    }
    for (const id of cvSectionIds) if (!translatedSectionIds.has(id)) {
      const message = `[${locale}] Missing CV section translation: ${id}`
      if (locale === site.defaultLocale) errors.push(message); else warnings.push(message)
    }
    for (const id of cvEntryIds) if (!translatedEntryIds.has(id)) {
      const message = `[${locale}] Missing CV entry translation: ${id}`
      if (locale === site.defaultLocale) errors.push(message); else warnings.push(message)
    }
  }

  const newsFile = join(localeRoot, locale, 'news.json')
  if (!existsSync(newsFile)) {
    const message = `[${locale}] Missing news.json`; if (locale === site.defaultLocale) errors.push(message); else warnings.push(message)
  } else {
    const localizedNews = readJson<NewsTranslation>(newsFile)
    requiredString(localizedNews.pageTitle, `${locale}.news.pageTitle`); requiredString(localizedNews.description, `${locale}.news.description`)
    duplicates(localizedNews.categories, item => item.id, `${locale} News category id`); duplicates(localizedNews.items, item => item.id, `${locale} News translation id`)
    const localizedNewsIds = new Set(localizedNews.items.map(item => item.id)); const localizedCategoryIds = new Set(localizedNews.categories.map(item => item.id))
    for (const category of localizedNews.categories) { requiredString(category.id, `${locale}.news.category.id`); requiredString(category.name, `${locale}.news.category.name`) }
    for (const id of newsCategoryIds) if (!localizedCategoryIds.has(id)) { const message = `[${locale}] Missing News category translation: ${id}`; if (locale === site.defaultLocale) errors.push(message); else warnings.push(message) }
    for (const [index, item] of localizedNews.items.entries()) {
      const label = `${locale}.news.items[${index}]`; requiredString(item.id, `${label}.id`); requiredString(item.title, `${label}.title`); requiredString(item.summary, `${label}.summary`); requiredString(item.alt, `${label}.alt`)
      if (!newsIds.has(item.id)) errors.push(`[${locale}] News translation id does not exist: ${item.id}`)
      if (!Array.isArray(item.content)) errors.push(`${label}.content must be an array.`)
      else item.content.forEach((block, blockIndex) => {
        const blockLabel = `${label}.content[${blockIndex}]`; const allowed = new Set(['paragraph','heading','image','quote','video','externalLink'])
        if (!allowed.has(block.type)) { errors.push(`${blockLabel}.type is invalid: ${block.type}`); return }
        if (['paragraph','heading','quote'].includes(block.type)) requiredString(block.text, `${blockLabel}.text`)
        if (block.type === 'image') { requiredString(block.src, `${blockLabel}.src`); requiredString(block.alt, `${blockLabel}.alt`); if (block.src && !allowedExtensions.has(extname(block.src).toLowerCase())) errors.push(`${blockLabel}.src has an unsupported extension.`) }
        if (block.type === 'video' && (!block.provider || !block.url || !validExternalVideo({ provider: block.provider, url: block.url }))) errors.push(`${blockLabel} video is invalid.`)
        if (block.type === 'externalLink') { requiredString(block.label, `${blockLabel}.label`); if (!block.url || !/^https?:\/\//.test(block.url)) errors.push(`${blockLabel}.url is invalid.`) }
      })
    }
    for (const id of newsIds) if (!localizedNewsIds.has(id)) { const message = `[${locale}] Missing News translation: ${id}`; if (locale === site.defaultLocale) errors.push(message); else warnings.push(message) }
  }

  const contactFile = join(localeRoot, locale, 'contact.json')
  if (!existsSync(contactFile)) { const message = `[${locale}] Missing contact.json`; if (locale === site.defaultLocale) errors.push(message); else warnings.push(message) }
  const siteFile = join(localeRoot, locale, 'site.json')
  if (existsSync(siteFile)) {
    const localizedSite = readJson<{ seo: { title: string; description: string; ogTitle: string; ogDescription: string; ogImage: string } }>(siteFile)
    requiredString(localizedSite.seo?.title, `${locale}.site.seo.title`); requiredString(localizedSite.seo?.description, `${locale}.site.seo.description`); requiredString(localizedSite.seo?.ogTitle, `${locale}.site.seo.ogTitle`); requiredString(localizedSite.seo?.ogDescription, `${locale}.site.seo.ogDescription`); requiredString(localizedSite.seo?.ogImage, `${locale}.site.seo.ogImage`)
  }
}

if (site.heroArtworkId && !base.some(item => item.id === site.heroArtworkId && item.featured && item.published)) {
  errors.push(`heroArtworkId must reference a published featured artwork: ${site.heroArtworkId}`)
}
if (about.featuredArtworkId && !base.some(item => item.id === about.featuredArtworkId)) errors.push(`about.featuredArtworkId does not exist: ${about.featuredArtworkId}`)
for (const warning of warnings) console.warn(`WARN ${warning}`)
if (errors.length) { for (const error of errors) console.error(`ERROR ${error}`); console.error(`\nContent validation failed with ${errors.length} error(s).`); process.exit(1) }
console.log(`Content validation passed: ${base.length} artworks, ${categories.length} categories, ${cv.entries.length} CV entries, ${news.length} News items, ${localeDirectories.length} locale(s).`)
