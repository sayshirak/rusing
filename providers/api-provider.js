const { request } = require("../utils/request");
const env = require("../config/env");

function unwrapData(resp) {
  if (resp && typeof resp === "object" && "data" in resp) {
    return resp.data;
  }
  return resp;
}

const apiProvider = {
  getUserProfile(userId) {
    return request(`${env.apiBaseUrl}/users/${userId}`).then(unwrapData);
  },

  getPlaylists() {
    return request(`${env.apiBaseUrl}/playlists`).then(unwrapData);
  },

  getPlaylistTracks(playlistId) {
    return request(`${env.apiBaseUrl}/playlists/${playlistId}/tracks`).then(unwrapData);
  },

  getNotice() {
    return request(`${env.apiBaseUrl}/config/notice`).then(unwrapData);
  },

  saveRecentPlay(track) {
    return request(`${env.apiBaseUrl}/user/history`, {
      method: "POST",
      data: {
        action: "played",
        trackId: track ? track.trackId : "",
        playedAt: new Date().toISOString(),
      },
    });
  },
};

module.exports = apiProvider;
