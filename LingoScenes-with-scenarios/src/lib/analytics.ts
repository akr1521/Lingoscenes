// Minimal analytics abstraction. FR-01 §39 requires these events "from the
// beginning" — this app doesn't have a vendor SDK (Segment/Amplitude/etc.)
// wired in yet, so `track()` logs a structured event in dev and is the one
// place a real provider gets plugged in later (see `setAnalyticsHandler`)
// without touching any call site in the scenarios feature.

export type AnalyticsEventName =
  | 'learn_screen_viewed'
  | 'scenario_list_loaded'
  | 'category_selected'
  | 'filter_applied'
  | 'search_started'
  | 'search_result_clicked'
  | 'scenario_card_clicked'
  | 'scenario_detail_viewed'
  | 'scenario_start_clicked';

export type AnalyticsProperties = Record<string, string | number | boolean | undefined | null>;

type AnalyticsHandler = (event: AnalyticsEventName, properties?: AnalyticsProperties) => void;

let handler: AnalyticsHandler | null = null;

/** Plug in a real analytics SDK (Segment, Amplitude, PostHog, ...) later. */
export function setAnalyticsHandler(fn: AnalyticsHandler | null): void {
  handler = fn;
}

export function track(event: AnalyticsEventName, properties?: AnalyticsProperties): void {
  if (handler) {
    handler(event, properties);
    return;
  }
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log(`[analytics] ${event}`, properties ?? {});
  }
}
