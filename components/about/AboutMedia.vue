<script setup lang="ts">
withDefaults(defineProps<{ src: string; alt: string; fallbackLabel?: string; ratio?: string }>(), { fallbackLabel: 'Image coming soon', ratio: '4 / 5' })
const failed = ref(false)
</script>

<template>
  <figure class="about-media" :class="{ 'is-fallback': failed }" :style="{ aspectRatio: ratio }">
    <img v-if="!failed" :src="src" :alt="alt" loading="lazy" decoding="async" @error="failed = true">
    <span v-else role="img" :aria-label="alt">{{ fallbackLabel }}</span>
  </figure>
</template>

<style scoped lang="scss">
.about-media { display: grid; place-items: center; overflow: hidden; width: 100%; margin: 0; background: #ebe8e1; }
img { width: 100%; height: 100%; object-fit: cover; }
.is-fallback { background-image: linear-gradient(135deg, transparent 49.8%, rgba(28,28,27,.1) 50%, transparent 50.2%); }
span { padding: 1rem; color: var(--color-muted); font-size: .7rem; letter-spacing: .08em; text-transform: uppercase; }
</style>
