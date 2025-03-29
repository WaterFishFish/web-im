import axios from "axios";
import { getAuth, setAuth } from "@/utils/auth";
import router from "@/router";
import { Message } from "element-ui";

const service = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? window.ApiURL
      : process.env.VUE_APP_BASE_API,
  timeout: 60000,
});

// request 拦截器
service.interceptors.request.use((request) => {
  const token = getAuth();
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  return request;
});

// response 拦截器
service.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      setAuth(undefined);
      router.push({ path: "/login" });
      Message.error("认证失效，请重新登陆");
    }
  }
);

export default service;
