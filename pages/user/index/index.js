import Api from "../../../utils/api.js";
import safeArea from "../../../utils/safe-area.js";
import { getUserInfo, getUserPhone,getAppData } from "../../../utils/util.js";
import {showPhoneNumberMask,closePhoneBox,channelRegister,closeChannelLoginPopup,queryUserFromChannel} from "../../../utils/login";
import { getWebFun } from "../../../utils/goUtils";
const app=getApp()
Page({
    data: {
        headImg: '/images/defaultImg.png',
        nickName: '',
        phoneNum:'',
        token: "",
        price: "",
        priceall: "",
        avatar: "",
        nickname: "",
        coupon: "",
        onOff: true,
        login_phone: "",
        isLogin: false, //是否显示退出登录（是否登录）
        userinfo: "",
        tenantId: '',
        isPhoneAuth:0,
        userType:0,
        priTmplIds:[],
        h5DoMain: app.globalData.h5DoMain,
        imgServerUrl: app.globalData.imgServerUrl,
        projectName:app.globalData.projectName,
       // userPhone: this.getUserPhoneNum(),
       couponConfirmPermissions:false
    },
    unReadMessageNum(){
        let that = this
        getApp().watch('unReadMessageNum', function () {
            that.setData({
                count: getApp().globalData.unReadMessageNum
            })
        })
    },
    onLoad() {
        this.unReadMessageNum()
        // 针对 iphonex优化
        safeArea.getSafeArea();
        this.setData({
            tenantId:  getApp().globalData.tenantId,
            count: getApp().globalData.unReadMessageNum,
            ...safeArea.data
        });

        this.getTemplateList()
        const userinfoLogin = wx.getStorageSync("userinfoLogin") || "";
        if(!userinfoLogin||!userinfoLogin.nickName){
            wx.setStorageSync('isIndexGo',1)
            getUserInfo(undefined,()=>{})
        }
        
    },
    getUserPhoneNum(){
        const userinfoLogin = wx.getStorageSync("userinfoLogin") || {};
        return userinfoLogin.phoneNo || wx.getStorageSync("userPhone") ||''
    },
    onShow() {
        this.unReadMessageNum()
        const userinfoLogin = wx.getStorageSync("userinfoLogin") || {};
       // if (userinfoLogin) {
            if(userinfoLogin.phoneNo || wx.getStorageSync("userPhone")){
                let tel
                this.setData({
                    isPhoneAuth:0
                })
                if(wx.getStorageSync("userPhone")){
                    tel=wx.getStorageSync("userPhone")
                    if(wx.getStorageSync('userType')){
                        userinfoLogin.userType=wx.getStorageSync('userType')
                    }
                }else{
                    wx.setStorageSync("userPhone",userinfoLogin.phoneNo);
                }
                if(userinfoLogin.phoneNo){
                    tel=wx.getStorageSync("userPhone")
                }
                tel = "" + tel;
                var reg=/(\d{3})\d{4}(\d{4})/;
                var tel1 = tel.replace(reg, "$1****$2");
            }else{
                tel1=''
            }
            this.setData({
                headImg: userinfoLogin.headImgUrl || '/images/defaultImg.png',
                nickName: userinfoLogin.nickName,
                userType: userinfoLogin.userType||wx.getStorageSync("userType"),
                phoneNum: tel1,
                //userType:wx.getStorageSync("userType")||userinfoLogin.userType
            })
            // if(!tel1){
            //     this.setData({
            //         isPhoneAuth:1
            //     })
            // }
      //  }
       this.setData({
            userPhone: this.getUserPhoneNum(),
            customerId: wx.getStorageSync('customerId'),
            agentId: wx.getStorageSync('agentId'),
           // couponConfirmPermissions:wx.getStorageSync("couponConfirmPermissions")
        }) 
        this.getCuponConfirmPermissions()
        this.getUserInfoCanClick=true
    },
    // login() {
    //     if (!this.data.nickName) {
    //         wx.navigateTo({
    //             url: '/pages/login/auth/index'
    //         });
    //     }
    // },
      getPhoneNumber (e) {
        console.log(e.detail.errMsg)
        console.log(e.detail.iv)
        console.log(e.detail.encryptedData)
        this.login()
      },
    logout() {
        wx.setStorageSync('userinfo', '')
        wx.setStorageSync('userinfoLogin', '')
        wx.setStorageSync('customerId', '')
        wx.setStorageSync('hxaccount', '')
        wx.setStorageSync('hxpassword', '')
        wx.setStorageSync('userHeadImg', '')
        wx.setStorageSync('userName', '')
        wx.setStorageSync('userPhone', '')
        wx.setStorageSync("state",'')
        wx.setStorageSync("userType",'')
        wx.redirectTo({
            url: '/pages/user/index/index'
        });
    },
    telephone(e) {
        wx.makePhoneCall({
            phoneNumber: e.currentTarget.dataset.phone
        })
    },
    showPhoneBox(){
        const userinfoLogin = wx.getStorageSync("userinfoLogin") || {};
        let {phoneNo,nickName} = userinfoLogin
        if(!phoneNo){
          phoneNo = wx.getStorageSync("userPhone")
        }
        if(phoneNo){
            var reg=/(\d{3})\d{4}(\d{4})/;
            this.setData({
                nickName,
                userPhone:phoneNo,
                phoneNum:phoneNo.replace(reg, "$1****$2"),
                headImg: userinfoLogin.headImgUrl,
                userType:wx.getStorageSync("userType")||userinfoLogin.userType
            })
           return
        }
        // 手机号的授权
        this.setData({
            isPhoneAuth:2
        })
    },
    closePhoneBox(){
        this.setData({
            isPhoneAuth:0
        })
    },
    async menuClickHanleFun(e) {
        const { type } = e.currentTarget.dataset;
        const userinfoLogin = wx.getStorageSync("userinfoLogin") || {};
        let {phoneNo} = userinfoLogin
        if(!phoneNo){
          phoneNo = wx.getStorageSync("userPhone")
        }

        if (!phoneNo && type !== 'aboutUs') {
            // wx.navigateTo({
            //     url: '/pages/login/auth/index'
            // });
            wx.showToast({
                title: "请登录后查看",
                icon:'none'
            });
            return false
        }
        let type2url={
            appointment:"/pages/user/appointment/index",
            buy:"/pages/user/buy/index",
            coupon:"/pages/user/coupon/index",
            activity:"/pages/user/activity/index",
            collection:"/pages/user/collection/index",
            card:"/pages/user/card/index",
            promote:"/pages/user/promote/list/index",
           // recommended:"/pages/h5/index/index",
            recommended:"/pages/user/customer/list/index",
            consultant:'/pages/user/consultant/list/index'
        };
        const url = type2url[type]
        if (url) {
            if(type==='recommended'){
                this.showPhoneNumberMask('mycustomer')
                return
            }
            wx.navigateTo({
                url:url
            });
        }
    },
    couponVerify(e){
        let that = this
        // 只允许从相机扫码
        wx.scanCode({
          onlyFromCamera: true,
          success (res) {
            if(res.errMsg=='scanCode:ok'){
                let array=res.result.split('?')
                let ids=array[1].split('&')
                wx.navigateTo({
                    url: '/pages/user/coupon/check?manage=1&couponCode='+ids[0]+'&onlineCustomerId='+ids[1]+'&projectId='+ids[2]+'&tenantId='+ids[3]+'&actWinningLogId='+ids[4]
                });
            }
          }
        })
    },
    setUserData(){
        const userinfoLogin = wx.getStorageSync("userinfoLogin") || {};
        let {phoneNo,nickName} = userinfoLogin
        if(!phoneNo){
          phoneNo = wx.getStorageSync("userPhone")
        }
            var reg=/(\d{3})\d{4}(\d{4})/;
            this.setData({
                nickName,
                userPhone:phoneNo,
                phoneNum:phoneNo&&phoneNo.replace(reg, "$1****$2"),
                headImg: userinfoLogin.headImgUrl,
                userType:userinfoLogin.userType||wx.getStorageSync("userType"),
                
            })
            this.getCuponConfirmPermissions()
    },
    getUserInfoLog:function(res){
        getUserInfo(res,()=>{
            this.setUserData()
            this.showPhoneBox()
        })
    },
    getWebFun,
    requestSubscribeMessage(e){
        const that=this
        wx.requestSubscribeMessage({
            tmplIds:this.data.priTmplIds,
            success (res) { 
                console.log(res)
        
            },
            fail(err){
                console.log(err)
            
                
            },
            complete(){
              //  that.subscriptionsSetting()
                that.menuClickHanleFun(e)
            }
          })

         
    },
    subscriptionsSetting(){
        wx.getSetting({
            withSubscriptions:true,
            success: (res) => {
                console.log(res)
              // let recordAuth = res.subscriptionsSetting
            
            }
      })
    },
    async getCuponConfirmPermissions(id) {
        const res =await Api.fetch({
            method: 'get',
            url: '/wx/getCuponConfirmPermissions',
        })
        if(res.code==200){
         this.setData({
            couponConfirmPermissions:res.data
         })
        }
    },
    async getTemplateList(id) {
        const appData = await getAppData()
        const res =await Api.fetchNoSignpay({
            method: 'post',
            url: '/wx/getTemplateList',
            data: {
                ...appData
            }
        })
        if(res.errcode==='0'){
            const priTmplIds = res.data.map(i=>i.priTmplId).slice(0,3)
         //   this.requestSubscribeMessage(priTmplIds)
         this.setData({
            priTmplIds
         })
        }
    },
    gotoCard(){
        let url=''
        const userinfoLogin = wx.getStorageSync("userinfoLogin") || "";
        const {memberId} = userinfoLogin
        if(this.data.userType==1||this.data.userType==3){
          url=`/pages/house/memberDetail/index?propertyid=${memberId}&type=my`
        }
        if(this.data.userType==2){
            url='/pages/user/card/agent/index'
          }
          wx.navigateTo({
              url
          })
    },
    getUserInfoCanClick:true,
    getUserInfo(res){
        console.log(this.getUserInfoCanClick)
       if(this.getUserInfoCanClick){
           this.getUserInfoCanClick=false
            getUserInfo(res,res?this.showPhoneNumberMask:null)
            console.log(this.getUserInfoCanClick)
        }
    },
    showPhoneNumberMask,
    queryUserFromChannel,
    closePhoneBox,
    channelRegister,
    closeChannelLoginPopup,
    phoneCallback(){
        if(this.data.isPhoneAuth==2){
            this.setUserData()
             this.setData({
                isPhoneAuth:0
             })
            return
         }
    },
    // 前往我的客户
    gotoNext(url) {
        // this.setData({
        //     isPhoneAuth:0
        // })

        let params=''

        const userinfoLogin = wx.getStorageSync("userinfoLogin") || "";
        let reporterId=wx.getStorageSync('agentId') || userinfoLogin.agentId
        if(!reporterId){
          
          wx.navigateTo({
            url
         })
          return
        }
        
    //     params = `?webUrl=${this.data.h5DoMain}/admin-channel/#/CustomerXcx&tenantId=${app.globalData.tenantId}&reporterId=${reporterId}&title=我的客户`
    //    console.log(params)
    //     wx.navigateTo({
    //         url: '/pages/h5/index/index'+params
    //     })
        wx.navigateTo({
            url: '/pages/user/customer/list/index'
        })
    },
        // 工具栏事件
        goNexts(e) {
            let {type, url, title, appid} = e.currentTarget.dataset

            let webUrllist = url.split('?')
            if (webUrllist.length > 1) {
                wx.navigateTo({
                    url: '/pages/h5/index/index?webUrl=' + webUrllist[0] + '&' + webUrllist[1] + '&title=' + title + '&color=blue' + '&customerId=' + wx.getStorageSync('customerId') + '&appId=' + appid + '&tenantId=' + this.data.tenantId
                })
            } else {
                wx.navigateTo({
                    url: '/pages/h5/index/index?webUrl=' + url + '&title=' + title + '&color=blue' + '&customerId=' + wx.getStorageSync('customerId') + '&appId=' + appid + '&tenantId=' + this.data.tenantId
                })
            }
        },
    // async queryUserFromChannel(){

    //     const userinfoLogin = wx.getStorageSync("userinfoLogin") || "";
    //     const mobile = userinfoLogin.phoneNo || wx.getStorageSync("userPhone")

    //     return new Promise(async (reslove,reject)=>{
    //         const result = await Api.fetchChannelManager({
    //             method: 'get',
    //             url: '/customersForThird/accounts/find',
    //             data: {
    //                 tenantId:getApp().globalData.tenantId,
    //                 mobile
    //             }
    //           })
         
    //           if (result.data) {
    //             wx.setStorageSync('agentId',result.data.userId)
    //             wx.setStorageSync('teamId',result.data.teamId)
    //             reslove(result.data)
    //           }else{
                
    //           }
    //     })

    // },
});
