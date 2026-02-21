import type { Metadata } from "next";
import TermsContent from "./TermsContent";

export const metadata: Metadata = {
  title: "Conditions Contractuelles (CGV) - FOCUS",
  description: "Conditions générales de vente des services premium FOCUS",
};

export default function TermsPage() {
  return <TermsContent />;
}
