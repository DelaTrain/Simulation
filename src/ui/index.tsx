import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import App from "./components/App";

createRoot(document.getElementById("ui")!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
