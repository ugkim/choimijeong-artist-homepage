<script setup lang="ts">
import type { LocalizedNewsItem } from '~/types/content'
defineProps<{ item: LocalizedNewsItem; href: string; category: string; date: string; readMore: string; fallbackLabel: string }>()
</script>
<template>
  <article class="news-preview">
    <NuxtLink :to="href" class="image-link" :aria-label="item.title"><NewsImage :src="item.thumbnail || item.image" :alt="item.alt" :width="item.imageWidth" :height="item.imageHeight" :fallback-label="fallbackLabel" /></NuxtLink>
    <div class="news-copy"><p class="meta"><span>{{ category }}</span><time :datetime="item.publishedAt">{{ date }}</time></p><h2><NuxtLink :to="href">{{ item.title }}</NuxtLink></h2>
      <p v-if="item.venue || item.location" class="place"><span v-if="item.venue">{{ item.venue }}</span><span v-if="item.location">{{ item.location }}</span></p>
      <p class="summary">{{ item.summary }}</p><NuxtLink :to="href" class="read-more">{{ readMore }} →</NuxtLink></div>
  </article>
</template>
<style scoped lang="scss">
.news-preview { display: grid; grid-template-columns: 1fr; align-content: start; gap: clamp(1.5rem,3vw,2.5rem); padding-block: clamp(2rem,4vw,4rem); border-top: 1px solid var(--color-line); }
.image-link { display: block; }
.news-copy { padding-top: .4rem; }
.meta { display: flex; gap: 1rem; margin: 0 0 1.5rem; color: var(--color-muted); font-size: .65rem; letter-spacing: .08em; text-transform: uppercase; }
.meta span { color: var(--accent-strong); }
h2 { margin: 0 0 1rem; font-family: var(--font-serif); font-size: clamp(1.7rem,3vw,3rem); font-weight: 400; line-height: 1.25; }
.place,.summary { margin: .5rem 0 0; color: var(--color-muted); font-size: .78rem; line-height: 1.8; }.place span + span::before { content: ' · '; }
.read-more { display: inline-flex; align-items: center; min-height: 44px; margin-top: 1.5rem; border-bottom: 1px solid var(--color-line); font-size: .7rem; letter-spacing: .06em; }
@media (max-width: 767px) { .news-preview { grid-template-columns: 1fr; gap: 1.4rem; } .news-copy { padding-top: 0; } }
</style>
