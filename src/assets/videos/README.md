# Videos

Place .mp4 video files here with the following exact names:

| Filename | State | Notes |
|---|---|---|
| `extending.mp4` | EXTENDING | Animation of lip extending into trailer |
| `retracting.mp4` | RETRACTING | Animation of lip retracting from trailer |
| `raising.mp4` | RAISING | Animation of platform raising |
| `lowering.mp4` | LOWERING | Animation of platform lowering |

> IDLE has no video — the leveler is stationary in the ready state.

## After adding video files

1. Open `src/constants/stateAssets.ts`
2. For each state that has a video, add an import at the top of the file:

```typescript
import extendingVideo from '../assets/videos/extending.mp4'
```

3. Uncomment the `video:` line in the corresponding state entry:

```typescript
EXTENDING: {
  image: extendingImg,
  video: extendingVideo,   // ← uncomment this
  label: 'EXTENDING',
  accentColor: '#facc15',
},
```

No changes to the `StateDisplay` component are needed — it automatically
switches from image to video mode when a `video` path is present.

## Video requirements

- **Format**: H.264 MP4 — best compatibility with iOS Safari
- **Audio**: No audio track needed (`muted` is required for autoPlay on iOS)
- **Resolution**: 1280×720 or 1920×1080
- **Loop-friendly**: First and last frames should be visually similar so `loop` is seamless
- **File size**: Keep reasonable — all videos are precached by the service worker on first load.
  The service worker's size limit is set to 50MB per file in `vite.config.ts`.
- **Codec note**: `avc1` (H.264 baseline/main profile) is the safest choice for iOS.
  HEVC (H.265) requires iOS 11+ and is not universally supported in web views.
