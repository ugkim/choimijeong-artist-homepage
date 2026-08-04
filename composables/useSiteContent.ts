import koData from '~/content/data/ko.json'
import enData from '~/content/data/en.json'
import type { LocaleBundle, LocaleCode } from '~/types/content'

const bundles: Record<LocaleCode, LocaleBundle> = { ko: koData as LocaleBundle, en: enData as LocaleBundle }
const config = bundles.ko.site.settings

export function useSiteContent() {
  const { locale } = useLocale()
  const content = computed(() => (bundles[locale.value] ?? bundles[config.defaultLocale]).site.content)
  return { config, content }
}
