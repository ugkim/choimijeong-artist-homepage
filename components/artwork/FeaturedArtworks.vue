<script setup lang="ts">
import type { LocalizedArtwork } from '~/types/content'
defineProps<{ artworks: LocalizedArtwork[]; title: string; linkLabel: string; fallbackLabel: string }>()
const { localePath } = useLocale()
</script>

<template>
  <section class="featured section-shell" aria-labelledby="featured-title">
    <header class="section-heading"><h2 id="featured-title">{{ title }}</h2><TextLink :to="localePath('/artworks')" :label="linkLabel" /></header>
    <div class="works-grid"><ArtworkPreview v-for="artwork in artworks" :key="artwork.id" :artwork="artwork" :fallback-label="fallbackLabel" /></div>
  </section>
</template>

<style scoped lang="scss">
.featured { padding-block: var(--section-gap); }
.section-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 2rem; margin-bottom: clamp(2rem, 4vw, 4rem); }
h2 { margin: 0; font-family: var(--font-serif); font-size: clamp(2rem, 4vw, 4rem); font-weight: 400; }
.works-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); align-items: start; gap: clamp(1rem, 2.2vw, 2.6rem); }
.works-grid :deep(.responsive-image) { aspect-ratio: 4 / 5 !important; }
.works-grid :deep(img) { object-fit: contain !important; }
@media (max-width: 980px) { .works-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 3rem 1.25rem; } }
@media (max-width: 520px) { .section-heading { align-items: flex-end; } .section-heading :deep(.text-link) { font-size: .65rem; } }
</style>
