import React, { useMemo } from "react";
import { ScrollView, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Button, LinkButton, OptionRow, Screen, Text } from "../../../ui";
import { makeStyles } from "../../../theme";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { answer, next, skip } from "../store/onboardingSlice";
import { questionById } from "../questions";

const useStyles = makeStyles((t) => ({
  top: { minHeight: 36, justifyContent: "center" },
  title: { marginTop: t.space.lg, marginBottom: t.space.xl },
  list: { gap: t.space.sm, paddingBottom: t.space.xl },
}));

export interface QuestionScreenProps {
  questionId: string;
}

/**
 * One screen for twenty-two steps.
 *
 * Single-select advances on tap; multi-select waits for "Continuer" because
 * the user is still composing an answer. That asymmetry is what makes the
 * funnel feel fast without ever feeling like it jumped ahead of you.
 */
export function QuestionScreen({ questionId }: QuestionScreenProps) {
  const s = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const question = useMemo(() => questionById(questionId), [questionId]);
  const selected = useAppSelector((st) => st.onboarding.answers[questionId]) ?? [];
  const firstName = useAppSelector((st) => st.onboarding.firstName);

  const title = question.usesName
    ? t(question.titleKey, { name: firstName })
    : t(question.titleKey);

  const canContinue = question.kind === "multi" ? selected.length > 0 : true;

  const onSelect = (optionId: string) => {
    dispatch(answer({ questionId, optionId, kind: question.kind }));
    if (question.kind === "single") dispatch(next());
  };

  return (
    <Screen
      header={
        <View style={s.top}>
          {question.skippable ? (
            <LinkButton
              label={t("common.skip")}
              align="end"
              onPress={() => dispatch(skip(questionId))}
              testID="onboarding-skip"
            />
          ) : null}
        </View>
      }
      footer={
        question.kind === "multi" ? (
          <Button
            label={t("common.continue")}
            disabled={!canContinue}
            onPress={() => dispatch(next())}
            testID="onboarding-continue"
          />
        ) : undefined
      }
    >
      <Text variant="display" align="center" style={s.title}>
        {title}
      </Text>

      <ScrollView
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
      >
        {question.options.map((option) => (
          <OptionRow
            key={option.id}
            label={t(option.labelKey)}
            icon={option.icon}
            glyph={option.glyph}
            kind={question.kind === "single" ? "radio" : "check"}
            selected={selected.includes(option.id)}
            onPress={() => onSelect(option.id)}
            testID={`option-${option.id}`}
          />
        ))}
      </ScrollView>
    </Screen>
  );
}
