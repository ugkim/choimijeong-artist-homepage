<script setup lang="ts">
import type { LocalizedArtwork } from '~/types/content'
withDefaults(defineProps<{ artwork: LocalizedArtwork; hero?: boolean; useThumbnail?: boolean; fallbackLabel?: string }>(), { hero: false, useThumbnail: false, fallbackLabel: 'Artwork image coming soon' })
</script>

<template>
  <ResponsiveImage :src="useThumbnail && artwork.thumbnail ? artwork.thumbnail : artwork.image" :alt="artwork.alt"
    :width="artwork.imageWidth" :height="artwork.imageHeight" :loading="hero ? 'eager' : 'lazy'"
    :fetchpriority="hero ? 'high' : 'auto'" :object-fit="artwork.cropMode ?? 'contain'"
    :object-position="artwork.objectPosition ?? 'center'" :background-color="artwork.backgroundColor ?? '#ebe8e1'" :fallback-label="fallbackLabel" />
</template>
