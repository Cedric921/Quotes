import { questionById } from "../onboarding/questions";

export interface ChoiceOption {
  id: string;
  labelKey: string;
}

/**
 * Option lists for the settings sub-pages.
 *
 * Age and beliefs reuse the onboarding questions verbatim rather than
 * redeclaring them: the user is correcting the answer they already gave, so a
 * second list would eventually drift from the first and the settings screen
 * would offer options the funnel never did.
 */
const fromQuestion = (id: string): ChoiceOption[] =>
  questionById(id).options.map((o) => ({ id: o.id, labelKey: o.labelKey }));

const own = (field: string, ids: string[]): ChoiceOption[] =>
  ids.map((id) => ({ id, labelKey: `settings.options.${field}.${id}` }));

export const genderOptions = own("gender", [
  "woman",
  "man",
  "non_binary",
  "other",
  "prefer_not",
]);

export const relationshipOptions = own("relationship", [
  "single",
  "dating",
  "relationship",
  "married",
  "complicated",
  "prefer_not",
]);

export const soundOptions = own("sound", ["on", "off"]);

export const ageOptions = fromQuestion("age");
export const beliefsOptions = fromQuestion("beliefs");

/**
 * Locales the app actually ships. `system` is first because following the
 * device is the right default for nine users out of ten.
 */
export const languageOptions: ChoiceOption[] = [
  { id: "system", labelKey: "settings.options.language.system" },
  ...["en", "fr", "es", "de", "it", "nl", "ru", "tr", "ar", "zh"].map(
    (id) => ({ id, labelKey: `settings.options.language.${id}` }),
  ),
];
