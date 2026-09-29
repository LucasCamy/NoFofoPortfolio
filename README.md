# Nó Fofo Portfolio

Responsive React + TypeScript + Vite portfolio for Nó Fofo, with a filterable catalog and WhatsApp contact.

## Development

The application lives in `NoFofoPortfolio/`.

```sh
cd NoFofoPortfolio
npm ci
npm run dev
```

Run `npm run build` to type-check and build the production site. Run `npm run preview` to preview the compiled output.

## Docker

From `NoFofoPortfolio/`, build and start the production container:

```sh
docker compose up -d --build
```

The portfolio is available at http://localhost:32050. Stop it with `docker compose down`.

## Deployment

GitHub Actions builds and deploys to GitHub Pages automatically on every push to `main`. You can also run **Deploy portfolio to GitHub Pages** manually from the Actions tab.

- Workflow: `.github/workflows/deploy.yml`
- Hosting source: repository **Settings → Pages → GitHub Actions**
- Website: https://igorsantanam.github.io/NoFofoPortfolio/
- Authentication: the workflow uses GitHub's built-in token; no personal access token or repository secret is required.

The workflow reads the Pages base path and supplies `PAGES_BASE_PATH` to Vite. The logo, favicon and catalog images respect that path. Local development and other hosting providers default to `/` when the variable is unset.

## Content

Edit `NoFofoPortfolio/src/content.ts` to update WhatsApp, catalog descriptions and product order. Add photos to `NoFofoPortfolio/public/pecas/`, use paths such as `/pecas/example.jpg`, and supply descriptive `imageAlt` text. Remote HTTPS image URLs are also supported. Set `provisional: false` only after replacing demonstration content with real product information.

The app source is tracked directly in this repository, not as a submodule. Dependencies, generated builds and local QA files are excluded from Git.

## Search visibility

The canonical website is https://nofofo.cloudlane.com.br/. Builds include rendered page content, local metadata for Campo Grande, brand structured data and crawler files. Run `npm run test:seo` after building. See [SEO deployment and Google Search Console steps](SEO-DEPLOYMENT.md) for the Docker server handoff.
