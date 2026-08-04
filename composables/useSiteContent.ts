import siteConfigData from '~/content/site.json'
import koSiteData from '~/content/locales/ko/site.json'
import enSiteData from '~/content/locales/en/site.json'
import type { LocaleCode, LocalizedSite, SiteConfig } from '~/types/content'

const config = siteConfigData as SiteConfig
const localeContent: Record<LocaleCode, LocalizedSite> = { ko: koSiteData as LocalizedSite, en: enSiteData as LocalizedSite }

export function useSiteContent() {
  const { locale } = useLocale()
  const content = computed(() => localeContent[locale.value] ?? localeContent[config.defaultLocale])
  return { config, content }
}
