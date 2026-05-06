let audio = null;
let paused = true;

function getAudio() {
  if (!audio) {
    // 使用后台音频管理器，支持切后台/锁屏继续播放。
    audio = wx.getBackgroundAudioManager();
  }
  return audio;
}

function play(track) {
  if (!track || !track.playUrl) {
    return;
  }
  const player = getAudio();
  const sameSrc = player.src === track.playUrl;
  if (!sameSrc) {
    player.title = track.title || "Rusing";
    player.singer = track.artist || "";
    player.epname = track.album || "";
    player.coverImgUrl = track.coverUrl || "";
    // 设置 src 后会自动开始播放。
    player.src = track.playUrl;
    return;
  }
  player.play();
}

function pause() {
  getAudio().pause();
}

function resume() {
  getAudio().play();
}

function stop() {
  getAudio().stop();
}

function seek(position) {
  const seconds = Number(position || 0);
  getAudio().seek(seconds > 0 ? seconds : 0);
}

function onEnded(callback) {
  getAudio().onEnded(() => {
    paused = true;
    callback && callback();
  });
}

function onError(callback) {
  getAudio().onError((err) => {
    paused = true;
    callback && callback(err);
  });
}

function onTimeUpdate(callback) {
  getAudio().onTimeUpdate(callback);
}

function onPlay(callback) {
  getAudio().onPlay(() => {
    paused = false;
    callback && callback();
  });
}

function onPause(callback) {
  getAudio().onPause(() => {
    paused = true;
    callback && callback();
  });
}

function onStop(callback) {
  getAudio().onStop(() => {
    paused = true;
    callback && callback();
  });
}

function getState() {
  const player = getAudio();
  return {
    currentTime: player.currentTime || 0,
    duration: player.duration || 0,
    paused,
  };
}

module.exports = {
  play,
  pause,
  resume,
  stop,
  seek,
  onEnded,
  onError,
  onTimeUpdate,
  onPlay,
  onPause,
  onStop,
  getState,
};
