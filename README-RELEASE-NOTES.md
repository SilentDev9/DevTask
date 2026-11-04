# DevTask update notes

This update adds a refreshed app identity, a responsive mobile More menu (About, Support, language), compatible language helper export, improved registration screen and password visibility controls, mobile safe-area/touch styles, and a PWA manifest served from `public`.

## Important before release
- Verify all remaining hard-coded strings page by page; this is not yet a certified complete translation.
- Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` locally in `.env.local` (never commit secrets).
- Confirm production `base` and `start_url`/`scope` for the actual deployment path.
- Support form is still a local demo and does not send messages.
- Google/GitHub buttons are not wired to OAuth.
- Run `npm ci`, `npm run build`, and test on real Android devices before publishing.

## Notification, typography, and statistics icon update

- Fixed notification layout with a three-column grid, safe wrapping for long messages, and language-aware RTL/LTR direction.
- Bundled Noto Sans Arabic regular, medium, semibold, and bold font files locally so Persian typography works without a remote font request.
- Replaced the four statistics metric icons with inline SVG icons so they do not depend on icon-font glyph availability.
- Noto Sans Arabic is distributed under the SIL Open Font License; the license/copyright text is included beside the bundled font files.
