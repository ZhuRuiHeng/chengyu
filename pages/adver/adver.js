const app = getApp();
let sign = wx.getStorageSync('sign');
Page({
  data: {
  
  },
  onLoad: function (options) {
    setTimeout(function () {
        wx.switchTab({
          url: '../index/index', 
        })
        wx.setStorageSync("navto", 0)
    }, 3000)
  },
  onShow(){
    let that = this;
    let kid = wx.getStorageSync('kid')
    wx.request({
      url: "https://unify.playonweixin.com/site/get-advertisements",
      success: function (res) {
        console.log(res);
        if (res.data.status) {
          var advers = res.data.adver.advers;
          var head_adver = res.data.adver.head_adver;
          var broadcasting = res.data.adver.broadcasting;
          wx.setStorageSync("advers", advers);
          wx.setStorageSync("broadcasting", broadcasting);
          that.setData({
            head_adver
          })
        }
      }
    })
  }


})