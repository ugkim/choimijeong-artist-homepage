<script setup lang="ts">
const { content: cv, sections, pdfUrl } = useCv()
const { config: siteConfig, content: site } = useSiteContent()
const { locale, availableLocales, defaultLocale, localePath } = useLocale()
const runtimeConfig = useRuntimeConfig()
const siteUrl = runtimeConfig.public.siteUrl.replace(/\/$/, '')
const canonical = computed(() => `${siteUrl}${localePath('/cv')}`)
const description = computed(() => `${site.value.artistNameLatin} — ${cv.value.pageTitle}`)

useHead(() => ({ htmlAttrs: { lang: locale.value }, link: [
  { rel: 'canonical', href: canonical.value },
  ...availableLocales.map(code => ({ rel: 'alternate', hreflang: code, href: `${siteUrl}${localePath('/cv', code)}` })),
  { rel: 'alternate', hreflang: 'x-default', href: `${siteUrl}${localePath('/cv', defaultLocale)}` }
] }))
useSeoMeta({ title: () => `${cv.value.pageTitle} — ${site.value.artistNameLatin}`, description: () => description.value,
  ogTitle: () => `${cv.value.pageTitle} — ${site.value.artistNameLatin}`, ogDescription: () => description.value,
  ogUrl: () => canonical.value, ogType: 'profile' })
</script>

<template>
  <article class="cv-page section-shell">
    <header class="cv-header"><p>{{ site.artistNameLatin }}</p><h1>{{ cv.pageTitle }}</h1>
      <a v-if="pdfUrl" :href="pdfUrl" class="pdf-download" download :aria-label="`${cv.downloadLabel} (PDF)`"><span>{{ cv.downloadLabel }}</span><small>PDF ↓</small></a>
    </header>
    <div class="desktop-sections" :class="{ 'is-mobile-visible': !siteConfig.cvPage.mobileAccordion }"><CvSection v-for="section in sections" :key="section.id" :section="section" :heading-id="`cv-${section.id}`" /></div>
    <div v-if="siteConfig.cvPage.mobileAccordion" class="mobile-sections"><CvAccordion v-for="(section,index) in sections" :key="section.id" :section="section" :open="index === 0" /></div>
  </article>
</template>

<style scoped lang="scss">
.cv-page { padding-block: clamp(7rem,12vw,12rem); }
.cv-header { display: grid; grid-template-columns: 1fr auto; align-items: end; gap: 2rem; margin-bottom: clamp(5rem,10vw,10rem); }
.cv-header > p { grid-column: 1/-1; margin: 0; color: var(--accent-strong); font-size: .68rem; letter-spacing: .16em; text-transform: uppercase; }
h1 { margin: 0; font-family: var(--font-serif); font-size: clamp(5rem,13vw,12rem); font-weight: 400; line-height: .85; }
.pdf-download { display: flex; align-items: center; justify-content: space-between; gap: 2rem; min-width: 14rem; min-height: 52px; border-bottom: 1px solid var(--color-text); font-size: .76rem; letter-spacing: .06em; }
.pdf-download small { color: var(--color-muted); font-size: .62rem; }
.desktop-sections { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 0 clamp(4rem,8vw,9rem); }
.mobile-sections { display: none; }
@media (max-width: 900px) { .desktop-sections { grid-template-columns: 1fr; } }
@media (max-width: 767px) { .cv-page { padding-top: calc(var(--mobile-header-height) + 4rem); } .cv-header { grid-template-columns: 1fr; margin-bottom: 4rem; } .pdf-download { min-width: 0; } .desktop-sections { display: none; } .desktop-sections.is-mobile-visible { display: block; } .mobile-sections { display: block; border-bottom: 1px solid var(--color-line); } }
</style>
