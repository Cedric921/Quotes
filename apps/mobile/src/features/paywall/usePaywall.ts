import { useCallback, useMemo, useState } from "react";
import type { PurchasesPackage } from "react-native-purchases";
import {
  useOfferings,
  usePurchase,
  useRestorePurchases,
} from "../../api/hooks/usePurchases";

export type PaywallPlan = "yearly" | "monthly";

export interface PaywallOffering {
  plan: PaywallPlan;
  /** The plan's price as the store formats it, e.g. "19,99 €" or "$17.99". */
  price: string;
  /**
   * The same plan per month, in the same currency and format. For the
   * monthly plan this is the price itself.
   */
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

const toOffering = (
  pkg: PurchasesPackage | undefined,
  plan: PaywallPlan,
): PaywallOffering | undefined => {
  if (!pkg) return undefined;
  const { product } = pkg;

  // The monthly figure used to be made by replacing the yearly amount
  // inside the store's price string with a comma-decimal version of the
  // twelfth — which matched nothing in "$17.99", so the paywall read
  // "$17.99/month, billed annually at $17.99" outside the euro zone.
  const monthlyEquivalent =
    plan === "monthly"
      ? product.priceString
      : (product.pricePerMonthString ??
        formatMoney(product.price / MONTHS, product.currencyCode));

  return {
    plan,
    price: product.priceString,
    monthlyEquivalent,
    introPrice: product.introPrice?.priceString ?? undefined,
    identifier: pkg.identifier,
    pkg,
  };
};

/**
 * One hook for the whole paywall, so the screen never touches RevenueCat.
 *
 * v1 spread offerings, purchase and restore across an 814-line screen; here
 * the screen asks for a few strings and three callbacks, which is also what
 * makes the sheet and full-screen presentations able to share one component.
 *
 * Two plans come back from the store, yearly and monthly; `plan` says which
 * one the button buys, and `offering` is that one. Both carry the store's own
 * currency, so a European sees euros and an American dollars without the app
 * knowing either.
 */
export function usePaywall() {
  const { data: offerings, isLoading } = useOfferings();
  const purchaseMutation = usePurchase();
  const restoreMutation = useRestorePurchases();
  const [plan, setPlan] = useState<PaywallPlan>("yearly");

  const plans = useMemo(() => {
    const packages = offerings?.availablePackages ?? [];
    const yearly =
      packages.find((p) => p.packageType === "ANNUAL") ??
      packages.find((p) => /year|annual/i.test(p.product.identifier)) ??
      packages[0];
    const monthly =
      packages.find((p) => p.packageType === "MONTHLY") ??
      packages.find(
        (p) => p !== yearly && /month/i.test(p.product.identifier),
      );
    return {
      yearly: toOffering(yearly, "yearly"),
      monthly: toOffering(monthly, "monthly"),
    };
  }, [offerings]);

  // A store that only lists one plan still gets a working button.
  const offering = plans[plan] ?? plans.yearly ?? plans.monthly;

  /**
   * How much cheaper the year is than twelve months, as a whole percentage —
   * undefined when either plan is missing or the year is not a saving.
   */
  const yearlySavingPercent = useMemo(() => {
    const yearly = plans.yearly?.pkg.product.price;
    const monthly = plans.monthly?.pkg.product.price;
    if (!yearly || !monthly) return undefined;
    const percent = Math.round((1 - yearly / (monthly * MONTHS)) * 100);
    return percent > 0 ? percent : undefined;
  }, [plans]);

  const purchase = useCallback(async () => {
    if (!offering) return;
    await purchaseMutation.mutateAsync(offering.pkg);
  }, [offering, purchaseMutation]);

  const restore = useCallback(async () => {
    await restoreMutation.mutateAsync();
  }, [restoreMutation]);

  return {
    offering,
    plans,
    plan,
    setPlan,
    yearlySavingPercent,
    isLoading,
    isPurchasing: purchaseMutation.isPending,
    isRestoring: restoreMutation.isPending,
    purchase,
    restore,
  };
}
