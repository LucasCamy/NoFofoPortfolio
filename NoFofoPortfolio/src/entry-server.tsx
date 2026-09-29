import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'
import { siteConfig, creations } from './content'

export function prerender() {
  const url = 'https://nofofo.cloudlane.com.br/'
  const organizationId = `${url}#organization`
  const websiteId = `${url}#website`
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': organizationId,
        name: 'Nó Fofo',
        url,
        logo: { '@type': 'ImageObject', url: `${url}logo-no-fofo.jpeg`, width: 1254, height: 1254 },
        description: 'Crochê, amigurumis e encomendas personalizadas em Campo Grande, Mato Grosso do Sul.',
        areaServed: { '@type': 'City', name: 'Campo Grande', containedInPlace: { '@type': 'State', name: 'Mato Grosso do Sul' } },
        ...(siteConfig.whatsappNumber ? { telephone: `+${siteConfig.whatsappNumber}` } : {}),
        ...(siteConfig.instagramUrl ? { sameAs: [siteConfig.instagramUrl] } : {}),
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        name: 'Nó Fofo',
        alternateName: 'No Fofo',
        url,
        inLanguage: 'pt-BR',
        publisher: { '@id': organizationId },
      },
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: 'Nó Fofo | Crochê e Amigurumi em Campo Grande, MS',
        inLanguage: 'pt-BR',
        isPartOf: { '@id': websiteId },
        about: { '@id': organizationId },
      },
    ],
  }
  const imageUrls = [...new Set(creations.filter(c => !c.provisional).flatMap(c => [c.image, ...(c.gallery?.map(photo => photo.image) ?? [])]).filter((image): image is string => Boolean(image)).map(image => new URL(image, url).href))]
  return { html: renderToString(createElement(App)), structuredData, url, imageUrls }
}
