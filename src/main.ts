import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./app.vue";
import { router } from "./router";
import { bootstrapPhase1Persistence } from "./bootstrap";
import { bootstrapTauriPersistence } from "./bootstrap-tauri";

import "./style.css";

if (typeof document !== "undefined" && (window as any).__TAURI__) {
  document.documentElement.classList.add("tauri");
}

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

if (typeof window !== "undefined" && (window as any).__TAURI__) {
  bootstrapTauriPersistence();
} else {
  bootstrapPhase1Persistence();
}

app.mount("#app");
