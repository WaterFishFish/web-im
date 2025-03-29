import Vue from "vue";
import Router from "vue-router";
import Home from "@/views/Home";
import Chat from "@/views/Chat";
import Login from "@/views/Login";

Vue.use(Router);

export const constantRouterMap = [
  {
    path: "/",
    name: "home",
    component: Home,
    meta: { title: "聊天" },
  },
  {
    path: "/chat",
    name: "chat",
    component: Chat,
    meta: { title: "聊天页" },
  },
  {
    path: "/login",
    name: "login",
    component: Login,
    meta: { title: "登录" },
  },
  {
    path: "/404",
    component: () => import("@/views/404"),
    hidden: true,
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/404",
    hidden: true,
  },
];

const createRouter = () =>
  new Router({
    mode: "hash",
    scrollBehavior: () => ({ y: 0 }),
    routes: [...constantRouterMap],
  });

const router = createRouter();

export default router;
