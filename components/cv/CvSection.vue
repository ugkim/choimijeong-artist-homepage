<script setup lang="ts">
import type { LocalizedCvSection } from '~/types/content'
defineProps<{ section: LocalizedCvSection; headingId?: string }>()
const yearLabel = (year: number | null, endYear: number | null) => {
  if (year === null) return ''
  return endYear && endYear !== year ? `${year}–${endYear}` : String(year)
}
</script>

<template>
  <section class="cv-section" :aria-labelledby="headingId">
    <h2 :id="headingId">{{ section.title }}</h2>
    <ol v-if="section.entries.length" class="cv-entries">
      <li v-for="entry in section.entries" :key="entry.id">
        <time v-if="entry.year !== null" :datetime="String(entry.year)">{{ yearLabel(entry.year, entry.endYear) }}</time>
        <div class="entry-copy">
          <h3><a v-if="entry.url" :href="entry.url">{{ entry.title }} <span aria-hidden="true">↗</span></a><template v-else>{{ entry.title }}</template></h3>
          <p v-if="entry.venue || entry.location" class="meta"><span v-if="entry.venue">{{ entry.venue }}</span><span v-if="entry.location">{{ entry.location }}</span></p>
          <p v-if="entry.description" class="description">{{ entry.description }}</p>
        </div>
      </li>
    </ol>
  </section>
</template>

<style scoped lang="scss">
.cv-section { padding-block: clamp(2rem, 4vw, 4rem); border-top: 1px solid var(--color-line); }
h2 { margin: 0 0 2.5rem; font-family: var(--font-serif); font-size: clamp(1.6rem, 3vw, 2.8rem); font-weight: 400; }
.cv-entries { display: grid; gap: 1.8rem; margin: 0; padding: 0; list-style: none; }
li { display: grid; grid-template-columns: 6rem minmax(0,1fr); gap: 1.5rem; }
time { color: var(--accent-strong); font-size: .72rem; letter-spacing: .06em; }
h3 { margin: 0; font-size: .92rem; font-weight: 400; line-height: 1.7; }
h3 a { text-decoration: underline; text-decoration-color: var(--color-line); text-underline-offset: .25rem; }
.meta,.description { margin: .3rem 0 0; color: var(--color-muted); font-size: .76rem; line-height: 1.75; }
.meta span + span::before { content: ' · '; }
@media (max-width: 540px) { li { grid-template-columns: 4.5rem minmax(0,1fr); gap: .8rem; } }
</style>
