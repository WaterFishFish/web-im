import axios from "axios";
import { getAuth } from "@/utils/auth";

console.log(process.env.VUE_APP_BASE_API);
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 60000,
});

service.interceptors.request.use((request) => {
  const token = getAuth();
  if (token) {
    request.headers.Authorization = token;
  }
  return request;
});

// response 拦截器
service.interceptors.response.use((response) => {
  return response.data;
});

export default service;
