import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  { path: "/", redirect: "/inbox" },
  { path: "/inbox", component: () => import("@/views/inbox.vue") },
  { path: "/today", component: () => import("@/views/today.vue") },
  { path: "/upcoming", component: () => import("@/views/upcoming.vue") },
  { path: "/anytime", component: () => import("@/views/anytime.vue") },
  { path: "/someday", component: () => import("@/views/someday.vue") },
  { path: "/completed", component: () => import("@/views/completed.vue") },
  { path: "/projects/:projectId", component: () => import("@/views/project.vue") },
  { path: "/tags/:tagId", component: () => import("@/views/tag.vue") },
  { path: "/review", component: () => import("@/views/review.vue") },
  { path: "/settings", component: () => import("@/views/settings.vue") }
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes
});
