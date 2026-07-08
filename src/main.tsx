import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

/* No StrictMode: the app was built and verified without it (the artifact
   runtime does not double-invoke effects), and behavior parity with
   legacy/biosphere.artifact.jsx is the M3 target. Revisit in M4 if desired. */
createRoot(document.getElementById("root")!).render(<App />);
