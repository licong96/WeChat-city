
Page({
  data: {
  },
  onLoad: function (options) {
  },
  onReady: function () {
  },
  onShow: function () {
  },
  // 城市选择组件返回值，这个页面只是一个载体
  bindCitySelector(data) {
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];     // 获取上一个页面

    // 修改上一页城市数据
    prevPage.setData({
      cityData: data.detail.value
    });
    wx.navigateBack();
  }
})