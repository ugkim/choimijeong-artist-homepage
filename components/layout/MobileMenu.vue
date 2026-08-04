<script setup lang="ts">
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()
const { config, content } = useSiteContent()
const { localePath } = useLocale()
const route = useRoute()
const panel = ref<HTMLElement | null>(null)
const isActive = (path: string) => path === '/' ? /^\/(en)?\/?$/.test(route.path) : route.path === localePath(path) || route.path.startsWith(`${localePath(path)}/`)

const focusables = () => Array.from(panel.value?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [])
const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') emit('close')
  if (event.key !== 'Tab') return
  const items = focusables(); if (!items.length) return
  const first = items[0]; const last = items[items.length - 1]
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
}
watch(() => props.open, async open => {
  if (!import.meta.client) return
  document.body.classList.toggle('menu-open', open)
  if (open) { await nextTick(); focusables()[0]?.focus() }
})
onBeforeUnmount(() => { if (import.meta.client) document.body.classList.remove('menu-open') })
</script>

<template>
  <Transition name="menu-fade">
    <div v-if="open" class="menu-backdrop" @click.self="$emit('close')">
      <div id="mobile-menu" ref="panel" class="mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation menu" @keydown="onKeydown">
        <nav aria-label="Mobile navigation">
          <NuxtLink v-for="item in config.menu" :key="item.id" :to="localePath(item.path)" :aria-current="isActive(item.path) ? 'page' : undefined" @click="$emit('close')">{{ content.menu[item.id] }}</NuxtLink>
        </nav>
        <div class="menu-meta"><LanguageSelector /><SocialLinks :socials="config.socials" /></div>
      </div>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.menu-backdrop { position: fixed; inset: 0; z-index: 40; background: rgba(28,28,27,.15); }
.mobile-menu { display: flex; flex-direction: column; min-height: 100dvh; padding: calc(var(--mobile-header-height) + 3.5rem) var(--page-padding) 2rem; background: var(--color-bg); }
nav { display: flex; flex-direction: column; align-items: flex-start; gap: 1rem; font-family: var(--font-serif); font-size: clamp(2rem, 10vw, 3.5rem); line-height: 1.05; }
nav a:hover,nav a[aria-current='page'] { color: var(--accent-strong); }
.menu-meta { display: grid; gap: 1.5rem; margin-top: auto; padding-top: 3rem; }
.menu-fade-enter-active,.menu-fade-leave-active { transition: opacity .2s ease; }
.menu-fade-enter-from,.menu-fade-leave-to { opacity: 0; }
@media (min-width: 768px) { .menu-backdrop { display: none; } }
</style>
