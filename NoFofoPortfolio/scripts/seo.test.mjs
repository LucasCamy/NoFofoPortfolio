import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const html = readFileSync('dist/index.html', 'utf8')
const canonical = 'https://nofofo.cloudlane.com.br/'
const base = process.env.PAGES_BASE_PATH || '/'

test('production HTML contains the visible portfolio before JavaScript executes', () => {
  assert.match(html, /<main\b/)
  assert.equal((html.match(/<h1\b/g) || []).length, 1)
  assert.match(html, /Campo Grande/)
  assert.match(html, /class="creation-description"/)
  assert.match(html, /https:\/\/wa\.me\//)
  assert.doesNotMatch(html, /<div id="root"><\/div>/)
})

test('canonical, structured data and crawler files point at the production domain', () => {
  assert.ok(html.includes(`rel="canonical" href="${canonical}"`))
  const json = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
  assert.ok(json)
  const schema = JSON.parse(json[1])
  const brand = schema['@graph'].find(item => item['@type'] === 'Organization')
  assert.equal(brand.name, 'Nó Fofo')
  assert.equal(brand.areaServed.name, 'Campo Grande')
  assert.equal(brand.url, canonical)
  assert.match(readFileSync('dist/robots.txt', 'utf8'), /Allow: \/\n/)
  assert.ok(readFileSync('dist/robots.txt', 'utf8').includes(`Sitemap: ${canonical}sitemap.xml`))
  const sitemap = readFileSync('dist/sitemap.xml', 'utf8')
  assert.equal((sitemap.match(/<loc>/g) || []).length, 1)
  assert.ok(sitemap.includes(`<loc>${canonical}</loc>`))
  assert.match(sitemap, /<image:loc>/)
})

test('rendered local scripts, styles and photographs exist under the deployment base', () => {
  const urls = [...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map(match => match[1])
    .filter(url => !/^(?:https?:|mailto:|tel:|data:|blob:)/i.test(url))
  assert.ok(urls.some(url => url.endsWith('.js')))
  assert.ok(urls.some(url => url.endsWith('.css')))
  assert.ok(urls.some(url => url.includes('/creations/')))
  for (const url of urls) {
    assert.ok(url.startsWith(base), `Wrong base path: ${url}`)
    const relative = decodeURIComponent(url.slice(base.length).split(/[?#]/)[0])
    assert.ok(existsSync(resolve('dist', relative)), `Missing deployed file: ${url}`)
  }
})
