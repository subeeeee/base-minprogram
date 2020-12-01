// pages/login/index/index.js
var Api = require("../../../utils/api.js");
import { getUserInfo, getUserPhone } from "../../../utils/util.js";

Page({

  /**
   * 页面的初始数据
   */
  data: {
      count: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let me = this
      getApp().watch('unReadMessageNum', function () {
          me.setData({
              count: getApp().globalData.unReadMessageNum
          })
      })
    this.setData({
      userid: options.userid,
      type: options.type
    })
  },
    getUserInfo
})
