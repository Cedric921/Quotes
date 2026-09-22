import React, { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { completeOnboarding, next } from "./store/onboardingSlice";
import { flow } from "./questions";
import { QuestionScreen } from "./screens/QuestionScreen";
import { IntroScreen, ManifestoScreen } from "./screens/StaticScreens";
import { NameScreen } from "./screens/NameScreen";
import { GoalsScreen } from "./screens/GoalsScreen";
import { TopicsScreen } from "./screens/TopicsScreen";
import { RemindersSetupScreen } from "./screens/RemindersSetupScreen";
import { StreakIntroScreen } from "./screens/StreakIntroScreen";
import { PlanReadyScreen } from "./screens/PlanReadyScreen";
import { AppIconScreen } from "./screens/AppIconScreen";
import { BundleUpsellScreen } from "./screens/BundleUpsellScreen";
import {
  PersonalQuoteScreen,
  WelcomeScreen,
} from "./screens/ImmersiveScreens";
import { WidgetSetupScreen } from "./screens/WidgetSetupScreen";
import { ThemePickerScreen } from "../theme/ThemePickerScreen";
import { PaywallScreen } from "../paywall/PaywallScreen";

/**
 * The funnel is a single index into `flow`, not a navigation stack.
 *
 * Thirty steps of `navigation.push` would let the user swipe back into a
 * half-answered questionnaire and would keep every screen mounted. An index
 * keeps one screen alive and makes "where am I" a single number we can log,
 * resume and A/B.
 */
export function OnboardingFlow() {
  const dispatch = useAppDispatch();
  const stepIndex = useAppSelector((s) => s.onboarding.stepIndex);
  const answers = useAppSelector((s) => s.onboarding.answers);

  const step = useMemo(
    () => flow[Math.min(stepIndex, flow.length - 1)],
    [stepIndex],
  );

  const goNext = useCallback(() => dispatch(next()), [dispatch]);
  const finish = useCallback(
    () => void dispatch(completeOnboarding(answers)),
    [dispatch, answers],
  );

  switch (step.kind) {
    case "question":
      return <QuestionScreen questionId={step.questionId!} />;
    case "intro":
      return (
        <IntroScreen
          copyKey={step.copyKey!}
          subtitleKey={step.subtitleKey}
          icon={step.icon}
        />
      );
    case "manifesto":
      return <ManifestoScreen copyKey={step.copyKey!} />;
    case "name":
      return <NameScreen />;
    case "goals":
      return <GoalsScreen />;
    case "topics":
      return <TopicsScreen />;
    case "theme":
      return <ThemePickerScreen onDone={goNext} />;
    case "appIcon":
      return <AppIconScreen onDone={goNext} />;
    case "reminders":
      return <RemindersSetupScreen onDone={goNext} />;
    case "streak":
      return <StreakIntroScreen />;
    case "plan":
      return <PlanReadyScreen />;
    case "bundle":
      return <BundleUpsellScreen />;
    case "personalQuote":
      return <PersonalQuoteScreen />;
    case "widget":
      return <WidgetSetupScreen />;
    case "welcome":
      return <WelcomeScreen onEnter={finish} />;
    default:
      // The funnel ran past its last step: hand over to the paywall, which
      // is the only thing that should ever sit between the funnel and the app.
      return <PaywallScreen presentation="fullscreen" onDismiss={finish} />;
  }
}
