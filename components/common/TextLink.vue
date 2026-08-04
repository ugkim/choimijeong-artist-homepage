<script setup lang="ts">
defineProps<{ to: string; label: string }>()
</script>

<template>
  <NuxtLink class="text-link" :to="to">
    <span>{{ label }}</span>
    <svg aria-hidden="true" viewBox="0 0 32 12"><path d="M0 6h30M24 1l6 5-6 5" /></svg>
  </NuxtLink>
</template>

<style scoped lang="scss">
.text-link { display: inline-flex; align-items: center; gap: .8rem; width: fit-content; font-size: .78rem; letter-spacing: .08em; text-transform: uppercase; }
svg { width: 2rem; fill: none; stroke: currentColor; stroke-width: 1; transition: transform .2s ease; }
.text-link:hover svg { transform: translateX(.25rem); }
@media (prefers-reduced-motion: reduce) { svg { transition: none; } }
</style>
