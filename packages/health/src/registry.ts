import { toSerializableError } from "@platform/utils";
import type { ComponentHealth, HealthCheck, HealthReport, HealthStatus } from "./types";

/** Registers infrastructure health checks and runs them into a composite report. */
export class HealthRegistry {
  private readonly checks: HealthCheck[] = [];

  register(check: HealthCheck): this {
    this.checks.push(check);
    return this;
  }

  registerAll(checks: readonly HealthCheck[]): this {
    for (const check of checks) this.checks.push(check);
    return this;
  }

  async run(): Promise<HealthReport> {
    const components = await Promise.all(this.checks.map((check) => this.runOne(check)));
    return {
      status: aggregate(components),
      checkedAt: new Date().toISOString(),
      components,
    };
  }

  private async runOne(check: HealthCheck): Promise<ComponentHealth> {
    const start = Date.now();
    try {
      await check.probe();
      return { name: check.name, status: "healthy", durationMs: Date.now() - start };
    } catch (error) {
      const status: HealthStatus = check.critical === false ? "degraded" : "unhealthy";
      return {
        name: check.name,
        status,
        durationMs: Date.now() - start,
        error: toSerializableError(error).message,
      };
    }
  }
}

function aggregate(components: readonly ComponentHealth[]): HealthStatus {
  if (components.some((component) => component.status === "unhealthy")) return "unhealthy";
  if (components.some((component) => component.status === "degraded")) return "degraded";
  return "healthy";
}

/** Maps a report to an HTTP-friendly shape (503 when unhealthy, otherwise 200). */
export function healthReportToHttp(report: HealthReport): { status: number; body: HealthReport } {
  return { status: report.status === "unhealthy" ? 503 : 200, body: report };
}
