# QAINN — Music Index (MVP)

A static, working first version of the music-review site.

## What is included

- 83 ratings imported from the supplied Excel workbook
- Home page with live average, median, replay-line count, and 8+ count
- Searchable/filterable leaderboard
- Individual song pages
- Editorial scoring philosophy
- “Challenge this score” form
- Community challenge queue
- Challenges persist in the browser via `localStorage`
- Responsive mobile layout

## Run it locally

Because the site loads `data.json`, use a tiny local web server rather than double-clicking `index.html`.

### Python

```bash
cd qainn_reviews
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

### VS Code

You can also use the **Live Server** extension and open `index.html`.

## Deploy it

This folder can be deployed as-is to Vercel, Netlify, Cloudflare Pages, or GitHub Pages.

For a public community version, the next upgrade should replace browser `localStorage` with Supabase/Postgres so submissions are shared across users, then add authentication and moderation.

## Suggested V2 data model

- `songs`
- `artists`
- `reviews`
- `score_revisions`
- `users`
- `challenges`
- `challenge_responses`

The current UI is intentionally compatible with that direction: the local challenge object already contains `songId`, proposed score, argument type, argument text, timestamp/moment, and creation time.
