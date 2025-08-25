// /pages/photoshow/photoshow.js
import api, { photoshow } from '../../config/settings'
Page({
  data: {
    images: [],
    loading: false,
    currentPage: 1
  },
  onLoad: function() {
    this.loadImages();
  },
  loadImages: function() {
    if (this.data.loading) return;
    this.setData({ loading: true });
    const that = this;
    wx.request({
      url: api.photoshow,
      method: 'GET',
      success(res) {
        if (res.statusCode === 200) {
          const newImages = res.data;
          that.setData({
            images: that.data.images.concat(newImages),
            currentPage: that.data.currentPage + 1,
          });
        }
      },
      complete() {
        that.setData({ loading: false });
      }
    });
  },
  previewImage: function(e) {
    const index = e.currentTarget.dataset.index;
    const urls = this.data.images.map(item => item.image_url);
    wx.previewImage({
      current: urls[index],
      urls: urls
    });
  },
});