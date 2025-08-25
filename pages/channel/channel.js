// /pages/channel/channel.js
import api from '../../config/settings'
Page({
  data: {
    tweets: [], // 推文列表
    page: 1, // 当前页码
    pageSize: 10, // 每页显示的推文数量
    isLoading: false, // 是否正在加载
    hasMore: true // 是否还有更多数据
  },
  onLoad() {
    this.loadTweets();
  },
  // 加载推文
  loadTweets() {
    if (this.data.isLoading || !this.data.hasMore) return;
    this.setData({ isLoading: true });
    wx.request({
      url: api.tweets,
      method: 'GET',
      data: {
        page: this.data.page,
        pageSize: this.data.pageSize
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 200) {
          const responseData = res.data.data; // 获取 data 字段
          const newTweets = responseData.list.map(tweet => ({
            ...tweet,
            time: this.formatTime(tweet.time), // 格式化时间
            avatar: tweet.avatar || '/images/default-avatar.png', // 默认头像
            images: tweet.images || [], // 确保 images 是数组
            official: tweet.official || false, // 默认非官方
            likeCount: tweet.like_count || 0, // 适配后端字段 like_count
            commentCount: tweet.comment_count || 0 // 适配后端字段 comment_count
          }));
          this.setData({
            tweets: this.data.tweets.concat(newTweets),
            page: this.data.page + 1,
            hasMore: responseData.pagination.has_more // 使用后端返回的 has_more
          });
        } else {
          wx.showToast({
            title: '加载失败，请重试',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      },
      complete: () => {
        this.setData({ isLoading: false });
        wx.stopPullDownRefresh(); // 停止下拉刷新动画
      }
    });
  },
  formatTime(timeStr) {
    const date = new Date(timeStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  },
  onPullDownRefresh() {
    this.setData({
      tweets: [],
      page: 1,
      hasMore: true
    });
    this.loadTweets();
  },
  onReachBottom() {
    this.loadTweets();
  },
  previewImage(e) {
    const index = e.currentTarget.dataset.index;
    const currentTweet = this.data.tweets[index];
    if (!currentTweet.images || currentTweet.images.length === 0) return;
    wx.previewImage({
      current: currentTweet.images[0], // 当前点击的图片
      urls: currentTweet.images // 所有图片
    });
  },
  navigateToDetail(e) {
    const tweetId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/tweet-detail/tweet-detail?id=${tweetId}`
    });
  }
});