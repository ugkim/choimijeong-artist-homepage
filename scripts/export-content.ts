import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue }
const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const defaultData = JSON.parse(readFileSync(join(root, 'content/data/ko.json'), 'utf8'))
const locales = defaultData.meta.availableLocales as string[]
const output = join(root, 'public/data')
mkdirSync(output, { recursive: true })

const escapeCsv = (value: string) => `"${value.replaceAll('"', '""')}"`
function flatten(value: JsonValue, path = '$', rows: Array<[string, string]> = []): Array<[string, string]> {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      const id = item && typeof item === 'object' && !Array.isArray(item) && typeof item.id === 'string' ? `id=${item.id}` : String(index)
      flatten(item, `${path}[${id}]`, rows)
    })
  } else if (value !== null && typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) => flatten(item, `${path}.${key}`, rows))
  } else {
    rows.push([path, value === null ? 'null' : String(value)])
  }
  return rows
}

for (const locale of locales) {
  const source = readFileSync(join(root, `content/data/${locale}.json`), 'utf8')
  const data = JSON.parse(source) as JsonValue
  writeFileSync(join(output, `${locale}.json`), source)
  const csv = [['key', 'value'], ...flatten(data)].map(row => row.map(escapeCsv).join(',')).join('\n')
  writeFileSync(join(output, `${locale}.csv`), `\uFEFF${csv}\n`)
}

console.log(`JSON/CSV 내보내기 완료: ${locales.map(locale => `/data/${locale}.{json,csv}`).join(', ')}`)
