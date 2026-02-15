import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import type { CheckContext, CheckResult } from "../lib/types.js";

export function yamlSyntax(ctx: CheckContext): CheckResult {
  const file = join(ctx.dir, "source.yaml");

  try {
    const raw = readFileSync(file, "utf-8");
    ctx.sourceConfig = parse(raw);
    return { check: "yaml-syntax", passed: true, message: "Valid YAML" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { check: "yaml-syntax", passed: false, message: msg };
  }
}
