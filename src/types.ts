import type { RenderOptions } from "pele";

export type PeleMdastOption = {
  /**
   * Languages to transform.
   *
   * @default ["mermaid"]
   */
  langs?: Array<string>;
};

export type PeleHastOption = RenderOptions;
