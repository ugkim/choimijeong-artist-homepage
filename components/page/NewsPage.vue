<script setup lang="ts">
const route = useRoute()
const { config, content: site } = useSiteContent()
const { content: news, items, categories, categoryName, formatDate } = useNews()
const { locale, availableLocales, defaultLocale, localePath } = useLocale()
const runtimeConfig = useRuntimeConfig(); const siteUrl = runtimeConfig.public.siteUrl.replace(/\/$/, '')
const rawCategory = computed(() => typeof route.query.category === 'string' ? route.query.category : '')
const activeCategory = computed(() => categories.value.some(item => item.id === rawCategory.value) ? rawCategory.value : '')
const filtered = computed(() => activeCategory.value ? items.value.filter(item => item.categoryId === activeCategory.value) : items.value)
const rawPage = computed(() => typeof route.query.page === 'string' ? Number.parseInt(route.query.page,10) : 1)
const totalPages = computed(() => Math.max(1,Math.ceil(filtered.value.length/config.newsPage.itemsPerPage)))
const currentPage = computed(() => Number.isFinite(rawPage.value) ? Math.min(Math.max(rawPage.value,1),totalPages.value) : 1)
const visible = computed(() => filtered.value.slice((currentPage.value-1)*config.newsPage.itemsPerPage,currentPage.value*config.newsPage.itemsPerPage))
const filterTo = (id:string) => ({path:localePath('/news'),query:id?{category:id}:{}})
const itemHref = (item: typeof items.value[number]) => config.newsPage.directExternalLinks && item.externalUrl ? item.externalUrl : localePath(`/news/${item.slug}`)
const canonical = computed(() => `${siteUrl}${localePath('/news')}`)
useHead(() => ({htmlAttrs:{lang:locale.value},link:[{rel:'canonical',href:canonical.value},...availableLocales.map(code=>({rel:'alternate',hreflang:code,href:`${siteUrl}${localePath('/news',code)}`})),{rel:'alternate',hreflang:'x-default',href:`${siteUrl}${localePath('/news',defaultLocale)}`}]}))
useSeoMeta({title:()=>`${news.value.pageTitle} — ${site.value.artistNameLatin}`,description:()=>news.value.description,ogTitle:()=>`${news.value.pageTitle} — ${site.value.artistNameLatin}`,ogDescription:()=>news.value.description,ogUrl:()=>canonical.value,ogType:'website'})
</script>
<template>
  <section class="news-page section-shell"><header><p>{{ site.artistNameLatin }}</p><h1>{{ news.pageTitle }}</h1><span>{{ news.description }}</span></header>
    <nav class="news-filters" aria-label="News categories"><NuxtLink :to="filterTo('')" :aria-pressed="activeCategory===''">{{ news.allLabel }}</NuxtLink><NuxtLink v-for="category in categories" :key="category.id" :to="filterTo(category.id)" :aria-pressed="activeCategory===category.id">{{ category.name }}</NuxtLink></nav>
    <div class="news-list"><NewsPreview v-for="item in visible" :key="item.id" :item="item" :href="itemHref(item)" :category="categoryName(item.categoryId)" :date="formatDate(item.publishedAt)" :read-more="news.readMore" :fallback-label="site.common.imagePending" /></div>
    <PaginationNav :current-page="currentPage" :total-pages="totalPages" :base-path="localePath('/news')" :category="activeCategory||undefined" :previous-label="site.works.previousPage" :next-label="site.works.nextPage" :status-label="site.works.pageStatus" />
  </section>
</template>
<style scoped lang="scss">
.news-page{padding-block:clamp(7rem,12vw,12rem)}header{display:grid;grid-template-columns:1fr minmax(15rem,.6fr);align-items:end;gap:2rem;margin-bottom:clamp(3rem,6vw,6rem)}header>p{grid-column:1/-1;margin:0;color:var(--accent-strong);font-size:.68rem;letter-spacing:.16em;text-transform:uppercase}h1{margin:0;font-family:var(--font-serif);font-size:clamp(4.5rem,11vw,11rem);font-weight:400;line-height:.88}header>span{color:var(--color-muted);font-size:.84rem;line-height:1.9}.news-filters{display:flex;flex-wrap:wrap;gap:.4rem 1.5rem;margin-bottom:clamp(3rem,6vw,6rem);padding-block:1rem;border-block:1px solid var(--color-line)}.news-filters a{display:inline-flex;align-items:center;min-height:44px;color:var(--color-muted);font-size:.7rem;letter-spacing:.08em;text-transform:uppercase}.news-filters a[aria-pressed=true]{color:var(--accent-strong);text-decoration:underline;text-underline-offset:.35rem}.news-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 clamp(3rem,6vw,7rem)}@media(max-width:1100px){.news-list{grid-template-columns:1fr}}@media(max-width:767px){.news-page{padding-top:calc(var(--mobile-header-height) + 4rem)}header{grid-template-columns:1fr}}
</style>
