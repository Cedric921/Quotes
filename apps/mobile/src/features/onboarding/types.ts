import type { Ionicons } from "@expo/vector-icons";

export type IconName = keyof typeof Ionicons.glyphMap;

/**
 * A questionnaire step.
 *
 * Twenty-two of the thirty onboarding steps are this shape with different
 * data, which is why they share one screen. The type is deliberately
 * serialisable: the admin panel already serves themes and fonts, and this is
 * the next thing that should come from the API so the funnel can change
 * without shipping a build.
 */
export interface Question {
  id: string;
  kind: "single" | "multi";
  /** i18n key for the title, e.g. `onboarding.q.motivation.title`. */
  titleKey: string;
  /** Shows "Ignorer" in the top-right. */
  skippable?: boolean;
  options: QuestionOption[];
  /** Personalises the title with the stored first name. */
  usesName?: boolean;
}

export interface QuestionOption {
  id: string;
  labelKey: string;
  icon?: IconName;
}

/** Steps that don't fit the question mould get their own screen. */
export type StepKind =
  | "question"
  | "intro"
  | "manifesto"
  | "name"
  | "goals"
  | "topics"
  | "theme"
  | "appIcon"
  | "reminders"
  | "streak"
  | "plan"
  | "bundle"
  | "personalQuote"
  | "widget"
  | "welcome";

export interface Step {
  kind: StepKind;
  /** Set when `kind === "question"`. */
  questionId?: string;
  /** Set for `intro` and `manifesto`. */
  copyKey?: string;
  illustration?: string;
}

export type Answers = Record<string, string[]>;
