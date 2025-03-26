<template>
  <div>
    <div class="chat-box">
      <lemon-imui
        :user="user"
        ref="IMUI"
        :width="curWidth"
        :height="curHeight"
        :theme="setting.theme"
        :hide-message-name="setting.hideMessageName"
        :hide-message-time="setting.hideMessageTime"
        :avatarCricle="setting.avatarCricle"
        @change-contact="handleChangeContact"
        @send="handleSend"
        :sendKey="setSendKey"
        :wrapKey="wrapKey"
        @pull-messages="handlePullMessages"
        style="min-height: 600px"
      >
        <template #sidebar-message-fixedtop="instance">
          <div style="margin: 15px 10px">聊天</div>
        </template>
        <template #sidebar-contact-fixedtop="instance">
          <div style="margin: 15px 10px">通讯录</div>
        </template>

        <template #cover>
          <div @click="closeGroup">
            <div class="cover">
              <i class="lemon-icon-message"></i>
              <p><b>easy-im</b></p>
            </div>
          </div>
        </template>
        <template #sidebar-message="Contact">
          <span class="lemon-badge lemon-contact__avatar" @click="closeGroup">
            <span
              class="lemon-avatar"
              v-bind:class="{ 'lemon-avatar--circle': setting.avatarCricle }"
            >
              <img size="50px" :src="Contact.avatar"
            /></span>
          </span>
          <div class="lemon-contact__inner" @click="closeGroup">
            <p class="lemon-contact__label">
              <span class="lemon-contact__name">
                <el-tag size="mini" v-if="Contact.is_group == 1">群聊</el-tag>
                {{ Contact.displayName }}
              </span>
              <span
                class="lemon-contact__time"
                v-text="formatTime(Contact.lastSendTime)"
              ></span>
            </p>
            <p class="lemon-contact__content lemon-last-content">
              <span class="lastContent">
                <span v-html="Contact.lastContent"></span>
              </span>
              <span
                class="el-icon-close-notification f-16"
                v-if="Contact.is_notice == 0"
              ></span>
            </p>
          </div>
        </template>
        <template #editor-footer> 使用 Enter 键发送消息</template>
      </lemon-imui>
    </div>
    <Socket ref="socket"></Socket>
  </div>
</template>

<script>
import { mapState } from "vuex";
import * as utils from "@/utils/index";
import Socket from "./socket";
import { getUser, setAuth } from "@/utils/auth";

const account = getUser();
export default {
  name: "app",
  components: {
    Socket,
  },
  props: {
    width: {
      type: String,
      default: "70vw",
    },
    height: {
      type: String,
      default: "40vw",
    },
  },
  data() {
    var _this = this;
    return {
      curWidth: this.width,
      curHeight: this.height,
      unread: 0,
      curFile: null,
      componentKey: 1,
      searchResult: false,
      Result: false,
      createChatBox: false,
      forwardBox: false,
      noticeBox: false,
      messageBox: false,
      webrtcBox: false,
      groupSetting: false,
      VoiceStatus: false,
      contactSetting: {},
      groupUserCount: 0,
      dialogTitle: "创建群聊",
      isAdd: true,
      userIds: [],
      notice: "",
      searchList: [],
      keywords: "",
      displayName: "",
      oldName: "",
      isEdit: false,
      user: account,
      params: {
        page: 1,
        limit: 10,
      },
      is_group: 2,
      group_id: 0,
      contacts: [],
      allUser: [],
      groupUser: [],
      groupMenu: [],
      contactsToUid: new Map(),
    };
  },
  computed: {
    // 监听全局socket消息状态
    ...mapState({
      socketAction: (state) => state.socketAction,
      contactId: (state) => state.toContactId,
      contactSync: (state) => state.contactSync,
      setting: (state) => state.setting,
      userInfo: (state) => state.userInfo,
      globalConfig: (state) => state.globalConfig,
    }),
    formatTime() {
      return function (val) {
        return utils.timeFormat(val);
      };
    },
  },
  watch: {
    // 监听接收socket消息
    socketAction(event) {
      console.log("socketAction");
      console.log(event);

      const { IMUI } = this.$refs;
      const data = {
        id: event.data.MsgId,
        status: "succeed",
        type: "text",
        sendTime: event.data.sendTime,
        content: event.data.Content,
        toContactId: event.data.ConversationId,
        fromUser: event.data.fromUser,
      };
      console.log(data);
      // IMUI.appendMessage(data);
    },
  },
  created() {},
  mounted() {
    this.user = getUser();
    // 初始化联系人
    this.getSimpleChat();
  },
  methods: {
    logout() {
      setAuth(undefined);
      window.location.reload();
    },
    // 初始化聊天
    getSimpleChat(update) {
      this.$nextTick(() => {
        const IMUI = this.$refs.IMUI;
        this.IMUI = IMUI;
        // 获取联系人列表
        this.$api.imApi.getContactsAPI().then((res) => {
          const data = res.data;
          this.contacts = data;

          var contacts = [];
          var msg = {};
          // 重新渲染消息
          data.forEach((item, index) => {
            if (item.type) {
              msg.type = item.type;
              msg.content = item.lastContent;
              data[index]["lastContent"] = IMUI.lastContentRender(msg);
            }
            if (item.id !== this.user.id) {
              contacts.push(item);
              this.contactsToUid.set(item.id, item);
            }
          });

          this.$store.commit("initContacts", contacts);
          IMUI.initContacts(contacts);
          // 初始化左侧菜单栏
          this.initMenus(IMUI);
        });
      });
    },
    // 初始化菜单
    initMenus(IMUI) {
      const menus = [
        {
          name: "messages",
        },
        {
          name: "contacts",
        },
        {
          name: "logout",
          title: "退出登陆",
          isBottom: true,
          render: (menu) => {
            return <i class="el-icon-upload2" />;
          },
          click: () => {
            this.logout();
          },
        },
      ];
      IMUI.initMenus(menus);
    },
    // 切换聊天窗口时要检测那些消息未读
    handleChangeContact(contact, instance) {
      instance.updateContact({
        id: contact.id,
        unread: 0,
      });
      // 将未读的总数减去当前选择的聊天
      const { IMUI } = this.$refs;
      this.initMenus(IMUI);
      // 聊天记录列表恢复到最初第一页
      this.params.page = 1;
      this.displayName = contact.displayName;
      this.oldName = contact.displayName;
      this.currentChat = contact;
      //切换聊天后全局设置是否是群聊或者单聊
      this.is_group = contact.is_group;
      // 如果是团队id，保存当前团队id避免下次切换回来的时候重复请求成员列表
      if (this.is_group == 1) {
        this.group_id = contact.id;
        this.notice = contact.notice;
      }
      var data = [];

      // 获取当前聊天窗口的所有消息
      var messages = IMUI.getMessages(contact.id);
      for (var i = 0; messages.length > i; i++) {
        if (messages[i].fromUser.id != this.user.id) {
          data.push(messages[i]);
        }
      }
      instance.closeDrawer();
    },
    // 发送聊天消息
    handleSend(message, next, file) {
      console.log(message);
      const data = {
        id: message.id,
        method: "conversation.chat",
        data: {
          chatType: this.is_group,
          recvId: this.contactsToUid.get(message.toContactId).id,
          msg: {
            content: message.content,
          },
        },
      };
      console.log(data);

      this.$refs.socket.websocketSend(data);

      next();
    },
    // 拉取聊天记录
    handlePullMessages(contact, next, instance) {
      let params = this.params;
      params.toContactId = contact.id;
      params.is_group = contact.is_group;
      this.$api.imApi
        .getMessageListAPI(params)
        .then((res) => {
          this.params.page++;
          let isEnd = false;
          let messages = res.data;
          if (messages.length < this.params.limit) {
            isEnd = true;
          }
          next(messages, isEnd);
        })
        .catch((error) => {
          next([], true);
        });
      return true;
    },
    closeGroup() {},
    wrapKey(e) {
      return this.setting.sendKey == 1
        ? e.keyCode == 13 && e.ctrlKey
        : e.keyCode == 13 && !e.ctrlKey && !e.shiftKey;
    },
    // 设置发送键
    setSendKey(e) {
      return this.setting.sendKey == 1
        ? e.keyCode == 13 && !e.ctrlKey && !e.shiftKey
        : e.keyCode == 13 && e.ctrlKey;
    },
  },
};
</script>
<style scoped lang="scss">
.mr-10 {
  margin-right: 0px;
  font-size: 33px;
  right: 23px;
  top: -3px;
  position: absolute;
}

.main-container {
  display: flex;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  width: 100%;
  height: 300vh;
  background-size: cover;
}

.messageBoxStyle {
  position: fixed;
  top: 0;
  left: 0;
  height: 250vh;
  width: 100%;
  z-index: 1999;
  background: rgba(0, 0, 0, 0.5);
  overflow-y: visible;

  .el-dialog__wrapper {
    display: flex;
    align-items: center;
  }
}

.chat-box {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
}

.cover {
  text-align: center;
  user-select: none;
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);

  i {
    font-size: 84px;
    color: #e6e6e6;
  }

  p {
    font-size: 18px;
    color: #ddd;
    line-height: 50px;
  }
}

.displayName {
  font-size: 16px;
  visibility: visible;
}

.contact-fixedtop-box {
  margin: 15px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  visibility: visible;
  position: relative;
}

.search-list {
  background: #fff;
  position: absolute;
  z-index: 99;
  top: 40px;
  width: 230px;
  height: 300px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
  overflow: auto;
  border: solid 1px #e6e6e6;

  .search-list-item :hover {
    background: #f1f1f1;
  }

  .lemon-contact {
    background: #fff;
  }
}

.chat-top-list {
  display: flex;
  padding: 0 5px 10px 10px;
  justify-content: flex-start;
  flex-wrap: wrap;
}

.message-title-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  visibility: visible;
}

.message-title-tools {
  font-size: 30px;
  color: #999999;
  letter-spacing: 5px;
  cursor: pointer;
}

.editInput {
  font-size: 18px;
  border: none;
  width: 400px;
}

.editInput:focus {
  outline: -webkit-focus-ring-color auto 0px;
}

.lemon-last-content {
  display: flex;
  justify-content: space-between;

  .lastContent {
    width: 200px !important;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
}

.slot-group-list {
  background: #fff;
  width: 200px;
  border-left: solid 1px #e6e6e6;
  height: 100%;
  white-space: initial;

  .group-side-box {
    .group-side-title {
      padding: 5px 10px;
    }

    .group-side-body {
      height: 150px;
      padding: 10px;
      cursor: pointer;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 5;
      -webkit-box-orient: vertical;
    }

    .group-user-body {
      min-height: 410px;

      .user-list {
        display: flex;
        flex-direction: row;
        align-items: center;
        flex-wrap: nowrap;
        justify-content: flex-start;
        padding: 5px;
        background: #fff;

        .user-avatar {
          margin: 3px 8px 0 0;
          line-height: 10px;
        }

        .user-name {
          width: 110px;
        }

        .user-role {
          width: 20px;
        }
      }

      .user-list:hover {
        background: #e6e6e6;
      }
    }
  }
}

.group-side-title {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: nowrap;
  justify-content: space-between;
}

.group-notice {
  height: 140px;
}

.group-user {
  min-height: 300px;
  overflow: auto;
}

.lemon-avatar {
  width: 40px;
  height: 50px;
  line-height: 40px;
  font-size: 30px;
}

.lemon-menu__item {
  color: #ffffff;
  cursor: pointer;
  padding: 14px 10px;
  max-width: 100%;
  word-break: break-all;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.lemon-wrapper .lemon-menu {
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  width: 60px;
  padding: 15px 0;
  position: relative;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
