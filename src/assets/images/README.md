# Images

Place state image files here with the following exact names:

| Filename | State | Notes |
|---|---|---|
| `idle.jpg` | IDLE / READY | Leveler in stored/flat position |
| `extending.jpg` | EXTENDING | Lip extended into trailer |
| `retracting.jpg` | RETRACTING | Lip retracting from trailer |
| `raising.jpg` | RAISING | Platform raised / elevated |
| `lowering.jpg` | LOWERING | Platform lowering to dock level |

## After adding image files

1. Open `src/constants/stateAssets.ts`
2. Replace each `makePlaceholderSVG(...)` call with an import:

```typescript
import idleImg      from '../assets/images/idle.jpg'
import extendingImg from '../assets/images/extending.jpg'
import retractingImg from '../assets/images/retracting.jpg'
import raisingImg   from '../assets/images/raising.jpg'
import loweringImg  from '../assets/images/lowering.jpg'
```

3. Update each state's `image:` field to use the imported value.

## Recommended specs
- Format: JPEG or WebP
- Resolution: 1280×720 minimum (1920×1080 ideal for Retina displays)
- Aspect ratio: 16:9 (matches the display area)
- The image is displayed with `object-fit: contain`, so any aspect ratio will work without cropping
