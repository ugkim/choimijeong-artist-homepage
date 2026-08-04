export interface ImageOptimizationOptions {
  maxLongEdge: number
  maxBytes: number
  initialQuality: number
  minimumQuality: number
  qualityStep: number
  preservePngTransparency: boolean
}

export interface OptimizedImage {
  file: File
  width: number
  height: number
  quality: number
  format: 'image/webp' | 'image/png'
}

const defaults: ImageOptimizationOptions = {
  maxLongEdge: 2048, maxBytes: 1024 * 1024, initialQuality: .84,
  minimumQuality: .6, qualityStep: .05, preservePngTransparency: true
}

const canvasBlob = (canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> =>
  new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Image encoding failed.')), type, quality))

export async function optimizeImage(input: File, overrides: Partial<ImageOptimizationOptions> = {}): Promise<OptimizedImage> {
  const options = { ...defaults, ...overrides }
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(input.type)) throw new Error('Only JPG, PNG, and WebP images are supported.')
  const bitmap = await createImageBitmap(input)
  const scale = Math.min(1, options.maxLongEdge / Math.max(bitmap.width, bitmap.height))
  let width = Math.max(1, Math.round(bitmap.width * scale)); let height = Math.max(1, Math.round(bitmap.height * scale))
  const format = input.type === 'image/png' && options.preservePngTransparency ? 'image/png' : 'image/webp'
  let quality = options.initialQuality; let blob: Blob

  while (true) {
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height
    const context = canvas.getContext('2d', { alpha: format === 'image/png' })
    if (!context) throw new Error('Canvas is unavailable.')
    context.drawImage(bitmap, 0, 0, width, height)
    blob = await canvasBlob(canvas, format, quality)
    if (blob.size <= options.maxBytes) break
    if (format === 'image/webp' && quality - options.qualityStep >= options.minimumQuality) quality = Number((quality - options.qualityStep).toFixed(2))
    else { width = Math.max(1, Math.round(width * .9)); height = Math.max(1, Math.round(height * .9)); quality = options.initialQuality }
    if (Math.max(width, height) < 640) throw new Error('The image could not be reduced below 1 MB without unacceptable resolution loss.')
  }
  bitmap.close()
  const extension = format === 'image/png' ? 'png' : 'webp'
  const filename = `${input.name.replace(/\.[^.]+$/, '')}.${extension}`
  return { file: new File([blob], filename, { type: format, lastModified: Date.now() }), width, height, quality, format }
}
