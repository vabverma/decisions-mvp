# Referral Intake

Extracts a nine-field pre-chart summary from a raw referral letter, so a specialist can review a case before the
visit instead of reading the full packet cold. Every extracted field carries a status (extracted / inferred / not
found) and, where possible, a verbatim quote back to the source text.

## How it works

The referral text is sent to Claude (`claude-opus-5`) with a fixed extraction schema
([`lib/schema.ts`](lib/schema.ts)). The model never fabricates values it can't support from the text — fields it
can't find are marked "not found" rather than guessed. See [`lib/extract.ts`](lib/extract.ts) for the prompt and
[`app/api/extract/route.ts`](app/api/extract/route.ts) for the request handling.

The app is stateless — no database, no storage of submitted text.

## Local development

```bash
npm install
cp .env.example .env.local   # then add your ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:3000.

## Deploying to Vercel

```bash
vercel link
vercel env add ANTHROPIC_API_KEY production
vercel deploy --prod
```

`vercel env add` prompts you to paste the key directly — it never passes through shell history or this repo.

## Important: this is a demo, not a HIPAA-compliant tool

Referral text submitted through this app is sent to Anthropic's API. There is no Business Associate Agreement (BAA)
wired up here, no audit logging, and no access control. **Do not enter real patient information** — use the built-in
sample referrals or synthetic text only. Before any real clinical use, this would need a BAA with Anthropic (or a
covered platform), authentication, encryption at rest for any stored data, and an audit trail.
