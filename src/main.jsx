import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { VisitorProvider } from "./hooks/VisitorContext";
import "@arcgis/core/assets/esri/themes/light/main.css";
import "./index.css";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <VisitorProvider>
        <App />
      </VisitorProvider>
    </BrowserRouter>
  </StrictMode>,
)
