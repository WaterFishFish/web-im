import router from "./router";
import { getAuth, setUser } from "@/utils/auth";
import imApi from "@/api/im";

const whiteList = ["/login", "/404"];
router.beforeEach(async (to, from, next) => {
  const token = getAuth();
  if (token) {
    const resp = await imApi.getUserInfoAPI();
    if (resp.data && resp.data.info) {
      setUser(resp.data.info);
    }
    if (to.path === "/login") {
      next({ path: "/" });
    } else {
      next();
    }
  } else {
    if (whiteList.includes(to.path)) {
      next();
    } else {
      next({ path: "/login" });
    }
  }
});
