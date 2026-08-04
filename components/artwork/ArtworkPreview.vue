<script setup lang="ts">
import type { LocalizedArtwork } from '~/types/content'
withDefaults(defineProps<{
  artwork: LocalizedArtwork; fallbackLabel: string; showTitle?: boolean; showYear?: boolean; showMedium?: boolean
}>(), { showTitle: true, showYear: true, showMedium: false })
const { localePath } = useLocale()
</script>

<template>
  <article class="artwork-preview">
    <NuxtLink class="image-link" :to="localePath(`/artworks/${artwork.slug}`)" :aria-label="artwork.title">
      <ArtworkImage :artwork="artwork" use-thumbnail :fallback-label="fallbackLabel" />
    </NuxtLink>
    <div v-if="showTitle || showYear || showMedium" class="caption">
      <h3 v-if="showTitle"><NuxtLink :to="localePath(`/artworks/${artwork.slug}`)">{{ artwork.title }}</NuxtLink></h3>
      <p v-if="showYear || showMedium"><template v-if="showYear">{{ artwork.year }}</template><span v-if="showYear && showMedium" aria-hidden="true"> · </span><template v-if="showMedium">{{ artwork.medium }}</template></p>
    </div>
  </article>
</template>

<style scoped lang="scss">
.artwork-preview { min-width: 0; }
.image-link { display: block; transition: opacity .25s ease; }
.image-link:hover { opacity: .88; }
.image-link :deep(.responsive-image) { aspect-ratio: auto !important; background: transparent !important; }
.caption { padding-top: .7rem; }
h3 { margin: 0; font-family: var(--font-serif); font-size: clamp(.95rem, 1.15vw, 1.16rem); font-weight: 400; }
p { margin: .35rem 0 0; color: var(--color-muted); font-size: .68rem; line-height: 1.6; }
</style>
