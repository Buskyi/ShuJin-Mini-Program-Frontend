// /pages/welcome/welcome.js
Page({
  data: {
    second: 3, // 倒计时
    img: '/images/bg/splash.png' // 默认图片路径
  },
  dojump() {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  onLoad(options) {
    var instance = setInterval(() => {
      if (this.data.second <= 1) {
        clearInterval(instance); // 清除定时器
        wx.switchTab({
          url: '/pages/index/index',
        });
      } else {
        this.setData({
          second: this.data.second - 1
        });
      }
    }, 1000);
  }
});