import { describe, expect, it } from "vitest";
import { HealthRegistry, healthReportToHttp } from "./registry";

describe("HealthRegistry", () => {
  it("reports healthy when all probes pass", async () => {
    const report = await new HealthRegistry()
      .register({ name: "a", probe: () => Promise.resolve() })
      .register({ name: "b", probe: () => Promise.resolve() })
      .run();
    expect(report.status).toBe("healthy");
    expect(report.components).toHaveLength(2);
  });

  it("reports unhealthy when a critical probe fails", async () => {
    const report = await new HealthRegistry()
      .register({ name: "ok", probe: () => Promise.resolve() })
      .register({ name: "db", probe: () => Promise.reject(new Error("down")) })
      .run();
    expect(report.status).toBe("unhealthy");
    expect(healthReportToHttp(report).status).toBe(503);
  });

  it("degrades (not fails) when a non-critical probe fails", async () => {
    const report = await new HealthRegistry()
      .register({ name: "cache", critical: false, probe: () => Promise.reject(new Error("miss")) })
      .run();
    expect(report.status).toBe("degraded");
    expect(healthReportToHttp(report).status).toBe(200);
  });
});
