/**
 * @platform/tracking — shared tracking TYPES only (Sprint 0.1 foundation).
 * Mirrors the event envelope in docs/architecture/16-tracking-specification.md.
 * NO event definitions, NO track()/identify() logic — those arrive in a later sprint.
 */

export type EventSource = "web" | "mobile_web" | "server" | "edge";

export interface ConsentState {
  readonly analytics: boolean;
  readonly marketing: boolean;
  readonly personalization: boolean;
}

export interface PageContext {
  readonly url?: string;
  readonly path?: string;
  readonly referrer?: string;
  readonly title?: string;
  readonly pageType?: string;
  readonly locale?: string;
  readonly currency?: string;
}

export interface UserContext {
  readonly visitorId?: string;
  readonly clientId?: string;
  readonly customerId?: string;
  readonly householdId?: string;
  readonly isLoggedIn?: boolean;
}

export interface SessionContext {
  readonly sessionId?: string;
  readonly journeyId?: string;
  readonly visitorId?: string;
}

export interface DeviceContext {
  readonly deviceType?: string;
  readonly os?: string;
  readonly browser?: string;
  readonly locale?: string;
}

export interface MarketingContext {
  readonly utmSource?: string;
  readonly utmMedium?: string;
  readonly utmCampaign?: string;
  readonly utmTerm?: string;
  readonly utmContent?: string;
}

export interface TrackingContext {
  readonly page?: PageContext;
  readonly user?: UserContext;
  readonly session?: SessionContext;
  readonly device?: DeviceContext;
  readonly marketing?: MarketingContext;
}

/** Shared event envelope. `properties` is event-specific (defined per event in a later sprint). */
export interface TrackingEnvelope<
  TName extends string = string,
  TProps extends Record<string, unknown> = Record<string, unknown>,
> {
  readonly eventId: string;
  readonly eventName: TName;
  readonly eventVersion: number;
  readonly dedupId?: string;
  readonly timestamp: string;
  readonly source: EventSource;
  readonly consent: ConsentState;
  readonly context: TrackingContext;
  readonly properties: TProps;
}
