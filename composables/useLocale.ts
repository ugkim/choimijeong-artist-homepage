import siteData from '~/content/site.json'
import type { LocaleCode, SiteConfig } from '~/types/content'

const config = siteData as SiteConfig

export function useLocale() {
  const route = useRoute()
  const localeState = useState<LocaleCode>('locale', () => config.defaultLocale)
  const routeLocale = computed<LocaleCode>(() => {
    const param = Array.isArray(route.params.locale) ? route.params.locale[0] : route.params.locale
    const value = param ?? route.path.split('/').filter(Boolean)[0]
    return config.availableLocales.includes(value as LocaleCode) ? value as LocaleCode : config.defaultLocale
  })
  watch(routeLocale, value => { localeState.value = value }, { immediate: true })

  const localePath = (path: string, targetLocale: LocaleCode = localeState.value): string => {
    const normalized = path === '/' ? '' : `/${path.replace(/^\/+|\/+$/g, '')}`
    return targetLocale === config.defaultLocale ? normalized || '/' : `/${targetLocale}${normalized}`
  }
  const switchLocalePath = (targetLocale: LocaleCode): string => {
    const segments = route.path.split('/').filter(Boolean)
    if (config.availableLocales.includes(segments[0] as LocaleCode)) segments.shift()
    const path = localePath(`/${segments.join('/')}`, targetLocale)
    const query = new URLSearchParams()
    for (const [key, value] of Object.entries(route.query)) {
      for (const item of Array.isArray(value) ? value : [value]) if (item != null) query.append(key, String(item))
    }
    const search = query.toString()
    return `${path}${search ? `?${search}` : ''}${route.hash}`
  }
  return { locale: readonly(localeState), availableLocales: config.availableLocales, defaultLocale: config.defaultLocale, localePath, switchLocalePath }
}
