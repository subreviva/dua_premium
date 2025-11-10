import PricingPackages from "@/components/pricing/PricingPackages";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pacotes Premium - DUA",
  description: "Escolha o plano perfeito para suas necessidades criativas. Música, designs, logos e vídeos ilimitados.",
};

export default function PricingPage() {
  return <PricingPackages />;
}
