Page({
  data: {
    cityData: {}
  },
  onShow: function () {
    console.log(this.data.cityData)
  },
  // 打开城市选择页面
  bindOpenCity() {
    wx.navigateTo({
      url: '../city/index'
    });
  },
})