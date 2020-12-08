let disp = require("../../utils/broadcast");
let WebIM = require("../../utils/WebIM")["default"];
import Api from '../../../utils/api.js';
const app =  getApp();

Page({
  data: {
    grant_type: "password",
  },
  onLoad(options) {
      const { houseid } = options;
      this.setData({ houseid });
    const hxaccount = wx.getStorageSync("hxaccount") || '';
    const hxpassword = wx.getStorageSync("hxpassword") || '';

    const hxyourname = wx.getStorageSync("hxyourname") || '';
    const hxyouraccount = wx.getStorageSync("hxyouraccount") || '';
    // 给两个人添加好友  我猜是这个样子
    Api.fetch({
        method: 'get',
        url: '/applet/member/addFriendSingle',
        ContentType: true,
        data: {
            username: hxaccount,
            friendName: hxyouraccount,
        }
    }).then((res) => {
        if (res.code === 200) {
          // console.log(res)
          app.globalData.state = true
        } else {
          wx.showToast({
              icon:'none',
              title: res.message,
              duration:3000
          })
        }
    })

    this.setData({
      username: {
        myName: hxaccount,
        your: hxyouraccount
      }
    });
    wx.setNavigationBarTitle({
      title: hxyourname
    });
    wx.setStorage({
      key: "myUsername",
      data: hxaccount
    });
      getApp().conn.open({
          apiUrl: WebIM.config.apiURL,
          user: hxaccount,
          pwd: hxpassword,
          grant_type: 'password',
          appKey: WebIM.config.appkey
      })
  },

  onUnload() {
    disp.fire("em.chatroom.leave");
  },

  onPullDownRefresh: function () {
    wx.showNavigationBarLoading();
    this.selectComponent('#chat').getMore()
    // 停止下拉动作
    wx.hideNavigationBarLoading();
    wx.stopPullDownRefresh();
  },

});
