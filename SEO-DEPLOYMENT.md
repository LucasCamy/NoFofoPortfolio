# Search visibility and production deployment

Canonical website: https://nofofo.cloudlane.com.br/
Target locality confirmed by the owner: Campo Grande, Mato Grosso do Sul.

## What this update changes

- Search title and description identify crochê, amigurumi and Campo Grande, MS.
- The same React content visitors use is rendered into the HTML at build time, then hydrated for filters and dialogs. There is no separate crawler-only copy.
- `robots.txt`, a sitemap containing the home page and real catalog images, and Organization/WebSite/WebPage structured data are generated from the build.
- No prices, ratings, street address, nationwide shipping or opening hours are invented.
- The custom domain is canonical, including when the same build is served on GitHub Pages.
- Nginx serves crawler files correctly and returns real 404 responses for missing pages instead of a homepage with status 200.

## Deployment required on the Docker server

The custom domain uses Docker Compose behind a Cloudflare tunnel. A successful GitHub Pages workflow does **not** update that container. The server operator should run the following from the root of the existing repository checkout (the folder containing the README and inner NoFofoPortfolio folder):

```sh
git status --short
# Resolve any local server changes before pulling; do not discard them.
git pull --ff-only origin main
cd NoFofoPortfolio
docker compose up -d --build portfolio
```

This rebuilds the portfolio service; it does not require stopping or changing the Cloudflare tunnel. The public origin remains port 32050. Keep the current tunnel routing and DNS.

Check:

```sh
curl -fsS https://nofofo.cloudlane.com.br/robots.txt
curl -fsS https://nofofo.cloudlane.com.br/sitemap.xml
curl -fsS https://nofofo.cloudlane.com.br/ | grep 'Campo Grande'
curl -I https://nofofo.cloudlane.com.br/this-page-does-not-exist
```

The first two responses must be text/XML, not the HTML homepage. The home page source must contain the visible portfolio content and canonical URL. The last request should return 404.

If Cloudflare continues serving the older responses, purge only the cached home page, robots.txt and sitemap.xml URLs. Confirm that HTTP redirects to HTTPS and that Googlebot is not challenged or blocked by an access rule. Do not disable security across the whole zone.

## Google Search Console — owner action

1. Open https://search.google.com/search-console/ and add the URL-prefix property `https://nofofo.cloudlane.com.br/`.
2. Complete ownership verification. The HTML tag or HTML verification file can be added to this repository and deployed by the server operator; alternatively, ask the DNS administrator to add Google's exact verification TXT record. Do not share account passwords or private keys.
3. After the Docker update is live, submit `https://nofofo.cloudlane.com.br/sitemap.xml` in Sitemaps.
4. Inspect the home-page URL, use Test live URL, then Request indexing. Review indexing and search performance over the following weeks.

The repository changes do not verify ownership, submit a sitemap to the user's Google account, or guarantee indexing/rankings. No Search Console verification code was supplied.

## Next content steps

Use the official domain consistently on Instagram and legitimate business profiles. Keep the real product photos and descriptions up to date. Confirm delivery areas before adding them. If eligible, the owner can create or update a Google Business Profile for Campo Grande; do not invent a storefront address or publish a private address simply for rankings.

Google guidance:
- https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.google.com/search/docs/appearance/site-names
