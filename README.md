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

## Database (Neon + Prisma)

Copy `.env.example` to `.env` and fill it in. The app connects through the pooled
`DATABASE_URL`; the Prisma CLI uses the direct `DIRECT_URL`.

- Change the schema in `prisma/schema.prisma`, then create a migration with
  `pnpm db:migrate --name <change>` (applies it to the database in `.env`).
- **Production migrations run automatically**: Vercel production builds run
  `prisma migrate deploy` (`scripts/migrate-on-deploy.mjs`) before `next build`.
  A failed migration fails the build and the previous deployment stays live.
  Preview and local builds skip this step.
- Migrations run while the old deployment still serves traffic, so keep them
  backward-compatible: add columns/tables first, remove old ones in a later release.
- `pnpm db:seed` adds the Trading Lab (100 seats) and the merch T-shirt with sizes S–XXL (run it by hand).
- `pnpm db:studio` opens a table editor.

Note: local, preview and production currently share one Neon database.

## Telegram signal bot

Admins write a signal to the bot in a private chat (text, or one photo with a
caption). The bot replies "send this to the channel?"; on **✅ Илгээх** it copies
that exact message to the private channel and confirms with a link. Each signal
is a row in the `signal` table: a double tap or a redelivered update never posts
twice, and a failed send keeps a **🔁 Дахин илгээх** button.

1. Create the bot with @BotFather and add it to the channel as an admin with
   "Post messages".
2. Set the `TELEGRAM_*` variables from `.env.example` in `.env` and on Vercel
   (Production). Send `/start` to the bot to see your Telegram id for
   `TELEGRAM_ADMIN_IDS`.
3. Deploy, then run `pnpm telegram:setup` — it checks the bot can post to the
   channel and registers the webhook (`/api/telegram/webhook`).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
