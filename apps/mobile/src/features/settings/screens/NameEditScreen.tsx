import React, { useState } from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { Button, Input, Sheet } from "../../../ui";
import { makeStyles } from "../../../theme";
import { useAppSelector } from "../../../store/hooks";
import { useUpdateProfile } from "../../../api/hooks/useUser";

const useStyles = makeStyles((t) => ({
  field: { marginTop: t.space.sm },
  cta: { marginTop: t.space.xl },
}));

/**
 * The name is the one "about you" field that isn't a choice — and the one the
 * product uses most, since it goes into the mood question, the personalised
 * quote and every reminder. It writes to the API, not to local settings.
 */
export function NameEditScreen({ onBack }: { onBack: () => void }) {
  const s = useStyles();
  const { t } = useTranslation();
  const current = useAppSelector((st) => st.auth.user?.name ?? "");
  const [value, setValue] = useState(current);
  const updateProfile = useUpdateProfile();

  const trimmed = value.trim();
  const dirty = trimmed.length > 0 && trimmed !== current;

  const save = () => {
    updateProfile.mutate({ name: trimmed }, { onSuccess: onBack });
  };

  return (
    <Sheet title={t("settings.name")} onBack={onBack} collapsedOnly>
      <View style={s.field}>
        <Input
          value={value}
          onChangeText={setValue}
          placeholder={t("onboarding.name.placeholder")}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={() => dirty && save()}
          label={t("settings.name")}
        />
      </View>

      <View style={s.cta}>
        <Button
          label={t("common.save")}
          disabled={!dirty}
          loading={updateProfile.isPending}
          onPress={save}
        />
      </View>
    </Sheet>
  );
}
