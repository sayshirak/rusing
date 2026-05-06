const provider = require("../../providers/index.js");
const env = require("../../config/env");
const { getSettings, setSettings, getRecentTrack } = require("../../utils/storage");

Page({
  data: {
    user: null,
    notice: null,
    settings: {
      playMode: "order",
      autoPlay: false,
      volume: 0.8,
    },
    recentTrack: null,
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.setData({
      recentTrack: getRecentTrack(),
      settings: getSettings(),
    });
  },

  async loadData() {
    try {
      const [user, notice] = await Promise.all([
        provider.getUserProfile(env.defaultUserId),
        provider.getNotice(),
      ]);
      this.setData({
        user,
        notice,
        settings: getSettings(),
        recentTrack: getRecentTrack(),
      });
    } catch (error) {
      wx.showToast({
        title: "加载歌曲失败",
        icon: "none",
      });
    }
  },

  onModeChange(event) {
    const index = Number(event.detail.value || 0);
    const modes = ["order", "random", "repeat-one"];
    setSettings({ playMode: modes[index] || "order" });
    this.setData({
      settings: getSettings(),
    });
  },

  onAutoPlayChange(event) {
    setSettings({
      autoPlay: !!event.detail.value,
    });
    this.setData({
      settings: getSettings(),
    });
  },
});
