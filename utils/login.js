import Api from './api.js';

export const showPhoneNumberMask=function(type="marketing"){
  this.closePhoneBox()
  let userPhone = wx.getStorageSync('userPhone')
  let userinfoLogin = wx.getStorageSync('userinfoLogin') || {}
  const mobile = userinfoLogin.phoneNo || userPhone
  if(mobile){
    if(wx.getStorageSync('agentId')){
      // this.gotoNext('/pages/marketing/index')
      this.gotoNext('/pages/home/everyoneSell/everyoneSell')
    }else{
      //查询渠道管家里面是否已经有此用户的信息了
      this.queryUserFromChannel(mobile,type)
    }

    this.setData({
      mobile:mobile.replace(/(\d{3})(\d{4})(\d{4})/,'$1****$3')
    })
  }else{
    this.setData({
      isPhoneAuth:1
    })
  }
}

export const queryUserFromChannel = async function(mobile,type){
  const result = await Api.fetchChannelManager({
    method: 'get',
    url: '/customersForThird/accounts/find',
    data: {
      tenantId:getApp().globalData.tenantId,
      mobile
    }
  })
  if (result.data) {
    wx.setStorageSync('agentId',result.data.userId)
    // this.gotoNext('/pages/marketing/index')

    this.gotoNext('/pages/home/everyoneSell/everyoneSell')
  }else{
    //  开始一版的一键注册
    // this.setData({
    //   channelLoginPopupShow:true
    // })
    // 后来一版的注册页面
    this.gotoNext('/pages/marketing/channelRegister/index?type='+type)
    this.getUserInfoCanClick=true
  }


}


export const closeChannelLoginPopup = function(){
  this.setData({
    channelLoginPopupShow:false
  })
}
export const channelRegister = async function(){
  let userinfoLogin = wx.getStorageSync('userinfoLogin') || {}
  const result = await Api.fetchChannelManager({
    method: 'post',
    url: '/customersForThird/accounts/register',
    data: {
      tenantId:getApp().globalData.tenantId,
      //"userId": null,
      //  "parentUserId": null,
      //    "userName": null,
      "password": "123456",
      "name": userinfoLogin.phoneNo||wx.getStorageSync("userPhone"),
      "identity": 0,
      "mobile": userinfoLogin.phoneNo||wx.getStorageSync("userPhone"),
      "sex": userinfoLogin.sex-1,
      //      "teamId": null,
      //      "idCard": null,
      //      "city": null,
      //      "projectId": null
    }
  })

  if (result.code === 200) {
    wx.setStorageSync('agentId',result.data.userId)

    this.setData({
      channelLoginPopupShow:false
    })
    wx.showToast({
      icon:'none',
      title: '注册成功',
      duration:3000,
      success:function(){
        wx.redirectTo({
          url:"/pages/marketing/index"
        })
      }
    })
    // setTimeout(() => {
    //   this.gotoNext()
    // }, 3000);
  }else{
    wx.showToast({
      icon:'none',
      title: result.message,
      duration:3000
    })
    this.getUserInfoCanClick=true
  }


}
export const closePhoneBox = function(){
  this.setData({
    isPhoneAuth:0
  })
  this.getUserInfoCanClick=true
}

export const getNickName=function() {
  const userinfoLogin = wx.getStorageSync("userinfoLogin") || {};
  const {nickName} = userinfoLogin
  this.setData({
    nickName
  })
}

export const getPhoneNo=function() {
  const userinfoLogin = wx.getStorageSync("userinfoLogin") || {};
  let {phoneNo} = userinfoLogin
  if(!phoneNo){
    phoneNo = wx.getStorageSync("userPhone")
  }
  this.setData({
    phoneNo
  })
}