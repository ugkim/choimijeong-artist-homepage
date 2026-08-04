<script setup lang="ts">
const { config, content } = useSiteContent()
const year = new Date().getFullYear()
const years = year === config.copyrightStartYear ? `${year}` : `${config.copyrightStartYear}–${year}`
</script>

<template>
  <footer class="site-footer section-shell">
    <div><SocialLinks :socials="config.socials" /><LanguageSelector /></div>
    <p>© {{ years }} {{ content.artistNameLatin }}. {{ content.footer.copyright }}</p>
  </footer>
</template>

<style scoped lang="scss">
.site-footer { display: flex; justify-content: space-between; gap: 2rem; padding-block: 2.2rem; border-top: 1px solid var(--color-line); color: var(--color-muted); font-size: .66rem; letter-spacing: .04em; }
.site-footer > div { display: flex; gap: 2rem; } p { margin: 0; text-align: right; }
@media (max-width: 767px) { .site-footer, .site-footer > div { flex-direction: column; } .site-footer > div { gap: 1.25rem; } p { text-align: left; line-height: 1.6; } }
</style>
