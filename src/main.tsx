import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { I18nextProvider } from "react-i18next";

import App from "./App.tsx";
import { Provider } from "./provider.tsx";
import i18n from "./i18n.ts";
import "@/styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <Suspense fallback={null}>
        <BrowserRouter>
          <Provider>
            <App />
          </Provider>
        </BrowserRouter>
      </Suspense>
    </I18nextProvider>
  </React.StrictMode>,
);
