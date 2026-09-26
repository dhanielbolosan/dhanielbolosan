import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { motionCssVariables } from "./lib/motion";

// Share motion timings with CSS to keep animations and JavaScript timers in sync.
for (const [property, value] of Object.entries(motionCssVariables)) {
  document.documentElement.style.setProperty(property, value);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
