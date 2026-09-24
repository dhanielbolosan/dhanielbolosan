import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { TooltipProvider } from "./components/imports/tooltip.tsx";
import { Toaster } from "./components/imports/sonner";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TooltipProvider>
      <App />
      <Toaster
        position="top-center"
        theme="dark"
      />
    </TooltipProvider>
  </StrictMode>,
);
