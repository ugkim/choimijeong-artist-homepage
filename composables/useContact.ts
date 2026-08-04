import koData from '~/content/data/ko.json'
import enData from '~/content/data/en.json'
import type { LocaleBundle, LocaleCode } from '~/types/content'

const bundles: Record<LocaleCode, LocaleBundle> = { ko: koData as LocaleBundle, en: enData as LocaleBundle }
const siteConfig = bundles.ko.site.settings
const contactConfig = bundles[siteConfig.defaultLocale].contact.settings
export function useContact() {
  const { locale } = useLocale()
  const content = computed(() => (bundles[locale.value] ?? bundles[siteConfig.defaultLocale]).contact.content)
  const socials = computed(() => [
    { label: 'Instagram', url: contactConfig.instagram }, { label: 'YouTube', url: contactConfig.youtube },
    { label: 'Vimeo', url: contactConfig.vimeo }, { label: 'Threads', url: contactConfig.threads }
  ].filter(item => item.url))
  return { config: contactConfig, content, socials }
}
