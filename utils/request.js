function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method: options.method || "GET",
      data: options.data || {},
      timeout: options.timeout || 8000,
      header: {
        "Content-Type": "application/json",
        ...(options.header || {}),
      },
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
          return;
        }
        reject(new Error(`HTTP ${res.statusCode}`));
      },
      fail(err) {
        reject(err);
      },
    });
  });
}

module.exports = {
  request,
};
