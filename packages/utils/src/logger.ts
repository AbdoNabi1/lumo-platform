/* eslint-disable no-console */
/**
 * Logging foundation — isomorphic, dependency-free. No business logging.
 * Emits structured JSON; level filtered by LOG_LEVEL (default "info").
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_WEIGHT: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

export type LogFields = Record<string, unknown>;

export interface Logger {
  debug(message: string, fields?: LogFields): void;
  info(message: string, fields?: LogFields): void;
  warn(message: string, fields?: LogFields): void;
  error(message: string, fields?: LogFields): void;
  child(scope: string): Logger;
}

export interface LoggerOptions {
  readonly scope?: string;
  readonly level?: LogLevel;
  /** Field names whose values are redacted before output. */
  readonly redact?: readonly string[];
}

function resolveLevel(explicit?: LogLevel): LogLevel {
  if (explicit) return explicit;
  const fromEnv =
    typeof process !== "undefined" ? (process.env?.LOG_LEVEL as LogLevel | undefined) : undefined;
  return fromEnv && fromEnv in LEVEL_WEIGHT ? fromEnv : "info";
}

const REDACTED = "[redacted]";

function redactFields(fields: LogFields, keys: readonly string[]): LogFields {
  if (keys.length === 0) return fields;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    out[key] = keys.includes(key) ? REDACTED : value;
  }
  return out;
}

export function createLogger(options: LoggerOptions = {}): Logger {
  const scope = options.scope ?? "app";
  const level = resolveLevel(options.level);
  const redact = options.redact ?? [];

  function emit(entryLevel: LogLevel, message: string, fields?: LogFields): void {
    if (LEVEL_WEIGHT[entryLevel] < LEVEL_WEIGHT[level]) return;
    const record = {
      ts: new Date().toISOString(),
      level: entryLevel,
      scope,
      msg: message,
      ...(fields ? redactFields(fields, redact) : {}),
    };
    const line = JSON.stringify(record);
    if (entryLevel === "error") console.error(line);
    else if (entryLevel === "warn") console.warn(line);
    else console.log(line);
  }

  return {
    debug: (message, fields) => emit("debug", message, fields),
    info: (message, fields) => emit("info", message, fields),
    warn: (message, fields) => emit("warn", message, fields),
    error: (message, fields) => emit("error", message, fields),
    child: (childScope) => createLogger({ ...options, scope: `${scope}:${childScope}` }),
  };
}

/** Default root logger. */
export const logger: Logger = createLogger();
