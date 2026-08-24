import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PersonalCodeTool } from "@/components/PersonalCodeTool";
import "@/app/project.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Nerastas puslapio šakninis elementas.");
}

createRoot(root).render(
  <StrictMode>
    <PersonalCodeTool />
  </StrictMode>,
);
