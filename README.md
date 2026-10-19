# satteri-pele

[Sätteri](https://github.com/bruits/satteri) plugin to render Mermaid diagrams with [Pele](https://github.com/obsidianmd/pele) at build time.

## Features

- Convert Markdown/MDX `mermaid` code blocks to SVG
- Multiple diagrams rendered in order with unique IDs
- Falls back to original code block on failure
- TypeScript types included
- **Zero client-side JS** — SVG generated at build via Pele

## Why satteri-pele?

| | satteri-pele | Client-side (mermaid.js) |
|--|-------------|--------------------------|
| **Runtime** | Node.js (Pele) | Browser |
| **Output** | Inline SVG | `<div class="mermaid">` + JS |
| **SSR/SSG** | ✅ Native | ❌ Needs headless browser |
| **Bundle size** | ~0 (server-only) | +~1MB mermaid.js |
| **Error fallback** | ✅ Preserves source | ❌ Breaks render |

## Installation

```bash
pnpm add satteri-pele pele satteri
# or
npm install satteri-pele pele satteri
```

## Quick Start (Astro)

```javascript
// astro.config.mjs
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import satteri from "satteri";
import { peleMdast, peleHast } from "satteri-pele";

export default defineConfig({
  integrations: [mdx()],
  markdown: {
    extendDefaultPlugins: true,
    syntaxHighlight: false,
    remarkPlugins: [
      [satteri, {
        mdastPlugins: [peleMdast()],
        hastPlugins: [peleHast()],
      }],
    ],
  },
});
```

Now Mermaid in `.md`/`.mdx` files renders to inline SVG at build time:

```markdown
```mermaid
flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action]
    B -->|No| D[End]
`​``
```

Output:
```html
<div class="mermaid" id="mermaid-0"><svg>...</svg></div>
```

## Usage with Sätteri directly

```typescript
import { markdownToHtml } from "satteri";
import { peleMdast, peleHast } from "satteri-pele";

const html = await markdownToHtml(markdown, {
  mdastPlugins: [peleMdast()],
  hastPlugins: [peleHast()],
});
```

## Options

### `peleMdast(options?)`

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `langs` | `string[]` | `["mermaid"]` | Language identifiers to process |

```typescript
peleMdast({ langs: ["mermaid", "pele"] })
```

### `peleHast(options?)`

Passes directly to [Pele's RenderOptions](https://github.com/obsidianmd/pele/blob/main/dist/types.d.ts).


```typescript
peleHast({
  fontSize: 16,
  fontFamily: "system-ui",
  responsive: true,
  maxWidth: 800,
  padding: 20,
})
```

See Pele's [RenderOptions](https://github.com/obsidianmd/pele/blob/main/dist/types.d.ts) for full details.

## Error Handling

On render failure, a warning is emitted and the original code block is preserved.

## License

ISC © tana
