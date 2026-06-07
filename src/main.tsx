import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "./lib/theme-provider.tsx";
import { TooltipProvider } from "./components/imports/tooltip.tsx";
import { PortfolioDock } from "./components/dock/portfolio-dock.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider
      defaultTheme="dark"
      storageKey="vite-ui-theme"
    >
      <TooltipProvider>
        <App />
        <div className="fixed bottom-0 left-0 right-0 mb-10">
          <PortfolioDock />
        </div>
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>,
);
