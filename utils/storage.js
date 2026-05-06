const RECENT_TRACK_KEY = "rusing_recent_track";
const SETTINGS_KEY = "rusing_settings";

function getRecentTrack() {
  try {
    return wx.getStorageSync(RECENT_TRACK_KEY) || null;
  } catch (e) {
    return null;
  }
}

function setRecentTrack(track) {
  wx.setStorageSync(RECENT_TRACK_KEY, track || null);
}

function getSettings() {
  const defaults = {
    playMode: "order",
    autoPlay: false,
    volume: 0.8,
  };
  try {
    return {
      ...defaults,
      ...(wx.getStorageSync(SETTINGS_KEY) || {}),
    };
  } catch (e) {
    return defaults;
  }
}

function setSettings(nextSettings) {
  const current = getSettings();
  wx.setStorageSync(SETTINGS_KEY, {
    ...current,
    ...nextSettings,
  });
}

module.exports = {
  getRecentTrack,
  setRecentTrack,
  getSettings,
  setSettings,
};
