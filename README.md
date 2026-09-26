# QAINN — Music Index v2

A static music-review publication and library built from the current QAINN ratings workbook.

## What's new in v2
- Light-blue editorial theme with improved contrast
- Professional boxed editorial score treatment with tier-specific styling
- 85 ratings imported from `Music_Rate_with_releases(1).xlsx`
- Search across song, artist, album/release and genre
- Library browsing by songs, artists, albums/releases, genres and score tiers
- Dedicated artist, album/release, genre and score-tier pages
- Contributor-aware artist pages for collaborations
- Leaderboard retained
- Song-level challenge UI retained (currently saved to the visitor's browser via `localStorage`)
- Existing `Without Me` cover preserved

## Important data note
The `Genres` field is a practical first-pass browsing taxonomy added for this website. It is meant to make the library usable now; it can be refined later as the catalogue grows.

## Files
- `index.html` — site shell/navigation
- `styles.css` — visual system and responsive layout
- `app.js` — routing, search, library, score UI and challenge UI
- `data.json` — 85-song website database
- `covers/` — locally hosted cover artwork

## Deploy to Vercel
If this repository is already connected to Vercel, replace the files in GitHub and commit them. Vercel should redeploy automatically.

## Challenge system limitation
Challenges currently live only in the user's browser. To make submissions shared across devices/users, the next step is connecting the form to a real database such as Supabase.
