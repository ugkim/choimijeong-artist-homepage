<script setup lang="ts">
const { config, content } = useSiteContent()
const { locale, localePath } = useLocale()
const { heroArtwork, featuredWithoutHero } = useArtworks()
const runtimeConfig = useRuntimeConfig()
const siteUrl = runtimeConfig.public.siteUrl.replace(/\/$/, '')
const canonical = computed(() => `${siteUrl}${localePath('/')}`)
const aboutPath = computed(() => localePath('/about'))

useHead(() => ({
  htmlAttrs: { lang: locale.value },
  link: [
    { rel: 'canonical', href: canonical.value },
    ...config.availableLocales.map(code => ({ rel: 'alternate', hreflang: code, href: `${siteUrl}${localePath('/', code)}` })),
    { rel: 'alternate', hreflang: 'x-default', href: `${siteUrl}/` }
  ],
  script: [{ type: 'application/ld+json', innerHTML: JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Person', name: content.value.artistName,
    alternateName: content.value.artistNameLatin, jobTitle: content.value.occupation, url: canonical.value,
    image: absoluteAssetUrl(config.aboutImage, siteUrl),
    sameAs: [config.socials.instagram, config.socials.youtube, config.socials.vimeo].filter(Boolean)
  }) }]
}))
useSeoMeta({
  title: () => content.value.seo.title, description: () => content.value.seo.description,
  ogTitle: () => content.value.seo.ogTitle, ogDescription: () => content.value.seo.ogDescription,
  ogImage: () => absoluteAssetUrl(content.value.seo.ogImage, siteUrl), ogType: 'website', ogUrl: () => canonical.value,
  twitterCard: 'summary_large_image', twitterTitle: () => content.value.seo.ogTitle,
  twitterDescription: () => content.value.seo.ogDescription, twitterImage: () => absoluteAssetUrl(content.value.seo.ogImage, siteUrl)
})
</script>

<template>
  <div class="main-page">
    <section v-if="heroArtwork" class="hero section-shell" aria-label="Featured artwork">
      <NuxtLink :to="localePath(`/artworks/${heroArtwork.slug}`)" :aria-label="heroArtwork.title">
        <ArtworkImage :artwork="heroArtwork" hero :fallback-label="content.common.imagePending" />
      </NuxtLink>
      <div class="hero-caption"><h1>{{ heroArtwork.title }}</h1><p>{{ heroArtwork.year }}<span> · </span>{{ heroArtwork.medium }}<span> · </span>{{ heroArtwork.dimensions }}</p></div>
    </section>

    <section class="artist-note section-shell" aria-labelledby="artist-note-title">
      <p id="artist-note-title">{{ content.main.artistNote }}</p>
      <TextLink :to="aboutPath" :label="content.main.artistNoteLink" />
    </section>

    <FeaturedArtworks :artworks="featuredWithoutHero" :title="content.main.worksTitle" :link-label="content.main.worksLink" :fallback-label="content.common.imagePending" />

    <section class="about-preview section-shell" aria-labelledby="about-title">
      <ResponsiveImage class="about-image" :src="config.aboutImage" :alt="`${content.artistName} studio`" :width="config.aboutImageWidth" :height="config.aboutImageHeight" :fallback-label="content.common.imagePending" />
      <div class="about-copy"><p class="eyebrow">{{ content.occupation }}</p><h2 id="about-title">{{ content.main.aboutTitle }}</h2><p class="summary">{{ content.main.aboutSummary }}</p><TextLink :to="aboutPath" :label="content.main.aboutLink" /></div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.hero { min-height: min(100vh, 1020px); padding-top: clamp(2rem, 5vw, 5.5rem); }
.hero > a { display: flex; justify-content: center; }
.hero :deep(.responsive-image) { width: auto; max-width: 100%; height: min(76vh, 820px); aspect-ratio: auto !important; background: transparent !important; }
.hero :deep(img) { width: auto; max-width: 100%; height: 100%; object-fit: contain !important; }
.hero-caption { display: flex; align-items: baseline; justify-content: space-between; gap: 2rem; padding-top: 1rem; border-top: 1px solid var(--color-line); }
.hero-caption h1 { margin: 0; font-family: var(--font-serif); font-size: clamp(1rem, 1.4vw, 1.35rem); font-weight: 400; }
.hero-caption p { margin: 0; color: var(--color-muted); font-size: .68rem; }
.artist-note { display: grid; grid-template-columns: minmax(0, 2.2fr) 1fr; align-items: end; gap: 3rem; padding-block: var(--section-gap); border-bottom: 1px solid var(--color-line); }
.artist-note > p { max-width: 30ch; margin: 0; font-family: var(--font-serif); font-size: clamp(1.75rem, 3.2vw, 3.4rem); line-height: 1.55; word-break: keep-all; }
.about-preview { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(18rem, .85fr); align-items: center; gap: clamp(3rem, 8vw, 9rem); padding-block: var(--section-gap); border-top: 1px solid var(--color-line); }
.about-image { aspect-ratio: 4 / 3 !important; }
.about-copy h2 { margin: .6rem 0 2rem; font-family: var(--font-serif); font-size: clamp(2rem, 4vw, 4.6rem); font-weight: 400; line-height: 1.08; }
.eyebrow { margin: 0; color: var(--accent-strong); font-size: .68rem; letter-spacing: .16em; text-transform: uppercase; }
.summary { max-width: 33rem; margin: 0 0 2.4rem; color: var(--color-muted); font-size: clamp(.88rem, 1.1vw, 1rem); line-height: 2; word-break: keep-all; }
@media (max-width: 767px) {
  .hero { min-height: auto; padding-top: calc(var(--mobile-header-height) + 1.5rem); }
  .hero :deep(.responsive-image) { width: 100%; height: auto; aspect-ratio: var(--hero-ratio, 4 / 5) !important; }
  .hero :deep(img) { width: 100%; height: 100%; }
  .hero-caption { align-items: flex-start; flex-direction: column; gap: .35rem; }
  .artist-note { grid-template-columns: 1fr; gap: 2rem; }
  .about-preview { grid-template-columns: 1fr; gap: 2.5rem; }
}
</style>
