import request from "@/utils/request";

const imApi = {};

imApi.loginAPI = (userInfo) => {
  return request.post("/v1/user/login", userInfo);
};

imApi.getUserInfoAPI = () => {
  return request.get("/v1/user/user");
};

imApi.getContactsAPI = (data) => {
  return request.get(
    "http://" + window.location.host + "/data/getContacts.json"
  );
};

imApi.getMessageListAPI = (data) => {
  return request.get(
    "http://" + window.location.host + "/data/msg/" + data.toContactId + ".json"
  );
};

imApi.getFileList = (data) => {
  return request.get("http://" + window.location.host + "/data/index.json");
};

export default imApi;
