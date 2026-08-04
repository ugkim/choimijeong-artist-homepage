<script setup lang="ts">
import type { NewsContentBlock } from '~/types/content'
defineProps<{ blocks: NewsContentBlock[] }>()
</script>
<template>
  <div class="news-content">
    <template v-for="(block,index) in blocks" :key="index">
      <p v-if="block.type === 'paragraph'">{{ block.text }}</p>
      <h2 v-else-if="block.type === 'heading'">{{ block.text }}</h2>
      <figure v-else-if="block.type === 'image'"><img :src="block.src" :alt="block.alt" loading="lazy"><figcaption v-if="block.alt">{{ block.alt }}</figcaption></figure>
      <blockquote v-else-if="block.type === 'quote'"><p>{{ block.text }}</p><footer v-if="block.attribution">— {{ block.attribution }}</footer></blockquote>
      <VideoEmbed v-else-if="block.type === 'video'" :video="{ provider: block.provider, url: block.url }" :title="block.title || 'Video'" />
      <a v-else-if="block.type === 'externalLink'" class="external-link" :href="block.url">{{ block.label }} ↗</a>
    </template>
  </div>
</template>
<style scoped lang="scss">
.news-content { max-width: 46rem; margin-inline: auto; }.news-content > p { margin: 0 0 2rem; font-size: clamp(.94rem,1.2vw,1.06rem); line-height: 2.05; }
h2 { margin: 4rem 0 1.5rem; font-family: var(--font-serif); font-size: clamp(1.7rem,3vw,2.8rem); font-weight: 400; }
figure { width: min(68rem,calc(100vw - var(--sidebar-width) - var(--page-padding)*2)); margin: clamp(4rem,8vw,8rem) 50%; transform: translateX(-50%); }figure img { display:block;width:100%;height:auto;aspect-ratio:3/2;object-fit:cover;background:#ebe8e1; }figcaption { margin-top:.7rem;color:var(--color-muted);font-size:.65rem; }
blockquote { margin: 4rem 0; padding: 2rem 0 2rem clamp(1.5rem,4vw,4rem); border-left: 1px solid var(--accent-strong); }blockquote p { margin:0;font-family:var(--font-serif);font-size:clamp(1.3rem,2.5vw,2rem);line-height:1.7; }blockquote footer { margin-top:1rem;color:var(--color-muted);font-size:.7rem; }
.external-link { display:inline-flex;min-height:44px;align-items:center;border-bottom:1px solid var(--color-text);font-size:.75rem; }
@media(max-width:767px){figure{width:100%;margin-inline:0;transform:none;}}
</style>
