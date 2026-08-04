export function absoluteAssetUrl(value: string, siteUrl: string): string {
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value
  return `${siteUrl}${value.startsWith('/') ? '' : '/'}${value}`
}
