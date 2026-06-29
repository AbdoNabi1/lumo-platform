import type { Redis } from "ioredis";
import type { HealthCheck } from "@platform/health";

/** Redis health probe via PING. */
export function createRedisHealthCheck(redis: Redis): HealthCheck {
  return {
    name: "redis",
    async probe(): Promise<void> {
      const response = await redis.ping();
      if (response !== "PONG") {
        throw new Error(`Unexpected PING response: ${response}`);
      }
    },
  };
}
