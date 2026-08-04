<script setup lang="ts">
withDefaults(defineProps<{ src: string; alt: string; width: number; height: number; eager?: boolean; fallbackLabel?: string }>(), { eager: false, fallbackLabel: 'Image coming soon' })
</script>
<template><ResponsiveImage :src="src" :alt="alt" :width="width" :height="height" :loading="eager ? 'eager' : 'lazy'" :fetchpriority="eager ? 'high' : 'auto'" object-fit="cover" :fallback-label="fallbackLabel" /></template>
