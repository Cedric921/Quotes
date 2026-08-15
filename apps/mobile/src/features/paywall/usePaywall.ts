import { useCallback, useMemo } from "react";
import type { PurchasesPackage } from "react-native-purchases";
import {
  useOfferings,
  usePurchase,
  useRestorePurchases,
} from "../../api/hooks/usePurchases";

export interface PaywallOffering {
  /** The yearly plan's price as the store formats it, e.g. "19,99 €" or "$17.99". */
  price: string;
  /** The same plan per month, in the same currency and format. */
  monthlyEquivalent: string;
  /** What the store charges today — the trial's own price when there is one. */
  introPrice: string | undefined;
  identifier?: string;
  /** The store package itself — what `purchase()` hands to RevenueCat. */
  pkg: PurchasesPackage;
}

const MONTHS = 12;

/**
 * Formats an amount the way the store would. RevenueCat gives a per-month
 * string itself for a yearly plan; this is the fallback for a store that
 * does not, and it keeps the store's currency rather than assuming euros.
 */
const formatMoney = (amount: number, currencyCode: string): string => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currencyCode}`;
  }
};

/**
 * One hook for the whole paywall, so the screen never touches RevenueCat.
 *
 * v1 spread offerings, purchase and restore across an 814-line screen; here
 * the screen asks for three strings and two callbacks, which is also what
 * makes the sheet and full-screen presentations able to share one component.
 */
export function usePaywall() {
  const { data: offerings, isLoading } = useOfferings();
  const purchaseMutation = usePurchase();
  const restoreMutation = useRestorePurchases();

  const offering = useMemo<PaywallOffering | undefined>(() => {
    const annual =
      offerings?.availablePackages?.find((p) => p.packageType === "ANNUAL") ??
      offerings?.availablePackages?.[0];
    if (!annual) return undefined;

    const { product } = annual;

    // The monthly figure used to be made by replacing the yearly amount
    // inside the store's price string with a comma-decimal version of the
    // twelfth — which matched nothing in "$17.99", so the paywall read
    // "$17.99/month, billed annually at $17.99" outside the euro zone.
    const monthlyEquivalent =
      product.pricePerMonthString ??
      formatMoney(product.price / MONTHS, product.currencyCode);

    return {
      price: product.priceString,
      monthlyEquivalent,
      introPrice: product.introPrice?.priceString ?? undefined,
      identifier: annual.identifier,
      pkg: annual,
    };
  }, [offerings]);

  const purchase = useCallback(async () => {
    if (!offering) return;
    await purchaseMutation.mutateAsync(offering.pkg);
  }, [offering, purchaseMutation]);

  const restore = useCallback(async () => {
    await restoreMutation.mutateAsync();
  }, [restoreMutation]);

  return {
    offering,
    isLoading,
    isPurchasing: purchaseMutation.isPending,
    isRestoring: restoreMutation.isPending,
    purchase,
    restore,
  };
}
