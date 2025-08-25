// /pages/tweet-detail/tweet-detail.js
import api from '../../config/settings';
Page({
  data: {
    tweet: {},          // 推文详情
    isLoading: true,    // 加载状态
    isLiking: false,    // 点赞中状态
    error: null         // 错误信息
  },
  onLoad(options) {
    this.loadTweetDetail(options.id);
  },
  _request(url, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      wx.request({
        url,
        method,
        data,
        success: res => {
          console.log('请求成功:', res); // 调试信息
          if (res.statusCode === 200 && res.data.code === 200) {
            resolve(res.data.data);
          } else {
            reject(res.data?.msg || '请求失败');
          }
        },
        fail: err => {
          console.error('请求失败:', err); // 调试信息
          reject('网络连接失败');
        }
      });
    });
  },
  async loadTweetDetail(tweetId) {
    this.setData({ isLoading: true, error: null });
    try {
      const data = await this._request(`${api.tweets}${tweetId}/`);
      console.log('推文详情:', data); // 调试信息
      this.setData({
        tweet: {
          ...data,
          time: this._formatTime(data.time),
          avatar: data.avatar || '/images/default-avatar.png',
          images: data.images || [],
          official: data.official || false,
          likeCount: data.like_count || 0,
          commentCount: data.comment_count || 0
        },
        isLoading: false
      });
    } catch (error) {
      console.error('加载失败:', error); // 调试信息
      this.setData({ error: error.toString(), isLoading: false });
    }
  },
  retryLoad() {
    const tweetId = this.data.tweet.id || this.options.id;
    this.loadTweetDetail(tweetId);
  },
  _showError(error) {
    wx.showToast({
      title: typeof error === 'string' ? error : '操作失败，请重试',
      icon: 'none',
      duration: 2000
    });
  },
  _formatTime(timeStr) {
    const date = new Date(timeStr);
    const pad = n => n.toString().padStart(2, '0');
    
    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} 
            ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  },
  previewImage(e) {
    const { images } = this.data.tweet;
    const index = e.currentTarget.dataset.index;
    if (images?.length) {
      wx.previewImage({
        current: images[index],
        urls: images
      });
    }
  },
  handleComment() {
    const tweetId = this.data.tweet.id;
    wx.navigateTo({
      url: `/pages/comment/comment?tweetId=${tweetId}`
    });
  }
});