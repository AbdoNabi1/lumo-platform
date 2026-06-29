/**
 * @platform/types — generic, framework-free TypeScript utility types.
 * Sprint 0.1 foundation: NO business/domain types live here.
 */

export type Nullable<T> = T | null;
export type Maybe<T> = T | null | undefined;
export type Awaitable<T> = T | Promise<T>;
export type ValueOf<T> = T[keyof T];
export type Prettify<T> = { [K in keyof T]: T[K] } & {};
export type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

declare const __brand: unique symbol;
/** Nominal/branded primitive, e.g. `type UserId = Brand<string, "UserId">`. */
export type Brand<T, B extends string> = T & { readonly [__brand]: B };

/** Discriminated result type for expected (non-exceptional) failures. */
export type Result<T, E = Error> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

/** Cursor-paginated envelope (cursor-only, per the API architecture contract). */
export interface Paginated<T> {
  readonly items: readonly T[];
  readonly pageInfo: {
    readonly hasNextPage: boolean;
    readonly endCursor: Nullable<string>;
  };
}
