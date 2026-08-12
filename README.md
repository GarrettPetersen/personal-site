# garrettpetersen.com

Personal site for Garrett Petersen. It is a fully static [Astro](https://astro.build/) build intended for Cloudflare Pages.

## Local development

```sh
npm install
npm run dev
```

Run the production checks with:

```sh
npm run check
npm run build
```

## Cloudflare Pages

Connect the `GarrettPetersen/personal-site` GitHub repository to Cloudflare Pages with:

- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `dist`
- Node version: `22`

Both `garrettpetersen.com` and `www.garrettpetersen.com` should be attached as custom domains. The site treats the apex domain as canonical and redirects `www` to it.
