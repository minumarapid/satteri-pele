import { render } from "pele";
import { markdownToHtml } from "satteri";
import { describe, expect, it } from "vitest";
import { peleHast, peleMdast } from "../src";

const pluginUse = (str: string) => {
  return markdownToHtml(str, {
    mdastPlugins: [peleMdast()],
    hastPlugins: [peleHast()],
  });
};

const pluginDisable = (str: string) => {
  return markdownToHtml(str);
};

const peleRender = (strs: Array<string>) => {
  const svgs = strs.map((str, i) => {
    const { svg } = render(str);
    return `<div class="mermaid" id="mermaid-${i}">${svg}</div>`;
  });
  return `${svgs.join("\n")}\n`;
};

const mermaidToMd = (str: string) => {
  return `\`\`\`mermaid
${str}
\`\`\``;
};

describe("converts Mermaid code blocks to SVG", () => {
  it("Converted to Mermaid", () => {
    const mermaid = `
      flowchart TD
        A([Mermaid text]) --> B{Supported?}
        B -- Yes --> C[Parse]
        B -- No --> H[Fall back]

        subgraph Pele
          C --> D[Layout]
          D --> E[Render]
        end

        E --> F[(SVG)]
        F -.-> G[Theme with CSS]
    `;
    const md = mermaidToMd(mermaid);
    const expected = `${peleRender([mermaid])}`;
    expect(pluginUse(md).html).toBe(expected);
  });
  it("renders multiple diagrams in order with incrementing IDs", () => {
    const mermaid1 = `
      flowchart TD
        A([Mermaid text]) --> B{Supported?}
        B -- Yes --> C[Parse]
        B -- No --> H[Fall back]

        subgraph Pele
          C --> D[Layout]
          D --> E[Render]
        end

        E --> F[(SVG)]
        F -.-> G[Theme with CSS]
    `;
    const mermaid2 = `
      flowchart LR
        subgraph Client
          UI[Web app]
          Cache[(Local cache)]
        end
        subgraph Services
          API[API gateway]
          Auth[Auth service]
          Orders[Order service]
        end
        subgraph Storage
          DB[(Orders DB)]
        end
        UI --> API
        UI --> Cache
        API --> Auth
        API --> Orders
        Orders --> DB
        Auth -. token .-> UI
    `;
    const md = `${mermaidToMd(mermaid1)}\n${mermaidToMd(mermaid2)}`;
    const expected = peleRender([mermaid1, mermaid2]);
    expect(pluginUse(md).html).toBe(expected);
  });
  it("preserves regular Markdown when Mermaid diagrams are present", () => {
    const mermaid = `
      flowchart TD
        A([Mermaid text]) --> B{Supported?}
        B -- Yes --> C[Parse]
        B -- No --> H[Fall back]

        subgraph Pele
          C --> D[Layout]
          D --> E[Render]
        end

        E --> F[(SVG)]
        F -.-> G[Theme with CSS]
    `;
    const md = `# Hello, World!
## This is the heading.
> BlockQuote
`;
    const pmd = `${md}\n${mermaidToMd(mermaid)}`;
    const expected = `${pluginDisable(md).html}${peleRender([mermaid])}`;
    expect(pluginUse(pmd).html).toBe(expected);
  });
  it("should produce the same output when Mermaid is absent as when the plugin is disabled", () => {
    const md = `
      # Hello, World!
      ## This is the heading.
      > BlockQuote
      
    `;
    const expected = pluginDisable(md).html;
    expect(pluginUse(md).html).toBe(expected);
  });
});
