<script setup lang="ts">
const props = withDefaults(defineProps<{
  src: string; alt: string; width: number; height: number; loading?: 'eager' | 'lazy'
  fetchpriority?: 'high' | 'low' | 'auto'; objectFit?: 'contain' | 'cover'; objectPosition?: string
  backgroundColor?: string; fallbackLabel?: string
}>(), { loading: 'lazy', fetchpriority: 'auto', objectFit: 'contain', objectPosition: 'center', backgroundColor: '#ebe8e1', fallbackLabel: 'Image coming soon' })
const failed = ref(false)
const ratio = computed(() => `${props.width} / ${props.height}`)
</script>

<template>
  <figure class="responsive-image" :class="{ 'is-fallback': failed }" :style="{ aspectRatio: ratio, backgroundColor }">
    <img v-if="!failed" :src="src" :alt="alt" :width="width" :height="height" :loading="loading" decoding="async"
      :fetchpriority="fetchpriority" :style="{ objectFit, objectPosition }" @error="failed = true">
    <span v-else role="img" :aria-label="alt">{{ fallbackLabel }}</span>
  </figure>
</template>

<style scoped lang="scss">
.responsive-image { margin: 0; overflow: hidden; width: 100%; }
img { display: block; width: 100%; height: 100%; }
.is-fallback { display: grid; place-items: center; background-image: linear-gradient(135deg, transparent 49.8%, rgba(28,28,27,.1) 50%, transparent 50.2%); }
span { padding: 1rem; color: var(--color-muted); font-size: .72rem; letter-spacing: .08em; text-transform: uppercase; }
</style>
