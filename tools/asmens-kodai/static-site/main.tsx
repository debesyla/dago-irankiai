import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PersonalCodeTool } from "@/components/PersonalCodeTool";
import { generatePersonalCodes } from "@/lib/personal-code";
import "@/app/project.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Nerastas puslapio šakninis elementas.");
}

const [initialCode] = generatePersonalCodes({ count: 1 });

createRoot(root).render(
  <StrictMode>
    <PersonalCodeTool initialCode={initialCode} />
  </StrictMode>,
);
