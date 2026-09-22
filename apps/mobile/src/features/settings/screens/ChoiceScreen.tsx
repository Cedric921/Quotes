import React, { useMemo, useState } from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { makeStyles } from "../../../theme";
import { Input, OptionRow, Sheet, Text } from "../../../ui";

const useStyles = makeStyles((t) => ({
  intro: { marginBottom: t.space.lg },
  // The rows are pills; without air between them they read as one striped
  // block. This is the gap the questionnaire uses.
  list: { gap: t.space.sm },
  empty: { marginTop: t.space.xl },
}));

/** Accent- and case-insensitive, so "eco" finds "École". */
const fold = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

export interface ChoiceScreenProps {
  titleKey: string;
  introKey?: string;
  options: { id: string; labelKey: string }[];
  selected: string[];
  kind?: "single" | "multi";
  onSelect: (id: string) => void;
  onBack: () => void;
  /**
   * Adds a search field pinned above the home indicator. Meant for the two
   * topic lists, which the API can grow past what fits on a screen.
   */
  searchable?: boolean;
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
  searchable,
}: ChoiceScreenProps) {
  const s = useStyles();
  const { t } = useTranslation();
  const [query, setQuery] = useState("");

  const labelled = useMemo(
    () => options.map((option) => ({ ...option, label: t(option.labelKey) })),
    [options, t],
  );

  const visible = useMemo(() => {
    const needle = fold(query.trim());
    if (!needle) return labelled;
    return labelled.filter((option) => fold(option.label).includes(needle));
  }, [labelled, query]);

  return (
    <Sheet
      title={t(titleKey)}
      onBack={onBack}
      collapsedOnly
      footer={
        searchable ? (
          <Input
            variant="glass"
            icon="search-outline"
            value={query}
            onChangeText={setQuery}
            placeholder={t("common.search")}
            label={t("common.search")}
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
            returnKeyType="search"
          />
        ) : undefined
      }
    >
      {introKey ? (
        <Text variant="body" tone="dim" style={s.intro}>
          {t(introKey)}
        </Text>
      ) : null}

      <View style={s.list}>
        {visible.map((option) => (
          <OptionRow
            key={option.id}
            label={option.label}
            kind={kind === "single" ? "radio" : "check"}
            selected={selected.includes(option.id)}
            onPress={() => onSelect(option.id)}
          />
        ))}
      </View>

      {visible.length === 0 ? (
        <Text variant="body" tone="dim" align="center" style={s.empty}>
          {t("common.noResults")}
        </Text>
      ) : null}
    </Sheet>
  );
}
