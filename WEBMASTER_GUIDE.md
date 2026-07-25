# GTTTA Webmaster Guide

This guide explains how to do every common task through the admin dashboard. You don't need to touch code for any of the tasks below.

---

## Logging in

Go to `https://your-site.com/admin`. Click "Sign in with Google" and use the club Google account. Only the email stored in `ADMIN_EMAIL` (set during deployment) can log in. If you're locked out, contact whoever manages the Vercel deployment to check that env variable.

---

## League Night Results

**This is the most important workflow.** It replaces the old Python script + manual Google Sheets workflow.

1. **Before the night:** Go to **Bracket Generator** to select who is attending. The system will create balanced groups based on current ratings. Adjust any groups by moving players between tables, then click "Use These Groups → League Entry."

2. **During or after the night:** In **League Entry**, verify the groups are correct. For each table:
   - Add all players (search by name; if someone is new, add them in **Roster** first)
   - Enter each match: select Player 1, enter scores like `11-7,8-11,11-5`, select Player 2, pick the winner
   - Click "+ Add Match" for each match played in the group

3. **Save:** Click "Save League Night & Update Ratings." The system:
   - Records all matches
   - Calculates USATT-formula rating changes for every match
   - Updates every player's current rating
   - Adds to the public Results archive and Rankings page automatically
   - Logs who made the entry for the audit trail

**Correcting a mistake:** Go to **League → [the night]** and edit. The audit log records every change with your email and a timestamp.

---

## Managing the Roster

Go to **Roster**.

- **Add a player:** Click "+ Add Player," enter name and starting rating (default 500 for beginners; use their USATT rating if known).
- **Deactivate a player:** Click their status badge to toggle Active/Inactive. Inactive players won't appear in bracket generation but their history is preserved.
- **Sync USATT rating:** Click "USATT sync" next to a player, enter their official USATT rating. The system will update their league rating **only if the USATT rating is higher** (this is a club rule — we never let a USATT rating decrease someone's league standing).
- **Export roster:** Click "Export CSV" to download the full roster as a spreadsheet.

---

## News / Announcements

Go to **News**.

- Click **+ New Post** to write an announcement. Body supports HTML (bold, links, lists).
- Use "Publish immediately" to make it live, or leave unchecked to save as a draft.
- Click the status badge on any post to toggle published/draft.
- Posts show on the public Home and News pages automatically.

---

## Schedule

Go to **Schedule**.

**Weekly times:** Add a recurring practice time (day, start/end time, location, type). These show on the public Schedule page.

**Exceptions:** When there's a one-off cancellation (Spring Break, building closure), add an Exception with the date and reason. This shows as a warning on the public Schedule page.

Delete entries when they're no longer accurate (e.g., end of semester).

---

## Officers

Go to **Officers**. Add/remove officers as leadership changes each year. These appear on the public About page. The "order" field controls display order (edit in database if needed, or delete and re-add in the desired order).

---

## Tournaments

Go to **Tournaments**. Add upcoming NCTTA, USATT, or local tournaments with dates and links. They appear on the public Tournaments page sorted by date.

---

## Resources / Sponsor Links

Go to **Resources**. Add/remove links to sponsor affiliates (Paddle Palace, Megaspin), training resources, or partner links. These appear on the public Resources page.

---

## Photo Gallery

Go to **Gallery**.

1. Click **+ Create Album** and name it (e.g., "Fall 2024 League").
2. Click the album to open it.
3. Drag and drop photos (or click to browse). They upload to Vercel Blob storage — no size limit beyond your storage plan.
4. The first photo automatically becomes the album cover.
5. Albums and photos appear on the public Gallery page with a lightbox viewer.

**Storage:** Photos are stored in Vercel Blob, not on the server. There's no arbitrary cap like Pixieset's 3GB limit.

---

## Mailing List

Go to **Mailing List**.

- **Add single:** Enter name + email.
- **Bulk add:** Paste a list of emails (one per line, or comma-separated). Useful for importing all GT listserv members at once.
- **Remove:** Click "Remove" next to an email to unsubscribe them.
- **Export CSV:** Download the full list anytime for use in Mailchimp, Gmail, or any email tool.

> **Sending emails:** The site stores the subscriber list. To actually send an email blast, export the CSV and use Gmail, Mailchimp, or similar. (A future upgrade could wire in Resend or SendGrid for in-app sending.)

---

## Importing Historical Data

To bring in old Google Sheets data:

### Roster
1. Export the old sheet as CSV with columns: Name, Email, Rating
2. Transform to match this format: `name,email,leagueRating`
3. A developer can use `prisma db seed` or `prisma studio` to import — ask the webmaster who set up the site, or file a GitHub issue.

### League Results
Historical results are complex to import automatically. Options:
- **Manual entry:** Enter the most recent seasons through the admin UI one night at a time
- **Bulk import script:** A developer can write a one-time script to parse the old Google Sheet format — the schema is designed to accept historical data

---

## Making Code Changes

If you need to change something that isn't exposed in the admin UI (rare):
1. Clone the repo: `git clone <repo>`
2. Make changes locally following the README setup
3. Test locally with `npm run dev`
4. Push to GitHub → Vercel auto-deploys

For database schema changes, run `npx prisma migrate dev --name your-description` and commit the generated migration file.

---

## Troubleshooting

**I can't log in:** Make sure you're using the exact Google account whose email matches `ADMIN_EMAIL` in Vercel's environment variables.

**Photos aren't uploading:** Check that `BLOB_READ_WRITE_TOKEN` is set in Vercel → Settings → Environment Variables.

**Ratings look wrong after a league night:** Go to League → [that night] and review the match entries. If a winner was entered incorrectly, edit the match. The audit log will show what was changed and by whom.

**The public site shows stale data:** All public pages cache for up to 60 seconds. Wait a minute and refresh. If data is missing entirely (new player not showing in rankings), check the admin to ensure they were saved correctly.
