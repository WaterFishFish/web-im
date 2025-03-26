import router from "./router";
import { getAuth, setUser } from "@/utils/auth";
import imApi from "@/api/im";

const whiteList = ["/login", "/404"];
router.beforeEach(async (to, from, next) => {
  const token = getAuth();
  if (token) {
    const { data } = await imApi.getUserInfoAPI();
    if (data.info) {
      console.log(data.info);
      setUser(data.info);
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
