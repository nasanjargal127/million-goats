This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

This project uses [pnpm](https://pnpm.io) (version pinned in `package.json` → `packageManager`).

```bash
pnpm install
pnpm dev
```

### Code quality

| Command          | What it does                                                |
| ---------------- | ----------------------------------------------------------- |
| `pnpm lint`      | Biome lint + format check                                   |
| `pnpm format`    | Biome: apply formatting, import sorting and safe lint fixes |
| `pnpm typecheck` | Generate Next.js route types, then `tsc --noEmit`           |
| `pnpm knip`      | Find unused files, exports and dependencies                 |
| `pnpm check`     | All of the above (no writes)                                |

Git hooks (Husky, installed automatically by `pnpm install`):

- **pre-commit** — Biome formats and lints staged files; fixes are re-staged, errors block the commit.
- **pre-push** — `pnpm typecheck` and `pnpm knip`.

### Brand assets

Regenerate favicon, app icons, OG/Twitter images and web logos from `brand/`:

```bash
pnpm brand
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
