<script setup lang="ts">
import type { LocalizedCvSection } from '~/types/content'
defineProps<{ section: LocalizedCvSection; open?: boolean }>()
</script>

<template>
  <details class="cv-accordion" :open="open">
    <summary><span>{{ section.title }}</span><span class="indicator" aria-hidden="true">+</span></summary>
    <CvSection :section="section" />
  </details>
</template>

<style scoped lang="scss">
.cv-accordion { border-top: 1px solid var(--color-line); }
summary { display: flex; align-items: center; justify-content: space-between; min-height: 72px; cursor: pointer; font-family: var(--font-serif); font-size: 1.35rem; list-style: none; }
summary::-webkit-details-marker { display: none; }
.indicator { font-family: var(--font-sans); font-size: 1.2rem; font-weight: 300; transition: transform .2s ease; }
details[open] .indicator { transform: rotate(45deg); }
:deep(.cv-section) { padding-top: .5rem; border-top: 0; }
:deep(.cv-section > h2) { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }
</style>
