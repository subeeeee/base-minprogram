import Api from "../../../utils/api.js";
const app =  getApp();
Page({
  data:{
    userInfo:{},
    projectName:app.globalData.projectName,
    imgServerUrl:app.globalData.imgServerUrl,
    h5DoMain: app.globalData.h5DoMain,
  },
  onLoad(){
    this.getDetail()
  },
  async getDetail(){
    const {memberId}= wx.getStorageSync('userinfoLogin');
    const res =await Api.fetch({
      method: 'get',
      url: '/applet/member/getDetail',
      showLoading: true,
      data: {
          memberId
      }
    })
    if (res.code === 200) {

      this.formImg(res.data,'wxPhoto','theme@2x.png')
      this.formImg(res.data,'wxQrCode','uploadIcon.png')
      
      this.setData({
        userInfo: res.data
      })
  } else {
      wx.showToast({
          title: res.message,
          icon: 'none',
          duration: 3000
      });
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
  showToast(title){
    wx.showToast({
      title,
      icon:'none',
      duration:3000
    })
  },
  isEmail(e) {
    return /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,6}$/.test(e)
 },
  async save(){
     const {wxId,mail,location,department,job,personalProfile} = this.data.userInfo;
     if(wxId&&wxId.length>50){
        this.showToast('微信账户不能超过50个字符')
        return
     }
     if(mail&&mail.length>50){
        this.showToast('邮箱不能超过50个字符')
        return
    }
    if(mail&&!this.isEmail(mail)){
      this.showToast('请输入正确的邮箱')
      return
    }
    if(location&&location.length>50){
      this.showToast('地址不能超过50个字符')
      return
    }
    if(department&&department.length>50){
      this.showToast('部门不能超过50个字符')
      return
    }
    if(job&&job.length>50){
      this.showToast('职称不能超过50个字符')
      return
    }
    if(personalProfile&&personalProfile.length>500){
      this.showToast('个人简介不能超过500个字符')
      return
    }
    
   


    const {userInfo} = this.data;
    if(userInfo.wxPhoto==='/images/theme@2x.png'){
      userInfo.wxPhoto=''
    }
    if(userInfo.wxQrCode==='/images/uploadIcon.png'){
      userInfo.wxQrCode=''
    }
    const res =await Api.fetch({
        method: 'put',
        url: '/applet/member',
        showLoading: true,
        data: {
            ...userInfo,
            wxPhoto:userInfo.wxPhoto.replace('https://yxf-bucket-01.oss-cn-beijing.aliyuncs.com/','').replace('?x-oss-process=image/resize,h_250',''),
            wxQrCode:userInfo.wxQrCode.replace('https://yxf-bucket-01.oss-cn-beijing.aliyuncs.com/','').replace('?x-oss-process=image/resize,h_250',''),
            headImgUrl:userInfo.headImgUrl.replace('https://yxf-bucket-01.oss-cn-beijing.aliyuncs.com/',''),
        }
    })
    if(res.code === 200){
      // wx.navigateTo({
      //     url:"/pages/user/index/index"
      // });

      this.showToast('保存成功')
    }
  },
  upload(e) {
      let {key} = e.currentTarget.dataset
      let that = this
      wx.chooseImage({
          success (res) {
            wx.showLoading({
              title: '图片上传中',
            })
              const tempFilePaths = res.tempFilePaths
              Api.uploadFile({
                  url: '/uploadImage?biz=1',
                  ContentType: true,
                  filePath: tempFilePaths[0],
                  name: 'pic',
                  header: {
                      'Content-Type': 'application/json;charset=UTF-8',
                      tenantId: getApp().globalData.tenantId,
                      customerId: wx.getStorageSync("customerId")
                  },
                  method: 'post',
                  success(res) {
                      wx.hideLoading();
                      if (JSON.parse(res.data).code === 200) {
                        const {userInfo} = that.data;
                        userInfo[key] = JSON.parse(res.data).data.url
                          that.setData({
                              userInfo
                          })
                      } else {
                          wx.showToast({
                              title: res.msg,
                              icon: 'none',
                              duration: 3000
                          })
                      }
                  },
                  fail(res){
                    console.log(res)
                    wx.hideLoading();
                  }
              })
          }
      })

  },
})