import siteData from '~/content/site.json'
import type { LocaleCode, SiteConfig } from '~/types/content'

export default defineNuxtRouteMiddleware(to => {
  const config = siteData as SiteConfig
  const rawLocale = Array.isArray(to.params.locale) ? to.params.locale[0] : to.params.locale
  if (rawLocale && !config.availableLocales.includes(rawLocale as LocaleCode)) return navigateTo('/404', { replace: true })
})
