import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { initSpeech } from "./speech";
// Self-hosted webfonts (Fontsource) so text renders consistently across devices
// and works offline in the PWA. Inter = Latin UI; Noto = matched Telugu/Devanagari.
// Nunito = the rounded, friendly UI face (Duolingo-style). Inter kept as a
// fallback stack member.
import "@fontsource/nunito/400.css";
import "@fontsource/nunito/600.css";
import "@fontsource/nunito/700.css";
import "@fontsource/nunito/800.css";
import "@fontsource/nunito/900.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/noto-sans-telugu/400.css";
import "@fontsource/noto-sans-telugu/600.css";
import "@fontsource/noto-sans-devanagari/400.css";
import "@fontsource/noto-sans-devanagari/600.css";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

// Auto-update the service worker in the background (offline-first PWA).
registerSW({ immediate: true });

// Upgrade to cloud voice if the server offers it; harmless if it doesn't.
void initSpeech();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
