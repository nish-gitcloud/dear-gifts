import { notFound } from "next/navigation";
import { getOccasion } from "@/config/occasions";
import { isOccasionEnabledEffective } from "@/lib/occasionSettings";
import { CreatorWizard } from "@/components/creator/CreatorWizard";

export default async function OccasionWizardPage({
  params,
}: {
  params: Promise<{ occasion: string }>;
}) {
  const { occasion: occasionId } = await params;
  const occasion = getOccasion(occasionId);
  if (!occasion || !(await isOccasionEnabledEffective(occasionId))) notFound();

  return <CreatorWizard occasion={occasion} />;
}
