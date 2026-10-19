import { PeleError, render } from "pele";
import { defineHastPlugin, defineMdastPlugin, htmlToHast } from "satteri";
import type { PeleHastOption, PeleMdastOption } from "./types";

const DATA_KEY = "satteri-pele";
const ELEMENT_DATA_KEY = "dataMermaidIndex";

export const peleMdast = (option?: PeleMdastOption) => {
  const langs = option?.langs ?? ["mermaid"];
  return defineMdastPlugin({
    name: "satteri-pele",
    code(node, ctx) {
      if (typeof node.lang !== "string") return;
      if (!langs.includes(node.lang)) return;
      let bag = ctx.data[DATA_KEY] as string[] | undefined;
      if (!bag) {
        bag = [];
        ctx.data[DATA_KEY] = bag;
      }
      const idx = bag.push(node.value) - 1;
      ctx.replaceNode(node, {
        type: "mermaidPlaceholder",
        data: {
          hName: "pre",
          hProperties: {
            className: ["mermaid"],
            [ELEMENT_DATA_KEY]: idx,
          },
        },
        children: [],
      });
      return;
    },
  });
};

export const peleHast = (option?: PeleHastOption) => {
  return defineHastPlugin({
    name: "satteri-pele",
    element: {
      filter: ["pre"],
      visit(node, ctx) {
        if (!node.properties.className?.includes("mermaid")) return;
        const rawPreIdx = node.properties[ELEMENT_DATA_KEY];
        if (typeof rawPreIdx !== "number" && typeof rawPreIdx !== "string")
          return;
        const preIdx =
          typeof rawPreIdx === "number" ? rawPreIdx : Number(rawPreIdx);
        if (!Number.isInteger(preIdx) || preIdx < 0) return;
        const bag = ctx.data[DATA_KEY];
        if (!Array.isArray(bag)) return;
        const mermaidSrc = bag[preIdx];
        if (typeof mermaidSrc !== "string") return;
        try {
          const { svg } = render(mermaidSrc, option);
          const html = `<div class="mermaid" id="mermaid-${preIdx}">${svg}</div>`;
          if (ctx.sourceFormat === "mdx") {
            const tree = htmlToHast(html, { fragment: true });
            if (tree.type !== "root")
              throw new Error("Expected an HTML fragment root");
            ctx.replaceNode(node, tree.children);
          } else {
            ctx.replaceNode(node, {
              type: "raw",
              value: html,
            });
          }
        } catch (error) {
          let message: string;
          if (error instanceof PeleError) {
            message = `Mermaid rendering failed [${error.code}]: ${error.message} at ${error.line}:${error.column}`;
          } else if (error instanceof Error) {
            message = `Mermaid rendering failed: ${error.message}`;
          } else {
            message = "Mermaid rendering failed";
          }
          ctx.report({ message, severity: "warning", node });
          ctx.replaceNode(node, {
            type: "element",
            tagName: "pre",
            properties: {},
            children: [
              {
                type: "element",
                tagName: "code",
                properties: { className: ["language-mermaid"] },
                children: [
                  {
                    type: "text",
                    value: mermaidSrc,
                  },
                ],
              },
            ],
          });
        }
      },
    },
  });
};
