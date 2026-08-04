# Reel Cutter — Split & Watermark

A single-file, browser-based tool that splits a video into timed parts (default 150–160 seconds each) and stamps each part with a "Part N" watermark — then bundles everything into one downloadable zip.

Everything runs **locally in the browser tab**, on desktop or mobile. No server, no upload, no backend to deploy.

## How it works

- **[ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm)** (loaded from CDN) runs real ffmpeg — trimming and adding a text overlay — entirely inside the browser using WebAssembly.
- **[JSZip](https://stuk.github.io/jszip/)** (loaded from CDN) bundles all the finished parts into a single `video_parts.zip`.
- The file picker uses `<input type="file" accept="video/*">`, which on phones opens the native "choose video" sheet.

No video data ever leaves the device — there's nothing to configure on a server, and no API keys are needed.

## Files

```
index.html   ← the entire app (HTML + CSS + JS in one file)
```

## Deploy it

Pick whichever is easiest:

**Option 1 — Open it directly**
Just double-click `index.html`. It runs from `file://` in most browsers (Chrome/Edge/Firefox). Safari can be stricter about local file access, so if it doesn't load, use Option 2 or 3.

**Option 2 — GitHub Pages**
1. Push `index.html` to a GitHub repo.
2. Go to **Settings → Pages**, set the source branch, save.
3. Your tool is live at `https://<username>.github.io/<repo>/`.

**Option 3 — Netlify / Vercel drag-and-drop**
1. Go to [netlify.com/drop](https://app.netlify.com/drop) (or Vercel's dashboard).
2. Drag the `index.html` file in.
3. You get an instant public URL.

Any static host works — Cloudflare Pages, Firebase Hosting, S3 + CloudFront, etc. There's no build step.

## Using the tool

1. **Pick a video** — tap the drop zone or drag a file in.
2. **Set cut settings**
   - *Min length / Max length (seconds)* — target range for each part (default 150–160s). The last part may be shorter if the video doesn't divide evenly.
   - *Watermark position* — Top, Bottom, or Center.
   - *Watermark text prefix* — defaults to "Part", so parts are labeled "Part 1", "Part 2", etc. Change it to whatever prefix you want.
3. **Click "Split & watermark this video."**
   - First run downloads the ffmpeg.wasm engine (~30MB), so it needs an internet connection the first time.
   - Each part is trimmed, watermarked, and added to a zip as it finishes — you'll see a checklist update live.
4. **Click "Download zip"** once processing completes. You'll get `video_parts.zip` containing `part_1.mp4`, `part_2.mp4`, etc.

## Known limitations

- **Memory** — processing happens in-browser memory. Very long or high-resolution videos can crash the tab on phones, since mobile browsers cap how much memory a WASM tab can use (roughly 1–2GB). If it crashes, try a shorter or lower-resolution source video, or run it on a laptop instead.
- **Speed** — encoding is CPU-bound and single-threaded in this build, so a 10-minute video can take a few minutes to process, longer on older devices. The encode preset is set to `ultrafast` to favor speed over file size; you can change `-preset ultrafast` to `medium` or `slow` in the script for smaller files at the cost of speed.
- **First-load requires internet** — ffmpeg.wasm and JSZip load from a CDN. After the first load, some browsers cache them, but there's no offline mode built in.
- **Output format** — parts are always re-encoded to H.264 MP4 with AAC audio for broad compatibility, regardless of the source format.

## Customizing

Everything is in `index.html`:
- Watermark font size/color/box — edit the `drawtext` filter string inside the `runBtn` click handler.
- Encoding quality/speed — change `-preset ultrafast` and add a `-crf` value in the `ffmpeg.exec([...])` call.
- Colors/fonts/layout — all in the `<style>` block at the top of the file.
