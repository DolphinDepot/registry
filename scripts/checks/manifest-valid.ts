import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import manifestSchema from "../schemas/manifest.schema.json" with { type: "json" };
import type { CheckContext, CheckResult } from "../lib/types.js";

const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);
const validate = ajv.compile(manifestSchema);

export function manifestValid(ctx: CheckContext): CheckResult {
    if (!ctx.manifest) {
        return {
            check: "manifest-valid",
            passed: false,
            message: "Skipped (manifest not fetched)",
        };
    }

    const valid = validate(ctx.manifest);

    if (valid) {
        return {
            check: "manifest-valid",
            passed: true,
            message: "Manifest is valid",
        };
    }

    const errors = validate
        .errors!.map((e) => `${e.instancePath || "/"} ${e.message}`)
        .join("; ");

    return { check: "manifest-valid", passed: false, message: errors };
}
