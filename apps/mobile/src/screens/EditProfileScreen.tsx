import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { useAppSelector } from "../store/hooks";
import { useThemeColors } from "../hooks";
import { useTranslation } from "react-i18next";
import { useUpdateProfile } from "../api/hooks/useUser";

interface EditProfileScreenProps {
  readonly navigation: any;
}

export default function EditProfileScreen({ navigation }: EditProfileScreenProps) {
  const { t } = useTranslation();
  const user = useAppSelector((state) => state.auth.user);
  const { colors } = useThemeColors();
  const styles = createStyles(colors);
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState(user?.name || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [isUploading, setIsUploading] = useState(false);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handlePickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(t("editProfile.permissionRequired"), t("editProfile.permissionMessage"));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      // For now, just use the local URI - in production, upload to Cloudinary
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      await updateProfile.mutateAsync({ name, avatar });
      Alert.alert(t("editProfile.success"), t("editProfile.successMessage"));
      navigation.goBack();
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert(t("common.error"), t("editProfile.errorMessage"));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("editProfile.title")}</Text>
        <TouchableOpacity onPress={handleSave} disabled={updateProfile.isPending}>
          {updateProfile.isPending ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={styles.saveButton}>{t("common.save")}</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handlePickImage} style={styles.avatarContainer}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarImage} />
            ) : (
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
                </Text>
              </LinearGradient>
            )}
            <View style={styles.editBadge}>
              <MaterialIcons name="edit" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.changePhotoText}>{t("editProfile.changePhoto")}</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("editProfile.name")}</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={t("editProfile.namePlaceholder")}
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("editProfile.email")}</Text>
            <View style={styles.disabledInput}>
              <Text style={styles.disabledText}>{user?.email}</Text>
              <Ionicons name="lock-closed" size={16} color={colors.textTertiary} />
            </View>
            <Text style={styles.helperText}>{t("editProfile.emailHelper")}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background } as ViewStyle,
    header: {
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20,
      borderBottomWidth: 1, borderBottomColor: colors.border,
    } as ViewStyle,
    backButton: { width: 40, height: 40, justifyContent: "center", alignItems: "center" } as ViewStyle,
    headerTitle: { fontSize: 20, fontWeight: "600", color: colors.text } as TextStyle,
    saveButton: { fontSize: 16, fontWeight: "600", color: colors.primary } as TextStyle,
    content: { flex: 1 } as ViewStyle,
    avatarSection: { alignItems: "center", paddingVertical: 32 } as ViewStyle,
    avatarContainer: { position: "relative" } as ViewStyle,
    avatar: { width: 100, height: 100, borderRadius: 50, justifyContent: "center", alignItems: "center" } as ViewStyle,
    avatarImage: { width: 100, height: 100, borderRadius: 50 } as ViewStyle,
    avatarText: { fontSize: 40, fontWeight: "700", color: "#fff" } as TextStyle,
    editBadge: {
      position: "absolute", bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16,
      backgroundColor: colors.primary, justifyContent: "center", alignItems: "center",
    } as ViewStyle,
    changePhotoText: { fontSize: 14, color: colors.primary, marginTop: 12, fontWeight: "500" } as TextStyle,
    form: { paddingHorizontal: 20 } as ViewStyle,
    inputGroup: { marginBottom: 24 } as ViewStyle,
    label: { fontSize: 14, fontWeight: "600", color: colors.text, marginBottom: 8 } as TextStyle,
    input: {
      backgroundColor: colors.backgroundSecondary, borderRadius: 12, padding: 16,
      fontSize: 16, color: colors.text, borderWidth: 1, borderColor: colors.border,
    } as TextStyle,
    disabledInput: {
      backgroundColor: colors.backgroundSecondary, borderRadius: 12, padding: 16,
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      borderWidth: 1, borderColor: colors.border, opacity: 0.7,
    } as ViewStyle,
    disabledText: { fontSize: 16, color: colors.textSecondary } as TextStyle,
    helperText: { fontSize: 12, color: colors.textTertiary, marginTop: 8 } as TextStyle,
  });

