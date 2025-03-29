import request from "@/utils/request";
import lockr from "lockr";

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
  let conversationId;
  if (data.is_group) {
    conversationId = data.toContactId;
  } else {
    conversationId =
      data.toContactId > data.currentId
        ? data.toContactId + "_" + data.currentId
        : data.currentId + "_" + data.toContactId;
  }
  // 仅仅只是为了兼容，这里选择将聊天记录存在前端
  const messageList = lockr.get(conversationId) || [];
  messageList.sort((a, b) => a.sendTime - b.sendTime);
  return Promise.resolve(messageList);
};

export default imApi;
