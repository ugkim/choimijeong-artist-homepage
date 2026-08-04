<script setup lang="ts">
const props = defineProps<{ slug: string }>()
const { content } = useSiteContent()
const { locale, availableLocales, defaultLocale, localePath } = useLocale()
const { getArtworkBySlug, getAdjacentArtworks } = useArtworks()
const { categoryName } = useCategories()
const runtimeConfig = useRuntimeConfig()
const siteUrl = runtimeConfig.public.siteUrl.replace(/\/$/, '')
const artwork = computed(() => getArtworkBySlug(props.slug))
if (!artwork.value) throw createError({ statusCode: 404, statusMessage: 'Artwork not found' })
const adjacent = computed(() => getAdjacentArtworks(props.slug))
const canonical = computed(() => `${siteUrl}${localePath(`/artworks/${props.slug}`)}`)
const description = computed(() => artwork.value?.description || `${artwork.value?.title}, ${artwork.value?.year ?? ''}, ${artwork.value?.medium}`)

useHead(() => ({ htmlAttrs: { lang: locale.value }, link: [
  { rel: 'canonical', href: canonical.value },
  ...availableLocales.map(code => ({ rel: 'alternate', hreflang: code, href: `${siteUrl}${localePath(`/artworks/${props.slug}`, code)}` })),
  { rel: 'alternate', hreflang: 'x-default', href: `${siteUrl}${localePath(`/artworks/${props.slug}`, defaultLocale)}` }
], script: artwork.value ? [{ type: 'application/ld+json', innerHTML: JSON.stringify({
  '@context': 'https://schema.org', '@type': 'VisualArtwork', name: artwork.value.title,
  image: absoluteAssetUrl(artwork.value.image, siteUrl), creator: { '@type': 'Person', name: content.value.artistNameLatin },
  dateCreated: artwork.value.year, artMedium: artwork.value.medium, width: artwork.value.imageWidth,
  height: artwork.value.imageHeight, inLanguage: locale.value, url: canonical.value
}) }] : [] }))
useSeoMeta({
  title: () => `${artwork.value?.title} — ${content.value.artistNameLatin}`,
  description: () => description.value,
  ogTitle: () => `${artwork.value?.title} — ${content.value.artistNameLatin}`,
  ogDescription: () => description.value,
  ogImage: () => artwork.value ? absoluteAssetUrl(artwork.value.image, siteUrl) : '',
  ogUrl: () => canonical.value,
  ogType: 'article', twitterCard: 'summary_large_image'
})
</script>

<template>
  <ArtworkDetail v-if="artwork" :artwork="artwork" :category-name="categoryName(artwork.categoryId)" :previous="adjacent.previous" :next="adjacent.next" />
</template>
