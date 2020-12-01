import Api from "../../../utils/api.js";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    obj:{
      couponCode:'',
      price:'',
      couponName:''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.manage!=1){
      wx.navigateBack()
    }
    this.setData({
      obj:{
        couponCode:options.couponCode,
        confirmCustomerId:options.onlineCustomerId,
        confirmProjectId:options.projectId,
        confirmTenantId:options.tenantId,
        actWinningLogId:options.actWinningLogId
      }
    })
    this.getCoupon()
  },
  closePage: function(){
      wx.navigateBack()
  },
  getCoupon: function(){
    let that=this;
    Api.fetch({
            method: 'post',
            url: '/applet/act/coupon/get',
            data: {'actWinningLogId':this.data.obj.actWinningLogId}
        }).then((res) => {
            if (res.code === 200) {
                that.setData({
                    activityName:res.data.activityName,
                    couponName:res.data.couponName,
                    price:res.data.price
                })
                if(res.data.state==1 || res.data.state==2){
                  wx.showToast({
                    title: '该优惠券已使用或已失效',
                    duration:2000
                })
                }
            } else {
                wx.showToast({
                    title: res.msg,
                    icon: 'none',
                    duration: 3000
                })
            }
        });
  },
  submitFun: function(){
    Api.fetch({
            method: 'post',
            url: '/admin/activity/coupon/confirm',
            data: this.data.obj
        }).then((res) => {
            if (res.code === 200) {
                wx.showToast({
                    title: '核销成功',
                    duration:2000
                })
                setTimeout(function () {
                    wx.navigateBack()
                }, 2000)
            } else {
                wx.showToast({
                    title: res.msg,
                    icon: 'none',
                    duration: 3000
                })
            }
        });
  }
})