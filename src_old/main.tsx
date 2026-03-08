import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ContainerProvider } from "@/app/composition/containerContext";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ContainerProvider>
        <App />
      </ContainerProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
