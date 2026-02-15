import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { reportEntry, reportSummary } from "../reporter.js";
import type { CheckResult } from "../types.js";

function collectOutput(logSpy: ReturnType<typeof vi.spyOn>): string {
  return logSpy.mock.calls.map((c: unknown[]) => c[0]).join("\n");
}

describe("reportEntry", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it("reports slug and check details for passing entry", () => {
    const results: CheckResult[] = [
      { check: "yaml-syntax", passed: true, message: "Valid YAML" },
    ];
    reportEntry("my-app", results);

    const output = collectOutput(logSpy);
    expect(output).toContain("my-app");
    expect(output).toContain("yaml-syntax");
    expect(output).toContain("Valid YAML");
  });

  it("reports slug and failing check details", () => {
    const results: CheckResult[] = [
      { check: "yaml-syntax", passed: true, message: "Valid YAML" },
      { check: "required-fields", passed: false, message: "Missing fields" },
    ];
    reportEntry("my-app", results);

    const output = collectOutput(logSpy);
    expect(output).toContain("my-app");
    expect(output).toContain("required-fields");
    expect(output).toContain("Missing fields");
  });
});

describe("reportEntry CI annotations", () => {
  const originalGA = process.env.GITHUB_ACTIONS;

  afterEach(() => {
    vi.resetModules();
    if (originalGA !== undefined) {
      process.env.GITHUB_ACTIONS = originalGA;
    } else {
      delete process.env.GITHUB_ACTIONS;
    }
  });

  it("does not emit ::error:: annotation outside CI", async () => {
    delete process.env.GITHUB_ACTIONS;
    vi.resetModules();
    const { reportEntry: freshReportEntry } = await import("../reporter.js");

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      const results: CheckResult[] = [
        { check: "yaml-syntax", passed: false, message: "Bad YAML" },
      ];
      freshReportEntry("my-app", results);

      const output = collectOutput(logSpy);
      expect(output).not.toContain("::error::");
    } finally {
      logSpy.mockRestore();
    }
  });

  it("emits ::error:: annotation for failed checks in CI", async () => {
    process.env.GITHUB_ACTIONS = "true";
    vi.resetModules();
    const { reportEntry: freshReportEntry } = await import("../reporter.js");

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      const results: CheckResult[] = [
        { check: "yaml-syntax", passed: false, message: "Bad YAML" },
      ];
      freshReportEntry("my-app", results);

      const output = collectOutput(logSpy);
      expect(output).toContain("::error::");
      expect(output).toContain("my-app");
      expect(output).toContain("yaml-syntax");
    } finally {
      logSpy.mockRestore();
    }
  });
});

describe("reportSummary", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it("prints totals correctly", () => {
    reportSummary(5, 2);

    const output = collectOutput(logSpy);
    expect(output).toContain("Total entries: 5");
    expect(output).toContain("Passed: 3");
    expect(output).toContain("Failed: 2");
  });
});
