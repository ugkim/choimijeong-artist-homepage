<script setup lang="ts">
const route = useRoute()
const { config, content } = useSiteContent()
const { locale, availableLocales, defaultLocale, localePath } = useLocale()
const { artworks } = useArtworks()
const { categories } = useCategories()
const runtimeConfig = useRuntimeConfig()
const siteUrl = runtimeConfig.public.siteUrl.replace(/\/$/, '')

const rawCategory = computed(() => typeof route.query.category === 'string' ? route.query.category : '')
const activeCategory = computed(() => categories.value.some(item => item.id === rawCategory.value) ? rawCategory.value : '')
const rawPage = computed(() => typeof route.query.page === 'string' ? Number.parseInt(route.query.page, 10) : 1)
const filtered = computed(() => activeCategory.value ? artworks.value.filter(item => item.categoryId === activeCategory.value) : artworks.value)
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / config.artworksPage.itemsPerPage)))
const currentPage = computed(() => Number.isFinite(rawPage.value) ? Math.min(Math.max(rawPage.value, 1), totalPages.value) : 1)
const visibleArtworks = computed(() => {
  const start = (currentPage.value - 1) * config.artworksPage.itemsPerPage
  return filtered.value.slice(start, start + config.artworksPage.itemsPerPage)
})
const categoryTo = (id: string) => ({ path: localePath('/artworks'), query: id ? { category: id } : {} })
const canonical = computed(() => `${siteUrl}${localePath('/artworks')}`)

useHead(() => ({ htmlAttrs: { lang: locale.value }, link: [
  { rel: 'canonical', href: canonical.value },
  ...availableLocales.map(code => ({ rel: 'alternate', hreflang: code, href: `${siteUrl}${localePath('/artworks', code)}` })),
  { rel: 'alternate', hreflang: 'x-default', href: `${siteUrl}${localePath('/artworks', defaultLocale)}` }
] }))
useSeoMeta({
  title: () => `${content.value.works.title} — ${content.value.artistNameLatin}`,
  description: () => content.value.works.description,
  ogTitle: () => `${content.value.works.title} — ${content.value.artistNameLatin}`,
  ogDescription: () => content.value.works.description,
  ogImage: () => `${siteUrl}${content.value.seo.ogImage}`,
  ogUrl: () => canonical.value,
  ogType: 'website'
})
</script>

<template>
  <section class="works-page section-shell">
    <header class="works-header"><p>{{ content.artistNameLatin }}</p><h1>{{ content.works.title }}</h1><span>{{ content.works.description }}</span></header>
    <nav class="filters" aria-label="Artwork categories">
      <NuxtLink :to="categoryTo('')" :aria-pressed="activeCategory === ''">{{ content.works.all }}</NuxtLink>
      <NuxtLink v-for="category in categories" :key="category.id" :to="categoryTo(category.id)" :aria-pressed="activeCategory === category.id">{{ category.name }}</NuxtLink>
    </nav>
    <ArtworkGrid v-if="visibleArtworks.length" :artworks="visibleArtworks" :fallback-label="content.common.imagePending"
      :show-title="config.artworksPage.showTitle" :show-year="config.artworksPage.showYear" :show-medium="config.artworksPage.showMedium"
      :mobile-columns="config.artworksPage.mobileColumns" :desktop-columns="config.artworksPage.desktopColumns" />
    <p v-else class="empty-state">{{ content.works.empty }}</p>
    <PaginationNav :current-page="currentPage" :total-pages="totalPages" :base-path="localePath('/artworks')" :category="activeCategory || undefined"
      :previous-label="content.works.previousPage" :next-label="content.works.nextPage" :status-label="content.works.pageStatus" />
  </section>
</template>

<style scoped lang="scss">
.works-page { padding-block: clamp(7rem, 12vw, 12rem); }
.works-header { display: grid; grid-template-columns: minmax(0, 1fr) minmax(14rem, .7fr); align-items: end; gap: 2rem; padding-bottom: clamp(3rem, 6vw, 6rem); }
.works-header p { grid-column: 1 / -1; margin: 0; color: var(--accent-strong); font-size: .68rem; letter-spacing: .16em; text-transform: uppercase; }
h1 { margin: 0; font-family: var(--font-serif); font-size: clamp(4rem, 10vw, 10rem); font-weight: 400; line-height: .9; }
.works-header span { max-width: 34rem; color: var(--color-muted); font-size: .85rem; line-height: 1.9; }
.filters { display: flex; flex-wrap: wrap; gap: .4rem 1.5rem; margin-bottom: clamp(4rem, 8vw, 8rem); padding-block: 1.2rem; border-block: 1px solid var(--color-line); }
.filters a { display: inline-flex; align-items: center; min-height: 44px; color: var(--color-muted); font-size: .72rem; letter-spacing: .08em; text-transform: uppercase; }
.filters a[aria-pressed='true'] { color: var(--accent-strong); text-decoration: underline; text-underline-offset: .35rem; }
.empty-state { min-height: 30vh; margin: 0; color: var(--color-muted); }
@media (max-width: 767px) { .works-page { padding-top: calc(var(--mobile-header-height) + 4rem); } .works-header { grid-template-columns: 1fr; } .works-header p { grid-column: auto; } }
</style>
