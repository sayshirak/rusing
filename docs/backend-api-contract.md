# Rusing 后端接口契约（预留）

## Base URL

`/api/v1`

## 统一响应建议

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

前端兼容两种格式：

- 直接返回数组/对象
- 包一层 `{ data: ... }`

## 接口清单

### 1) 获取用户信息

- `GET /users/{userId}`
- 返回：`User`

### 2) 获取歌单列表

- `GET /playlists`
- 返回：`Playlist[]`

### 3) 获取歌单曲目

- `GET /playlists/{playlistId}/tracks`
- 返回：`Track[]`

### 4) 获取公告

- `GET /config/notice`
- 返回：`Notice`

### 5) 上报播放历史

- `POST /user/history`
- 入参：

```json
{
  "action": "played",
  "trackId": "t001",
  "playedAt": "2026-04-27T10:00:00Z"
}
```

## 字段模型（建议）

### User

```json
{
  "userId": "u001",
  "openId": "xxx",
  "nickname": "Rusing用户",
  "avatarUrl": "https://...",
  "status": "active",
  "createdAt": "2026-04-20T08:00:00Z",
  "updatedAt": "2026-04-23T18:00:00Z"
}
```

### Playlist

```json
{
  "playlistId": "p001",
  "name": "轻听精选",
  "type": "featured",
  "status": "active",
  "coverUrl": "https://...",
  "description": "描述",
  "trackCount": 3,
  "updatedAt": "2026-04-23T18:00:00Z"
}
```

### Track

```json
{
  "trackId": "t001",
  "title": "轻听精选",
  "artist": "Rusing Studio",
  "album": "轻听精选 Vol.1",
  "duration": 228,
  "source": "self-hosted",
  "status": "active",
  "playUrl": "https://...",
  "coverUrl": "https://...",
  "lyricUrl": "",
  "sortOrder": 1,
  "updatedAt": "2026-04-23T18:00:00Z"
}
```
