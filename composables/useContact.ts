import contactData from '~/content/contact/index.json'
import koContactData from '~/content/locales/ko/contact.json'
import enContactData from '~/content/locales/en/contact.json'
import siteData from '~/content/site.json'
import type { ContactConfig, LocaleCode, LocalizedContact, SiteConfig } from '~/types/content'

const contactConfig = contactData as ContactConfig
const siteConfig = siteData as SiteConfig
const translations: Record<LocaleCode, LocalizedContact> = { ko: koContactData as LocalizedContact, en: enContactData as LocalizedContact }
export function useContact() {
  const { locale } = useLocale()
  const content = computed(() => translations[locale.value] ?? translations[siteConfig.defaultLocale])
  const socials = computed(() => [
    { label: 'Instagram', url: contactConfig.instagram }, { label: 'YouTube', url: contactConfig.youtube },
    { label: 'Vimeo', url: contactConfig.vimeo }, { label: 'Threads', url: contactConfig.threads }
  ].filter(item => item.url))
  return { config: contactConfig, content, socials }
}
