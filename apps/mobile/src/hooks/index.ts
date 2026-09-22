/**
 * What is left of the v1 hooks once its UI went.
 *
 * The three translation hooks are the client-side auto-translate binding over
 * `services/translationService`; no v2 screen calls them yet, because the API
 * serves quotes and topics already translated. They stay because the service
 * behind them does (spec §6 keeps `services/` intact) — the day auto-translate
 * comes back, this is where it plugs in.
 */
export { useTranslatedQuote } from "./useTranslatedQuote";
export { useTranslatedTopic } from "./useTranslatedTopic";
export { useTranslatedSubscription } from "./useTranslatedSubscription";
