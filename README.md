# Rusing 小程序（静态 JSON 先行版）

本项目已按“前端先行、后端预留”的方案实现：

- 首期：微信原生小程序 + 静态 JSON 数据源
- 后期：切换 `providers` 到 Java/MySQL 后端接口

## 目录结构

```text
rusing/
  app.js
  app.json
  app.wxss
  config/
    env.js
  providers/
    index.js
    static-json-provider.js
    api-provider.js
  services/
    player-service.js
  utils/
    request.js
    storage.js
  mock/api/v1/
    playlists.json
    playlists/p001/tracks.json
    playlists/p002/tracks.json
    config/notice.json
    users/u001.json
  pages/
    home/
    playlist/
    player/
    me/
  docs/
    backend-api-contract.md
```

## 本地运行

1. 用微信开发者工具打开目录：`D:\program\music-player-wechatmini-program\rusing`
2. 使用测试 `AppID`（当前 `project.config.json` 已为 `touristappid`）
3. 直接编译运行

## 数据源切换

编辑 `config/env.js`：

- `dataSourceMode: "static"`：优先从 `staticBaseUrl` 拉取，失败回退到 `mock/` 内置 JSON
- `dataSourceMode: "api"`：走后端 API（`apiBaseUrl`）

## 后端预留点

- 页面不直接请求 URL，只调用 `providers/index.js` 输出的统一接口
- 切后端时，仅替换 provider 实现，不改页面业务代码
- 接口契约见：`docs/backend-api-contract.md`
