# Reel Cutter — Split Long Videos Into Reels, TikToks & Shorts

A free, browser-based tool that splits a video into timed parts (default 150–160 seconds each) and labels each part by filename — then bundles everything into one downloadable zip.

Everything runs **locally in the browser tab**, on desktop or mobile. No server, no upload, no backend to deploy.

## How it works

- A hand-written **MP4 box parser** (in `index.html`) reads the container structure directly and locates the video's existing keyframes.
- For each part, it **copies the existing compressed audio/video samples** into a new MP4 — no decoding, no re-encoding, so there's zero quality loss and no CDN dependency.
- Cuts snap to the nearest keyframe at or before the target time, so every part plays back cleanly from frame one. Actual part length can be off by up to a couple of seconds as a result.
- A hand-written **zip writer** (also in `index.html`) bundles all finished parts into `video_parts.zip`.
- The file picker uses `<input type="file" accept="...">`, which on phones opens the native "choose video" sheet.

No video data ever leaves the device — there's nothing to configure on a server, and no API keys, ffmpeg.wasm, or third-party libraries are needed.

## Site structure

```
index.html                                   ← the split tool (HTML + CSS + JS in one file)
about.html                                   ← what Reel Cutter does and why it's in-browser
contact.html                                 ← support / feedback / business contact
privacy-policy.html                          ← privacy policy, incl. AdSense/cookie disclosure
terms-of-service.html                        ← terms of service
404.html                                     ← custom not-found page (noindex, follow)
sitemap.xml                                  ← XML sitemap with lastmod dates
robots.txt                                   ← crawl rules + sitemap reference
ads.txt                                      ← AdSense publisher verification
vercel.json                                  ← cache-control headers for assets/sitemap/robots
site.webmanifest                             ← PWA manifest (name, icons, theme color)
google43a8446c4c368aab.html                  ← existing Google Search Console verification file
assets/
  site.css                                   ← shared nav, footer, ad slots, content-page styles
  site.js                                    ← mobile nav toggle + active-link highlighting
  og-image.png                               ← 1200×630 Open Graph / Twitter share image
  icons/                                     ← favicons + apple-touch-icon + PWA icons (192/512)
blog/
  index.html                                 ← tutorials hub
  split-video-for-instagram-reels.html       ← step-by-step splitting tutorial (expanded)
  mp4-keyframes-explained.html               ← why cuts snap to keyframes (expanded)
  best-clip-length-for-social-media.html     ← 2026 length limits/sweet spots by platform (expanded)
  free-movie-cutter.html                     ← targets "movie cutter" + related long-tail terms (reworked)
  troubleshooting-guide.html                 ← common errors and fixes, by source (new)
  video-format-glossary.html                 ← codec/container/keyframe terminology reference (new)
  who-uses-reel-cutter.html                  ← real workflows per creator type (new)
```

`index.html` keeps its original inline `<style>` and `<script>` untouched — the split/zip logic hasn't changed. `assets/site.css` only adds new, non-conflicting styles for the nav, footer, ad slots, and the content pages.

## AdSense "low value content" rejection — fixed

Google rejected the site pre-launch with **"Low value content"**, and it was accurate: total unique prose across the site was ~2,500 words spread thin across 10 pages, with several pages (notably `free-movie-cutter.html` at 441 words) short enough to resemble the "thin/doorway page" pattern Google's spam policies flag.

This pass addressed it directly:
- Expanded the four existing articles from 440–600 words each to 990–1,140 words each with genuine added depth (GOP/codec detail, worked examples, per-source troubleshooting notes, retention/algorithm context, testing frameworks) rather than padding.
- Added three new substantial pages: a troubleshooting reference tied to the product's real error messages, a video-format glossary, and a use-cases page with concrete per-persona workflows.
- Expanded About (386→877 words) and Contact (220→357 words), which were thin enough on their own to read as an incomplete site.
- Total unique content across the site's core pages went from ~2,500 to ~9,100 words.
- Fixed a broken navigation bug (four blog pages' "Tutorials" nav/breadcrumb/footer links pointed to `/` instead of `/blog/`) found during this audit — unrelated to the content-depth issue but worth fixing regardless.

**Before resubmitting for AdSense review:** wait until the new pages are live and Google has had a chance to crawl them (submit `sitemap.xml` in Search Console to speed this up), then check "I confirm I have fixed the issues" only once that's done. A very new domain with no backlinks may still take more than one review cycle — that's a trust/authority factor content depth alone can't fully offset.

**Not fixed by this pass — needs your input:** several ad slots (`about.html`, `contact.html`, `index.html`, and three blog pages) still have literal placeholder text (`PASTE_LEFT_RAIL_AD_SLOT_ID`, `PASTE_INCONTENT_AD_SLOT_ID`, etc.) in their `data-ad-slot` attributes instead of real AdSense slot IDs. Replace these with real slot IDs from your AdSense dashboard before resubmitting.

## Keyword targeting: "movie cutter"

The homepage title/description and a new article (`blog/free-movie-cutter.html`) now target "movie cutter" and related terms (movie splitter, video cutter, free movie cutter online). This is deliberately framed around **cutting your own long-form footage** — home movies, personal recordings, lectures, podcasts — rather than splitting copyrighted films/shows, since that's a different (and legally risky) search intent that could jeopardize the AdSense account. The new article and homepage FAQ both include an explicit copyright note.

## SEO pass (this update)

Every internal link, asset path (`assets/site.css`, `assets/site.js`), and favicon reference is now **root-absolute** (`/about.html`, `/assets/...`) instead of relative — simpler to maintain and immune to path bugs regardless of which folder a page lives in.

**Deliberately kept `.html` extensions.** Vercel's `cleanUrls` option can strip `.html` from every URL, but it does so for *all* HTML files with no per-file exclusion — including `google43a8446c4c368aab.html`, which must stay reachable at that exact literal path for Google Search Console verification. Stripping it site-wide risked breaking that verification for a cosmetic URL change, so this build keeps `.html` URLs (matching what's already live and indexed) and only cleaned up the *paths*, not the extensions. The one exception is the blog hub, which now resolves at `/blog/` (served as a directory index — standard static-hosting behavior, not a redirect).

**Added:**
- Real Open Graph / Twitter Card images (`assets/og-image.png`, 1200×630) on every page — previously every page was missing `og:image` entirely, which hurts link-preview click-through on social/chat shares.
- Proper favicons and app icons (16/32/180/192/512px) replacing the inline emoji-SVG data URI — real icon files are what Google Search actually indexes for the site favicon shown in results.
- `site.webmanifest` for installability signals.
- `FAQPage` structured data on the homepage, mirroring the existing on-page FAQ — eligible for FAQ rich results in Search.
- `lastmod` dates on every `sitemap.xml` entry.
- `vercel.json` with long-cache immutable headers for `/assets/*` (faster repeat loads, a Core Web Vitals / page-speed factor) and short-cache headers for `sitemap.xml`/`robots.txt`.
- A custom `404.html` (noindex, follow) with real navigation back into the site instead of a blank/default error page.



This site is live at **https://reel-cutter-swart.vercel.app/**. All canonical URLs, Open Graph tags, JSON-LD, `sitemap.xml`, and `robots.txt` already point at this address.

If you ever move to a custom domain later, update every reference in one pass:

```bash
grep -rl "reel-cutter-swart.vercel.app" . | xargs sed -i 's#reel-cutter-swart\.vercel\.app#yourdomain.com#g'
```

**AdSense publisher ID** still needs to be set. Every page has `ca-pub-XXXXXXXXXXXXXXXX` (in the AdSense script tag, a meta tag, and each ad slot's `data-ad-client`), and `ads.txt` has `pub-0000000000000000`. Replace both with your real AdSense publisher ID:

```bash
grep -rl "ca-pub-XXXXXXXXXXXXXXXX" . | xargs sed -i 's/ca-pub-XXXXXXXXXXXXXXXX/ca-pub-YOURREALID/g'
sed -i 's/pub-0000000000000000/pub-YOURREALID/' ads.txt
```

Then set your real `data-ad-slot` values per placement in AdSense (currently `0000000001`–`0000000006` as placeholders across the pages).

**Contact info.** The Contact, Privacy, and Terms pages currently have no working email address — Contact shows a "form coming soon" note, and Privacy/Terms link back to the Contact page instead of a mailto link. Add a real inbox (or a form service like Formspree/Google Forms) whenever you're ready, then update those three pages.

## Re-deploying

The site is already deployed on Vercel at https://reel-cutter-swart.vercel.app/. To push updates, redeploy the same project (via the Vercel dashboard's drag-and-drop, or by connecting the repo and pushing to the tracked branch, if you set it up that way).

> Note: `index.html` alone can still be opened directly via `file://` for local testing of the split tool, but the nav links and other pages assume the site is served over `http(s)` from the project root, as it is on Vercel.

## Using the tool

1. **Pick a video** — tap the drop zone or drag a file in. MP4/MOV/M4V work best.
2. **Set cut settings**
   - *Min length / Max length (seconds)* — target range for each part (default 150–160s). The last part may be shorter if the video doesn't divide evenly.
   - *Part label prefix* — defaults to "Part", so parts are labeled "Part 1", "Part 2", etc. in the output filename.
   - *Include audio* — keep or drop the audio track.
3. **Click "Split this video (fast, lossless)."**
   - Each part is built and added to the zip as it finishes — you'll see a checklist update live.
4. **Click "Download zip"** once processing completes. You'll get `video_parts.zip` containing `part_1_...mp4`, `part_2_...mp4`, etc.

## Known limitations

- **Memory** — processing happens in-browser memory. Very long or high-resolution videos can crash the tab on phones, since mobile browsers cap how much memory a tab can use. If it crashes, try a shorter or lower-resolution source video, or run it on a laptop instead.
- **Cut precision** — because nothing is re-encoded, cuts snap to the nearest keyframe rather than an exact timestamp. See `blog/mp4-keyframes-explained.html` for why.
- **Container support** — standard, non-fragmented MP4/MOV files work best. Fragmented MP4s or unusual variants may fail to parse; re-exporting as a standard MP4 usually fixes it.
- **Output format** — parts keep the source's existing video/audio codec (no transcoding), so output compatibility matches your source file.

## Customizing

- Colors/fonts/layout for the tool itself — the inline `<style>` block at the top of `index.html`.
- Shared nav/footer/ad-slot styles for the whole site — `assets/site.css`.
- MP4 parsing / zip packing logic — inside the `<script>` block in `index.html` (unchanged from the original implementation).
- New tutorial articles — add a file under `blog/`, then link it from `blog/index.html` and `sitemap.xml`.

## SEO & ads notes

- Every page ships meta description, canonical URL, Open Graph/Twitter tags, and JSON-LD structured data (`WebApplication`, `Organization`, `Article`, and `BreadcrumbList` where relevant).
- `sitemap.xml` and `robots.txt` are at the project root and reference the real (placeholder) domain — update after replacing the domain placeholder above.
- Ad slots are placed away from the tool's Run/Download buttons to avoid accidental clicks near interactive controls, per AdSense policy.
- The privacy policy and terms of service are general templates, not legal advice — have them reviewed for your jurisdiction before relying on them commercially.