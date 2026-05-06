const provider = require("../../providers/index.js");
const env = require("../../config/env");
const { getRecentTrack, getSettings } = require("../../utils/storage");

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

    const settings = getSettings();
    const defaultPlaylist = playlists[0];
    wx.navigateTo({
      url: `/pages/player/player?playlistId=${defaultPlaylist.playlistId}&mode=${settings.playMode || "order"}`,
    });
  },

  onTapPlaylist(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/playlist/playlist?playlistId=${id}`,
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
    wx.navigateTo({
      url: `/pages/player/player?playlistId=${recentTrack.playlistId}&trackId=${recentTrack.trackId}`,
    });
  },
});
