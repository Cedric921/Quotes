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
  ActionButtons,
  ThemeSelectionModal,
} from "../components";
import {
  SubscriptionBottomSheet,
  ProfileCompletionModal,
} from "../components/onboarding";
import { useQuotes, useToggleLikeQuote } from "../api/hooks";
import { useCreateCheckoutSession } from "../api/hooks/useSubscriptions";
import { useApplyPromoCode } from "../api/hooks/usePromoCode";
import { Quote } from "../types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { registerThunk } from "../store/slices/authSlice";
import { useThemeColors, usePermissions, useReviewPrompt } from "../hooks";
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

  // Request permissions on first install
  usePermissions();

  // Sharing state and ref
  const [isSharing, setIsSharing] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const screenRef = useRef<View>(null);

  // Onboarding states
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null,
  );
  const [isRegistering, setIsRegistering] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // React Query hooks
  // Always include all quotes for better UX - filtering is just for premium features
  const {
    data,
    isLoading,
    isFetching,
    isRefetching,
    error,
    fetchNextPage,
    hasNextPage,
    refetch,
    status,
  } = useQuotes(10, true);

  // Debug log for tracking fetch status
  useEffect(() => {
    console.log("[HomeScreen] Query status:", {
      status,
      isLoading,
      isFetching,
      hasData: !!data,
      pagesCount: data?.pages?.length,
      quotesCount: data?.pages?.flat()?.length,
      error: error?.message,
    });
  }, [status, isLoading, isFetching, data, error]);

  // Timeout for loading - show error after 15 seconds
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    // Use isFetching instead of isLoading for more accurate state
    if ((isLoading || isFetching) && !data?.pages?.length) {
      timeoutId = setTimeout(() => {
        setLoadingTimeout(true);
      }, 15000);
    } else {
      setLoadingTimeout(false);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoading, isFetching, data]);

  const toggleLikeMutation = useToggleLikeQuote();
  const checkoutMutation = useCreateCheckoutSession();

  // Check if onboarding should be shown
  // Show welcome bottom sheet ONLY for NON-authenticated users (guests)
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        // ONLY show if user is NOT authenticated (guest users)
        if (isAuthenticated) {
          return;
        }

        // Check if user has opted out of seeing the popup
        const dontShowAgain = await AsyncStorage.getItem(
          DONT_SHOW_ONBOARDING_KEY,
        );
        if (dontShowAgain === "true") {
          return;
        }

        // Show the welcome bottom sheet after a short delay
        setTimeout(() => setShowOnboarding(true), 1000);
      } catch (error) {
        console.error("Error checking onboarding:", error);
      }
    };
    checkOnboarding();
  }, [isAuthenticated]);

  // Handle plan selection from bottom sheet
  // Navigate directly to RevenueCat-powered SubscriptionScreen so users
  // can purchase without being forced to create an account first.
  const handleSelectPlan = (_plan: SubscriptionPlan) => {
    setShowOnboarding(false);
    navigation.navigate("Subscription", { fromProfile: false });
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
    promoCode?: string;
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

      // Note: If a promo code is provided, we skip the payment flow
      // The promo code will be applied after registration in SignupScreen
      // This modal is only for the paid subscription flow via Stripe

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
  // Server already filters based on includePremium parameter
  const filteredQuotes = useMemo(() => {
    return data?.pages.flat() || [];
  }, [data]);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleLike = useCallback(
    (quoteId: string) => {
      const quote = filteredQuotes.find((q: Quote) => q.id === quoteId);
      if (!quote) return;

      toggleLikeMutation.mutate({
        quoteId,
        isLiked: quote.isLiked || false,
      });
    },
    [filteredQuotes, toggleLikeMutation],
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
  const { recordQuoteViewed } = useReviewPrompt();

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: any) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index || 0);
        recordQuoteViewed();
      }
    },
    [recordQuoteViewed],
  );

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

  // Push the full quotes pool to the widget so it can rotate one per day
  const lastQuotesPushRef = useRef<string>("");
  useEffect(() => {
    if (!filteredQuotes.length) return;
    const signature = filteredQuotes
      .slice(0, 30)
      .map((q) => q.id)
      .join("|");
    if (signature === lastQuotesPushRef.current) return;
    lastQuotesPushRef.current = signature;
    widgetService.updateWidgetQuotes(
      filteredQuotes.slice(0, 30).map((q) => ({
        content: q.text,
        author: q.author,
        topicName: q.topic?.name,
      })),
    );
  }, [filteredQuotes]);

  const handleOpenThemeModal = useCallback(() => {
    setShowThemeModal(true);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Quote }) => (
      <QuoteCard
        quote={item}
        onLike={handleLike}
        isLiked={item.isLiked}
        onThemePress={handleOpenThemeModal}
      />
    ),
    [handleLike, handleOpenThemeModal],
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

  // Determine display state - be more careful about the conditions
  // Show loading if: fetching data AND no data yet AND no error
  const hasQuotes = filteredQuotes.length > 0;
  const isInitialLoading = (isLoading || isFetching) && !hasQuotes && !error;
  const showError = (error || loadingTimeout) && !hasQuotes;
  // Show empty state skeleton if not loading, no error, but also no data (shouldn't happen normally)
  const showEmptyLoading =
    !isLoading && !isFetching && !error && !hasQuotes && !loadingTimeout;

  const content = (
    <>
      {/* Header - Hidden during capture */}
      {!isCapturing && <Header />}

      {/* Main Content Area */}
      {showError ? (
        <ErrorMessage
          message={t("errors.failedToLoadQuotes")}
          onRetry={() => {
            setLoadingTimeout(false);
            handleRetry();
          }}
        />
      ) : isInitialLoading || showEmptyLoading ? (
        <LoadingSkeleton />
      ) : (
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
      )}

      {/* Fixed Bottom Navigation Bar - Always visible (not during capture) */}
      {!isCapturing && (
        <ActionButtons
          quoteId={filteredQuotes[currentIndex]?.id || ""}
          isLiked={filteredQuotes[currentIndex]?.isLiked || false}
          isAuthenticated={isAuthenticated}
          onLike={handleLike}
          onSettings={handleProfile}
          onTopics={handleTopics}
          onLogin={handleLogin}
          onShare={filteredQuotes.length > 0 ? handleShare : undefined}
          isSharing={isSharing}
        />
      )}

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

      {/* Theme Selection Modal */}
      <ThemeSelectionModal
        isVisible={showThemeModal}
        onClose={() => setShowThemeModal(false)}
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
