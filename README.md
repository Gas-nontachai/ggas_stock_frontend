# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Environment Setup

Create a local environment file from the example:

```bash
cp .env.example .env
```

Adjust values in `.env` to match your backend endpoints.
- `APP_PORT` controls the Nuxt app port (default: `3000`)
- `NUXT_DEVTOOLS` controls Nuxt DevTools (default: `false`)

## Development Server

Start the development server on `http://localhost:<APP_PORT>`:

```bash
# npm
npm run dev

# npm (enable Nuxt DevTools for inspection)
npm run dev:inspect

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

Startup-time note:
- For cold start checks, use the log timings for `Vite client built`, `Vite server built`, and `Nuxt Nitro server built`.
- Do not use total terminal process runtime as startup latency because `nuxt dev` stays running.

Dependency maintenance note:
- If you see Browserslist warnings, run `npx update-browserslist-db@latest` occasionally.

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
