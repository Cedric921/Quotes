import { useCallback, useMemo } from "react";
import {
  useOfferings,
  usePurchase,
  useRestorePurchases,
} from "../../api/hooks/usePurchases";

export interface PaywallOffering {
  /** Localised price of the yearly plan, e.g. "19,99 €". */
  price: string;
  /** Localised price per month, e.g. "1,66 €". */
  monthlyEquivalent: string;
  /** What the user is charged today — "0,00 €" during the trial. */
  introPrice: string;
  identifier?: string;
}

const MONTHS = 12;

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

    const price = annual.product.priceString;
    const perMonth = annual.product.price / MONTHS;

    // Reuse the store's own currency formatting rather than guessing a symbol.
    const monthlyEquivalent = price.replace(
      String(annual.product.price).replace(".", ","),
      perMonth.toFixed(2).replace(".", ","),
    );

    return {
      price,
      monthlyEquivalent,
      introPrice: annual.product.introPrice?.priceString ?? "0,00 €",
      identifier: annual.identifier,
    };
  }, [offerings]);

  const purchase = useCallback(async () => {
    if (!offering?.identifier) return;
    await purchaseMutation.mutateAsync(offering.identifier);
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
