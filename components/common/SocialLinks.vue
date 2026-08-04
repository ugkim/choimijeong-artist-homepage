<script setup lang="ts">
import type { Socials } from '~/types/content'
const props = defineProps<{ socials: Socials }>()
const links = computed(() => [
  { id: 'instagram', label: 'Instagram', href: props.socials.instagram },
  { id: 'youtube', label: 'YouTube', href: props.socials.youtube },
  { id: 'vimeo', label: 'Vimeo', href: props.socials.vimeo },
  { id: 'email', label: 'Email', href: props.socials.email ? `mailto:${props.socials.email.replace(/^mailto:/, '')}` : '' }
].filter(item => item.href))
</script>

<template>
  <ul v-if="links.length" class="social-links" aria-label="Social links">
    <li v-for="link in links" :key="link.id"><a :href="link.href" :target="link.id === 'email' ? undefined : '_blank'" :rel="link.id === 'email' ? undefined : 'noopener noreferrer'">{{ link.label }}</a></li>
  </ul>
</template>

<style scoped lang="scss">
.social-links { display: flex; flex-wrap: wrap; gap: .45rem 1.1rem; margin: 0; padding: 0; list-style: none; font-size: .7rem; letter-spacing: .08em; text-transform: uppercase; }
a:hover { color: var(--accent-color); }
</style>
