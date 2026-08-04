(function () {
  const settings = { maxLongEdge: 2048, maxBytes: 1048576, initialQuality: 0.84, minimumQuality: 0.6, qualityStep: 0.05 };
  const toBlob = (canvas, type, quality) => new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Image encoding failed.')), type, quality));
  window.optimizeArtworkImage = async function (file) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Only JPG, PNG, and WebP images are supported.');
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, settings.maxLongEdge / Math.max(bitmap.width, bitmap.height));
    let width = Math.max(1, Math.round(bitmap.width * scale)); let height = Math.max(1, Math.round(bitmap.height * scale));
    const type = file.type === 'image/png' ? 'image/png' : 'image/webp'; let quality = settings.initialQuality; let blob;
    while (true) {
      const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
      const context = canvas.getContext('2d', { alpha: type === 'image/png' });
      if (!context) throw new Error('Canvas is unavailable.');
      context.drawImage(bitmap, 0, 0, width, height); blob = await toBlob(canvas, type, quality);
      if (blob.size <= settings.maxBytes) break;
      if (type === 'image/webp' && quality - settings.qualityStep >= settings.minimumQuality) quality = Number((quality - settings.qualityStep).toFixed(2));
      else { width = Math.round(width * .9); height = Math.round(height * .9); quality = settings.initialQuality; }
      if (Math.max(width, height) < 640) throw new Error('Image optimization failed: unable to meet the 1 MB limit.');
    }
    bitmap.close(); const extension = type === 'image/png' ? 'png' : 'webp';
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.' + extension, { type, lastModified: Date.now() });
  };
}());
