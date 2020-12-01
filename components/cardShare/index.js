import {getAppData,getQrCode,generalStatistical} from "../../utils/util"
import {downloadFilePromise,removeSystemFile,showLoading,saveImageToPhotosAlbum} from "../../utils/saveImage"
const app =  getApp();
//Component Object
Component({
  properties: {
    houseid:String,
    item:Object,
    selectdProjectId:String,
    type:String
  },
  options: {
    styleIsolation: 'apply-shared'
  },
  data: {
    xcxCodeUrl:'',
    systemInfo:{},
    imgServerUrl:app.globalData.imgServerUrl,
    imgDraw: {}, //绘制图片的大对象
    projectName:app.globalData.projectName,
    imgServerUrl:app.globalData.imgServerUrl,
    h5DoMain: app.globalData.h5DoMain,
  },
  methods: {
    hideShareDialog(){
      this.triggerEvent("hideShareDialog")
    },
    getAppData,
    getQrCode,
    downloadFilePromise,
    async downloadImage() {
     // this.showLoading('名片制作中')
     // const { shareImage } = await this.createProjectShareImage();
      wx.hideLoading()
      wx.getSetting({
          success: (res) => {
              if (!res.authSetting['scope.writePhotosAlbum']) {
                  wx.authorize({
                      scope: 'scope.writePhotosAlbum',
                      success: () => {
                          this.showLoading('图片保存中...')
                          this.saveImageToPhotosAlbum(this.data.sharePath)
                       //   this.saveImageToPhotosAlbum(shareImage)
                          
                      },
                      fail() {
                          // APP.showToast("此功能需要您授权保存图片");

                                                //用户点击拒绝授权，跳转到设置页，引导用户授权
                      wx.showModal({
                        title: "提示",
                        content: "是否允许打开相册",
                        success: (res) => {
                          if (res.confirm) {
                            wx.openSetting({
                              success: () => {
                                wx.authorize({
                                  scope: "scope.writePhotosAlbum",
                                  success: () => {
                                    this.saveImageToPhotosAlbum(this.data.sharePath)
                                  }
                                });
                              },
                              fail: () => {
                                wx.showToast({
                                  title: "获取授权失败",
                                  duration: 3000
                                });
                              }
                            });
                          }
                        }
          
                      });
                      }
                  });
              } else {
                  //this.showLoading('图片保存中...')
                 // this.saveImageToPhotosAlbum(shareImage)
                 this.saveImageToPhotosAlbum(this.data.sharePath)
              }


              this.generalStatistical({
                statisticalName:'createBusinessCard',
                projectId:this.data.selectdProjectId||this.data.item.projectId,
                operateObjectId:this.data.item.memberId
              })

              this.triggerEvent("hideShareDialog")
          },
          fail() {},
      })
    },
    //removeSystemFile,
    showLoading,
    saveImageToPhotosAlbum,
    generalStatistical,
    getStrLen(detail) {
      let len=0;
      for (let i = 0; i < detail.length; i++) {
        // 中文或者数字占两个长度
        if (detail.charCodeAt(i) > 127 || (detail.charCodeAt(i) >= 48 && detail.charCodeAt(i) <= 57)) {
          len += 2;
        } else {
          len++;
        }
      }
      return len||0
    },
    hide(){
      this.triggerEvent("hideShareDialog")
    },
    prevent(){
      // 不能删，点击遮罩层不能啥
    },
    getPostInfoArr(memberCardInfo='长按识别我的专属码;查看更多楼盘信息'){
      if(memberCardInfo.indexOf(';')>-1){
        return  memberCardInfo.split(';')
      }
      if(memberCardInfo.indexOf('；')>-1){
      return memberCardInfo.split('；')
      }
      return [memberCardInfo]
    },
    async drawPic() {
      console.log(this.data.sharePath)
      if (this.data.sharePath) { //如果已经绘制过了本地保存有图片不需要重新绘制
        this.setData({
          visible: true
        })
        this.triggerEvent('initData') 
        return
      }
      wx.showLoading({
        title: '名片生成中'
      })
      const {name='',job='',mobile,wxId='',location=''} = this.data.item;
      let headImgUrl = this.data.item.headImgUrl
      const {imgServerUrl} = this.data;
      if(headImgUrl.indexOf('http')===-1){
        headImgUrl = `${imgServerUrl}/xcx_images/${this.data.projectName}/theme@2x.png`
      }
       const xcxCodeUrl = await this.data.xcxCodeUrl
      let mobileArr = mobile?[
        {
          "type": "image",
          "url": imgServerUrl+`/xcx_images/${this.data.projectName}/userinfo-tel.png`,
          "css": {
            "width": "30px",
            "height": "30px",
            "top": "184px",
            "left": "290px",
            "rotate": "0",
            "borderRadius": "",
            "borderWidth": "",
            "borderColor": "#000000",
            "shadow": "",
            "mode": "scaleToFill"
          }
        },
        {
          "type": "text",
          "text": mobile,
          "css": {
            "color": "#4a4a4a",
            "background": "rgba(0,0,0,0)",
            "width": "200px",
            "height": "30px",
            "top": "184px",
            "left": "330px",
            "rotate": "0",
            "borderRadius": "",
            "borderWidth": "",
            "borderColor": "#000000",
            "shadow": "",
            "padding": "0px",
            "fontSize": "24px",
            "fontWeight": "normal",
            "maxLines": "1",
            "lineHeight": "50px",
            "textStyle": "fill",
            "textDecoration": "none",
            "fontFamily": "",
            "textAlign": "left"
          }
        }
      ]:[]
      let wxArr = wxId?[
        {
          "type": "image",
          "url": imgServerUrl+`/xcx_images/${this.data.projectName}/userinfo-wx.png`,
          "css": {
            "width": "30px",
            "height": "30px",
            "top": "230px",
            "left": "290px",
            "rotate": "0",
            "borderRadius": "",
            "borderWidth": "",
            "borderColor": "#000000",
            "shadow": "",
            "mode": "scaleToFill"
          }
        },
        {
          "type": "text",
          "text": wxId,
          "css": {
            "color": "#4a4a4a",
            "background": "rgba(0,0,0,0)",
            "width": "280px",
            "height": "30px",
            "top": "230px",
            "left": "330px",
            "rotate": "0",
            "borderRadius": "",
            "borderWidth": "",
            "borderColor": "#000000",
            "shadow": "",
            "padding": "0px",
            "fontSize": "24px",
            "fontWeight": "normal",
            "maxLines": "1",
            "lineHeight": "50px",
            "textStyle": "fill",
            "textDecoration": "none",
            "fontFamily": "",
            "textAlign": "left"
          }
        }
      ]:[]
      let locationArr = location?[
        {
          "type": "image",
          "url": imgServerUrl+`/xcx_images/${this.data.projectName}/userinfo-loc.png`,
          "css": {
            "width": "30px",
            "height": "30px",
            "top": "276px",
            "left": "290px",
            "rotate": "0",
            "borderRadius": "",
            "borderWidth": "",
            "borderColor": "#000000",
            "shadow": "",
            "mode": "scaleToFill"
          }
        },
        {
          "type": "text",
          "text": location,
          "css": {
            "color": "#4a4a4a",
            "background": "rgba(0,0,0,0)",
            "width": "200px",
            "height": "30px",
            "top": "278px",
            "left": "330px",
            "rotate": "0",
            "borderRadius": "",
            "borderWidth": "",
            "borderColor": "#000000",
            "shadow": "",
            "padding": "0px",
            "fontSize": "24px",
            "fontWeight": "normal",
            "maxLines": "1",
            "lineHeight": "50px",
            "textStyle": "fill",
            "textDecoration": "none",
            "fontFamily": "",
            "textAlign": "left"
          }
        }
      ]:[]
      this.setData({
        imgDraw: {
          "width": "720px",
          "height": "860px",
          "background": "",
          "views": [
            {
              "type": "image",
              "url": imgServerUrl+`/xcx_images/${this.data.projectName}/card_bg.png`,
              "css": {
                "width": "720px",
                "height": "860px",
                "top": "0px",
                "left": "0px",
                "rotate": "0",
                "borderRadius": "8px",
                "borderWidth": "",
                "borderColor": "",
                "shadow": "",
                "mode": "scaleToFill"
              }
            },
            {
              "type": "image",
              "url": imgServerUrl+"/xcx_images/card/card_top_bg.png",
              "css": {
                "width": "680px",
                "height": "432px",
                "top": "20px",
                "left": "20px",
                "rotate": "0",
                "borderRadius": "",
                "borderWidth": "",
                "borderColor": "#000000",
                "shadow": "",
                "mode": "scaleToFill"
              }
            },
            {
              "type": "image",
              "url": imgServerUrl+"/xcx_images/card/card_bottom_bg.png",
              "css": {
                "width": "680px",
                "height": "268px",
                "top": "560px",
                "left": "20px",
                "rotate": "0",
                "borderRadius": "",
                "borderWidth": "",
                "borderColor": "#000000",
                "shadow": "",
                "mode": "scaleToFill"
              }
            },
            {
              "type": "image",
              "url": imgServerUrl+`/xcx_images/${this.data.projectName}/userinfo-bg.png`,
              "css": {
                "width": "200px",
                "height": "200px",
                "top": "110px",
                "left": "66px",
                "rotate": "0",
                "borderRadius": "",
                "borderWidth": "",
                "borderColor": "",
                "shadow": "",
                "mode": "scaleToFill"
              }
            },
            {
              "type": "image",
              "url": headImgUrl,
              "css": {
                "width": "160px",
                "height": "160px",
                "top": "130px",
                "left": "86px",
                "rotate": "0",
                "borderRadius": "",
                "borderWidth": "",
                "borderColor": "#000000",
                "shadow": "",
                "mode": "scaleToFill"
              }
            },
            {
              "type": "image",
              "url": imgServerUrl+`/xcx_images/${this.data.projectName}/userinfo-icon.png`,
              "css": {
                "width": "52px",
                "height": "52px",
                "top": "112px",
                "left": "67px",
                "rotate": "0",
                "borderRadius": "",
                "borderWidth": "",
                "borderColor": "",
                "shadow": "",
                "mode": "scaleToFill"
              }
            },
            {
              "type": "image",
              "url": imgServerUrl+`/xcx_images/${this.data.projectName}/userinfo_x.png`,
              "css": {
                "width": "200px",
                "height": "180px",
                "top": "50px",
                "left": "460px",
                "rotate": "0",
                "borderRadius": "",
                "borderWidth": "",
                "borderColor": "",
                "shadow": "",
                "mode": "scaleToFill"
              }
            },
            {
              "type": "text",
              "text": name,
              "css": {
                "color": "#4A4A4A",
                "background": "rgba(0,0,0,0)",
                "width": "200px",
                "height": "50px",
                "top": "114px",
                "left": "290px",
                "rotate": "0",
                "borderRadius": "",
                "borderWidth": "",
                "borderColor": "#000000",
                "shadow": "",
                "padding": "0px",
                "fontSize": "36px",
                "fontWeight": "normal",
                "maxLines": "1",
                "lineHeight": "50px",
                "textStyle": "fill",
                "textDecoration": "none",
                "fontFamily": "",
                "textAlign": "left"
              }
            },
            {
              "type": "text",
              "text": job,
              "css": {
                "color": "#9b9b9b",
                "background": "rgba(0,0,0,0)",
                "width": "200px",
                "height": "50px",
                "top": "124px",
                "left": (this.getStrLen(name)-4)*15+388+"px",
                "rotate": "0",
                "borderRadius": "",
                "borderWidth": "",
                "borderColor": "#000000",
                "shadow": "",
                "padding": "0px",
                "fontSize": "24px",
                "fontWeight": "normal",
                "maxLines": "1",
                "lineHeight": "50px",
                "textStyle": "fill",
                "textDecoration": "none",
                "fontFamily": "",
                "textAlign": "left"
              }
            },
            ...mobileArr,
            ...wxArr,
            ...locationArr,
            {
              "type": "image",
              "url": imgServerUrl+"/xcx_images/yh.png",
              "css": {
                "width": "20px",
                "height": "26px",
                "top": "350px",
                "left": "66px",
                "rotate": "0",
                "borderRadius": "",
                "borderWidth": "",
                "borderColor": "#000000",
                "shadow": "",
                "mode": "scaleToFill"
              }
            },
            {
              "type": "text",
              "text": "独家优惠",
              "css": {
                "color": "#9b9b9b",
                "background": "rgba(0,0,0,0)",
                "width": "200px",
                "height": "30px",
                "top": "350px",
                "left": "100px",
                "rotate": "0",
                "borderRadius": "",
                "borderWidth": "",
                "borderColor": "#000000",
                "shadow": "",
                "padding": "0px",
                "fontSize": "20px",
                "fontWeight": "normal",
                "maxLines": "1",
                "lineHeight": "50px",
                "textStyle": "fill",
                "textDecoration": "none",
                "fontFamily": "",
                "textAlign": "left"
              }
            },
            {
              "type": "image",
              "url": imgServerUrl+"/xcx_images/qw.png",
              "css": {
                "width": "20px",
                "height": "24px",
                "top": "350px",
                "left": "220px",
                "rotate": "0",
                "borderRadius": "",
                "borderWidth": "",
                "borderColor": "#000000",
                "shadow": "",
                "mode": "scaleToFill"
              }
            },
            {
              "type": "text",
              "text": "权威信息",
              "css": {
                "color": "#9b9b9b",
                "background": "rgba(0,0,0,0)",
                "width": "200px",
                "height": "30px",
                "top": "350px",
                "left": "252px",
                "rotate": "0",
                "borderRadius": "",
                "borderWidth": "",
                "borderColor": "#000000",
                "shadow": "",
                "padding": "0px",
                "fontSize": "20px",
                "fontWeight": "normal",
                "maxLines": "1",
                "lineHeight": "50px",
                "textStyle": "fill",
                "textDecoration": "none",
                "fontFamily": "",
                "textAlign": "left"
              }
            },
            {
              "type": "image",
              "url": imgServerUrl+"/xcx_images/kf.png",
              "css": {
                "width": "24px",
                "height": "22px",
                "top": "352px",
                "left": "376px",
                "rotate": "0",
                "borderRadius": "",
                "borderWidth": "",
                "borderColor": "#000000",
                "shadow": "",
                "mode": "scaleToFill"
              }
            },
            {
              "type": "text",
              "text": "在线看房",
              "css": {
                "color": "#9b9b9b",
                "background": "rgba(0,0,0,0)",
                "width": "200px",
                "height": "30px",
                "top": "350px",
                "left": "412px",
                "rotate": "0",
                "borderRadius": "",
                "borderWidth": "",
                "borderColor": "#000000",
                "shadow": "",
                "padding": "0px",
                "fontSize": "20px",
                "fontWeight": "normal",
                "maxLines": "1",
                "lineHeight": "50px",
                "textStyle": "fill",
                "textDecoration": "none",
                "fontFamily": "",
                "textAlign": "left"
              }
            },
            {
              "type": "image",
              "url": imgServerUrl+"/xcx_images/zx.png",
              "css": {
                "width": "20px",
                "height": "22px",
                "top": "350px",
                "left": "530px",
                "rotate": "0",
                "borderRadius": "",
                "borderWidth": "",
                "borderColor": "#000000",
                "shadow": "",
                "mode": "scaleToFill"
              }
            },
            {
              "type": "text",
              "text": "免费咨询",
              "css": {
                "color": "#9b9b9b",
                "background": "rgba(0,0,0,0)",
                "width": "200px",
                "height": "30px",
                "top": "350px",
                "left": "562px",
                "rotate": "0",
                "borderRadius": "",
                "borderWidth": "",
                "borderColor": "#000000",
                "shadow": "",
                "padding": "0px",
                "fontSize": "20px",
                "fontWeight": "normal",
                "maxLines": "1",
                "lineHeight": "50px",
                "textStyle": "fill",
                "textDecoration": "none",
                "fontFamily": "",
                "textAlign": "left"
              }
            },
            {
              "type": "image",
              "url": imgServerUrl+"/xcx_images/card/card_circle.png",
              "css": {
                "width": "240px",
                "height": "240px",
                "top": "456px",
                "left": "240px",
                "rotate": "0",
                "borderRadius": "50%",
                "borderWidth": "",
                "borderColor": "#000000",
                "shadow": "",
                "mode": "scaleToFill"
              }
            },
            {
              "type": "image",
              "url": xcxCodeUrl,
              "css": {
                "width": "205px",
                "height": "205px",
                "top": "473px",
                "left": "257px",
                "rotate": "0",
                "borderRadius": "50%",
                "borderWidth": "",
                "borderColor": "#000000",
                "shadow": "",
                "mode": "scaleToFill"
              }
            },
            ...this.data.memberCardInfo.map((i,idx)=>{
              return             {
                "type": "text",
                "text":i,
                "css": {
                  "color": "#fff",
                  "background": "rgba(0,0,0,0)",
                  "width": "720px",
                  "height": "30px",
                  "top": 720+idx*40+"px",
                  "left": "0",
                  "rotate": "0",
                  "borderRadius": "",
                  "borderWidth": "",
                  "borderColor": "#000000",
                  "shadow": "",
                  "padding": "0px",
                  "fontSize": "28px",
                  "fontWeight": "normal",
                  "maxLines": "1",
                  "lineHeight": "50px",
                  "textStyle": "fill",
                  "textDecoration": "none",
                  "fontFamily": "",
                  "textAlign": "center"
                }
              }
            }),
          ]
        }
      })
    },
    onImgOK(e) {
      wx.hideLoading()
      this.setData({
        sharePath: e.detail.path,
        visible: true,
      })
      //通知外部绘制完成，重置isCanDraw为false
    // this.triggerEvent('initData') 
    }
  },
  created:function(){

  },
  attached:async function(){
    // 拿到二维码图片的base64 start
    console.log(this.data.item)
    const appData = await this.getAppData()
    // const customerId = wx.getStorageSync("customerId")
    // const userinfoLogin = wx.getStorageSync("userinfoLogin")
    // const {userType} = userinfoLogin
    // const {memberId} = userinfoLogin
    let {memberId,userType,onlineCustomerId=0} = this.data.item
    let projectId = this.data.selectdProjectId || this.data.item.projectId || ''
    if(!onlineCustomerId){
      onlineCustomerId=0;
      if(this.data.type=='my'){
        onlineCustomerId = wx.getStorageSync('customerId')||0;
      }
    }
    console.log(projectId)
   // if(onlineCustomerId){
      const res = await this.getQrCode(3,onlineCustomerId,`pages/house/memberDetail/index?hid=${projectId}&shareCId=${onlineCustomerId}&shareCType=${userType||0}&propertyid=${memberId}`,appData,projectId)
      if(res.code==200){
        this.setData({
          xcxCodeUrl:res.data,
          memberCardInfo:this.getPostInfoArr(appData.memberCardInfo)
        })
      }
      

   // }

    // 拿到二维码图片的base64  end
    //获取 系统信息
    const systemInfo =await wx.getSystemInfo()
    this.setData({
      systemInfo
    })

    this.drawPic()
  },
  ready: function(){
    console.log(this)
  },
  moved: function(){

  },
  detached: function(){

  },
});