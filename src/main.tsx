import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { AccessControlProvider } from "./context/access-control-context";
import { AuthProvider } from "./hooks/useAuth";
import { ThemeProvider } from "./context/theme-context";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AccessControlProvider>
        <AuthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthProvider>
      </AccessControlProvider>
    </ThemeProvider>
  </React.StrictMode>
);
