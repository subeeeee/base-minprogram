import Api from './api';
module.exports = {
  getWebFun: e => {
    let { url: webUrl, title = "", content } = e.currentTarget.dataset;
    if (content) {
      content = JSON.parse(content)
      wx.navigateToMiniProgram({
        appId: content.appid,
        path: content.path,
        envVersion: 'trial',
        success(res) { }
      });
    } else if (webUrl) {
      const webUrllist = webUrl.split("?");
      if (webUrllist.length > 1) {
        wx.navigateTo({
          url: `/pages/h5/index/index?webUrl=${webUrllist[0]}&${webUrllist[1]}&title=${title}`
        });
      } else {
        wx.navigateTo({
          url: `/pages/h5/index/index?webUrl=${webUrl}&title=${title}`
        });
      }
    } else {
      wx.navigateTo({
        url: "/pages/h5/money/index"
      });
    }
  },
  goHouseFun: e => {
    const { houseid } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/house/detail/index?houseid=${houseid}`
    });
  },
  goLoginFun: () => {
    const token = wx.getStorageSync("token") || "";
    if (!token) {
      Api.getUrl();
      wx.navigateTo({
        url: `/pages/login/index/index`
      });
      return;
    }
  }
};
