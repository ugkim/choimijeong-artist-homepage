<script setup lang="ts">
import type { LocalizedArtwork } from '~/types/content'
const props = defineProps<{
  open: boolean; artwork: LocalizedArtwork; closeLabel: string; zoomInLabel: string; zoomOutLabel: string; resetLabel: string
}>()
const emit = defineEmits<{ close: [] }>()
const dialog = ref<HTMLElement | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)
const scale = ref(1)
const offset = reactive({ x: 0, y: 0 })
const drag = reactive({ active: false, startX: 0, startY: 0, originX: 0, originY: 0 })
let returnFocus: HTMLElement | null = null

const reset = () => { scale.value = 1; offset.x = 0; offset.y = 0 }
const setScale = (next: number) => { scale.value = Math.min(4, Math.max(1, Number(next.toFixed(2)))); if (scale.value === 1) { offset.x = 0; offset.y = 0 } }
const focusables = () => Array.from(dialog.value?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]') ?? [])
const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') emit('close')
  if (event.key !== 'Tab') return
  const items = focusables(); const first = items[0]; const last = items[items.length - 1]
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
}
const onPointerDown = (event: PointerEvent) => {
  if (event.pointerType !== 'mouse' || scale.value <= 1) return
  event.preventDefault(); drag.active = true; drag.startX = event.clientX; drag.startY = event.clientY; drag.originX = offset.x; drag.originY = offset.y
}
const onPointerMove = (event: PointerEvent) => {
  if (!drag.active) return
  offset.x = drag.originX + event.clientX - drag.startX; offset.y = drag.originY + event.clientY - drag.startY
}
const stopDrag = () => { drag.active = false }

watch(() => props.open, async open => {
  if (!import.meta.client) return
  document.body.classList.toggle('lightbox-open', open)
  if (open) { returnFocus = document.activeElement as HTMLElement; reset(); await nextTick(); closeButton.value?.focus() }
  else { returnFocus?.focus(); returnFocus = null }
})
onBeforeUnmount(() => { if (import.meta.client) document.body.classList.remove('lightbox-open') })
</script>

<template>
  <Teleport to="body">
    <Transition name="lightbox-fade">
      <div v-if="open" class="lightbox-backdrop" @click.self="$emit('close')">
        <section ref="dialog" class="lightbox" role="dialog" aria-modal="true" :aria-label="artwork.title" @keydown="onKeydown">
          <div class="lightbox-toolbar">
            <button type="button" :aria-label="zoomOutLabel" :disabled="scale <= 1" @click="setScale(scale - .25)">−</button>
            <button type="button" :aria-label="resetLabel" :disabled="scale === 1" @click="reset">{{ Math.round(scale * 100) }}%</button>
            <button type="button" :aria-label="zoomInLabel" :disabled="scale >= 4" @click="setScale(scale + .25)">+</button>
            <button ref="closeButton" class="close" type="button" :aria-label="closeLabel" @click="$emit('close')">×</button>
          </div>
          <div class="lightbox-stage" :class="{ 'is-draggable': scale > 1 }" @pointerdown="onPointerDown" @pointermove="onPointerMove" @pointerup="stopDrag" @pointercancel="stopDrag" @pointerleave="stopDrag">
            <img :src="artwork.image" :alt="artwork.alt" :width="artwork.imageWidth" :height="artwork.imageHeight" draggable="false"
              :style="{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`, backgroundColor: artwork.backgroundColor ?? 'transparent', objectPosition: artwork.objectPosition ?? 'center' }">
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.lightbox-backdrop { position: fixed; inset: 0; z-index: 100; display: grid; place-items: center; padding: 1rem; background: rgba(15,15,14,.94); }
.lightbox { display: flex; flex-direction: column; width: 100%; height: 100%; color: #f5f2ec; }
.lightbox-toolbar { z-index: 2; display: flex; justify-content: flex-end; gap: .25rem; }
button { min-width: 44px; min-height: 44px; border: 1px solid rgba(255,255,255,.28); background: transparent; color: inherit; cursor: pointer; }
button:disabled { opacity: .35; cursor: default; }
.close { margin-left: .75rem; font-size: 1.5rem; }
.lightbox-stage { display: grid; flex: 1; place-items: center; overflow: hidden; min-height: 0; touch-action: auto; }
.lightbox-stage.is-draggable { cursor: grab; }
img { display: block; max-width: 100%; max-height: calc(100dvh - 6rem); object-fit: contain; transform-origin: center; transition: transform .18s ease; user-select: none; }
.lightbox-stage.is-draggable img { transition: none; }
.lightbox-fade-enter-active,.lightbox-fade-leave-active { transition: opacity .2s ease; }
.lightbox-fade-enter-from,.lightbox-fade-leave-to { opacity: 0; }
</style>

<style lang="scss">body.lightbox-open { overflow: hidden; }</style>
