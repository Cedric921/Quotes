import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Answers } from "../types";

const KEY_DONE = "@focus_onboarding_v2_done";
const KEY_ANSWERS = "@focus_onboarding_v2_answers";

export interface OnboardingState {
  stepIndex: number;
  answers: Answers;
  firstName: string;
  goals: string;
  topicIds: string[];
  appIconId?: string;
  done: boolean;
  hydrated: boolean;
}

const initialState: OnboardingState = {
  stepIndex: 0,
  answers: {},
  firstName: "",
  goals: "",
  topicIds: [],
  done: false,
  hydrated: false,
};

const onboardingSlice = createSlice({
  name: "onboarding",
  initialState,
  reducers: {
    next: (state) => {
      state.stepIndex += 1;
    },
    back: (state) => {
      state.stepIndex = Math.max(0, state.stepIndex - 1);
    },
    /** Single-select replaces; multi-select toggles. */
    answer: (
      state,
      action: PayloadAction<{
        questionId: string;
        optionId: string;
        kind: "single" | "multi";
      }>,
    ) => {
      const { questionId, optionId, kind } = action.payload;
      if (kind === "single") {
        state.answers[questionId] = [optionId];
        return;
      }
      const current = state.answers[questionId] ?? [];
      state.answers[questionId] = current.includes(optionId)
        ? current.filter((x) => x !== optionId)
        : [...current, optionId];
    },
    skip: (state, action: PayloadAction<string>) => {
      state.answers[action.payload] = [];
      state.stepIndex += 1;
    },
    setFirstName: (state, action: PayloadAction<string>) => {
      state.firstName = action.payload;
    },
    setGoals: (state, action: PayloadAction<string>) => {
      state.goals = action.payload;
    },
    setTopics: (state, action: PayloadAction<string[]>) => {
      state.topicIds = action.payload;
    },
    setAppIcon: (state, action: PayloadAction<string>) => {
      state.appIconId = action.payload;
    },
    hydrate: (
      state,
      action: PayloadAction<{ done: boolean; answers: Answers }>,
    ) => {
      state.done = action.payload.done;
      state.answers = action.payload.answers;
      state.hydrated = true;
    },
    finish: (state) => {
      state.done = true;
    },
  },
});

export const {
  next,
  back,
  answer,
  skip,
  setFirstName,
  setGoals,
  setTopics,
  setAppIcon,
  hydrate,
  finish,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;

type Dispatch = (action: unknown) => void;

export const loadOnboarding = () => async (dispatch: Dispatch) => {
  try {
    const [done, answers] = await Promise.all([
      AsyncStorage.getItem(KEY_DONE),
      AsyncStorage.getItem(KEY_ANSWERS),
    ]);
    dispatch(
      hydrate({
        done: done === "1",
        answers: answers ? (JSON.parse(answers) as Answers) : {},
      }),
    );
  } catch {
    dispatch(hydrate({ done: false, answers: {} }));
  }
};

export const completeOnboarding =
  (answers: Answers) => async (dispatch: Dispatch) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(KEY_DONE, "1"),
        AsyncStorage.setItem(KEY_ANSWERS, JSON.stringify(answers)),
      ]);
    } catch {
      // Persisting the funnel is best-effort; never block the user on it.
    }
    dispatch(finish());
  };
