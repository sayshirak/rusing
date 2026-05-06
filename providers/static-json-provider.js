const { request } = require("../utils/request");
const { setRecentTrack } = require("../utils/storage");
const env = require("../config/env");
const { users, playlists, notice, tracksMap } = require("../mock/mock-data");

function unwrapData(resp) {
  if (resp && typeof resp === "object" && "data" in resp) {
    return resp.data;
  }
  return resp;
}

function fetchWithFallback(url, fallbackData) {
  if (!env.staticBaseUrl) {
    return Promise.resolve(unwrapData(fallbackData));
  }

  return request(url)
    .then(unwrapData)
    .catch(() => unwrapData(fallbackData));
}

const staticJsonProvider = {
  getUserProfile(userId) {
    const fallback = users[userId] || users.u001;
    return fetchWithFallback(`${env.staticBaseUrl}/users/${userId}.json`, fallback);
  },

  getPlaylists() {
    return fetchWithFallback(`${env.staticBaseUrl}/playlists.json`, playlists);
  },

  getPlaylistTracks(playlistId) {
    const fallback = tracksMap[playlistId] || { data: [] };
    return fetchWithFallback(
      `${env.staticBaseUrl}/playlists/${playlistId}/tracks.json`,
      fallback
    );
  },

  getNotice() {
    return fetchWithFallback(`${env.staticBaseUrl}/config/notice.json`, notice);
  },

  saveRecentPlay(track) {
    setRecentTrack(track);
    return Promise.resolve();
  },
};

module.exports = staticJsonProvider;
