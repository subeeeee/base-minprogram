import Api from "../../../../utils/api.js";

Page({
  data:{
    userInfo:{}
  },
  onLoad(){
    this.getDetail()
  },
  async getDetail(mobile){
    let {phoneNo=''}=wx.getStorageSync("userinfo")||''
      const result = await Api.fetchChannelManager({
          method: 'get',
          url: '/customersForThird/accounts/find',
          data: {
              tenantId:getApp().globalData.tenantId,
              mobile:phoneNo||wx.getStorageSync("userPhone")
          }
        })
        if (result.data) {
          this.setData({
            userInfo: result.data
          })
        }else{
        }
  },
  formImg(obj,key,defaultImgName){
    const name = obj[key];
    obj[key] =  name ? ( name.indexOf('http') != -1 ?  name : ('https://yxf-bucket-01.oss-cn-beijing.aliyuncs.com/' + name + '?x-oss-process=image/resize,h_250')) : '/images/'+defaultImgName
  },
  bindKeyInput(e) {
      let key = e.currentTarget.dataset.key
      let userInfo = this.data.userInfo
      userInfo[key] = e.detail.value
      this.setData({
        userInfo
      })
  },
  async save(){
    const {userInfo} = this.data;
    const res =await Api.fetch({
        method: 'put',
        url: '/applet/member',
        showLoading: true,
        data: {
            ...userInfo
        }
    })
    if(res.code === 200){
      wx.navigateTo({
          url:"/pages/user/index/index"
      });
    }
  },
})