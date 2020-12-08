import Api from '../../../utils/api.js';
import safeArea from '../../../utils/safe-area.js';
import { getUserInfo,getUserPhone } from "../../../utils/util.js";
import {showPhoneNumberMask,closePhoneBox,channelRegister,closeChannelLoginPopup,queryUserFromChannel,getNickName,getPhoneNo} from "../../../utils/login"
 const app =  getApp();
Page({
    onReady: function (res) {
        this.videoContext = wx.createVideoContext('myVideo')
    },
    data: {
        zixun: [],
        huodong: [],
        houseList: [],
        recommend: [],
        cityList2: [],
        chaping: [],
        cityShows: 1,
        cityList: [],
        cityNames: '', //城市信息
        dwType: false,
        chapingis: '',
        tenantId: '',
        autoplay: true,
        currentSwiper:0,
        mddotSwiper:0,
        isPhoneAuth:0,
        customerId:'',
        nickName:'',
        channelLoginPopupShow:false,
        h5DoMain: app.globalData.h5DoMain,
        mobile:'',
        pageSize:12,
        showMore:false,
        imgServerUrl:app.globalData.imgServerUrl,
        globalProjectName:app.globalData.projectName,
        cdnUrl:app.globalData.cdnUrl,
        darkColor:app.globalData.darkColor,
        lightColor:app.globalData.lightColor

    },
    getUserPhoneNum(){
        const userinfoLogin = wx.getStorageSync("userinfoLogin") || {};
        return userinfoLogin.phoneNo || wx.getStorageSync("userPhone") ||''
    },
    swiperChange: function (e) {
        // currentSwiper  滑动指示器
        this.setData({
          currentSwiper: e.detail.current
        })
    },
    mddotChange: function (e) {
        // currentSwiper  滑动指示器
        this.setData({
          mddotSwiper: e.detail.current
        })
      },
    onLoad(option) {
        wx.showShareMenu({
            withShareTicket: true
        })
        // wx.onShareAppMessage({
        //     title: '测试分享',
        //     path: '/pages/home/index/index',
        //     imageUrl: '/images/commission.png'
        // })
        // 针对 iphonex优化
        let that = this
        getApp().watch('unReadMessageNum' ,function () {
            that.setData({
                count: getApp().globalData.unReadMessageNum
            })
        })
        safeArea.getSafeArea()
        this.setData({
            tenantId: getApp().globalData.tenantId,
            count: getApp().globalData.unReadMessageNum,
            ...safeArea.data
        });
        
        this.setData({
            chapingis: wx.getStorageSync('chaping') || 0,
            dwType: wx.getStorageSync('dwType')
        });

        this.getSlide(1)
        this.getSlide(2)
        this.getSlide(4)
        this.getCity(2)
        //this.getCurrentLocal()

        // 设置城市
        let cityList = wx.getStorageSync('cityList') || []
        if (cityList.length == 0) {
            wx.setStorageSync('codeC', '-1')
            wx.setStorageSync('codeC_dw', '-1')
            wx.setStorageSync('cityName', '全国')
            wx.setStorageSync('cityName_dw', '全国')
            var cityLists = [{ name: '全国', codeC: '-1' }]
            wx.setStorageSync('cityList', cityLists)
            this.setData({
                cityNames: '全国',
            })
        } else {
            wx.setStorageSync('codeC', cityList[0].codeC)
            wx.setStorageSync('cityName', cityList[0].name)
            this.setData({
                cityNames: cityList[0].name
            })
        }
        if(!wx.getStorageSync("userinfo")){
            wx.setStorageSync('isIndexGo',1)
            this.getUserInfo()
        }
    },
    chapShowNo() {
        this.setData({
            chapingis: 1
        })
        wx.setStorageSync('chaping', 1)
    },
    //插屏
    goChaping(e) {
        this.setData({
            chapingis: 1
        })
        wx.setStorageSync('chaping', 1)
        const { url } = e.currentTarget.dataset
        var webUrllist = url.split('?')
        if (webUrllist.length > 1) {
            wx.navigateTo({
                url: '/pages/h5/index/index?webUrl=' + webUrllist[0] + '&' + webUrllist[1]
            })
        } else {
            wx.navigateTo({
                url: '/pages/h5/index/index?webUrl=' + url
            })
        }
    },
    getNickName,
    onShow: function() {
        
        this.getNickName()
        // wx.navigateTo({
        //         url: '/pages/home/Unlimited/index'
        //     })
        let that = this
        getApp().watch('unReadMessageNum' ,function () {
            that.setData({
                count: getApp().globalData.unReadMessageNum
            })
        })
        this.setData({
            chaping: wx.getStorageSync('chaping') || 0,
            cityNames: wx.getStorageSync('cityName'),
            phoneNo:this.getUserPhoneNum()
        })
        this.getHouseList()
        this.getPromoteList()
       // this.showPhoneNumberMask()
       this.getUserInfoCanClick=true
    },
    startRolling() {
        this.setData({
            autoplay: true
        })
    },
    endRolling() {
        this.setData({
            autoplay: false
        })
    },
    // 城市
    getCity() {
        Api.getCityList({})
            .then(({code, data}) => {
            if (code == 200) {
                this.setData({
                    cityList2: data.splice(0, 3)
                })
            }
        })
    },
    // 楼盘
    getHouseList() {
        let city = wx.getStorageSync('codeC')
        Api.fetch({
            method: 'post',
            url: '/applet/project/pageList',
            ContentType: true,
            data: {
                cityCode: city == -1 ? '' : city,
                pageSize:this.data.pageSize
            }
        }).then((res) => {
            if (res.code === 200) {
                res.data.records.forEach(function (item, i) {
                    if (item.city) {
                        item.city = item.city.split('-')[item.city.split('-').length - 1]
                    }
                    if (item.imageUrls) {
                        item.imageUrls = item.imageUrls.split(',')
                    }
                    if (item.sellPoint) {
                        if (item.sellPoint.indexOf('，') !== -1) {
                            item.sellPoint = item.sellPoint.split('，')
                        } else {
                            item.sellPoint = item.sellPoint.split(' ')
                        }
                    }
                })

                this.setData({
                    houseList: res.data.records,
                    showMore:res.data.totalNum>this.data.pageSize
                })
            } else {
                wx.showToast({
                    icon:'none',
                    title: res.message,
                    duration:3000
                })
            }
        })
    },
    // 推荐项目
    getPromoteList() {
        let city = wx.getStorageSync('codeC')
        Api.fetch({
            method: 'post',
            url: '/applet/project/promoteList',
            ContentType: true,
            data: {
                cityCode: city == -1 ? '' : city
            }
        }).then((res) => {
            if (res.code === 200) {
                res.data.forEach(function (item, i) {
                    if (item.imageUrls) {
                        item.imageUrls = item.imageUrls.split(',')
                    }
                    if (item.sellPoint) {
                        if (item.sellPoint.indexOf('，') !== -1) {
                            item.sellPoint = item.sellPoint.split('，')
                        } else {
                            item.sellPoint = item.sellPoint.split(' ')
                        }
                    }
                })

                this.setData({
                    recommend: res.data
                })
            } else {
                wx.showToast({
                    icon:'none',
                    title: res.message,
                    duration:3000
                })
            }
        })
    },
    // 活动-资讯
    getSlide(type) {
        let obj = {}
        if(type==1) {
            obj = {
                type: 1
            }
        }else if(type==4){
            obj = {
                type: 4
            }
        }else if(type==2){
            obj = {
                type: 2
            }
        }
        Api.fetch({
            method: 'post',
            url: '/applet/index/getSlide',
            ContentType: true,
            data: obj
        }).then((res) => {
            if (res.code === 200) {
                if (type === 1) {
                    this.setData({
                        zixun: res.data
                    })
                } else if(type===4) {
                    this.setData({
                        huodong: res.data
                    })
                }else{
                     this.setData({
                        chaping: res.data
                    })
                }
            } else {
                wx.showToast({
                    icon:'none',
                    title: res.message,
                    duration:3000
                })
            }
        })
    },
    // 前往楼盘详情
    goHouse(e) {
        var houseid = e.currentTarget.dataset.houseid
        wx.navigateTo({
            url: '/pages/house/detail/index?houseid=' + houseid
        })
    },
    inputChange(e) {
        wx.setStorageSync('houseName', e.detail.value)
        wx.navigateTo({
            url: '/pages/house/index/index'
        })
    },
    // 前往楼盘列表
    goHouseList(e) {
        if (e.currentTarget.dataset.name) {
            wx.setStorageSync('cityName', e.currentTarget.dataset.name)
            wx.setStorageSync('codeC', e.currentTarget.dataset.code)
        } else {
            wx.setStorageSync('cityName', '全国')
            wx.setStorageSync('codeC', '-1')
        }
        wx.navigateTo({
            url: '/pages/house/index/index'
        })
    },
    // 工具栏事件
    goNexts(e) {
        let {type, url, title, appid} = e.currentTarget.dataset
        // 1 = h5
        if (type == 1) {
            let webUrllist = url.split('?')
            if (webUrllist.length > 1) {
                wx.navigateTo({
                    url: '/pages/h5/index/index?webUrl=' + webUrllist[0] + '&' + webUrllist[1] + '&title=' + title + '&color=blue' + '&customerId=' + wx.getStorageSync('customerId') + '&appId=' + appid + '&tenantId=' + this.data.tenantId+ '&primaryColor='+this.data.darkColor.slice(1) + '&secondaryColor='+this.data.lightColor.slice(1) 
                })
            } else {
                wx.navigateTo({
                    url: '/pages/h5/index/index?webUrl=' + url + '&title=' + title + '&color=blue' + '&customerId=' + wx.getStorageSync('customerId') + '&appId=' + appid + '&tenantId=' + this.data.tenantId+ '&primaryColor='+this.data.darkColor.slice(1) + '&secondaryColor='+this.data.lightColor.slice(1) 
                })
            }
        }else if (type == 2) {
            let webUrllist = url.split('?')
            if (webUrllist.length > 1) {
                var topicId = webUrllist[1].split('=')[1]
                wx.navigateTo({
                    url: '/pages/activity/index?topicId=' + topicId
                })
            }
        } else {
            wx.navigateTo({
                url: url
            })
        }
    },
    // 前往城市选择页面
    goCity() {
        wx.navigateTo({
            url: '/pages/home/city/city'
        })
    },
    getUserInfoCanClick:true,
    getUserInfo(res){
        console.log(this.getUserInfoCanClick)
       if(this.getUserInfoCanClick){
           this.getUserInfoCanClick=false
            getUserInfo(res,res?this.showPhoneNumberMask:null)
            if(res&&res.detail&&res.detail.errMsg&&res.detail.errMsg.indexOf('fail')>-1){
                this.getUserInfoCanClick=true
              }
        }
    },
    showPhoneNumberMask,
    queryUserFromChannel,
    closePhoneBox,
    channelRegister,
    closeChannelLoginPopup,
    // 前往全民营销页面
    gotoNext(url) {
        // this.setData({
        //     isPhoneAuth:0
        // })
        wx.navigateTo({
            url
        })
    },
    goToMarketing(){
        wx.navigateTo({
            url: '/pages/home/city/city'
        })
    },
    async getPhoneNumber(e){
         getUserPhone(e,()=>{
             let mobile = this.getUserPhoneNum()
            this.setData({
                phoneNo:mobile,
                mobile:mobile.replace(/(\d{3})(\d{4})(\d{4})/,'$1****$3')
            },()=>this.showPhoneNumberMask()) //showPhoneNumberMask  里面传type  mycustomer注册成功后去  我的客户页面   marketing注册成功后去  全民营销的报备页面  默认值为 marketing
         })
     },
    goMapFun() {
        wx.navigateTo({
           url: '/pages/house/map/index'
       })
    },
     // 获取当前地理位置 授权验证
      // getCurrentLocal() {
      //   let that = this;
      //   wx.login({
      //     success (res) {
      //       if (res.code) {
      //         console.log('res.code:',res)
      //       } else {
      //         console.log('登录失败！' + res.errMsg)
      //       }
      //     }
      //   })
      //   wx.getSetting({
      //     success(res) {
      //       if (res.authSetting['scope.userLocation'] == false) { // 如果已拒绝授权，则打开设置页面
      //            console.log('back')
      //       } else { // 第一次授权，或者已授权，直接调用相关api
      //         wx.getLocation({
      //           type: 'wgs84',
      //           success(res) {
      //               var param = {
      //                   location: res.latitude + ',' + res.longitude,
      //                   key: 'FCOBZ-54I6X-GH242-TKF6S-MKBHS-QYBDE',
      //                   get_poi: 1
      //                 };
      //                 wx.request({
      //                     url: 'https://apis.map.qq.com/ws/geocoder/v1/?location=', 
      //                     data: param,
      //                     success (res) {
      //                       that.setData({
      //                           mayCity: res.data.result.address_component.city
      //                       })
      //                       console.log(res.data.result.address_component.city)
      //                     }
      //                 });
      //           }
      //         })
      //       }
      //     }
      //   })
      //}
});
