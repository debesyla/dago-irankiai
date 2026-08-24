import { PersonalCodeTool } from "@/components/PersonalCodeTool";
import { generatePersonalCodes } from "@/lib/personal-code";

export default function Home() {
  const [initialCode] = generatePersonalCodes({ count: 1 });

  return <PersonalCodeTool initialCode={initialCode} />;
}
