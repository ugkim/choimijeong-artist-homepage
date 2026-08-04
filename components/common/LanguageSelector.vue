<script setup lang="ts">
import type { LocaleCode } from '~/types/content'
const { locale, availableLocales, switchLocalePath } = useLocale()
const labels: Record<LocaleCode, string> = { ko: 'KR', en: 'EN' }
</script>

<template>
  <nav class="language-selector" aria-label="Language">
    <NuxtLink v-for="item in availableLocales" :key="item" :to="switchLocalePath(item)" :lang="item" :aria-current="locale === item ? 'true' : undefined">{{ labels[item] }}</NuxtLink>
  </nav>
</template>

<style scoped lang="scss">
.language-selector { display: flex; align-items: center; gap: .8rem; font-size: .68rem; letter-spacing: .1em; }
a { color: var(--color-muted); }
a[aria-current='true'] { color: var(--color-text); text-decoration: underline; text-underline-offset: .3rem; }
</style>
