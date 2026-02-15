import Ajv from "ajv";
import sourceSchema from "../schemas/source.schema.json" with { type: "json" };
import type { CheckContext, CheckResult } from "../lib/types.js";

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(sourceSchema);

export function requiredFields(ctx: CheckContext): CheckResult {
  if (!ctx.sourceConfig) {
    return {
      check: "required-fields",
      passed: false,
      message: "Skipped (YAML parse failed)",
    };
  }

  const valid = validate(ctx.sourceConfig);

  if (valid) {
    return { check: "required-fields", passed: true, message: "All required fields present" };
  }

  const errors = validate.errors!
    .map((e) => `${e.instancePath || "/"} ${e.message}`)
    .join("; ");

  return { check: "required-fields", passed: false, message: errors };
}
