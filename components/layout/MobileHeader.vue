<script setup lang="ts">
defineProps<{ expanded: boolean }>()
defineEmits<{ toggle: [] }>()
const { content } = useSiteContent()
const { localePath } = useLocale()
</script>

<template>
  <header class="mobile-header">
    <NuxtLink class="mobile-identity" :to="localePath('/')"><strong>{{ content.artistNameLatin }}</strong><span>{{ content.artistName }}</span></NuxtLink>
    <button class="menu-button" type="button" aria-label="Toggle menu" :aria-expanded="expanded" aria-controls="mobile-menu" @click="$emit('toggle')">
      <span /><span />
    </button>
  </header>
</template>

<style scoped lang="scss">
.mobile-header { display: none; }
@media (max-width: 767px) {
  .mobile-header { position: fixed; inset: 0 0 auto; z-index: 50; display: flex; align-items: center; justify-content: space-between; height: var(--mobile-header-height); padding-inline: var(--page-padding); border-bottom: 1px solid var(--color-line); background: color-mix(in srgb, var(--color-bg) 94%, transparent); backdrop-filter: blur(8px); }
  .mobile-identity { display: flex; align-items: baseline; gap: .65rem; }
  .mobile-identity strong { font-family: var(--font-serif); font-size: 1rem; font-weight: 400; }
  .mobile-identity span { font-size: .68rem; letter-spacing: .14em; }
  .menu-button { position: relative; width: 44px; height: 44px; margin-right: -.7rem; border: 0; background: transparent; color: inherit; cursor: pointer; }
  .menu-button span { position: absolute; left: 11px; width: 22px; height: 1px; background: currentColor; transition: transform .2s ease, top .2s ease; }
  .menu-button span:first-child { top: 18px; } .menu-button span:last-child { top: 25px; }
  .menu-button[aria-expanded='true'] span:first-child { top: 22px; transform: rotate(45deg); }
  .menu-button[aria-expanded='true'] span:last-child { top: 22px; transform: rotate(-45deg); }
}
</style>
