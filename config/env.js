const env = {
  // static: 从静态 JSON 拉取；api: 从后端接口拉取
  dataSourceMode: "static",
  // 开发阶段留空则直接使用本地 mock 数据，不发起远程请求
  staticBaseUrl: "",
  apiBaseUrl: "https://api.rusing.net/api/v1",
  defaultUserId: "u001",
};

module.exports = env;
