<template>
  <div
    class="login-wrapper"
    :style="'background-image:url(/static/img/login-background.jpg)'"
  >
    <div class="form-box">
      <div class="form-title">Easy Chat</div>
      <el-form
        ref="loginForm"
        :model="loginForm"
        :rules="loginRules"
        label-width="0px"
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input
            ref="username"
            v-model="loginForm.username"
            type="text"
            auto-complete="off"
            placeholder="请输入账号"
            prefix-icon="el-icon-user"
          />
        </el-form-item>
        <el-form-item prop="password" v-show="!forget">
          <el-input
            v-model="loginForm.password"
            type="password"
            auto-complete="off"
            placeholder="请输入密码"
            prefix-icon="el-icon-lock"
            @keyup.enter.native="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            :loading="loading"
            size="small"
            type="primary"
            style="width: 100%"
            @click.native.prevent="handleLogin"
          >
            <span v-if="!loading">登 录</span>
            <span v-else>登 录 中...</span>
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { Message } from "element-ui";

export default {
  name: "Login",

  data() {
    return {
      forget: false,
      loginForm: {
        username: "",
        password: "",
      },
      loginRules: {
        username: [
          {
            required: true,
            trigger: "blur",
            message: "用户名不能为空",
          },
        ],
        password: [
          {
            required: true,
            trigger: "blur",
            message: "密码不能为空",
          },
        ],
      },
      loading: false,
      coding: false,
      redirect: undefined,
    };
  },
  computed: {
    ...mapState({
      globalConfig: (state) => state.globalConfig,
    }),
  },
  watch: {
    $route: {
      handler: function (route) {
        this.redirect = route.query && route.query.redirect;
      },
      immediate: true,
    },
  },
  methods: {
    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        const data = {
          phone: this.loginForm.username,
          password: this.loginForm.password,
        };
        if (valid) {
          this.loading = true;
          this.$store
            .dispatch("Login", data)
            .then((res) => {
              Message.success("登陆成功");
              this.$router.push({ path: "/" });
            })
            .catch((e) => {
              this.loading = false;
              Message.error(e);
            });
        }
      });
    },
  },
};
</script>

<style lang="scss">
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  background-size: cover;

  .form-box {
    width: 300px;
    padding: 15px 30px 20px;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 15px 30px 0 rgba(0, 0, 1, 0.1);
    position: absolute;
    right: 100px;

    .form-title {
      margin: 0 auto 35px;
      text-align: center;
      color: #707070;
      font-size: 18px;
      letter-spacing: 2px;
    }
  }

  .remenber {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
