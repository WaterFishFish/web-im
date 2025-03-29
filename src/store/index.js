import Vue from "vue";
import Vuex from "vuex";
import imApi from "@/api/im";

Vue.use(Vuex);

const state = {
  userInfo: null, // 用户信息
  // 权限信息
  allAuth: null, // 总权限信息 默认空 调整动态路由
  contactSync: "",
  toContactId: 0,
  unread: 0,
  allContacts: [],
  globalConfig: {
    sysInfo: {
      logo: "/static/img/logo.png",
      name: "easy-im",
      state: "1",
      regtype: "2",
      runMode: "1",
    },
    chatInfo: {
      stun: "",
      online: "1",
      webrtc: "1",
      msgClear: "0",
      stunPass: "",
      stunUser: "",
      groupChat: "1",
      simpleChat: "1",
      msgClearDay: "0",
      groupUserMax: "0",
    },
    fileUpload: {
      size: "50",
      preview: "",
      fileExt: [
        "jpg",
        "jpeg",
        "png",
        "bmp",
        "gif",
        "pdf",
        "mp3",
        "wav",
        "wmv",
        "amr",
        "mp4",
        "3gp",
        "avi",
        "m2v",
        "mkv",
        "mov",
        "webp",
        "ppt",
        "pptx",
        "doc",
        "docx",
        "xls",
        "xlsx",
        "txt",
        "md",
      ],
    },
    demon_mode: false,
  }, // 全局配置
  setting: {
    sendKey: "1",
    theme: "default",
    isVoice: true,
    avatarCricle: false,
    hideMessageName: false,
    hideMessageTime: false,
  },
};

const mutations = {
  SET_AUTH: (state, data) => {
    const token = data.token;
    localStorage.setItem("token", token);
  },
  catchSocketAction(state, data) {
    state.socketAction = data;
  },

  initContacts: (state, data) => {
    state.allContacts = data;
  },
  openChat: (state, data) => {
    state.toContactId = data;
    state.contactSync = Math.random().toString(36).substr(-8);
  },
  updateSetting(state, data) {
    state.userInfo.setting = data;
    state.setting = data;
  },
  setGlobalConfig(state, data) {
    state.globalConfig = data;
  },
};

const actions = {
  // 登录
  Login({ commit, dispatch }, userInfo) {
    return new Promise((resolve, reject) => {
      imApi
        .loginAPI(userInfo)
        .then((res) => {
          if (res.data) {
            commit("SET_AUTH", res.data);
            resolve(res);
          } else {
            reject(res);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
};

export default new Vuex.Store({
  state,
  mutations,
  actions,
});
