import React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "../../../theme";
import { OptionRow, Sheet, Text } from "../../../ui";

const useStyles = makeStyles((t) => ({
  intro: { marginBottom: t.space.lg },
  list: { gap: t.space.sm },
}));

export interface ChoiceScreenProps {
  titleKey: string;
  introKey?: string;
  options: { id: string; labelKey: string }[];
  selected: string[];
  kind?: "single" | "multi";
  onSelect: (id: string) => void;
  onBack: () => void;
}

/**
 * One component for every single-field settings sub-page: gender, age,
 * relationship, beliefs, language, sound, content preferences.
 *
 * They are the same screen with different data — which is the same insight as
 * the onboarding questionnaire, applied to the other end of the app.
 */
export function ChoiceScreen({
  titleKey,
  introKey,
  options,
  selected,
  kind = "single",
  onSelect,
  onBack,
}: ChoiceScreenProps) {
  const s = useStyles();
  const { t } = useTranslation();

  return (
    <Sheet title={t(titleKey)} onBack={onBack} collapsedOnly>
      {introKey ? (
        <Text variant="body" tone="dim" style={s.intro}>
          {t(introKey)}
        </Text>
      ) : null}

      <>
        {options.map((option) => (
          <OptionRow
            key={option.id}
            label={t(option.labelKey)}
            kind={kind === "single" ? "radio" : "check"}
            selected={selected.includes(option.id)}
            onPress={() => onSelect(option.id)}
          />
        ))}
      </>
    </Sheet>
  );
}
