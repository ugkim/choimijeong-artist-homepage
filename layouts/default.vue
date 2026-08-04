<script setup lang="ts">
const menuOpen = ref(false)
const route = useRoute()
watch(() => route.fullPath, () => { menuOpen.value = false })
</script>

<template>
  <div class="site-frame">
    <a class="skip-link" href="#main-content">Skip to content</a>
    <ArtistSidebar />
    <MobileHeader :expanded="menuOpen" @toggle="menuOpen = !menuOpen" />
    <MobileMenu :open="menuOpen" @close="menuOpen = false" />
    <main id="main-content"><slot /></main>
    <SiteFooter />
  </div>
</template>
