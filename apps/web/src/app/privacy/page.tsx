import type { Metadata } from "next";
import PrivacyContent from "./PrivacyContent";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation et Politique de Confidentialité - FOCUS",
  description: "Conditions générales d'utilisation et politique de confidentialité de l'application FOCUS",
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}

