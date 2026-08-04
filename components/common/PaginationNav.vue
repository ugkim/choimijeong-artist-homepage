<script setup lang="ts">
const props = defineProps<{
  currentPage: number; totalPages: number; basePath: string; category?: string
  previousLabel: string; nextLabel: string; statusLabel: string
}>()
const pageTo = (page: number) => ({ path: props.basePath, query: { ...(props.category ? { category: props.category } : {}), ...(page > 1 ? { page: String(page) } : {}) } })
</script>

<template>
  <nav v-if="totalPages > 1" class="pagination" aria-label="Pagination">
    <div class="pagination-edge">
      <NuxtLink v-if="currentPage > 1" :to="pageTo(1)" aria-label="First page">←|</NuxtLink><span v-else aria-hidden="true">←|</span>
      <NuxtLink v-if="currentPage > 1" :to="pageTo(currentPage - 1)" :aria-label="previousLabel">←</NuxtLink><span v-else aria-hidden="true">←</span>
    </div>
    <p><span class="sr-only">{{ statusLabel }}</span><strong aria-current="page">{{ currentPage }}</strong><span aria-hidden="true"> / </span>{{ totalPages }}</p>
    <div class="pagination-edge">
      <NuxtLink v-if="currentPage < totalPages" :to="pageTo(currentPage + 1)" :aria-label="nextLabel">→</NuxtLink><span v-else aria-hidden="true">→</span>
      <NuxtLink v-if="currentPage < totalPages" :to="pageTo(totalPages)" aria-label="Last page">|→</NuxtLink><span v-else aria-hidden="true">|→</span>
    </div>
  </nav>
</template>

<style scoped lang="scss">
.pagination { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; margin-top: clamp(5rem, 10vw, 9rem); border-top: 1px solid var(--color-line); padding-top: 1.5rem; }
.pagination-edge { display: flex; gap: .25rem; }
.pagination-edge:last-child { justify-content: flex-end; }
a, .pagination-edge span { display: grid; place-items: center; min-width: 44px; min-height: 44px; font-size: .82rem; }
.pagination-edge span { color: var(--color-line); }
a:hover { color: var(--accent-strong); }
p { margin: 0; color: var(--color-muted); font-size: .72rem; letter-spacing: .12em; }
strong { color: var(--color-text); font-weight: 500; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; }
</style>
