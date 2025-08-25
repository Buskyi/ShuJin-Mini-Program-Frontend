// /pages/index/index.js
import api from '../../config/settings'
Page({
  data:{
    banner_list:[{
      img:'/images/banner/1.png'
    }],
    notice:'社区平台上线啦~'
  },
  onLoad(){
    wx.request({
      url: api.banner,
      method:'GET',
      success:(res)=>{
        this.setData({
          banner_list:res.data.banner,
          notice:res.data.notice.title
        })
      }
    })
  },
})
