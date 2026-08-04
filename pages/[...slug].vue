<script setup lang="ts">
import type { LocaleCode } from '~/types/content'
const route = useRoute()
const { availableLocales } = useLocale()
const raw = computed(() => Array.isArray(route.params.slug) ? route.params.slug : [route.params.slug].filter(Boolean) as string[])
const segments = computed(() => {
  const values = [...raw.value]
  if (availableLocales.includes(values[0] as LocaleCode)) values.shift()
  return values
})
const isMain = computed(() => raw.value.length === 1 && availableLocales.includes(raw.value[0] as LocaleCode))
const pageId = computed(() => segments.value[0] ?? 'main')
const isWorks = computed(() => segments.value.length === 1 && pageId.value === 'artworks')
const isArtworkDetail = computed(() => segments.value.length === 2 && pageId.value === 'artworks')
const isAbout = computed(() => segments.value.length === 1 && pageId.value === 'about')
const isCv = computed(() => segments.value.length === 1 && pageId.value === 'cv')
const isNews = computed(() => segments.value.length === 1 && pageId.value === 'news')
const isNewsDetail = computed(() => segments.value.length === 2 && pageId.value === 'news')
const isContact = computed(() => segments.value.length === 1 && pageId.value === 'contact')
const artworkSlug = computed(() => segments.value[1] ?? '')
const newsSlug = computed(() => segments.value[1] ?? '')
if (!isMain.value && !isWorks.value && !isArtworkDetail.value && !isAbout.value && !isCv.value && !isNews.value && !isNewsDetail.value && !isContact.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}
</script>

<template>
  <MainPage v-if="isMain" />
  <ArtworksPage v-else-if="isWorks" />
  <ArtworkDetailPage v-else-if="isArtworkDetail" :slug="artworkSlug" />
  <AboutPage v-else-if="isAbout" />
  <CvPage v-else-if="isCv" />
  <NewsPage v-else-if="isNews" />
  <NewsDetailPage v-else-if="isNewsDetail" :slug="newsSlug" />
  <ContactPage v-else-if="isContact" />
</template>
