import Api from "../utils/api"
export const imClickfun = function(e) {
  if (!wx.getStorageSync('customerId')) {
      this.setData({
          isUserAuth:1
      });
      return false
  }
  Api.fetch({
      method: 'get',
      url: '/applet/member/getMemberCycle',
      data: {
          projectId: this.data.houseid,
      }
  }).then((res) => {
      if (res.code === 200) {
          if (res.data) {

              wx.navigateTo({
                  url: `/packageIm/pages/main/index?memberid=${res.data.memberId}&houseid=${this.data.houseid}`
              });
              this.generalStatistical({
                statisticalName:'onlineConsulting',
                projectId: this.data.houseid,
              })
          } else {
              wx.showToast({
                  title: '该项目暂无置业顾问！',
                  icon: 'none',
                  duration: 3000
              })
          }
      } else {
          wx.showToast({
              title: res.message,
              icon: 'none',
              duration: 3000
          })
      }
  });

}