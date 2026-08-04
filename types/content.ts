export type LocaleCode = 'ko' | 'en'

export interface ExternalVideo { provider: 'youtube' | 'vimeo'; url: string }
export interface ArtworkBase {
  id: string; slug: string; year: number | null; image: string; thumbnail?: string
  imageWidth: number; imageHeight: number; featured: boolean; published: boolean; order: number
  externalVideo: ExternalVideo | null; categoryId: string; seriesId?: string
  objectPosition?: string; cropMode?: 'contain' | 'cover'; backgroundColor?: string
}
export interface ArtworkTranslation {
  id: string; title: string; medium: string; dimensions: string; description?: string; alt: string
}
export type LocalizedArtwork = ArtworkBase & ArtworkTranslation
export interface CategoryBase { id: string; order: number; published: boolean }
export interface CategoryTranslation { id: string; name: string }
export type LocalizedCategory = CategoryBase & CategoryTranslation
export interface AboutConfig {
  portraitImage: string; studioImage: string; featuredArtworkId: string | null
  showArtistNote: boolean; showBiography: boolean; showStatement: boolean
}
export interface LocalizedAbout {
  pageTitle: string; introduction: string; biography: string[]; statementTitle: string
  statement: string[]; quote: string; quoteAttribution: string; downloadCv: string
}
export interface CvSectionBase { id: string; order: number; published: boolean }
export interface CvEntryBase {
  id: string; sectionId: string; year: number | null; endYear: number | null
  order: number; published: boolean; url: string | null
}
export interface CvConfig { sections: CvSectionBase[]; entries: CvEntryBase[]; pdf: Partial<Record<LocaleCode, string>> }
export interface CvSectionTranslation { id: string; title: string }
export interface CvEntryTranslation { id: string; title: string; venue: string; location: string; description: string }
export interface LocalizedCv { pageTitle: string; sections: CvSectionTranslation[]; entries: CvEntryTranslation[]; downloadLabel: string }
export interface LocalizedCvEntry extends CvEntryBase, CvEntryTranslation {}
export interface LocalizedCvSection extends CvSectionBase, CvSectionTranslation { entries: LocalizedCvEntry[] }
export type NewsContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'image'; src: string; alt: string }
  | { type: 'quote'; text: string; attribution?: string }
  | { type: 'video'; provider: 'youtube' | 'vimeo'; url: string; title?: string }
  | { type: 'externalLink'; url: string; label: string }
export interface NewsBase {
  id: string; slug: string; categoryId: string; publishedAt: string; endAt: string | null
  thumbnail: string; image: string; imageWidth: number; imageHeight: number
  published: boolean; featured: boolean; order: number; externalUrl: string | null
  externalVideo: ExternalVideo | null; relatedArtworkIds: string[]
}
export interface NewsCategoryTranslation { id: string; name: string }
export interface NewsItemTranslation {
  id: string; title: string; summary: string; content: NewsContentBlock[]
  venue: string; location: string; alt: string
}
export interface LocalizedNews {
  pageTitle: string; description: string; allLabel: string; readMore: string; externalLink: string
  backToNews: string; previous: string; next: string; categories: NewsCategoryTranslation[]; items: NewsItemTranslation[]
}
export type LocalizedNewsItem = NewsBase & NewsItemTranslation
export interface ContactConfig {
  email: string; phone: string; instagram: string; youtube: string; vimeo: string
  threads: string; addressMapUrl: string; showEmail: boolean; showPhone: boolean; showContactForm: boolean
}
export interface LocalizedContact {
  pageTitle: string; introduction: string; emailLabel: string; phoneLabel: string; socialLabel: string
  mapLabel: string; copyEmail: string; copied: string; copyFailed: string; inquiryNotice: string
}
export interface MenuItem { id: string; path: string }
export interface Socials { instagram: string; youtube: string; vimeo: string; email: string }
export interface SiteConfig {
  defaultLocale: LocaleCode; availableLocales: LocaleCode[]; heroArtworkId: string | null
  aboutImage: string; aboutImageWidth: number; aboutImageHeight: number; copyrightStartYear: number
  socials: Socials; menu: MenuItem[]
  artworksPage: { showTitle: boolean; showYear: boolean; showMedium: boolean; itemsPerPage: number; mobileColumns: number; desktopColumns: number }
  cvPage: { sortDirection: 'asc' | 'desc'; mobileAccordion: boolean; showPdfDownload: boolean }
  newsPage: { itemsPerPage: number; directExternalLinks: boolean }
}
export interface LocalizedSite {
  artistName: string; artistNameLatin: string; occupation: string; menu: Record<string, string>
  main: { artistNote: string; artistNoteLink: string; worksTitle: string; worksLink: string; aboutTitle: string; aboutSummary: string; aboutLink: string }
  works: { title: string; description: string; all: string; previousPage: string; nextPage: string; pageStatus: string; empty: string }
  artworkDetail: { backToWorks: string; category: string; video: string; previous: string; next: string; openLightbox: string; closeLightbox: string; zoomIn: string; zoomOut: string; resetZoom: string }
  common: { imagePending: string; pagePreparing: string }
  footer: { copyright: string }
  seo: { title: string; description: string; ogTitle: string; ogDescription: string; ogImage: string }
}

export interface LocaleBundle {
  meta: { schemaVersion: number; locale: LocaleCode; defaultLocale: LocaleCode; availableLocales: LocaleCode[] }
  site: { settings: SiteConfig; content: LocalizedSite }
  artworks: LocalizedArtwork[]
  categories: LocalizedCategory[]
  about: { settings: AboutConfig; content: LocalizedAbout }
  cv: Omit<LocalizedCv, 'sections' | 'entries'> & {
    pdf: Partial<Record<LocaleCode, string>>
    sections: Array<CvSectionBase & CvSectionTranslation>
    entries: LocalizedCvEntry[]
  }
  news: Omit<LocalizedNews, 'items'> & { items: LocalizedNewsItem[] }
  contact: { settings: ContactConfig; content: LocalizedContact }
}
