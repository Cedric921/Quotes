import React, { useCallback } from "react";
import { ScrollView, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Button, Chip, ChipWrap, LinkButton, Screen, Text } from "../../../ui";
import { makeStyles } from "../../../theme";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { next, setTopics } from "../store/onboardingSlice";
import { useTopics } from "../../../api/hooks/useTopics";

const useStyles = makeStyles((t) => ({
  top: { minHeight: 36, justifyContent: "center" },
  title: { marginTop: t.space.lg, marginBottom: t.space.xl },
  list: { paddingBottom: t.space.xl },
}));

/**
 * Topics come from the API, so this is a flow of auto-width chips rather than
 * a fixed list of rows — the label lengths are not ours to control.
 */
export function TopicsScreen() {
  const s = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { data: topics = [] } = useTopics();
  const selected = useAppSelector((st) => st.onboarding.topicIds);

  const toggle = useCallback(
    (id: string) => {
      dispatch(
        setTopics(
          selected.includes(id)
            ? selected.filter((x) => x !== id)
            : [...selected, id],
        ),
      );
    },
    [dispatch, selected],
  );

  return (
    <Screen
      header={
        <View style={s.top}>
          <LinkButton
            label={t("common.skip")}
            align="end"
            onPress={() => dispatch(next())}
          />
        </View>
      }
      footer={
        <Button
          label={t("onboarding.topics.cta")}
          disabled={selected.length === 0}
          onPress={() => dispatch(next())}
        />
      }
    >
      <Text variant="display" align="center" style={s.title}>
        {t("onboarding.topics.title")}
      </Text>

      <ScrollView
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
      >
        <ChipWrap>
          {topics.map((topic) => (
            <Chip
              key={topic.id}
              label={topic.name}
              selected={selected.includes(topic.id)}
              onPress={() => toggle(topic.id)}
              testID={`topic-${topic.id}`}
            />
          ))}
        </ChipWrap>
      </ScrollView>
    </Screen>
  );
}
