<script setup lang="ts">
const { config, content: about, featuredArtwork } = useAbout()
const { pdfUrl } = useCv()
const { config: siteConfig, content: site } = useSiteContent()
const { locale, availableLocales, defaultLocale, localePath } = useLocale()
const runtimeConfig = useRuntimeConfig()
const siteUrl = runtimeConfig.public.siteUrl.replace(/\/$/, '')
const canonical = computed(() => `${siteUrl}${localePath('/about')}`)
const socialUrls = computed(() => [siteConfig.socials.instagram, siteConfig.socials.youtube, siteConfig.socials.vimeo].filter(value => /^https?:\/\//.test(value)))

useHead(() => ({ htmlAttrs: { lang: locale.value }, link: [
  { rel: 'canonical', href: canonical.value },
  ...availableLocales.map(code => ({ rel: 'alternate', hreflang: code, href: `${siteUrl}${localePath('/about', code)}` })),
  { rel: 'alternate', hreflang: 'x-default', href: `${siteUrl}${localePath('/about', defaultLocale)}` }
], script: [{ type: 'application/ld+json', innerHTML: JSON.stringify({
  '@context': 'https://schema.org', '@type': 'Person', name: site.value.artistName,
  alternateName: site.value.artistNameLatin, image: config.portraitImage ? absoluteAssetUrl(config.portraitImage, siteUrl) : undefined,
  jobTitle: site.value.occupation, description: about.value.introduction, url: canonical.value,
  sameAs: socialUrls.value.length ? socialUrls.value : undefined
}) }] }))
useSeoMeta({
  title: () => `${about.value.pageTitle} — ${site.value.artistNameLatin}`,
  description: () => about.value.introduction,
  ogTitle: () => `${about.value.pageTitle} — ${site.value.artistNameLatin}`,
  ogDescription: () => about.value.introduction,
  ogImage: () => absoluteAssetUrl(config.portraitImage, siteUrl),
  ogUrl: () => canonical.value,
  ogType: 'profile'
})
</script>

<template>
  <article class="about-page section-shell">
    <section class="about-intro" aria-labelledby="about-title">
      <header><p>{{ site.artistNameLatin }}</p><h1 id="about-title">{{ about.pageTitle }}</h1><div class="lead">{{ about.introduction }}</div></header>
      <AboutMedia :src="config.portraitImage" :alt="`${site.artistName} — ${about.pageTitle}`" :fallback-label="site.common.imagePending" />
    </section>

    <blockquote v-if="about.quote" class="artist-quote">
      <span aria-hidden="true">“</span><p>{{ about.quote }}</p><footer v-if="about.quoteAttribution">— {{ about.quoteAttribution }}</footer>
    </blockquote>

    <section v-if="config.showBiography && about.biography.length" class="text-section biography">
      <p class="eyebrow">Biography</p><div class="prose"><p v-for="paragraph in about.biography" :key="paragraph">{{ paragraph }}</p></div>
    </section>

    <section v-if="config.showArtistNote && config.showStatement && about.statement.length" class="text-section statement">
      <h2>{{ about.statementTitle }}</h2><div class="prose"><p v-for="paragraph in about.statement" :key="paragraph">{{ paragraph }}</p></div>
    </section>

    <section class="selected-media">
      <NuxtLink v-if="featuredArtwork" :to="localePath(`/artworks/${featuredArtwork.slug}`)" class="selected-artwork">
        <ArtworkImage :artwork="featuredArtwork" :fallback-label="site.common.imagePending" />
        <span>{{ featuredArtwork.title }}, {{ featuredArtwork.year }}</span>
      </NuxtLink>
      <AboutMedia v-else :src="config.studioImage" :alt="`${site.artistName} studio`" :fallback-label="site.common.imagePending" ratio="3 / 2" />
      <a v-if="pdfUrl" class="cv-download" :href="pdfUrl" download :aria-label="`${about.downloadCv} (PDF)`">{{ about.downloadCv }} <span aria-hidden="true">↓</span><small>PDF</small></a>
    </section>
  </article>
</template>

<style scoped lang="scss">
.about-page { padding-block: clamp(6rem, 10vw, 9rem); }
.about-intro { display: grid; grid-template-columns: minmax(0,.85fr) minmax(20rem,1.15fr); align-items: end; gap: clamp(3rem,8vw,9rem); }
.about-intro header { padding-bottom: 2rem; }
.about-intro header > p,.eyebrow { margin: 0 0 1.5rem; color: var(--accent-strong); font-size: .68rem; letter-spacing: .16em; text-transform: uppercase; }
h1 { margin: 0 0 clamp(2.5rem,5vw,4.5rem); font-family: var(--font-serif); font-size: clamp(3.25rem,7.5vw,7.5rem); font-weight: 400; line-height: .92; }
.lead { max-width: 32rem; font-family: var(--font-serif); font-size: clamp(1.05rem,1.65vw,1.45rem); line-height: 1.75; }
.artist-quote { max-width: 58rem; margin: var(--section-gap) auto; padding: clamp(2rem,5vw,5rem) 0; border-block: 1px solid var(--color-line); text-align: center; }
.artist-quote > span { color: var(--accent-color); font-family: var(--font-serif); font-size: 3rem; line-height: 1; }
.artist-quote p { margin: .5rem 0 1.5rem; font-family: var(--font-serif); font-size: clamp(1.3rem,2.7vw,2.35rem); line-height: 1.6; }
.artist-quote footer { color: var(--color-muted); font-size: .72rem; letter-spacing: .08em; }
.text-section { display: grid; grid-template-columns: minmax(10rem,.45fr) minmax(0,1fr); gap: clamp(2rem,8vw,9rem); max-width: 78rem; margin: var(--section-gap) auto; }
.text-section h2 { margin: 0; font-family: var(--font-serif); font-size: clamp(1.45rem,2.6vw,2.6rem); font-weight: 400; line-height: 1.35; }
.prose { max-width: 42rem; }
.prose p { margin: 0 0 1.65rem; font-size: clamp(.86rem,1vw,.98rem); line-height: 2; }
.selected-media { max-width: 66rem; margin: var(--section-gap) auto 0; }
.selected-artwork { display: block; }
.selected-artwork > span { display: block; margin-top: 1rem; color: var(--color-muted); font-size: .72rem; }
.cv-download { display: inline-flex; align-items: center; gap: .8rem; min-height: 48px; margin-top: 2.5rem; border-bottom: 1px solid var(--color-text); font-size: .78rem; letter-spacing: .06em; }
.cv-download small { color: var(--color-muted); font-size: .6rem; }
@media (max-width: 767px) { .about-page { padding-top: calc(var(--mobile-header-height) + 4rem); } .about-intro { grid-template-columns: 1fr; } .about-intro header { order: 1; } h1 { margin-bottom: 2.5rem; } .text-section { grid-template-columns: 1fr; gap: 1.5rem; } }
</style>
