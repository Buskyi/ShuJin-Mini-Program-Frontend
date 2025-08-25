// /pages/books/books.js
import api from '../../config/settings'
Page({
  data: {
    searchKeyword: '',
    articles: [],
    allArticles: [],
    processedSummaries: []
  },
  onLoad: function() {
    this.fetchArticles();
  },
  fetchArticles: function() {
    wx.showLoading({
      title: '加载中...'
    });
    wx.request({
      url: api.books,
      method: 'GET',
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200) {
          const processed = res.data.map(item => {
            const processedSummary = this.processSummary(item.summary);
            return {
              ...item,
              processedSummary,
              showExpandButton: this.needShowExpandButton(processedSummary),
              isExpanded: false
            };
          });
          this.setData({
            articles: processed,
            allArticles: processed
          });
        } else {
          this.showToast('加载失败，请重试');
        }
      },
      fail: (err) => {
        wx.hideLoading();
        this.showToast('网络错误，请重试');
      }
    });
  },
  // 处理摘要换行
  processSummary: function(summary) {
    if (!summary) return '';
    return summary
      .replace(/\n\n+/g, '</p><p>')
      .replace(/\n/g, '<br/>')
      .replace(/<p>/g, '<p style="margin:8px 0;">');
  },
  // 判断是否需要显示展开按钮
  needShowExpandButton: function(content) {
    const brCount = (content.match(/<br\/?>/g) || []).length;
    const pCount = (content.match(/<p/g) || []).length;
    return brCount > 2 || pCount > 1;
  },
  // 切换展开/收起状态
  toggleExpand: function(e) {
    const id = e.currentTarget.dataset.id;
    const articles = this.data.articles.map(item => {
      if (item.id === id) {
        return {
          ...item,
          isExpanded: !item.isExpanded
        };
      }
      return item;
    });
    this.setData({ articles });
    e.stopPropagation();
  },
  onSearchInput: function(e) {
    this.setData({
      searchKeyword: e.detail
    });
  },
  onSearch: function() {
    const keyword = this.data.searchKeyword.trim().toLowerCase();
    if (!keyword) {
      this.setData({ articles: this.data.allArticles });
      return;
    }
    const filteredArticles = this.data.allArticles.map(item => {
      const match = item.title.toLowerCase().includes(keyword) || 
                   (item.summary && item.summary.toLowerCase().includes(keyword));
      return match ? item : null;
    }).filter(item => item !== null);
    this.setData({ articles: filteredArticles });
  },
  onArticleTap: function(e) {
    const articleId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/article/article?id=${articleId}`
    });
  },
  showToast: function(title) {
    wx.showToast({
      title,
      icon: 'none',
      duration: 2000
    });
  }
});