import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../services/api";

// Types
export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  durationMonths: number;
  isActive: boolean;
}

export interface Subscription {
  id: string;
  status: "ACTIVE" | "CANCELLED" | "EXPIRED";
  startDate: string;
  endDate: string;
  amountPaid?: number;
  stripePaymentIntentId?: string;
  plan?: SubscriptionPlan;
}

export interface AppConfig {
  freemiumDurationDays: number;
  monthlyPrice: number;
  yearlyPrice: number;
  yearlyDiscountPercentage: number;
}

interface SubscriptionState {
  plans: SubscriptionPlan[];
  currentSubscription: Subscription | null;
  config: AppConfig | null;
  selectedPlanId: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: SubscriptionState = {
  plans: [],
  currentSubscription: null,
  config: null,
  selectedPlanId: null,
  isLoading: false,
  error: null,
};

// Async Thunks
export const fetchSubscriptionData = createAsyncThunk(
  "subscription/fetchData",
  async (_, { rejectWithValue }) => {
    try {
      const [plansRes, configRes] = await Promise.all([
        apiClient.get<SubscriptionPlan[]>(
          "/subscriptions/plans?activeOnly=true",
        ),
        apiClient.get<AppConfig>("/subscriptions/config"),
      ]);
      return { plans: plansRes.data, config: configRes.data };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch subscription data",
      );
    }
  },
);

export const fetchCurrentSubscription = createAsyncThunk(
  "subscription/fetchCurrent",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<Subscription>(
        "/subscriptions/my-subscription",
      );
      return response.data;
    } catch (error: any) {
      // No subscription is not an error
      if (error.response?.status === 404) {
        return null;
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch subscription",
      );
    }
  },
);

export const startFreeTrial = createAsyncThunk(
  "subscription/startTrial",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<Subscription>(
        "/subscriptions/start-trial",
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to start trial",
      );
    }
  },
);

export const createCheckoutSession = createAsyncThunk(
  "subscription/checkout",
  async (planId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<{ url: string; sessionId: string }>(
        "/subscriptions/checkout",
        { planId },
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create checkout",
      );
    }
  },
);

// Slice
const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    setSelectedPlan: (state, action: PayloadAction<string | null>) => {
      state.selectedPlanId = action.payload;
    },
    clearSubscriptionError: (state) => {
      state.error = null;
    },
    setCurrentSubscription: (
      state,
      action: PayloadAction<Subscription | null>,
    ) => {
      state.currentSubscription = action.payload;
    },
    resetSubscriptionState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchSubscriptionData
      .addCase(fetchSubscriptionData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptionData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.plans = action.payload.plans;
        state.config = action.payload.config;
      })
      .addCase(fetchSubscriptionData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // fetchCurrentSubscription
      .addCase(fetchCurrentSubscription.fulfilled, (state, action) => {
        state.currentSubscription = action.payload;
      })
      // startFreeTrial
      .addCase(startFreeTrial.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(startFreeTrial.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSubscription = action.payload;
      })
      .addCase(startFreeTrial.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSelectedPlan,
  clearSubscriptionError,
  setCurrentSubscription,
  resetSubscriptionState,
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;
