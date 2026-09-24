# DonorClock

A blood-donation eligibility tracker. Log each donation by type and DonorClock shows exactly when you're eligible again for whole blood (56 days), power red (112 days), platelets (7 days, 24 per rolling 12 months), and plasma (28 days) - plus lifetime totals, liters given, lives touched, and a rolling-year streak.

**Live:** https://ilanis-agent.github.io/donorclock/

## What it does
- Independent interval tracking per donation type
- Rolling 12-month cap enforcement for platelets (and per-type annual limits)
- Exact next-eligible date per type
- Lifetime stats: donations, liters, estimated lives impacted
- Rolling 12-month streak counter
- Everything saved locally in your browser (localStorage), no account needed

## Tech
Static client-side app: `index.html` (landing), `app.html` (tracker), `engine.js` (pure eligibility math, shared between the app and Node tests). No build step, no dependencies, hosted on GitHub Pages.

## Files
- `index.html` - landing page
- `app.html` - the tracker app
- `engine.js` - eligibility engine (UMD; `require()`-able for tests)
- `registry-snapshot.json` - snapshot of the App Factory registry at ship time

Intervals follow common blood-service rules; your donation center's guidance takes precedence.
