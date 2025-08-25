// /pages/game/game.js
import api from '../../config/settings';
Page({
  data: {
    imageCards: [],      // 左侧图片卡片列
    nameCards: [],       // 右侧名称卡片列
    score: 0,            // 当前得分
    timeLeft: 60,        // 剩余时间
    gameOver: false,     // 游戏是否结束
    loading: true,       // 加载状态
    firstSelected: null, // 第一次选中的卡片信息
    lockSelection: false, // 锁定选择状态
    timer: null,         // 计时器
    secondIndex: null,   // 第二次点击的索引
    scoreChanged: false  // 分数变化动画标志
  },
  onLoad() {
    this.initGame();
  },
  initGame() {
    this.setData({
      imageCards: [],
      nameCards: [],
      score: 0,
      timeLeft: 60,
      gameOver: false,
      firstSelected: null,
      lockSelection: false,
      secondIndex: null,
      scoreChanged: false
    });
    this.fetchGameData();
  },
  fetchGameData() {
    this.setData({ loading: true });
    wx.request({
      url: api.shujin_game,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data.cards) {
          this.prepareGameData(res.data.cards);
        } else {
          this.showError('获取游戏数据失败');
        }
      },
      fail: (err) => {
        console.error('请求失败:', err);
        this.showError('网络错误，请重试');
      }
    });
  },
  prepareGameData(cards) {
    try {
      if (!Array.isArray(cards) || cards.length < 4) {
        throw new Error('至少需要4种不同的蜀锦数据');
      }
      const cardPairs = [];
      const usedIds = new Set();
      for (const card of cards) {
        if (!usedIds.has(card.id) && usedIds.size < 4) {
          const id = card.id || Math.random().toString(36).substr(2, 9);
          cardPairs.push(
            { 
              ...card, 
              id, 
              image: card.image_url || card.image || '/images/default.jpg',
              isImageCard: true,
              matched: false,
              selected: false,
              animate: ''
            },
            { 
              ...card, 
              id,
              image: card.image_url || card.image || '/images/default.jpg',
              isImageCard: false,
              matched: false,
              selected: false,
              animate: ''
            }
          );
          usedIds.add(id);
        }
      }
      this.setData({
        imageCards: this.shuffleArray(cardPairs.filter(c => c.isImageCard)),
        nameCards: this.shuffleArray(cardPairs.filter(c => !c.isImageCard)),
        loading: false
      }, () => {
        this.startTimer();
      });
    } catch (error) {
      console.error('准备游戏数据出错:', error);
      this.showError('初始化游戏失败');
    }
  },
  shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  },
  startTimer() {
    clearInterval(this.data.timer);
    this.setData({
      timer: setInterval(() => {
        const timeLeft = this.data.timeLeft - 1;
        this.setData({ timeLeft }, () => {
          if (timeLeft <= 0) this.endGame();
        });
      }, 1000)
    });
  },
  handleCardTap(e) {
    try {
      if (!e?.currentTarget?.dataset) {
        console.warn('无效的点击事件');
        return;
      }
      const { index, type } = e.currentTarget.dataset;
      const cardsKey = `${type}Cards`;
      if (this.data.gameOver || this.data.lockSelection) {
        return;
      }
      const cards = this.data[cardsKey];
      if (!Array.isArray(cards) || index >= cards.length) {
        console.error('无效的卡片数据:', { cardsKey, index, cards });
        return;
      }
      const card = cards[index];
      if (card.matched || card.selected) {
        return;
      }
      this.setData({
        [`${cardsKey}[${index}].selected`]: true,
        lockSelection: true
      }, () => {
        if (!this.data.firstSelected) {
          this.setData({
            firstSelected: { index, type: cardsKey, id: card.id },
            lockSelection: false
          });
        } else {
          this.setData({
            secondIndex: index
          });
          setTimeout(() => {
            this.checkMatch(index, cardsKey, card.id);
          }, 500);
        }
      });
    } catch (error) {
      console.error('处理点击出错:', error);
      this.setData({ lockSelection: false });
    }
  },
  checkMatch(secondIndex, secondType, secondId) {
    const first = this.data.firstSelected;
    const isMatch = first.id === secondId && first.type !== secondType;
    if (isMatch) {
      const updates = {};
      updates[first.type] = this.data[first.type].map((card, i) => 
        i === first.index ? { ...card, matched: true, selected: false } : card
      );
      updates[secondType] = this.data[secondType].map((card, i) => 
        i === secondIndex ? { ...card, matched: true, selected: false } : card
      );
      this.setData({
        ...updates,
        score: this.data.score + 10,
        scoreChanged: true,
        firstSelected: null,
        lockSelection: false
      }, () => {
        setTimeout(() => {
          this.setData({ scoreChanged: false });
        }, 500);
        if (this.checkGameComplete()) {
          this.endGame();
        }
      });
    } else {
      this.setData({
        scoreChanged: true
      });
      this.handleMatchFailure(first, secondType);
    }
  },
  handleMatchFailure(first, secondType) {
    const newScore = Math.max(0, this.data.score - 5);
    this.setData({
      [`${first.type}[${first.index}].animate`]: 'shake',
      [`${secondType}[${this.data.secondIndex}].animate`]: 'shake'
    });
    setTimeout(() => {
      const updates = {};
      updates[first.type] = this.data[first.type].map(card => 
        ({ ...card, selected: false, animate: '' })
      );
      updates[secondType] = this.data[secondType].map(card => 
        ({ ...card, selected: false, animate: '' })
      );
      this.setData({
        ...updates,
        score: newScore,
        firstSelected: null,
        lockSelection: false,
        scoreChanged: false
      });
    }, 500);
  },
  checkGameComplete() {
    return [...this.data.imageCards, ...this.data.nameCards]
      .every(card => card.matched);
  },
  endGame() {
    clearInterval(this.data.timer);
    this.setData({ gameOver: true });
  },
  showError(message) {
    wx.showToast({ 
      title: message, 
      icon: 'none',
      duration: 2000
    });
    this.setData({ loading: false });
  },
  restartGame() {
    this.initGame();
  },
  exitGame() {
    wx.navigateBack();
  },
  onUnload() {
    clearInterval(this.data.timer);
  }
});