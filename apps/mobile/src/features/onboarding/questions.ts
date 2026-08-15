import type { Question, Step } from "./types";

const q = (
  id: string,
  kind: Question["kind"],
  options: (string | [string, Question["options"][number]["icon"]])[],
  extra: Partial<Question> = {},
): Question => ({
  id,
  kind,
  titleKey: `onboarding.q.${id}.title`,
  options: options.map((o) =>
    typeof o === "string"
      ? { id: o, labelKey: `onboarding.q.${id}.opt.${o}` }
      : { id: o[0], labelKey: `onboarding.q.${id}.opt.${o[0]}`, icon: o[1] },
  ),
  ...extra,
});

/**
 * The twelve signs, with the symbols the design puts beside them. They are
 * Unicode, not icons: no icon font ships the zodiac, and a list of twelve
 * identical bullets is not the screen that was drawn.
 */
const ZODIAC: [string, string][] = [
  ["aries", "\u2648"],
  ["taurus", "\u2649"],
  ["gemini", "\u264A"],
  ["cancer", "\u264B"],
  ["leo", "\u264C"],
  ["virgo", "\u264D"],
  ["libra", "\u264E"],
  ["scorpio", "\u264F"],
  ["sagittarius", "\u2650"],
  ["capricorn", "\u2651"],
  ["aquarius", "\u2652"],
  ["pisces", "\u2653"],
];

const zodiac = (): Question => ({
  id: "zodiac",
  kind: "single",
  titleKey: "onboarding.q.zodiac.title",
  skippable: true,
  options: ZODIAC.map(([id, glyph]) => ({
    id,
    labelKey: `onboarding.q.zodiac.opt.${id}`,
    glyph,
  })),
});

/**
 * The questionnaire. Order lives in `flow` below — this is just the content,
 * so a question can be reordered or A/B'd without touching a screen.
 */
export const questions: Question[] = [
  q("source", "single", [
    "tiktok",
    "instagram",
    "facebook",
    "friend",
    "appstore",
    "search",
    "other",
  ]),
  q("age", "single", ["u18", "18_24", "25_34", "35_44", "45_54", "55p"], {
    skippable: true,
  }),
  q("faith", "single", ["yes", "somewhat", "no", "prefer_not"], {
    skippable: true,
  }),
  q("beliefs", "single", [
    "christian",
    "muslim",
    "jewish",
    "hindu",
    "buddhist",
    "spiritual",
    "none",
    "other",
  ], { skippable: true }),
  zodiac(),
  q("motivationSources", "multi", [
    "learning",
    "people",
    "progress",
    "challenge",
    "recognition",
    "other",
  ], { skippable: true }),
  q("consistency", "multi", [
    "routine",
    "reminders",
    "accountability",
    "small_steps",
    "other",
  ], { skippable: true }),
  q("whenUnmotivated", "multi", [
    "rest",
    "music",
    "talk",
    "push_through",
    "avoid",
  ], { skippable: true }),
  q("dailyHabit", "multi", [
    "morning",
    "commute",
    "break",
    "evening",
    "before_sleep",
  ], { skippable: true }),

  // Second block — after the theme is chosen and the first quote is shown.
  q("quoteStyle", "multi", [
    "tough_love",
    "admired_people",
    "short",
    "thought_provoking",
    "spiritual",
  ], { skippable: true }),
  q("whenItLands", "multi", [
    "write",
    "save",
    "share",
    "send",
    "download",
    "wallpaper",
  ], { skippable: true }),
  q("mentalHealth", "multi", [
    "meditation",
    "support",
    "exercise",
    "therapy",
    "journal",
    "nature",
  ], { skippable: true }),
  q("thoughtsShapeReality", "single", ["seen_it", "open", "not_really"], {
    skippable: true,
  }),
  q("positiveThinking", "single", [
    "believe",
    "heard",
    "tell_me_more",
    "sceptical",
  ], { skippable: true }),
  q("mood", "single", [
    ["excellent", "happy-outline"],
    ["good", "happy-outline"],
    ["neutral", "remove-outline"],
    ["bad", "sad-outline"],
    ["terrible", "sad-outline"],
    ["other", "ellipsis-horizontal"],
  ], { usesName: true }),
  q("moodCause", "multi", [
    ["work", "briefcase-outline"],
    ["health", "pulse-outline"],
    ["relationship", "heart-outline"],
    ["family", "home-outline"],
    ["friends", "people-outline"],
    ["other", "ellipsis-horizontal"],
  ]),
  q("avoiding", "multi", [
    "heal_past",
    "set_goals",
    "transform_relationships",
    "career",
    "finances",
    "other",
  ], { skippable: true }),
  q("improve", "multi", [
    ["positive_thinking", "happy-outline"],
    ["faith", "sparkles-outline"],
    ["stress", "rainy-outline"],
    ["self_esteem", "ribbon-outline"],
    ["relationships", "people-circle-outline"],
    ["goals", "flag-outline"],
  ]),
  q("achieve", "multi", [
    "positive_mindset",
    "confidence",
    "reach_goals",
    "energy",
    "happiness",
    "presence",
  ], { skippable: true }),
];

export const questionById = (id: string): Question => {
  const found = questions.find((x) => x.id === id);
  if (!found) throw new Error(`Unknown onboarding question: ${id}`);
  return found;
};

/**
 * Whether the funnel asks its questions. Off at the client's request: the
 * first launch keeps the welcome, name, streak, reminders, icon, bundle,
 * theme, plan, manifesto and widget screens, and skips every list — the
 * questions, the goals, the topics — and the two intros that only announce
 * them. The screens, the answers and the personalised copy stay in the code
 * for the day it comes back; flip this and the whole questionnaire returns.
 */
export const QUESTIONNAIRE_ENABLED = false;

/** Intros whose only job is to introduce a run of questions. */
const QUESTIONNAIRE_INTROS = new Set([
  "onboarding.intro.goals",
  "onboarding.intro.quiz2",
]);

export const isQuestionnaireStep = (step: Step): boolean =>
  step.kind === "question" ||
  step.kind === "goals" ||
  step.kind === "topics" ||
  (step.kind === "intro" && QUESTIONNAIRE_INTROS.has(step.copyKey ?? ""));

/**
 * The funnel as designed, ~30 steps; the `question` ones all render through
 * `QuestionScreen`. `flow` below is what actually runs.
 */
export const fullFlow: Step[] = [
  {
    kind: "intro",
    copyKey: "onboarding.intro.hero",
    subtitleKey: "onboarding.intro.heroSubtitle",
    icon: "sunny-outline",
  },
  { kind: "question", questionId: "source" },
  {
    kind: "intro",
    copyKey: "onboarding.intro.personalise",
    icon: "compass-outline",
  },
  { kind: "question", questionId: "age" },
  { kind: "name" },
  { kind: "question", questionId: "faith" },
  { kind: "question", questionId: "beliefs" },
  { kind: "question", questionId: "zodiac" },
  { kind: "question", questionId: "motivationSources" },
  { kind: "question", questionId: "consistency" },
  { kind: "question", questionId: "whenUnmotivated" },
  { kind: "intro", copyKey: "onboarding.intro.goals", icon: "flag-outline" },
  { kind: "question", questionId: "dailyHabit" },
  { kind: "streak" },
  { kind: "reminders" },
  { kind: "appIcon" },
  { kind: "bundle" },
  { kind: "theme" },
  { kind: "personalQuote" },
  {
    kind: "intro",
    copyKey: "onboarding.intro.quiz2",
    icon: "chatbubble-ellipses-outline",
  },
  { kind: "question", questionId: "quoteStyle" },
  { kind: "question", questionId: "whenItLands" },
  { kind: "question", questionId: "mentalHealth" },
  { kind: "question", questionId: "thoughtsShapeReality" },
  { kind: "question", questionId: "positiveThinking" },
  { kind: "question", questionId: "mood" },
  { kind: "question", questionId: "moodCause" },
  { kind: "question", questionId: "avoiding" },
  { kind: "question", questionId: "improve" },
  { kind: "question", questionId: "achieve" },
  { kind: "goals" },
  { kind: "topics" },
  { kind: "plan" },
  { kind: "manifesto", copyKey: "onboarding.manifesto.firstThing" },
  { kind: "manifesto", copyKey: "onboarding.manifesto.threeDays" },
  { kind: "widget" },
  { kind: "welcome" },
];

/** The steps the app runs, in order. */
export const flow: Step[] = QUESTIONNAIRE_ENABLED
  ? fullFlow
  : fullFlow.filter((step) => !isQuestionnaireStep(step));

