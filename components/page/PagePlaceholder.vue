<script setup lang="ts">
const props = defineProps<{ pageId: string }>()
const { content } = useSiteContent()
useSeoMeta({ title: () => `${content.value.menu[props.pageId] ?? props.pageId} — ${content.value.artistNameLatin}`, description: () => content.value.seo.description })
</script>

<template>
  <section class="placeholder section-shell"><p>{{ content.artistNameLatin }}</p><h1>{{ content.menu[pageId] ?? pageId }}</h1><span>{{ content.common.pagePreparing }}</span></section>
</template>

<style scoped lang="scss">
.placeholder { min-height: calc(100vh - 8rem); padding-block: clamp(8rem, 18vh, 14rem); }
.placeholder p { color: var(--accent-strong); font-size: .68rem; letter-spacing: .16em; text-transform: uppercase; }
.placeholder h1 { margin: 1rem 0 2rem; font-family: var(--font-serif); font-size: clamp(4rem, 11vw, 10rem); font-weight: 400; line-height: 1; }
.placeholder span { color: var(--color-muted); }
</style>
