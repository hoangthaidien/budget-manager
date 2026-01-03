# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

  ## Deploy to Cloudflare Pages

  This project is a Vite SPA. For Cloudflare Pages, the key settings are:

  - Build command: `npm run build`
  - Build output directory: `dist`
  - SPA routing fallback: add a `_redirects` file (already included at `public/_redirects`)

  ### Option A: Deploy via Cloudflare Dashboard (recommended)

  1. Push the repo to GitHub/GitLab.
  2. In Cloudflare Dashboard → **Pages** → **Create a project** → connect your repo.
  3. In **Build settings**:
    - Framework preset: **Vite**
    - Build command: `npm run build`
    - Build output directory: `dist`
  4. In **Environment variables**, add the variables used by the app (see `src/lib/appwrite.ts` and `src/lib/constants.ts`):
    - `VITE_APPWRITE_ENDPOINT`
    - `VITE_APPWRITE_PROJECT_ID`
    - `VITE_APPWRITE_DATABASE_ID`
    - `VITE_APPWRITE_COLLECTION_FAMILIES_ID`
    - `VITE_APPWRITE_COLLECTION_FAMILY_MEMBERS_ID`
    - `VITE_APPWRITE_COLLECTION_CATEGORIES_ID`
    - `VITE_APPWRITE_COLLECTION_TRANSACTIONS_ID`
    - `VITE_APPWRITE_COLLECTION_BUDGETS_ID`
    - `VITE_APPWRITE_COLLECTION_TAGS_ID`

  Cloudflare Pages will rebuild and redeploy on every push.

  ### Option B: Deploy from your machine with Wrangler

  ```bash
  npm run build
  npx wrangler pages deploy dist
  ```

  ### Custom domain

  In Cloudflare Dashboard → **Pages** → your project → **Custom domains**:

  - Add your domain/subdomain (e.g. `app.example.com` or `example.com`).
  - If your domain is already on Cloudflare DNS, it can usually auto-configure the DNS records.
  - Once active, Pages will serve your site on that domain.

