const provider = require("../../providers/index.js");
const env = require("../../config/env");
const { getRecentTrack } = require("../../utils/storage");

Page({
  data: {
    loading: false,
    user: null,
    notice: null,
    playlists: [],
    recentTrack: null,
    mode: "static",
  },

  onLoad() {
    this.setData({
      mode: env.dataSourceMode,
      recentTrack: getRecentTrack(),
    });
    this.loadData();
  },

  onShow() {
    this.setData({
      recentTrack: getRecentTrack(),
    });
  },

  async loadData() {
    this.setData({ loading: true });
    try {
      const [user, notice, playlists] = await Promise.all([
        provider.getUserProfile(env.defaultUserId),
        provider.getNotice(),
        provider.getPlaylists(),
      ]);
      this.setData({
        user,
        notice,
        playlists: playlists || [],
      });
    } catch (error) {
      wx.showToast({
        title: "加载歌曲失败",
        icon: "none",
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  onTapStart() {
    const { playlists } = this.data;
    if (!playlists.length) {
      wx.showToast({
        title: "暂无歌单",
        icon: "none",
      });
      return;
    }

    const defaultPlaylist = playlists[0];
    const app = getApp();
    app.globalData.pendingPlaySelection = {
      playlistId: defaultPlaylist.playlistId,
    };
    wx.switchTab({
      url: "/pages/player/player",
    });
  },

  onTapPlaylist(event) {
    const { id } = event.currentTarget.dataset;
    const app = getApp();
    app.globalData.pendingPlaylistId = id || "";
    wx.switchTab({
      url: "/pages/playlist/playlist",
    });
  },

  onTapRecent() {
    const recentTrack = getRecentTrack();
    if (!recentTrack) {
      wx.showToast({
        title: "暂无最近播放",
        icon: "none",
      });
      return;
    }
    const app = getApp();
    app.globalData.pendingPlaySelection = {
      playlistId: recentTrack.playlistId,
      trackId: recentTrack.trackId,
    };
    wx.switchTab({
      url: "/pages/player/player",
    });
  },
});
