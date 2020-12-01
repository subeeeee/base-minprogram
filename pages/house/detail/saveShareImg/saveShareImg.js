import Api from '../../../../utils/api.js'
import {getAppData,getQrCode,generalStatistical} from "../../../../utils/util"
import {downloadFilePromise,removeSystemFile,showLoading,saveImageToPhotosAlbum,base64ToURL} from "../../../../utils/saveImage"
const app =  getApp();

Page({
  data: {
    // {name: 'cell standard', id: '0', checked: true,imageUrl:'https://yxf-bucket-01.oss-cn-beijing.aliyuncs.com/images/1595382222239.jpg'},
    // {name: 'cell standard', id: '1',imageUrl:'https://yxf-bucket-01.oss-cn-beijing.aliyuncs.com/images/1569727030161.jpg'}
    radioItems: "", //默认为‘’，当为数组时显示元素
    selectedImg:"",
    xcxCodeUrl:'',
    systemInfo:{},
    houseid:'',
    projectName:app.globalData.projectName,
    imgServerUrl:app.globalData.imgServerUrl,
    h5DoMain: app.globalData.h5DoMain,
    miniprogramName:app.globalData.miniprogramName,
    miniprogramTitle:app.globalData.miniprogramTitle
  },
  radioChange: function (e) {
    let {url} = e.currentTarget.dataset;

    var radioItems = this.data.radioItems;
    for (var i = 0, len = radioItems.length; i < len; ++i) {
      if(radioItems[i]){
        radioItems[i].checked = radioItems[i].imageUrl == url;
      }
        
    }

    this.setData({
        radioItems: radioItems,
        selectedImg:url
    });
  },
  getQrCode,
  getAppData,
  async getList(params){
    const res =await Api.fetch({
        method: 'post',
        url: '/applet/poster/pageList',
        ContentType: true,
        data: {
          "pageNum":1,
          "pageSize":1000,
          "param":
          {
            "projectId":params.houseid
          }
        }
    })
    if (res.code) {
      const imgList = res.data.list.map(i=>{
        i.imageUrl='https://yxf-bucket-01.oss-cn-beijing.aliyuncs.com/'+i.imageUrl
        return i
      })
      let [firstObj] = imgList
      if(firstObj){
        firstObj.checked = true;
      }
      this.setData({
        radioItems: imgList,
        selectedImg:firstObj?firstObj.imageUrl:''
      })
    } else {
       console.error(res)
    }
  },
   onLoad: async function(options){
    const systemInfo =await wx.getSystemInfo()
    this.setData({
      systemInfo
    })
    this.getList(options)
    // 获取base64图片码
    const appData = await this.getAppData()
    const customerId = wx.getStorageSync("customerId")
    const userinfoLogin = wx.getStorageSync("userinfoLogin")
    let {userType} = userinfoLogin
    const res = await this.getQrCode(2,customerId,`pages/house/detail/index?hid=${options.houseid}&shareCId=${customerId}&shareCType=${userType||0}`,appData,options.houseid)
    if(res.code==200){
      this.setData({
        xcxCodeUrl:res.data,
        houseid:options.houseid,
        posterInfo:this.getPostInfoArr(appData.posterInfo)
      })
    }
  },
  getPostInfoArr(posterInfo=`长按识别${this.data.miniprogramTitle};${this.data.miniprogramName}官方服务平台`){
      if(posterInfo.indexOf(';')>-1){
        return  posterInfo.split(';')
      }
      if(posterInfo.indexOf('；')>-1){
       return posterInfo.split('；')
      }
      return [posterInfo]
  },
  downloadFilePromise,
   /** 项目分享图 */
  createProjectShareImage() {
    return new Promise(async (reslove,reject)=>{
      const { systemInfo } = this.data;

      let shareImg = await this.downloadFilePromise(this.data.selectedImg)
      let xcxCodeUrl = await this.downloadFilePromise(this.data.xcxCodeUrl)

      const ctx = wx.createCanvasContext('shareCanvas');
      ctx.setFillStyle('#fff')
      const canvasWidth = 1125;   // 680
      const canvasHeight = 2436 ///840  1520 
      const postersImgWidth = 1125
      const postersImgHeight = 1926

      ctx.fillRect(0, 0, canvasWidth*2, canvasHeight*2);
      
      const scale = 2 * systemInfo.windowWidth / 750;


      ctx.save();

      ctx.drawImage(shareImg, 0 * scale, 0 * scale, postersImgWidth * scale, postersImgHeight * scale);
      ctx.restore();

      ctx.drawImage(xcxCodeUrl, 105 * scale, (postersImgHeight+105) * scale, 300 * scale, 300 * scale);
       

      ctx.setFillStyle('#4a4a4a');
      ctx.setFontSize(60 * scale);
      // ctx.fillText(shareTextTop, 190 * scale, 750 * scale);
      // ctx.fillText(shareTextBottom, 190 * scale, 800 * scale);
      this.data.posterInfo.forEach((item,idx)=>{
        if(idx==this.data.posterInfo.length-1){
          ctx.setFontSize(48 * scale);
        }
        ctx.fillText(item, 458 * scale, ( (postersImgHeight+230)+idx*85) * scale);  //680 750
      })


       
       
      ctx.draw(false, () => {
          wx.canvasToTempFilePath({
              canvasId: 'shareCanvas',
              width: canvasWidth * scale,
              height: canvasHeight * scale,
              destWidth: canvasWidth * scale,
              destHeight: canvasHeight * scale,
              success: (result) => {
                  wx.hideLoading();
                 reslove({
                  shareImage: result.tempFilePath
                 })
               // this.removeSystemFile(xcxCodeUrl) 
              },
              fail(err){
                 console.error(err)
                 reject(err)
              }
          })
      });
    })
    },
  async downloadImage() {
    this.showLoading('海报制作中')
    const { shareImage } = await this.createProjectShareImage();
    wx.hideLoading();
    wx.getSetting({
        success: (res) => {
            if (!res.authSetting['scope.writePhotosAlbum']) {
                wx.authorize({
                    scope: 'scope.writePhotosAlbum',
                    success: () => {
                        this.showLoading('图片保存中...')
                        this.saveImageToPhotosAlbum(shareImage)
                    },
                    fail: () => {

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
                                    this.saveImageToPhotosAlbum(shareImage)
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
               this.showLoading('图片保存中...')
               this.saveImageToPhotosAlbum(shareImage)
            }

            this.generalStatistical({
              statisticalName:'posterProject',
              projectId:this.data.houseid,
            })
        },
        fail() {},
    })
  },
  removeSystemFile,
  showLoading,
  saveImageToPhotosAlbum,
  base64ToURL,
  onReady: function(){
    
  },
  onShow: function(){
    
  },
  onHide: function(){

  },
  onUnload: function(){

  },
  onPullDownRefresh: function(){

  },
  onReachBottom: function(){

  },
  onShareAppMessage: function(){

  },
  onPageScroll: function(){

  },
  //item(index,pagePath,text)
  onTabItemTap:function(item){

  },
  generalStatistical
});