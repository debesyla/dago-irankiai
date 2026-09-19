import { PersonalCodeTool } from "@/components/PersonalCodeTool";
import { generatePersonalCodes } from "@/lib/personal-code";

export default function PersonalCodePage() {
  const [initialCode] = generatePersonalCodes({ count: 1 });

  return <PersonalCodeTool initialCode={initialCode} />;
}
