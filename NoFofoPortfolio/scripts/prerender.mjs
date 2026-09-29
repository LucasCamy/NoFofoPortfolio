import { readFile, writeFile } from 'node:fs/promises'
import { createServer } from 'vite'

// Render the same React tree that the browser hydrates. No separate crawler-only content.
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
try {
  const { prerender } = await server.ssrLoadModule('/src/entry-server.tsx')
  const { html, structuredData, url, imageUrls } = prerender()
  const template = await readFile('dist/index.html', 'utf8')
  if (!template.includes('<div id="root"></div>') || !template.includes('<!--seo-structured-data-->')) {
    throw new Error('Expected HTML placeholders are missing; refusing to publish an empty shell.')
  }
  const json = JSON.stringify(structuredData).replace(/</g, '\\u003c')
  await writeFile('dist/index.html', template
    .replace('<div id="root"></div>', () => `<div id="root">${html}</div>`)
    .replace('<!--seo-structured-data-->', () => `<script type="application/ld+json">${json}</script>`))
  const escapeXml = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
  const images = imageUrls.map(image => `    <image:image><image:loc>${escapeXml(image)}</image:loc></image:image>`).join('\n')
  await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n  <url>\n    <loc>${escapeXml(url)}</loc>\n${images}\n  </url>\n</urlset>\n`)
  await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${url}sitemap.xml\n`)
  console.log(`Prerendered home page, brand structured data, robots.txt and sitemap with ${imageUrls.length} photos.`)
} finally {
  await server.close()
}
