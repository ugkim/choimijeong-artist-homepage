<script setup lang="ts">
import type { ExternalVideo } from '~/types/content'
const props = defineProps<{ video: ExternalVideo; title: string }>()

const embedUrl = computed(() => {
  try {
    const url = new URL(props.video.url)
    if (props.video.provider === 'youtube') {
      const id = url.hostname === 'youtu.be' ? url.pathname.split('/').filter(Boolean)[0] : url.searchParams.get('v') ?? url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1]
      return id && /^[\w-]{6,}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null
    }
    if (props.video.provider === 'vimeo') {
      const id = url.pathname.split('/').filter(Boolean).reverse().find(part => /^\d+$/.test(part))
      return id ? `https://player.vimeo.com/video/${id}` : null
    }
  } catch { return null }
  return null
})
</script>

<template>
  <div v-if="embedUrl" class="video-embed">
    <iframe :src="embedUrl" :title="title" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" />
  </div>
</template>

<style scoped lang="scss">
.video-embed { position: relative; width: 100%; aspect-ratio: 16 / 9; background: #111; }
iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
</style>
