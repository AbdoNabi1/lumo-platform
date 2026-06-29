import type { Principal } from "./principal";

/**
 * Verifies a bearer token and resolves the authenticated {@link Principal}, or `null` when the
 * token is missing or invalid. Implemented by infrastructure (an Ory adapter, later) and invoked at
 * the interfaces boundary; the domain never depends on it. Callers map a `null` result to an
 * `AuthenticationError` (`@platform/utils`).
 */
export interface Authenticator {
  verify(token: string): Promise<Principal | null>;
}
