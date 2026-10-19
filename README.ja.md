# satteri-pele

[Sätteri](https://github.com/bruits/satteri)で[Pele](https://github.com/obsidianmd/pele)を使ってMermaidダイアグラムをビルド時にレンダリングするプラグインです。

## Features

- Markdown/MDXの`mermaid`コードブロックをSVGに変換
- 複数の図を順序通りにレンダリングし、一意のIDを付与
- 失敗時は元のコードブロックを保持してフォールバック
- TypeScript型定義付属
- **クライアントJSゼロ** — Peleでビルド時にSVG生成

## Why satteri-pele?

| | satteri-pele | クライアントサイド (mermaid.js) |
|--|-------------|--------------------------|
| **ランタイム** | Node.js (Pele) | ブラウザ |
| **出力** | インライン SVG | `<div class="mermaid">` + JS |
| **SSR/SSG** | ✅ ネイティブ対応 | ❌ ヘッドレスブラウザ必要 |
| **バンドルサイズ** | ~0 (サーバーのみ) | +~1MB mermaid.js |
| **エラーフォールバック** | ✅ ソース保持 | ❌ レンダリング失敗 |

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

これで`.md`/`.mdx`内のMermaidがビルド時にインラインSVG化されます：

```markdown
```mermaid
flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action]
    B -->|No| D[End]
`​``
```

出力：
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

| プロパティ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| `langs` | `string[]` | `["mermaid"]` | 処理対象の言語識別子 |

```typescript
peleMdast({ langs: ["mermaid", "mmd"] })
```

### `peleHast(options?)`

[PeleのRenderOptions](https://github.com/obsidianmd/pele/blob/main/dist/types.d.ts)を直接指定できます。


```typescript
peleHast({
  fontSize: 16,
  fontFamily: "system-ui",
  responsive: true,
  maxWidth: 800,
  padding: 20,
})
```

詳細なオプションはPeleの[RenderOptions](https://github.com/obsidianmd/pele/blob/main/dist/types.d.ts)を参照してください。

## Error Handling

レンダリング失敗時は警告を出し、元のコードブロックを保持します。

## License

ISC © tana