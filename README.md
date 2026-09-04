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
sitemap.xml                                  ← XML sitemap for search engines
robots.txt                                   ← crawl rules + sitemap reference
ads.txt                                      ← AdSense publisher verification (needs your pub ID)
google43a8446c4c368aab.html                  ← existing Google Search Console verification file
assets/
  site.css                                   ← shared nav, footer, ad slots, content-page styles
  site.js                                    ← mobile nav toggle + active-link highlighting
blog/
  index.html                                 ← tutorials hub
  split-video-for-instagram-reels.html       ← step-by-step splitting tutorial
  mp4-keyframes-explained.html               ← why cuts snap to keyframes
  best-clip-length-for-social-media.html     ← 2026 length limits/sweet spots by platform
```

`index.html` keeps its original inline `<style>` and `<script>` untouched — the split/zip logic hasn't changed. `assets/site.css` only adds new, non-conflicting styles for the nav, footer, ad slots, and the content pages.

## Deployment

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