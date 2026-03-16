import { useCallback, useState, useMemo, useEffect, useRef } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  RefreshControl,
  ActivityIndicator,
  ViewStyle,
  ImageBackground,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { captureRef } from "react-native-view-shot";
import Toast from "react-native-toast-message";
import {
  QuoteCard,
  LoadingSkeleton,
  ErrorMessage,
  Header,
  DotsIndicator,
  ActionButtons,
} from "../components";
import {
  SubscriptionBottomSheet,
  ProfileCompletionModal,
} from "../components/onboarding";
import { useQuotes, useToggleLikeQuote } from "../api/hooks";
import { useCreateCheckoutSession } from "../api/hooks/useSubscriptions";
import { Quote } from "../types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { registerThunk } from "../store/slices/authSlice";
import { useThemeColors } from "../hooks";
import { useTranslation } from "react-i18next";
import { widgetService } from "../services/widgetService";
import { SubscriptionPlan } from "../store/slices/subscriptionSlice";

const ONBOARDING_KEY = "@focus_onboarding_shown";
const DONT_SHOW_ONBOARDING_KEY = "@focus_dont_show_onboarding";

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Home"
>;

interface HomeScreenProps {
  readonly navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { t } = useTranslation();
  const { height } = useWindowDimensions();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const isSubscribed = user?.isSubscribed ?? false;
  const isAdmin = user?.isAdmin ?? false;
  const backgroundTheme = useAppSelector(
    (state) => state.theme.backgroundTheme,
  );
  const { colors } = useThemeColors();
  const styles = createStyles(colors, height);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Sharing state and ref
  const [isSharing, setIsSharing] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const screenRef = useRef<View>(null);

  // Onboarding states
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null,
  );
  const [isRegistering, setIsRegistering] = useState(false);

  // React Query hooks
  const {
    data,
    isLoading,
    isRefetching,
    error,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useQuotes(10);

  const toggleLikeMutation = useToggleLikeQuote();
  const checkoutMutation = useCreateCheckoutSession();

  // Check if onboarding should be shown
  // Show on every app open if user is not subscribed (unless "don't show again" is checked)
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        // Don't show if user is subscribed or admin
        if (isSubscribed || isAdmin) {
          return;
        }

        // Check if user has opted out of seeing the popup
        const dontShowAgain = await AsyncStorage.getItem(
          DONT_SHOW_ONBOARDING_KEY,
        );
        if (dontShowAgain === "true") {
          return;
        }

        // Show the onboarding popup after a short delay
        setTimeout(() => setShowOnboarding(true), 1000);
      } catch (error) {
        console.error("Error checking onboarding:", error);
      }
    };
    checkOnboarding();
  }, [isSubscribed, isAdmin]);

  // Handle plan selection from bottom sheet
  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowOnboarding(false);
    setShowProfileModal(true);
  };

  // Handle onboarding close
  const handleCloseOnboarding = async () => {
    setShowOnboarding(false);
    // Don't set ONBOARDING_KEY anymore - we want to show it every time
    // unless user explicitly opts out via "don't show again"
  };

  // Handle profile completion and checkout
  const handleProfileComplete = async (profileData: {
    name: string;
    email: string;
    password: string;
  }) => {
    if (!selectedPlan) return;

    setIsRegistering(true);
    try {
      // 1. Register the user
      await dispatch(
        registerThunk({
          name: profileData.name,
          email: profileData.email,
          password: profileData.password,
        }),
      ).unwrap();

      // 2. Mark onboarding as completed
      await AsyncStorage.setItem(ONBOARDING_KEY, "true");

      // 3. Create checkout session
      const checkoutResult = await checkoutMutation.mutateAsync(
        selectedPlan.id,
      );

      if (!checkoutResult.checkoutUrl) {
        throw new Error("No checkout URL received");
      }

      // 4. Open Stripe Checkout
      setShowProfileModal(false);
      const browserResult = await WebBrowser.openBrowserAsync(
        checkoutResult.checkoutUrl,
        {
          dismissButtonStyle: "cancel",
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
        },
      );

      if (browserResult.type === "cancel") {
        Toast.show({
          type: "info",
          text1: t("subscription.paymentCancelled"),
          text2: t("subscription.paymentCancelledMessage"),
        });
      } else {
        Toast.show({
          type: "success",
          text1: t("subscription.paymentSuccess"),
          text2: t("subscription.subscriptionActivated"),
        });
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: t("errors.registrationFailed"),
        text2: error.message || t("errors.tryAgain"),
      });
    } finally {
      setIsRegistering(false);
    }
  };

  // Handle profile modal close
  const handleCloseProfileModal = async () => {
    setShowProfileModal(false);
    setSelectedPlan(null);
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
  };

  // Flatten pages into a single array of quotes
  const quotes = useMemo(() => {
    return data?.pages.flat() || [];
  }, [data]);

  // Filter out quotes from premium topics if user is not authenticated or not premium/admin
  const filteredQuotes = useMemo(() => {
    return quotes.filter((quote) => {
      // If topic is not premium, show it
      if (!quote.topic?.isPremium) return true;

      // If topic is premium, only show if user is authenticated AND (premium OR admin)
      return isAuthenticated && (user?.isPremium || user?.isAdmin);
    });
  }, [quotes, isAuthenticated, user]);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleLike = useCallback(
    (quoteId: string) => {
      const quote = quotes.find((q) => q.id === quoteId);
      if (!quote) return;

      toggleLikeMutation.mutate({
        quoteId,
        isLiked: quote.isLiked || false,
      });
    },
    [quotes, toggleLikeMutation],
  );

  const handleProfile = useCallback(() => {
    // If user is not subscribed, redirect to subscription screen first
    const isPremium = user?.isSubscribed || user?.isAdmin;
    if (!isPremium) {
      navigation.navigate("Subscription", { fromProfile: true });
    } else {
      navigation.navigate("Profile");
    }
  }, [navigation, user?.isSubscribed, user?.isAdmin]);

  const handleTopics = useCallback(() => {
    navigation.navigate("Topics");
  }, [navigation]);

  const handleLogin = useCallback(() => {
    navigation.navigate("Login");
  }, [navigation]);

  // Handle share - capture the screen and share as image
  const handleShare = useCallback(async () => {
    if (!screenRef.current || isSharing) return;

    try {
      setIsSharing(true);

      // Hide buttons before capture
      setIsCapturing(true);

      // Small delay to ensure buttons are hidden
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Capture the screen as an image
      const uri = await captureRef(screenRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });

      // Show buttons again
      setIsCapturing(false);

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Toast.show({
          type: "error",
          text1: t("common.error"),
          text2: "Sharing is not available on this device",
        });
        return;
      }

      // Share the image
      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: t("common.share"),
        UTI: "public.png",
      });

      // Clean up the temporary file after sharing
      if (Platform.OS !== "web") {
        try {
          const file = new FileSystem.File(uri);
          if (file.exists) {
            file.delete();
          }
        } catch {
          // Ignore cleanup errors
        }
      }
    } catch (error) {
      console.error("Error sharing quote:", error);
      setIsCapturing(false);
      Toast.show({
        type: "error",
        text1: t("common.error"),
        text2: "Failed to share quote",
      });
    } finally {
      setIsSharing(false);
    }
  }, [isSharing, t]);

  const lastWidgetUpdateRef = useRef<string | null>(null);

  const handleViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  // Update widget when current quote changes
  useEffect(() => {
    const currentQuote = filteredQuotes[currentIndex];
    if (currentQuote && currentQuote.id !== lastWidgetUpdateRef.current) {
      lastWidgetUpdateRef.current = currentQuote.id;
      widgetService.updateWidgetQuote({
        content: currentQuote.text,
        author: currentQuote.author,
        topicName: currentQuote.topic?.name,
      });
    }
  }, [currentIndex, filteredQuotes]);

  const renderItem = useCallback(
    ({ item }: { item: Quote }) => (
      <QuoteCard quote={item} onLike={handleLike} isLiked={item.isLiked} />
    ),
    [handleLike],
  );

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isLoading && !isRefetching) {
      fetchNextPage();
    }
  }, [hasNextPage, isLoading, isRefetching, fetchNextPage]);

  const renderFooter = useCallback(() => {
    if (!isLoading && !isRefetching) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="large" color="#0A84FF" />
      </View>
    );
  }, [isLoading, isRefetching, styles.footer]);

  // Show loading skeleton on initial load
  if (isLoading && filteredQuotes.length === 0 && !error) {
    return <LoadingSkeleton />;
  }

  // Show error message if there's an error and no quotes
  if (error && filteredQuotes.length === 0) {
    return (
      <ErrorMessage
        message={t("errors.failedToLoadQuotes")}
        onRetry={handleRetry}
      />
    );
  }

  const content = (
    <>
      {/* Header - Hidden during capture */}
      {!isCapturing && <Header />}

      {/* Quotes List */}
      <FlatList
        data={filteredQuotes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor="#0A84FF"
          />
        }
        ListFooterComponent={renderFooter}
        getItemLayout={(_data, index) => ({
          length: height,
          offset: height * index,
          index,
        })}
      />

      {/* Dots Indicator */}
      {/* {filteredQuotes.length > 0 && (
        <DotsIndicator
          total={filteredQuotes.length}
          currentIndex={currentIndex}
        />
      )} */}

      {/* Fixed Bottom Navigation Bar - Hidden during capture */}
      {!isCapturing &&
        (filteredQuotes.length > 0 && filteredQuotes[currentIndex] ? (
          <ActionButtons
            quoteId={filteredQuotes[currentIndex].id}
            isLiked={filteredQuotes[currentIndex].isLiked}
            isAuthenticated={isAuthenticated}
            onLike={handleLike}
            onSettings={handleProfile}
            onTopics={handleTopics}
            onLogin={handleLogin}
            onShare={handleShare}
            isSharing={isSharing}
          />
        ) : (
          <ActionButtons
            quoteId=""
            isLiked={false}
            isAuthenticated={isAuthenticated}
            onLike={() => {}}
            onSettings={handleProfile}
            onTopics={handleTopics}
            onLogin={handleLogin}
          />
        ))}

      {/* Onboarding Bottom Sheet */}
      <SubscriptionBottomSheet
        isVisible={showOnboarding}
        onClose={handleCloseOnboarding}
        onSelectPlan={handleSelectPlan}
      />

      {/* Profile Completion Modal */}
      <ProfileCompletionModal
        isVisible={showProfileModal}
        onClose={handleCloseProfileModal}
        onComplete={handleProfileComplete}
        selectedPlan={selectedPlan}
        isLoading={isRegistering}
      />
    </>
  );

  // If a background theme is selected, wrap content in ImageBackground with glass effect
  if (backgroundTheme?.imageUrl) {
    return (
      <View ref={screenRef} collapsable={false} style={styles.container}>
        <ImageBackground
          source={{ uri: backgroundTheme.imageUrl }}
          style={styles.container}
          resizeMode="cover"
        >
          {/* Glass effect overlay using BlurView */}
          <BlurView intensity={4} tint="dark" style={styles.glassOverlay}>
            <View style={styles.glassInner}>{content}</View>
          </BlurView>
        </ImageBackground>
      </View>
    );
  }

  return (
    <View ref={screenRef} collapsable={false} style={styles.container}>
      {content}
    </View>
  );
}

const createStyles = (colors: any, height: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    } as ViewStyle,
    glassOverlay: {
      flex: 1,
    } as ViewStyle,
    glassInner: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.1)",
    } as ViewStyle,
    footer: {
      height: height,
      justifyContent: "center",
      alignItems: "center",
    } as ViewStyle,
  });
