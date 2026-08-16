import React, { useMemo, useState } from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { makeStyles } from "../../../theme";
import {
  Input,
  LinkButton,
  Loader,
  LoadFailed,
  OptionRow,
  Sheet,
  Text,
} from "../../../ui";
import type { LoadState } from "../../../api/hooks/useLoadState";

const useStyles = makeStyles((t) => ({
  intro: { marginBottom: t.space.lg },
  notice: { marginBottom: t.space.lg, alignItems: "center", gap: t.space.xxs },
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
  options: { id: string; labelKey: string; locked?: boolean }[];
  selected: string[];
  kind?: "single" | "multi";
  onSelect: (id: string) => void;
  onBack: () => void;
  /**
   * Adds a search field pinned above the home indicator. Meant for the two
   * topic lists, which the API can grow past what fits on a screen.
   */
  searchable?: boolean;
  /**
   * Shown above the list when some options are locked: one line saying
   * why, and where to go to unlock them.
   */
  lockedNoticeKey?: string;
  onOpenPaywall?: () => void;
  /**
   * For options served by the API. While nothing is cached, a spinner or an
   * error with a retry stands in for the list — never "no results".
   */
  load?: LoadState;
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
  lockedNoticeKey,
  onOpenPaywall,
  load,
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

  const hasLocked = useMemo(
    () => options.some((option) => option.locked),
    [options],
  );

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

      {hasLocked && lockedNoticeKey ? (
        <View style={s.notice}>
          <Text variant="caption" tone="tertiary" align="center">
            {t(lockedNoticeKey)}
          </Text>
          {onOpenPaywall ? (
            <LinkButton
              label={t("settings.unlockAll")}
              icon="ribbon-outline"
              onPress={onOpenPaywall}
            />
          ) : null}
        </View>
      ) : null}

      {load?.loading ? <Loader withLabel /> : null}
      {load?.failed ? <LoadFailed onRetry={load.retry} /> : null}

      <View style={s.list}>
        {visible.map((option) => (
          <OptionRow
            key={option.id}
            label={option.label}
            kind={kind === "single" ? "radio" : "check"}
            selected={selected.includes(option.id)}
            locked={option.locked}
            onPress={() => onSelect(option.id)}
          />
        ))}
      </View>

      {!load?.loading && !load?.failed && visible.length === 0 ? (
        <Text variant="body" tone="dim" align="center" style={s.empty}>
          {t("common.noResults")}
        </Text>
      ) : null}
    </Sheet>
  );
}
