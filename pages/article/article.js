// /pages/article/article.js
import api from '../../config/settings'
Page({
  data: {
    article: null, // 文章详情数据
    formattedContent: '', // 格式化后的内容
    loading: true // 加载状态
  },
  onLoad: function(options) {
    const articleId = options.id;
    this.fetchArticleDetail(articleId);
  },
  // 从 Django 后端获取文章详情
  fetchArticleDetail: function(articleId) {
    wx.showLoading({
      title: '加载中...',
    });
    wx.request({
      url: api.books + articleId + '/',
      method: 'GET',
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200) {
          this.setData({ 
            article: res.data,
            formattedContent: this.processContent(res.data.content || ''),
            loading: false
          });
        } else {
          this.showErrorToast('文章加载失败');
        }
      },
      fail: (err) => {
        wx.hideLoading();
        this.showErrorToast('网络错误，请重试');
        this.setData({ loading: false });
      }
    });
  },
  // 更完善的内容处理函数
  processContent: function(content) {
    if (!content) return '';
    let processed = content
      .replace(/ /g, '&nbsp;')
      .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;') // 制表符转换为4个空格
      .replace(/\n/g, '<br/>');
    processed = processed.replace(/<br\/><br\/>/g, '</p><p style="margin:10px 0;">');
    processed = `<p style="margin:10px 0;">${processed}</p>`;
    processed = processed.replace(/<br\/>- /g, '<br/>&nbsp;&nbsp;• '); // 简单列表
    processed = processed.replace(
      /<br\/>&nbsp;&nbsp;&nbsp;&nbsp;(.*?)<br\/>/g, 
      '<br/><code style="display:block;background:#f5f5f5;padding:10px;border-radius:4px;margin:8px 0;overflow-x:auto;">$1</code><br/>'
    );
    processed = processed.replace(
      /<img/g, 
      '<img style="max-width:100%;height:auto;border-radius:8px;margin:12px 0;"'
    );
    return processed;
  },
  // 显示错误提示
  showErrorToast: function(message) {
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    });
  },
  // 返回上一页
  onBack: function() {
    wx.navigateBack();
  }
});