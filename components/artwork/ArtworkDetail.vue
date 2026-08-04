<script setup lang="ts">
import type { LocalizedArtwork } from '~/types/content'
defineProps<{
  artwork: LocalizedArtwork; categoryName: string; previous: LocalizedArtwork | null; next: LocalizedArtwork | null
}>()
const { content } = useSiteContent()
const { localePath } = useLocale()
const lightboxOpen = ref(false)
</script>

<template>
  <article class="artwork-detail section-shell">
    <NuxtLink class="back-link" :to="localePath('/artworks')">← {{ content.artworkDetail.backToWorks }}</NuxtLink>
    <div class="detail-layout">
      <button class="artwork-button" type="button" :aria-label="content.artworkDetail.openLightbox" @click="lightboxOpen = true">
        <ArtworkImage :artwork="artwork" hero :fallback-label="content.common.imagePending" />
      </button>
      <aside class="artwork-info">
        <p class="category">{{ categoryName }}</p>
        <h1>{{ artwork.title }}</h1>
        <dl>
          <div v-if="artwork.year !== null"><dt class="sr-only">Year</dt><dd>{{ artwork.year }}</dd></div>
          <div><dt class="sr-only">Medium</dt><dd>{{ artwork.medium }}</dd></div>
          <div><dt class="sr-only">Dimensions</dt><dd>{{ artwork.dimensions }}</dd></div>
        </dl>
        <p v-if="artwork.description" class="description">{{ artwork.description }}</p>
      </aside>
    </div>
    <section v-if="artwork.externalVideo" class="video-section" :aria-labelledby="`video-${artwork.id}`">
      <h2 :id="`video-${artwork.id}`">{{ content.artworkDetail.video }}</h2>
      <VideoEmbed :video="artwork.externalVideo" :title="`${artwork.title} — ${content.artworkDetail.video}`" />
    </section>
    <nav class="artwork-navigation" aria-label="Adjacent artworks">
      <NuxtLink v-if="previous" class="previous" :to="localePath(`/artworks/${previous.slug}`)"><span>← {{ content.artworkDetail.previous }}</span><strong>{{ previous.title }}</strong></NuxtLink><span v-else />
      <NuxtLink v-if="next" class="next" :to="localePath(`/artworks/${next.slug}`)"><span>{{ content.artworkDetail.next }} →</span><strong>{{ next.title }}</strong></NuxtLink>
    </nav>
    <ArtworkLightbox :open="lightboxOpen" :artwork="artwork" :close-label="content.artworkDetail.closeLightbox"
      :zoom-in-label="content.artworkDetail.zoomIn" :zoom-out-label="content.artworkDetail.zoomOut" :reset-label="content.artworkDetail.resetZoom" @close="lightboxOpen = false" />
  </article>
</template>

<style scoped lang="scss">
.artwork-detail { padding-block: clamp(6rem, 10vw, 10rem); }
.back-link { display: inline-flex; align-items: center; min-height: 44px; margin-bottom: 2rem; color: var(--color-muted); font-size: .7rem; letter-spacing: .08em; text-transform: uppercase; }
.detail-layout { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(17rem, .5fr); align-items: start; gap: clamp(3rem, 7vw, 8rem); }
.artwork-button { width: 100%; padding: 0; border: 0; background: transparent; color: inherit; cursor: zoom-in; }
.artwork-button :deep(.responsive-image) { max-height: calc(100vh - 8rem); background: transparent; }
.artwork-button :deep(img) { max-height: calc(100vh - 8rem); object-fit: contain !important; }
.artwork-info { position: sticky; top: 3rem; padding-top: 1rem; border-top: 1px solid var(--color-line); }
.category { margin: 0 0 1.5rem; color: var(--accent-strong); font-size: .68rem; letter-spacing: .14em; text-transform: uppercase; }
h1 { margin: 0 0 2rem; font-family: var(--font-serif); font-size: clamp(2.2rem, 4.5vw, 5.5rem); font-weight: 400; line-height: 1.08; }
dl { margin: 0; color: var(--color-muted); font-size: .78rem; line-height: 1.9; } dl div, dd { margin: 0; }
.description { margin: 2.5rem 0 0; padding-top: 2rem; border-top: 1px solid var(--color-line); font-size: .9rem; line-height: 2; white-space: pre-line; }
.video-section { max-width: 1100px; margin: var(--section-gap) auto 0; padding-top: 2rem; border-top: 1px solid var(--color-line); }
.video-section h2 { margin: 0 0 2rem; font-family: var(--font-serif); font-size: clamp(1.5rem, 3vw, 2.5rem); font-weight: 400; }
.artwork-navigation { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: var(--section-gap); padding-block: 2rem; border-block: 1px solid var(--color-line); }
.artwork-navigation a { display: flex; flex-direction: column; gap: .6rem; min-height: 64px; }
.artwork-navigation .next { align-items: flex-end; text-align: right; }
.artwork-navigation span { color: var(--color-muted); font-size: .66rem; letter-spacing: .1em; text-transform: uppercase; }
.artwork-navigation strong { font-family: var(--font-serif); font-size: clamp(1rem, 2vw, 1.5rem); font-weight: 400; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; }
@media (max-width: 767px) { .artwork-detail { padding-top: calc(var(--mobile-header-height) + 2rem); } .detail-layout { grid-template-columns: 1fr; gap: 2.5rem; } .artwork-info { position: static; } }
</style>
