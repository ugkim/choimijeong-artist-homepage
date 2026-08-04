<script setup lang="ts">
const { config, content } = useSiteContent()
const { localePath } = useLocale()
const route = useRoute()
const isActive = (path: string) => path === '/' ? /^\/(en)?\/?$/.test(route.path) : route.path === localePath(path) || route.path.startsWith(`${localePath(path)}/`)
</script>

<template>
  <aside class="artist-sidebar">
    <NuxtLink class="identity" :to="localePath('/')">
      <strong>{{ content.artistNameLatin }}</strong><span>{{ content.artistName }}</span><small>{{ content.occupation }}</small>
    </NuxtLink>
    <nav class="primary-nav" aria-label="Primary navigation">
      <NuxtLink v-for="item in config.menu" :key="item.id" :to="localePath(item.path)" :aria-current="isActive(item.path) ? 'page' : undefined">{{ content.menu[item.id] }}</NuxtLink>
    </nav>
    <div class="sidebar-footer"><LanguageSelector /><SocialLinks :socials="config.socials" /></div>
  </aside>
</template>

<style scoped lang="scss">
.artist-sidebar { position: fixed; inset: 0 auto 0 0; z-index: 20; display: flex; flex-direction: column; width: var(--sidebar-width); min-height: 100vh; padding: 3rem 2.4rem 2.2rem; border-right: 1px solid var(--color-line); background: var(--color-bg); }
.identity { display: flex; flex-direction: column; align-items: flex-start; }
.identity strong { font-family: var(--font-serif); font-size: 1.25rem; font-weight: 400; letter-spacing: .02em; }
.identity span { margin-top: .25rem; font-size: .8rem; letter-spacing: .18em; }
.identity small { margin-top: .65rem; color: var(--color-muted); font-size: .62rem; letter-spacing: .12em; text-transform: uppercase; }
.primary-nav { display: flex; flex-direction: column; align-items: flex-start; gap: .76rem; margin-top: clamp(4rem, 10vh, 7rem); font-family: var(--font-serif); font-size: 1rem; }
.primary-nav a { position: relative; padding-block: .12rem; }
.primary-nav a::after { position: absolute; bottom: -.05rem; left: 0; width: 0; height: 1px; background: var(--accent-color); content: ''; transition: width .2s ease; }
.primary-nav a:hover::after, .primary-nav a[aria-current='page']::after { width: 100%; }
.primary-nav a[aria-current='page'] { color: var(--accent-strong); }
.sidebar-footer { display: grid; gap: 1.4rem; margin-top: auto; }
@media (max-width: 767px) { .artist-sidebar { display: none; } }
</style>
