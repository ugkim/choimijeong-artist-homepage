import { readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const sourceDir = process.argv[2] ?? 'C:\\tmp'
const artistHtml = readFileSync(join(sourceDir, 'minkyoung-opengallery.html'), 'utf8')
const sourceUrl = 'https://www.opengallery.co.kr/artist/A0318/'

const decode = (value = '') => value
  .replace(/&#x([\da-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
  .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)))
  .replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&')
  .replaceAll('&quot;', '"').replaceAll('&#39;', "'").replace(/\s+/g, ' ').trim()
const writeJson = (path, value) => writeFileSync(join(root, path), `${JSON.stringify(value, null, 2)}\n`)
const meta = (html, property) => decode(html.match(new RegExp(`<meta property="${property}" content="([^"]*)"`))?.[1])

const codes = [...new Set([...artistHtml.matchAll(/data-code="(A0318-\d{4})"/g)].map(match => match[1]))].sort()
const artworks = codes.map(code => {
  const html = readFileSync(join(sourceDir, `${code}.html`), 'utf8')
  const title = meta(html, 'og:title').replace(/^김민경 \| /, '').replace(/ :: 오픈갤러리$/, '')
  const detail = meta(html, 'og:description')
  const matched = detail.match(/^(.*),\s*([\d.]+x[\d.]+cm),\s*(\d{4})$/)
  if (!matched) throw new Error(`${code}: 작품 정보를 해석할 수 없습니다: ${detail}`)
  const [, medium, dimensions, yearText] = matched
  const [, widthText, heightText] = dimensions.match(/([\d.]+)x([\d.]+)cm/) ?? []
  const width = Number(widthText)
  const height = Number(heightText)
  return { code, title, medium, dimensions, year: Number(yearText), width, height }
}).sort((a, b) => b.year - a.year || b.code.localeCompare(a.code))

const bases = artworks.map((artwork, index) => ({
  id: `artwork-${artwork.code.toLowerCase()}`,
  slug: artwork.code.toLowerCase(),
  year: artwork.year,
  image: `https://og-data.s3.amazonaws.com/media/artworks/image/A0318/${artwork.code}.jpg`,
  thumbnail: `https://og-data.s3.amazonaws.com/media/artworks/w_fixed/A0318/${artwork.code}.jpg`,
  imageWidth: Math.max(1, Math.round(artwork.width * 10)),
  imageHeight: Math.max(1, Math.round(artwork.height * 10)),
  featured: index < 6,
  published: true,
  order: index + 1,
  externalVideo: null,
  cropMode: 'contain',
  categoryId: 'relationship'
}))

const koArtworkText = artworks.map(artwork => ({
  id: `artwork-${artwork.code.toLowerCase()}`,
  title: artwork.title,
  medium: artwork.medium,
  dimensions: artwork.dimensions,
  description: '',
  alt: `김민경 작가의 ${artwork.year}년 작품 「${artwork.title}」`
}))
const mediumEn = value => value
  .replaceAll('수묵한지콜라주', 'ink-painted hanji collage')
  .replaceAll('한지콜라주', 'hanji collage')
  .replaceAll('혼합 재료', 'mixed media').replaceAll('혼합재료', 'mixed media').replaceAll('혼합매체', 'mixed media')
  .replaceAll('수묵채색', 'ink and color').replaceAll('담채', 'light color').replaceAll('채색', 'color')
  .replaceAll('옻칠지', 'lacquered paper').replaceAll('죽지', 'bamboo paper').replaceAll('장지', 'jangji paper')
  .replaceAll('한지', 'hanji').replaceAll('콜라주', 'collage').replaceAll('먹', 'ink')
  .replaceAll('에 ', ' on ').replace(/\s*,\s*/g, ', ').replace(/\s+/g, ' ').trim()
const enArtworkText = artworks.map(artwork => ({
  id: `artwork-${artwork.code.toLowerCase()}`,
  title: artwork.title,
  medium: mediumEn(artwork.medium),
  dimensions: artwork.dimensions,
  description: '',
  alt: `${artwork.title}, a ${artwork.year} work by Minkyoung Kim`
}))

const typeMap = { '개인전': 'solo-exhibitions', '단체전': 'group-exhibitions', '작품소장': 'collections', '수상/선정': 'awards', '기타': 'other' }
const cvEntries = []
for (const block of artistHtml.split('<div class="adb-cv-type">').slice(1)) {
  const group = decode(block.match(/adb-cv-type-grouper">([\s\S]*?)<\/div>/)?.[1])
  const sectionId = typeMap[group]
  if (!sectionId) continue
  for (const row of block.split('<div class="adb-cv-row">').slice(1)) {
    const title = decode(row.match(/adb-cv-row-title">([\s\S]*?)<\/span>/)?.[1])
    if (!title) continue
    const year = Number(row.match(/adb-cv-row-year[^>]*">(\d{4})<\/span>/)?.[1]) || null
    cvEntries.push({ sectionId, year, title })
  }
}
[
  ['서울대학교 동양화 박사', 'Ph.D. in Oriental Painting, Seoul National University'],
  ['서울대학교 동양화 석사', 'M.F.A. in Oriental Painting, Seoul National University'],
  ['서울대학교 동양화 학사', 'B.F.A. in Oriental Painting, Seoul National University']
].forEach(([title, titleEn]) => cvEntries.unshift({ sectionId: 'education', year: null, title, titleEn }))

const cvBaseEntries = cvEntries.map((entry, index) => ({
  id: `cv-${String(index + 1).padStart(4, '0')}`,
  sectionId: entry.sectionId,
  year: entry.year,
  endYear: null,
  order: index + 1,
  published: true,
  url: null
}))
const cvText = (locale) => cvEntries.map((entry, index) => ({
  id: `cv-${String(index + 1).padStart(4, '0')}`,
  title: locale === 'en' && entry.titleEn ? entry.titleEn : entry.title,
  venue: '', location: '', description: ''
}))

const introduction = '사람과 사람의 사이라는 뜻의 ‘사람 인(人) 사이 간(間)’이라는 단어에 착안하여 이 땅 위에 공존하는 사람들 사이의 소통 과정과, 그 안에서 일어나는 미묘한 감정의 교류를 그리는 동양화가 김민경입니다.'
const koInterview = [
  ['작가가 되기로 결심하게 된 계기는 무엇이었나요?', '그림을 그린다는 것이 저 혼자만의 이야기에 그치지 않을까 늘 생각했습니다. 그러던 어느 날 어떤 감상자 분께서 제 작업이 본인의 인간관계를 되돌아보며, 소중한 사람들에 대해 깊이 생각해 보는 계기가 되었다는 말씀을 해 주셨습니다. 제 그림을 좋아해주시는 한 분 한 분의 말씀에 큰 힘을 얻어 열심히 작업을 하고 있습니다.'],
  ['작품을 통해 말하고자 하는 것은 무엇인가요?', '다른 사람이 있기에 내가 존재한다고 생각합니다. 모두가 함께 살아가는 이 땅 위에서 우리는 스스로를 기울이고 내가 먼저 다가감으로써 공존의 질서를 확립합니다. 저의 작업에서는 인간이 서로 소통하고 공존하기 위해 움직이는 내 안의 생각하는 나와, 행동하는 나를 담아내고자 합니다.'],
  ['주로 사용하시는 표현 방법과 스타일은 무엇이고, 그 이유는 무엇인가요?', '저는 주로 한지 위에 담채기법과, 제가 만든 셀을 콜라주하는 방법을 활용하여 작업합니다. 직접적으로 인물의 형상을 표현하는 대신 기하학적인 셀의 형태를 통해 개개인을 표현합니다. 한지는 물과 물감을 종이에 머금고 그림을 담아냅니다. 한지라는 매체가 가진 이러한 특성을 최대한 살려 사람들의 감정 상태와 그 움직임을 표현하기 위해 노력하고 있습니다.'],
  ['가장 애착이 가거나 특별한 작품이 있으신가요?', '작품 하나하나가 저에게는 소중하지만, 현재 제가 진행하고 있는 작업들의 모태가 되는 작품인 ‘The Same Earth’에 항상 고마운 마음을 가지고 있습니다. 우리가 함께 지내는 이 땅에서 서로가 서로에게 자리를 내어주며 살아가는 모습을 담은 이 작품은 사람들의 마음속 저마다의 방에 대한 생각과, 공존에 대한 사색을 이끌어내주었기에 조금 더 특별했던 것 같습니다.'],
  ['주로 어디에서 영감을 얻으시나요?', '저는 사람들이 함께 살아가는 모습을 지켜볼 수 있는 모든 장면에서 영감을 얻습니다. 주변에서 보고 들은 상황일 수도 있고 저만의 경험에서 떠오른 생각을 그려내기도 합니다. 눈에 보이지 않는 감정의 흐름을 주제로 작업하다 보니 어려움이 많았습니다. 그러나 상황에 대해 깊이 생각하다 보면 불현듯 감정의 움직임이 이미지로 머릿속에 떠오를 때가 있습니다. 끊임없는 생각의 정리가 필요한 것 같습니다.'],
  ['앞으로 작업 방향은 어떻게 되시나요?', '처음에는 사람들이 함께 살아가는 외면적인 모습을 상징적으로 그려내고자 했습니다. 공존의 다양한 형태와 모습, 그리고 그 안에서 미묘하게 발생하는 감정의 흐름을 포착하여 제 나름대로의 질서를 구축하고 그것을 그림으로 표현하는 것에 점차 매력을 느끼게 되었습니다. 감정의 움직임에 대한 저의 느낌을 자유롭게 담아내는 것에 좀 더 집중해보고자 합니다.'],
  ['대중들에게 어떻게 기억되길 바라시나요?', '단절 없이 이어지는 현실 속에서 감상자들로 하여금 스스로의 삶을 한 번쯤 되돌아보게 하는, 그런 그림을 그리는 작가로 기억되고 싶어요. 시각적인 감상만을 위한 그림보다는 각자의 경험에 비추어 공감의 실마리를 찾도록 하는 에너지가 있는 그림을 그리고 싶습니다.'],
  ['작품 활동 외에 취미 활동이 있으신가요?', '정적인 그림을 그리는 데에 반해 활동적인 움직임을 좋아합니다. 여기저기 돌아다니거나 다양한 사람들과 만나 소통하는 것을 좋아합니다. 다양한 연령대의 사람들과 대화하고 그들의 이야기를 듣는 시간이 저의 취미인 동시에 작업에 영감을 불어넣어주는 시간이기도 한 것 같아요. 혼자만의 시간을 가지게 된다면 책을 읽고 생각하는 것을 좋아합니다.']
]
const enInterview = [
  ['What led you to decide to become an artist?', 'I often wondered whether drawing would remain only my own story. One day, a viewer told me that my work had prompted them to reflect on their relationships and think deeply about the people they cherish. The words of each person who appreciates my paintings give me strength to continue working.'],
  ['What do you hope to say through your work?', 'I believe that I exist because others exist. On this earth that we share, we establish an order of coexistence by inclining ourselves toward others and taking the first step. My work seeks to hold both the thinking self and the acting self that move within us as we communicate and coexist.'],
  ['What methods and style do you mainly use, and why?', 'I mainly use light color on hanji and collage with cells that I make myself. Instead of depicting people directly, I represent individuals through geometric cell-like forms. Hanji absorbs water and pigment; I try to use this quality fully to express emotional states and their movement.'],
  ['Is there a work to which you feel especially attached?', 'Every work is precious to me, but I am especially grateful to The Same Earth, which became the foundation of my current practice. It depicts people making room for one another on the earth we share, inviting reflection on each person’s inner room and on coexistence.'],
  ['Where do you usually find inspiration?', 'I find inspiration in every scene where people live together—from things I see and hear around me to thoughts arising from my own experience. Invisible emotional currents can be difficult to work with, but when I think deeply about a situation, their movement sometimes appears suddenly as an image.'],
  ['Where is your work heading next?', 'At first I wanted to symbolically depict the outward forms of people living together. I became increasingly drawn to capturing the many forms of coexistence and the subtle emotional currents within them, building my own order and translating it into painting. I now want to focus more freely on my sense of emotional movement.'],
  ['How would you like the public to remember you?', 'I want to be remembered as an artist whose paintings invite viewers to look back on their own lives. Beyond visual appreciation, I want to make work with the energy to help each person find a point of empathy through their own experience.'],
  ['What do you enjoy outside your artistic practice?', 'Although painting is still and quiet, I enjoy being active—going places, meeting people, and communicating. Listening to people of many ages is both a pastime and a source of inspiration. When I have time alone, I enjoy reading and thinking.']
]

const siteSettings = JSON.parse(readFileSync(join(root, 'content/site.json'), 'utf8'))
siteSettings.heroArtworkId = 'artwork-a0318-0051'
siteSettings.aboutImage = bases[0].image
siteSettings.aboutImageWidth = bases[0].imageWidth
siteSettings.aboutImageHeight = bases[0].imageHeight
siteSettings.copyrightStartYear = 2015
siteSettings.artworksPage.itemsPerPage = 24
writeJson('content/site.json', siteSettings)
writeJson('content/artworks/index.json', { artworks: bases })
writeJson('content/artworks/categories.json', { categories: [{ id: 'relationship', order: 1, published: true }] })
writeJson('content/locales/ko/artworks.json', { artworks: koArtworkText })
writeJson('content/locales/en/artworks.json', { artworks: enArtworkText })
writeJson('content/locales/ko/categories.json', { categories: [{ id: 'relationship', name: '관계와 공존' }] })
writeJson('content/locales/en/categories.json', { categories: [{ id: 'relationship', name: 'Relationship & Coexistence' }] })

writeJson('content/about/index.json', {
  portraitImage: bases[0].image, studioImage: bases[1].image,
  featuredArtworkId: 'artwork-a0318-0009', showArtistNote: true, showBiography: true, showStatement: true
})
writeJson('content/locales/ko/about.json', {
  pageTitle: 'About', introduction,
  biography: ['서울대학교에서 동양화 학사, 석사, 박사 과정을 마쳤습니다.', '김민경은 사람과 사람 사이의 관계, 소통, 공존의 질서를 한지 위 기하학적 셀과 감정의 흐름으로 풀어냅니다.'],
  statementTitle: '작가의 말 · Interview', statement: koInterview.map(([question, answer]) => `Q. ${question}\n${answer}`),
  quote: '다른 사람이 있기에 내가 존재한다고 생각합니다.', quoteAttribution: '김민경', downloadCv: 'CV 다운로드'
})
writeJson('content/locales/en/about.json', {
  pageTitle: 'About', introduction: 'Minkyoung Kim is an Oriental painter who explores communication and subtle emotional exchanges among people living together, beginning with the Korean word ingan (人間): a person existing between people.',
  biography: ['She earned her B.F.A., M.F.A., and Ph.D. in Oriental Painting from Seoul National University.', 'Kim translates relationships, communication, and coexistence into geometric cells and emotional currents on hanji.'],
  statementTitle: 'Artist Interview', statement: enInterview.map(([question, answer]) => `Q. ${question}\n${answer}`),
  quote: 'I believe that I exist because others exist.', quoteAttribution: 'Minkyoung Kim', downloadCv: 'Download CV'
})

const sections = [
  ['education', '학력', 'Education'], ['solo-exhibitions', '개인전', 'Solo Exhibitions'],
  ['group-exhibitions', '단체전', 'Group Exhibitions'], ['collections', '작품소장', 'Collections'],
  ['awards', '수상/선정', 'Awards & Selections'], ['other', '기타', 'Other Activities']
]
writeJson('content/cv/index.json', {
  sections: sections.map(([id], index) => ({ id, order: index + 1, published: true })), entries: cvBaseEntries, pdf: { ko: '', en: '' }
})
for (const locale of ['ko', 'en']) writeJson(`content/locales/${locale}/cv.json`, {
  pageTitle: 'CV',
  sections: sections.map(([id, ko, en]) => ({ id, title: locale === 'ko' ? ko : en })),
  entries: cvText(locale), downloadLabel: locale === 'ko' ? 'CV PDF 다운로드' : 'Download CV PDF'
})

const koSite = {
  artistName: '김민경', artistNameLatin: 'Minkyoung Kim', occupation: '동양화가',
  menu: { main: 'Main', artworks: 'Works', about: 'About', cv: 'CV', news: 'News', contact: 'Contact' },
  main: { artistNote: introduction, artistNoteLink: '작가의 말 읽기', worksTitle: 'Works', worksLink: '전체 작품 보기', aboutTitle: 'About the Artist', aboutSummary: '김민경은 관계와 소통, 공존 속에서 일어나는 미묘한 감정의 움직임을 한지와 콜라주로 그립니다.', aboutLink: '더 알아보기' },
  works: { title: 'Works', description: '사람과 사람 사이의 관계와 감정의 흐름을 탐구하는 김민경의 작품 51점을 소개합니다.', all: '전체', previousPage: '이전 페이지', nextPage: '다음 페이지', pageStatus: '페이지', empty: '이 분류에 공개된 작품이 없습니다.' },
  artworkDetail: { backToWorks: '작품 목록으로', category: '분류', video: '작품 영상', previous: '이전 작품', next: '다음 작품', openLightbox: '작품 크게 보기', closeLightbox: '확대 보기 닫기', zoomIn: '확대', zoomOut: '축소', resetZoom: '원래 크기' },
  common: { imagePending: '작품 이미지 준비 중', pagePreparing: '페이지를 준비하고 있습니다.' },
  footer: { copyright: 'All works and images © Minkyoung Kim.' },
  seo: { title: '김민경 | Minkyoung Kim', description: '관계와 소통, 공존의 감정을 그리는 동양화가 김민경의 작품과 이력을 소개합니다.', ogTitle: '김민경 | Minkyoung Kim', ogDescription: '동양화가 김민경의 작품과 작업 세계를 만나보세요.', ogImage: bases[0].image }
}
const enSite = {
  ...koSite, artistName: 'Minkyoung Kim', occupation: 'Oriental Painter',
  main: { artistNote: 'Minkyoung Kim explores communication and subtle emotional exchanges among people living together through hanji, color, and collage.', artistNoteLink: 'Read artist interview', worksTitle: 'Works', worksLink: 'View all works', aboutTitle: 'About the Artist', aboutSummary: 'Minkyoung Kim paints the movement of emotion within relationships, communication, and coexistence.', aboutLink: 'Learn more' },
  works: { title: 'Works', description: 'Explore 51 works by Minkyoung Kim on relationships and emotional currents between people.', all: 'All', previousPage: 'Previous page', nextPage: 'Next page', pageStatus: 'Page', empty: 'There are no published works in this category.' },
  artworkDetail: { backToWorks: 'Back to Works', category: 'Category', video: 'Artwork video', previous: 'Previous work', next: 'Next work', openLightbox: 'View artwork larger', closeLightbox: 'Close enlarged view', zoomIn: 'Zoom in', zoomOut: 'Zoom out', resetZoom: 'Reset zoom' },
  common: { imagePending: 'Artwork image coming soon', pagePreparing: 'This page is being prepared.' },
  seo: { title: 'Minkyoung Kim | Artist', description: 'Works and career of Minkyoung Kim, an Oriental painter exploring relationships, communication, and coexistence.', ogTitle: 'Minkyoung Kim | Artist', ogDescription: 'Discover the works and practice of Minkyoung Kim.', ogImage: bases[0].image }
}
writeJson('content/locales/ko/site.json', koSite)
writeJson('content/locales/en/site.json', enSite)

writeJson('content/news/index.json', { items: [] })
for (const locale of ['ko', 'en']) {
  const news = JSON.parse(readFileSync(join(root, `content/locales/${locale}/news.json`), 'utf8'))
  news.description = locale === 'ko' ? '김민경의 전시와 프로젝트, 최근 활동 소식입니다.' : 'Exhibitions, projects, and recent activities by Minkyoung Kim.'
  news.items = []
  writeJson(`content/locales/${locale}/news.json`, news)
}

console.log(`Imported ${artworks.length} artworks and ${cvEntries.length} CV entries from ${sourceUrl}`)
