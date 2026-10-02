# Reel Cutter — AdSense "Low value content" playbook

Prepared Oct 2, 2026. No one can guarantee AdSense approval; this is the work that removes every known risk and strengthens the real signals Google says it looks for.

Evidence labels: **CONFIRMED** = shown in your screenshots or Google's own help pages. **LIKELY** = reasonable interpretation, not stated by Google. **UNKNOWN** = can't be established from what I have.

## 1. What Google actually told you (CONFIRMED)

- Site ownership: verified (green tick).
- Policy review: "Low value content". Google asks that the site (a) provides authentic, high-quality information, tools or services, (b) exhibits ongoing curation and structural maintenance, (c) generates and sustains genuine user interest.
- Google's help page on "site not ready to show ads" lists the checks: ad code present, site reachable by the AdSense crawler, enough unique content and good UX/navigation, no policy violations.
- Google gives no page-level detail, so the exact trigger is **UNKNOWN**. Everything below is a ranked set of probable causes.

## 2. Audit findings

| # | Severity | Finding | Status |
|---|---|---|---|
| 1 | High (LIKELY) | Site lives on a free `*.vercel.app` subdomain and a web search for the domain returns nothing — no search presence, no history. This maps to "consistent presence on the web" and "genuine user interest". A custom domain is a **best practice, not a stated Google requirement**. | Needs you (see §3 step D) |
| 2 | High (LIKELY) | Only one functional page (the splitter). Rest were articles about the same narrow topic. Value was thin relative to "tools or services". | **Fixed in code**: added `/split-planner.html`, a second real tool |
| 3 | High | 24 ad units with placeholder slot IDs (`PASTE_..._SLOT_ID`): three per page, including two 160×600 rails, on pages of ~800 words. Cannot serve before approval, error out, and is heavy density for the content amount. | **Fixed in code**: all removed. Loader script, `google-adsense-account` meta and `ads.txt` kept |
| 4 | Medium (LIKELY) | "Ongoing curation": every page is dated Sept 5–16, with no publishing rhythm. | Needs you (§3 step E) |
| 5 | Medium | Privacy policy lacked a proper Google third-party-vendor disclosure and EEA/UK/CH consent language; analytics section described something not installed. | **Fixed in code** |
| 6 | Medium (LIKELY) | No named person/owner anywhere on the site. Contact is a bare Gmail address. | Needs you (§3 step E) |
| 7 | Low | About page said the site is supported by "the ads you see on this page" while there were none. | **Fixed** |
| 8 | Low | Fixed earlier: blog nav links pointed to `/` instead of `/blog/`. Confirmed present in the build. | OK |
| 9 | UNKNOWN | Whether the version Google reviewed is what is live now, and whether Google has indexed these pages. | Check §3 step B/C |

Already good (CONFIRMED in repo): HTTPS (Vercel), `robots.txt` allows all and references the sitemap, `ads.txt` has `google.com, pub-1806601681825275, DIRECT, f08c47fec0942fa0`, Search Console and AdSense verification present, privacy/terms/contact/about all exist and are linked sitewide, no copied or copyrighted content found, the "movie cutter" page is framed around footage the user owns.

Note: `ReelCutter-nav-fixed.zip` is an **older, smaller build** (4 articles, no 404/manifest/icons). Do not deploy it. This package is built from `ReelCutter-main.zip`.

## 3. Your step-by-step plan

**A. Deploy this build** to the Vercel project (push to the tracked branch or redeploy).

**B. Verify live (5 minutes).** Open each and confirm: `/ads.txt` shows your pub ID line; `/split-planner.html` works; view-source on `/` shows the AdSense `<script>` and no `<ins class="adsbygoogle">`; `/sitemap.xml` lists 20 URLs; nav links work on every page including `/blog/`.

**C. Search Console.** Submit `https://reel-cutter-swart.vercel.app/sitemap.xml`. In URL Inspection, request indexing for `/`, `/split-planner.html` and the blog hub. Check the Pages report: if most URLs are "Discovered – not indexed" or "Crawled – not indexed", Google doesn't yet see the site as valuable and an AdSense re-review is likely to fail again (LIKELY). Fix that first.

**D. Get a custom domain (strongly recommended).** Buy one, add it in Vercel, set the vercel.app address to redirect to it, then run (from the project root):

```bash
grep -rl "reel-cutter-swart.vercel.app" . | xargs sed -i 's#reel-cutter-swart\.vercel\.app#yourdomain.com#g'
```

Then add the new domain as a site in your *existing* AdSense account, verify it in Search Console, and use it for the review. Same account, same owner, honest — this is normal site management, not evasion. Do **not** open a second AdSense account.

**E. Build real, ongoing content (the part no script can do for you).**
- Add a real author byline and short bio to About and each guide (name, what you do, why you built the tool). A faceless site is a weaker trust signal (LIKELY).
- Publish 1–2 genuinely new guides per week for 3–4 weeks. Strong angles come from your own testing, which is exactly what Google calls original value: results of splitting files from specific phones/apps (keyframe interval, how far cuts drifted), memory limits you actually hit on specific devices, screenshots of your own error messages, before/after file-size tables.
- Avoid mass-produced or AI-padded articles with no first-hand material; that is the "thin/scaled content" pattern the spam policies describe.
- Add a visible "last updated" date and update old guides when facts change.

**F. Get genuine users.** Share the tool honestly where creators ask these questions (relevant communities, your own socials). Never buy traffic, use traffic exchanges, or ask anyone to click ads — that causes invalid-traffic enforcement, a much worse problem than this rejection.

**G. Wait, then request review.** After steps A–E (realistically 3–4+ weeks, UNKNOWN), tick "I confirm I have fixed the issues" in AdSense → Sites and click **Request review**. One well-prepared request beats several quick ones. A brand-new domain may need more than one cycle.

## 4. After approval

1. Use **Auto ads** (AdSense → Ads → By site). The loader is already on every page, so no code change is needed. Or add manual units with real slot IDs, one at a time.
2. Keep ads away from the Split / Download buttons and don't place them where they can be mistaken for tool controls (accidental-click risk).
3. For visitors in the EEA, UK and Switzerland, set up a Google-certified consent message under AdSense → Privacy & messaging. Check Google's current EU user consent requirements before launch (policy status should be verified against the official documentation; I did not re-verify the current wording).
4. Do not add ads to the privacy, terms, contact or 404 pages.
5. Review the AdSense Policy center and Sites page monthly.

## 5. Files changed in this package

- Removed 24 placeholder ad blocks across 11 pages
- New: `split-planner.html`
- Nav + footer links to the planner on every page; `sitemap.xml` now has 14 URLs
- `privacy-policy.html`: ad cookie / vendor / consent / logs sections; `terms-of-service.html`: date
- `about.html`: ad disclosure, editorial/corrections card
- `vercel.json`: security headers
- `README.md`: stale AdSense/placeholder notes replaced

## 6. Update — Oct 3, 2026 content pass

**Done in code (this package):**
- Homepage now has substantial original, tool-specific content: how-to, limits, supported formats, privacy, 13-question FAQ.
- 6 new pages: FAQ + how-to, YouTube Shorts, cutter-vs-splitter, phone, and "is my video uploaded?" guides. The site now has 20 indexable URLs (up from 14).
- Two false technical claims removed ("Zero external scripts", "No CDN, no external libraries").
- FAQ schema matches visible FAQ; sitemap, hub and footer updated.

**Still needs you (code cannot do these):**
1. **Name a real author/owner.** Add a short bio (name, what you do, why you built the tool) to About and, ideally, a byline on guides. Schema currently says the author is the "Reel Cutter" organization, because inventing a person would be dishonest.
2. **Add first-hand material.** The strongest content is your own testing: keyframe intervals and drift from specific phones/apps, memory ceilings you actually hit on named devices, screenshots of your own error messages. The new pages deliberately avoid claiming tests that haven't been run.
3. **Custom domain, genuine users, and a publishing rhythm** (§3 D–F above) remain the likeliest gating factors. More pages do not substitute for them.
4. **Deploy, then Search Console:** resubmit `sitemap.xml` (20 URLs) and request indexing for `/`, `/blog/how-to-split-video-online.html` and `/faq.html`. Check the Pages report before requesting AdSense review.

No one can guarantee approval; these changes remove content-quality and accuracy risks and add real information, but Google gives no page-level feedback, so the exact trigger remains unknown.

