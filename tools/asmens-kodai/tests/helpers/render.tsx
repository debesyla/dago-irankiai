// Renders the tool to static HTML the way a server would, for tests.
// Loaded through Vite's SSR transform (see rendered-html.test.mjs), which
// handles TSX and the "@/" alias exactly like the production build does.
import { renderToStaticMarkup } from "react-dom/server";
import { PersonalCodeTool } from "@/components/PersonalCodeTool";

export function renderTool(initialCode: string): string {
  return renderToStaticMarkup(<PersonalCodeTool initialCode={initialCode} />);
}
