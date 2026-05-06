const provider = require("../../providers/index.js");

function formatDuration(sec) {
  const total = Number(sec || 0);
  const m = Math.floor(total / 60);
  const s = Math.floor(total % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function withDisplayDuration(tracks = []) {
  return tracks.map((item) => ({
    ...item,
    displayDuration: formatDuration(item.duration),
  }));
}

Page({
  data: {
    playlistId: "",
    playlists: [],
    currentPlaylist: null,
    tracks: [],
    loading: false,
  },

  onLoad(options) {
    const playlistId = options.playlistId || "";
    this.setData({ playlistId });
    this.loadPlaylistsAndTracks(playlistId);
  },

  onShow() {
    const app = getApp();
    const pendingPlaylistId = app.globalData.pendingPlaylistId;
    if (!pendingPlaylistId) {
      return;
    }
    app.globalData.pendingPlaylistId = "";
    if (pendingPlaylistId === this.data.playlistId) {
      return;
    }
    this.loadPlaylistsAndTracks(pendingPlaylistId);
  },

  async loadPlaylistsAndTracks(playlistId) {
    this.setData({ loading: true });
    try {
      const playlists = await provider.getPlaylists();
      const targetPlaylistId = playlistId || (playlists[0] && playlists[0].playlistId);
      const tracks = targetPlaylistId ? await provider.getPlaylistTracks(targetPlaylistId) : [];
      const currentPlaylist = (playlists || []).find((p) => p.playlistId === targetPlaylistId) || null;
      this.setData({
        playlists: playlists || [],
        playlistId: targetPlaylistId,
        currentPlaylist,
        tracks: withDisplayDuration(tracks || []),
      });
    } catch (error) {
      wx.showToast({
        title: "加载歌单失败",
        icon: "none",
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  async onSwitchPlaylist(event) {
    const playlistId = event.currentTarget.dataset.id;
    if (!playlistId || playlistId === this.data.playlistId) {
      return;
    }
    this.setData({ playlistId, loading: true });
    try {
      const tracks = await provider.getPlaylistTracks(playlistId);
      const currentPlaylist = this.data.playlists.find((p) => p.playlistId === playlistId) || null;
      this.setData({
        currentPlaylist,
        tracks: withDisplayDuration(tracks || []),
      });
    } catch (error) {
      wx.showToast({
        title: "切换失败",
        icon: "none",
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  onTapTrack(event) {
    const { trackId } = event.currentTarget.dataset;
    const app = getApp();
    app.globalData.pendingPlaySelection = {
      playlistId: this.data.playlistId,
      trackId,
    };
    wx.switchTab({
      url: "/pages/player/player",
    });
  },
});
