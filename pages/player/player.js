const provider = require("../../providers/index.js");
const playerService = require("../../services/player-service");
const { setRecentTrack, getSettings } = require("../../utils/storage");

function formatTime(sec) {
  const total = Number(sec || 0);
  const m = Math.floor(total / 60);
  const s = Math.floor(total % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function withDisplayDuration(tracks = []) {
  return tracks.map((item) => ({
    ...item,
    displayDuration: formatTime(item.duration),
  }));
}

Page({
  data: {
    playlistId: "",
    tracks: [],
    currentIndex: 0,
    currentTrack: null,
    playing: false,
    playMode: "order",
    currentTime: "00:00",
    duration: "00:00",
    currentSeconds: 0,
    durationSeconds: 0,
    sliderValue: 0,
    isDraggingProgress: false,
    hasStartedCurrent: false,
    coverLoadError: false,
    fallbackCoverUrl: "https://qny.smzdm.com/202403/09/65ec173e3865f7681.jpg",
  },

  onLoad(options) {
    const settings = getSettings();
    const initialPlaylistId = options.playlistId || "";
    const shouldAutoPlay = !!options.trackId || !!settings.autoPlay;
    this.setData({
      playlistId: initialPlaylistId,
      playMode: options.mode || settings.playMode || "order",
    });
    this.initAudioEvents();
    this.loadTracks(options.trackId, initialPlaylistId, shouldAutoPlay);
  },

  onShow() {
    this.consumePendingSelection();
  },

  consumePendingSelection() {
    const app = getApp();
    const pending = app.globalData.pendingPlaySelection;
    if (!pending || !pending.playlistId) {
      return;
    }

    app.globalData.pendingPlaySelection = null;
    const targetPlaylistId = pending.playlistId;
    const targetTrackId = pending.trackId;
    this.setData({
      playlistId: targetPlaylistId,
    });
    this.loadTracks(targetTrackId, targetPlaylistId, true);
  },

  initAudioEvents() {
    playerService.onPlay(() => {
      this.setData({ playing: true });
    });

    playerService.onPause(() => {
      this.setData({ playing: false });
    });

    playerService.onStop(() => {
      this.setData({ playing: false });
    });

    playerService.onEnded(() => {
      this.playNext(false);
    });

    playerService.onError(() => {
      wx.showToast({
        title: "播放失败，切换下一首",
        icon: "none",
      });
      this.playNext(false);
    });

    playerService.onTimeUpdate(() => {
      const state = playerService.getState();
      const currentSeconds = Math.floor(state.currentTime || 0);
      const durationSeconds = Math.floor(state.duration || 0);
      if (this.data.isDraggingProgress) {
        this.setData({
          duration: formatTime(durationSeconds),
          durationSeconds,
        });
        return;
      }
      this.setData({
        currentTime: formatTime(currentSeconds),
        duration: formatTime(durationSeconds),
        currentSeconds,
        durationSeconds,
        sliderValue: currentSeconds,
      });
    });
  },

  async loadTracks(trackId, forcePlaylistId = "", shouldAutoPlay = false) {
    try {
      let playlistId = forcePlaylistId || this.data.playlistId;
      if (!playlistId) {
        const playlists = await provider.getPlaylists();
        playlistId = (playlists && playlists[0] && playlists[0].playlistId) || "";
        this.setData({ playlistId });
      }

      const rawTracks = await provider.getPlaylistTracks(playlistId);
      if (!rawTracks || !rawTracks.length) {
        wx.showToast({
          title: "当前歌单没有可播放曲目",
          icon: "none",
        });
        return;
      }
      const tracks = withDisplayDuration(rawTracks);
      let idx = 0;
      if (trackId) {
        const target = tracks.findIndex((t) => t.trackId === trackId);
        idx = target >= 0 ? target : 0;
      }
      this.setData({
        tracks,
        currentIndex: idx,
        currentTrack: tracks[idx],
        coverLoadError: false,
      });
      if (shouldAutoPlay) {
        this.playCurrent();
      } else {
        // 禁止自动播放时，只更新选中曲目，不触发播放。
        playerService.stop();
        this.setData({
          playing: false,
          hasStartedCurrent: false,
          currentTime: "00:00",
          currentSeconds: 0,
          sliderValue: 0,
          duration: formatTime(tracks[idx] && tracks[idx].duration ? tracks[idx].duration : 0),
          durationSeconds: tracks[idx] && tracks[idx].duration ? tracks[idx].duration : 0,
          isDraggingProgress: false,
        });
      }
    } catch (error) {
      wx.showToast({
        title: "加载曲目失败",
        icon: "none",
      });
    }
  },

  playCurrent() {
    const { tracks, currentIndex, playlistId } = this.data;
    const currentTrack = tracks[currentIndex];
    if (!currentTrack) {
      return;
    }
    playerService.play(currentTrack);
    setRecentTrack({
      ...currentTrack,
      playlistId,
    });
    provider.saveRecentPlay({
      ...currentTrack,
      playlistId,
    });
    this.setData({
      currentTrack,
      playing: true,
      hasStartedCurrent: true,
      coverLoadError: false,
      currentTime: "00:00",
      currentSeconds: 0,
      sliderValue: 0,
      isDraggingProgress: false,
    });
  },

  onTapPlayPause() {
    if (!this.data.currentTrack) {
      return;
    }
    const state = playerService.getState();
    const isPaused = state.paused;
    if (!isPaused) {
      playerService.pause();
    } else if (!this.data.hasStartedCurrent) {
      this.playCurrent();
    } else {
      playerService.resume();
    }
  },

  onTapPrev() {
    this.playPrev();
  },

  onTapNext() {
    // 手动点击下一首时，默认应切到下一曲，不受单曲循环限制。
    this.playNext(true);
  },

  playPrev() {
    const { tracks, currentIndex } = this.data;
    if (!tracks.length) {
      return;
    }
    const idx = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
    this.setData({ currentIndex: idx });
    this.playCurrent();
  },

  playNext(isManual = false) {
    const { tracks, currentIndex, playMode } = this.data;
    if (!tracks.length) {
      return;
    }

    let idx = currentIndex;
    if (playMode === "repeat-one" && !isManual) {
      idx = currentIndex;
    } else if (playMode === "random") {
      idx = Math.floor(Math.random() * tracks.length);
    } else {
      idx = currentIndex === tracks.length - 1 ? 0 : currentIndex + 1;
    }

    this.setData({ currentIndex: idx });
    this.playCurrent();
  },

  onTapMode() {
    const modes = ["order", "random", "repeat-one"];
    const current = modes.indexOf(this.data.playMode);
    const nextMode = modes[(current + 1) % modes.length];
    this.setData({
      playMode: nextMode,
    });
    wx.showToast({
      title: `模式: ${this.modeLabel(nextMode)}`,
      icon: "none",
    });
  },

  onProgressChanging(event) {
    const sec = Number(event.detail.value || 0);
    this.setData({
      isDraggingProgress: true,
      sliderValue: sec,
      currentSeconds: sec,
      currentTime: formatTime(sec),
    });
  },

  onProgressChange(event) {
    const sec = Number(event.detail.value || 0);
    playerService.seek(sec);
    this.setData({
      isDraggingProgress: false,
      sliderValue: sec,
      currentSeconds: sec,
      currentTime: formatTime(sec),
    });
  },

  onTapListTrack(event) {
    const idx = Number(event.currentTarget.dataset.index);
    if (Number.isNaN(idx)) {
      return;
    }
    this.setData({ currentIndex: idx });
    this.playCurrent();
  },

  onCoverError() {
    this.setData({
      coverLoadError: true,
    });
  },

  modeLabel(mode) {
    if (mode === "random") {
      return "随机播放";
    }
    if (mode === "repeat-one") {
      return "单曲循环";
    }
    return "顺序播放";
  },
});
