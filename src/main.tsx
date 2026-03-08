import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "@/App";
import "@/index.css";
import { ContainerProvider } from "@/app/composition/containerContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ContainerProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ContainerProvider>
  </React.StrictMode>,
);
