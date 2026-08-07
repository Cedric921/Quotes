import React, { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { ChoiceScreen } from "./ChoiceScreen";
import {
  persistSettings,
  setChoice,
  setSound,
  toggleChoice,
} from "../settingsSlice";
import {
  ageOptions,
  beliefsOptions,
  genderOptions,
  languageOptions,
  relationshipOptions,
  soundOptions,
} from "../options";
import { useTopics } from "../../../api/hooks/useTopics";
import { SYSTEM_LANGUAGE, changeLanguage } from "../../../i18n";
import type { Topic } from "../../../types";

interface FieldProps {
  onBack: () => void;
}

/** Single-value fields: pick one, it saves, you go back. */
function useSingleField(field: Parameters<typeof setChoice>[0]["field"]) {
  const dispatch = useAppDispatch();
  const value = useAppSelector((s) => s.settings[field]);

  const select = useCallback(
    (id: string) => {
      dispatch(setChoice({ field, value: id }));
      void dispatch(persistSettings());
    },
    [dispatch, field],
  );

  return { selected: value ? [value] : [], select };
}

export function GenderScreen({ onBack }: FieldProps) {
  const { selected, select } = useSingleField("gender");
  return (
    <ChoiceScreen
      titleKey="settings.gender"
      options={genderOptions}
      selected={selected}
      onSelect={select}
      onBack={onBack}
    />
  );
}

export function AgeScreen({ onBack }: FieldProps) {
  const { selected, select } = useSingleField("age");
  return (
    <ChoiceScreen
      titleKey="settings.age"
      options={ageOptions}
      selected={selected}
      onSelect={select}
      onBack={onBack}
    />
  );
}

export function RelationshipScreen({ onBack }: FieldProps) {
  const { selected, select } = useSingleField("relationship");
  return (
    <ChoiceScreen
      titleKey="settings.relationship"
      options={relationshipOptions}
      selected={selected}
      onSelect={select}
      onBack={onBack}
    />
  );
}

export function BeliefsScreen({ onBack }: FieldProps) {
  const { selected, select } = useSingleField("beliefs");
  return (
    <ChoiceScreen
      titleKey="settings.beliefs"
      options={beliefsOptions}
      selected={selected}
      onSelect={select}
      onBack={onBack}
    />
  );
}

/**
 * Changing the language switches i18next immediately, so the screen you're
 * looking at re-renders in the new language while you're still on it. That
 * instant feedback is the point — a language picker that needs a restart
 * always feels broken.
 */
export function LanguageScreen({ onBack }: FieldProps) {
  const dispatch = useAppDispatch();
  const value = useAppSelector((s) => s.settings.language) ?? SYSTEM_LANGUAGE;

  const select = useCallback(
    (id: string) => {
      dispatch(setChoice({ field: "language", value: id }));
      void dispatch(persistSettings());
      // Through the i18n module, not the instance: it is what writes the
      // preference down and what turns "system" into an actual language.
      void changeLanguage(id);
    },
    [dispatch],
  );

  return (
    <ChoiceScreen
      titleKey="settings.language"
      options={languageOptions}
      selected={[value]}
      onSelect={select}
      onBack={onBack}
    />
  );
}

export function SoundScreen({ onBack }: FieldProps) {
  const dispatch = useAppDispatch();
  const sound = useAppSelector((s) => s.settings.sound);

  const select = useCallback(
    (id: string) => {
      dispatch(setSound(id === "on"));
      void dispatch(persistSettings());
    },
    [dispatch],
  );

  return (
    <ChoiceScreen
      titleKey="settings.sound"
      introKey="settings.intro.sound"
      options={soundOptions}
      selected={[sound ? "on" : "off"]}
      onSelect={select}
      onBack={onBack}
    />
  );
}

/** Multi-value fields, both driven by the topic list the API serves. */
function useTopicField(field: "contentPreferences" | "mutedTopics") {
  const dispatch = useAppDispatch();
  const { data: topics = [] } = useTopics();
  const selected = useAppSelector((s) => s.settings[field]);

  const options = (topics as Topic[]).map((topic) => ({
    id: topic.id,
    // Topic names come from the API already translated, so they are values,
    // not keys — ChoiceScreen runs them through t(), which passes them
    // through unchanged when no key matches.
    labelKey: topic.name,
  }));

  const toggle = useCallback(
    (id: string) => {
      dispatch(toggleChoice({ field, value: id }));
      void dispatch(persistSettings());
    },
    [dispatch, field],
  );

  return { options, selected, toggle };
}

export function ContentPreferencesScreen({ onBack }: FieldProps) {
  const { options, selected, toggle } = useTopicField("contentPreferences");
  return (
    <ChoiceScreen
      titleKey="settings.contentPreferences"
      introKey="settings.intro.contentPreferences"
      kind="multi"
      options={options}
      selected={selected}
      onSelect={toggle}
      onBack={onBack}
    />
  );
}

export function MutedContentScreen({ onBack }: FieldProps) {
  const { options, selected, toggle } = useTopicField("mutedTopics");
  return (
    <ChoiceScreen
      titleKey="settings.mutedContent"
      introKey="settings.intro.mutedContent"
      kind="multi"
      options={options}
      selected={selected}
      onSelect={toggle}
      onBack={onBack}
    />
  );
}
