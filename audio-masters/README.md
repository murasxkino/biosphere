# Audio masters

The owner's original soundtrack recordings — 16-bit / 44.1 kHz stereo WAV, one per archetype. **These are the source of truth for the soundtrack layer.** Nothing here is ever bundled: Vite copies only `public/`, so these files reach neither the web build, nor the artifact, nor the iOS app.

What ships is a derived 256 kbps AAC encode in `public/music/`, approved by the owner in a blind A/B against these masters on 2026-07-15 (APP_STORE_ROADMAP §3).

## Re-encoding

```
ffmpeg -i audio-masters/<name>.wav -c:a aac -b:a 256k -ar 44100 -ac 2 \
  -movflags +faststart public/music/<name>.m4a
```

Then bump the `?v=` query on that archetype's entry in `src/audio/tracks.ts` so listeners with a cached copy hear the new piece.

## Replacing a piece

Put the new master here, encode it as above, and A/B it against what it replaces before committing — the soundtrack is the app's best feature and is not changed casually. The by-ear `level` trim in `tracks.ts` belongs to the piece, so a new recording needs its own listening pass.

## Why the masters stay in the repo

Git history already carries them permanently, so keeping the working copies costs local disk only, and it means a re-encode never depends on finding the originals somewhere else.
