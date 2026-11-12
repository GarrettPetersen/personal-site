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

## Résumé

The public `/resume.pdf` asset is the compact résumé generated from `resume_short.md` in the [`GarrettPetersen/resume`](https://github.com/GarrettPetersen/resume) repository. Regenerate it there, then replace `public/resume.pdf` when the canonical résumé changes.

## Cloudflare Pages

Connect the `GarrettPetersen/personal-site` GitHub repository to Cloudflare Pages with:

- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `dist`
- Node version: `22`

Both `garrettpetersen.com` and `www.garrettpetersen.com` should be attached as custom domains. The site treats the apex domain as canonical and redirects `www` to it.

## Project desk

`/desk/` is a public dashboard linked from the home-page footer. It is excluded from the sitemap and requests no indexing; anyone with the URL can read it. `/desk.ics` exports confirmed dates and tentative internal reviews. The browser handles calendar navigation and freshness indicators; it does not expose an editing endpoint or require an account.

The public allowlist is `src/data/desk.json`. Keep the brief, next actions and project summaries short. Focus on Marque & Reprisal through its November 18, 2026 launch; Subject & Sovereign (`../subject-and-sovereign`) and Shaolin London (`../anime-games`) are next-game candidates, not production commitments. Twenty-Four Histories is secondary active work. Shipped projects stay in the collapsed archive unless the owner reactivates them.

Run `npm run desk:refresh` with an authenticated GitHub CLI to refresh aggregate repository activity and the published glossary coverage. This command replaces the snapshot only after every required source succeeds. It never copies commit titles, issue text, credentials or whole private reports. It does not advance editorial review, email or Steam observation times. Review CI against the actual release revision; a failed check on an older revision is not proof of a broken released build.

During the daily check-in:

1. Read this README, check the worktree and pull the production branch with `git pull --ff-only` only when clean. Preserve other ongoing work; use an isolated worktree for a snapshot update if this checkout is busy. Do not edit or commit another chat’s changes.
2. Run the source refresh. Inspect current project plans and open work read-only. Use the locally linked `plan-indie-game-marketing` skill for lifecycle decisions; it links directly to the sibling `indie-game-marketing-skills` checkout. All five skill links under `.agents/skills` are machine-local and ignored by Git.
3. Read relevant project email and later replies before proposing tasks. Publish only neutral, paraphrased actions. Never include names of correspondents, email addresses, message IDs, private links, keys, financial records, application answers or copied messages. Do not send replies, issue keys, spend money, submit applications or release games as part of a dashboard check-in.
4. Read Marque & Reprisal’s signed-in Steamworks lifetime wishlist overview and the last seven complete days. Keep outstanding wishlists distinct from period net movement. Current project reporting instructions are in `../polyglobe/apps/pixel-globe/tools/steam-marketing/README.md`; private reports remain outside this repository. Publish only the selected aggregate KPIs. If login or a source is unavailable, retain the old measurement and timestamp and report the specific gap in chat. Never substitute zero, infer a current balance from a partial window, or make a refreshed report appear to be a fresh observation.
5. Update the concise brief, owners, blockers, completed tasks and calendar using evidence. Distinguish confirmed external dates from suggested internal reviews. The submitted grant application is completed; up to $50,000 is potential funding pending a decision, not secured income. Monitor for clarification or a decision; do not resubmit. Do not invent a decision date.
6. Advance `reviewedAt` only after reviewing the portfolio. Preserve each metric’s actual source date. Run `npm test`, `npm run check`, `npm run build` and `git diff --check`; inspect the public diff. Commit only dashboard-related changes and push `main`, which triggers the existing Cloudflare Pages build. Verify the production snapshot before reporting a successful update. On a failed refresh or deployment, retain the last verified data and report the failure clearly.

The daily check-in maintains this dashboard and recommends priorities. Product fixes and external actions belong to their owning projects. The public page deliberately contains no raw inbox or private account data. A local Codex heartbeat provides the check-in, so it depends on the desktop environment being available.
