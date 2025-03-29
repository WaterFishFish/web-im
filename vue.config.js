const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  runtimeCompiler: true,
  productionSourceMap: false,
  publicPath: "/",
  assetsDir: "assets",
  devServer: {
    port: 3001, // 端口号
    host: "0.0.0.0", // 项目地址
    proxy: {
      // 配置跨域
      "/api": {
        // 把地址改成你自己的地址
        target: `http://62e8d20d.r25.cpolar.top`, //请求后台接口
        changeOrigin: true, // 允许跨域
        pathRewrite: {
          "^/api": "", // 重写请求
        },
      },
    },
  },
});
