<script setup lang="ts">
import type { LocalizedArtwork } from '~/types/content'
const props = withDefaults(defineProps<{
  artworks: LocalizedArtwork[]; fallbackLabel: string; showTitle?: boolean; showYear?: boolean; showMedium?: boolean
  mobileColumns?: number; desktopColumns?: number
}>(), { showTitle: true, showYear: true, showMedium: false, mobileColumns: 2, desktopColumns: 4 })
const gridStyle = computed(() => ({ '--mobile-columns': props.mobileColumns, '--desktop-columns': props.desktopColumns }))
</script>

<template>
  <div class="artwork-grid" :style="gridStyle">
    <ArtworkPreview v-for="artwork in artworks" :key="artwork.id" :artwork="artwork" :fallback-label="fallbackLabel"
      :show-title="showTitle" :show-year="showYear" :show-medium="showMedium" />
  </div>
</template>

<style scoped lang="scss">
.artwork-grid { display: grid; grid-template-columns: repeat(var(--desktop-columns), minmax(0, 1fr)); align-items: start; gap: var(--artwork-grid-row-gap, clamp(3.5rem, 8vw, 8rem)) var(--artwork-grid-column-gap, clamp(1.2rem, 2.5vw, 3rem)); }
.artwork-grid :deep(.responsive-image) { height: auto; }
.artwork-grid :deep(.responsive-image img) { height: auto; object-fit: contain !important; }
@media (min-width: 1100px) {
  .artwork-grid > :nth-child(7n + 1) { grid-column: span 2; }
  .artwork-grid > :nth-child(7n + 1) :deep(.caption) { max-width: 26rem; }
}
@media (max-width: 767px) {
  .artwork-grid { grid-template-columns: repeat(var(--mobile-columns), minmax(0, 1fr)); gap: clamp(2.6rem, 12vw, 4.5rem) .85rem; }
  .artwork-grid > * { grid-column: span 1; }
}
</style>
