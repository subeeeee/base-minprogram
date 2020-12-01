import Api from "../../../utils/api";
import {generalStatistical,getUserInfo,reportCustomer,getUserPhone} from "../../../utils/util";
import {getNickName,getPhoneNo} from "../../../utils/login";

const safeArea = require("../../../utils/safe-area.js");
const app = getApp();

Page({
    data: {
        isUserAuth:0,
        obj: {},
        houseList:[],
        showShareDialogFlag:false,
        showMoreMessage:false,
        type:'project',
        referred:'',
        projectListShow:false,
        myCustomerId:wx.getStorageSync('userinfoLogin').customerId||wx.getStorageSync('customerId'),
        isMyself:false,
        isPhoneAuth:0,
        imgServerUrl:app.globalData.imgServerUrl,
        cdnUrl:app.globalData.cdnUrl,
        projectName:app.globalData.projectName,
        h5DoMain: app.globalData.h5DoMain,

    },
    onLoad(options) {
        let isShareOpenPage = false
        console.log(options)
        wx.showShareMenu({
            withShareTicket: true
        })
        // 针对 iphonex优化
        safeArea.getSafeArea();
        this.setData({
            ...safeArea.data,
            type:options.type
        });
        const {propertyid = "",hid="",shareCId='',shareCType=''} = options;
        if(shareCType||shareCId){
            wx.setStorageSync('shareCId',shareCId)
            wx.setStorageSync('shareCType',shareCType)
            wx.setStorageSync('register_type',1)
            let userinfoLogin = wx.getStorageSync("userinfoLogin")
            if(userinfoLogin){
                this.reportCustomer({
                    sourceType:shareCType,
                    sourceId:shareCId,
                    registerType:1,
                    sourceProjectId:hid,
                    customerId:userinfoLogin.customerId
                })
                if(!userinfoLogin.phoneNo&&!wx.getStorageSync('userPhone')){
                    this.setData({
                        isPhoneAuth:1
                    })
                }

            }else{
                //true代表需要保存userinfologin的信息
                this.getUserInfo(true,()=>{
                    this.setData({
                        isPhoneAuth:1
                    })
                    let userinfoLogin = wx.getStorageSync("userinfoLogin")
                    this.reportCustomer({
                        sourceType:shareCType,
                        sourceId:shareCId,
                        registerType:1,
                        sourceProjectId:hid,
                        customerId:userinfoLogin.customerId
                    })
                 
                })
            }
            isShareOpenPage = true
        }
        this.setData({
            projectId:hid,
            propertyid,
            isShareOpenPage
        });


    },
    getDetail(){
        Api.fetch({
            method: 'get',
            url: '/applet/member/getDetail',
            showLoading: true,
            data: {
                memberId: this.data.propertyid,
                operateObjectId:this.data.propertyid,
                projectId:this.data.projectId
            }
        }).then((res) => {
            console.log(res)
            if (res.code === 200) {

                let {isShow} =  res.data
                if(!isShow&&this.data.isShareOpenPage){
                    wx.showToast({
                        title: '项目已下线',
                        icon: 'none',
                        duration: 2000,
                        success:()=>{
                            setTimeout( ()=> {
                                wx.reLaunch({
                                    url: `/pages/home/index/index`
                                })
                            },2000)
                        }
                    })
                    return
                }



                res.data.headImgUrl = res.data&&res.data.headImgUrl ? (res.data.headImgUrl.indexOf('http') != -1 ? res.data.headImgUrl : ('https://yxf-bucket-01.oss-cn-beijing.aliyuncs.com/' + res.data.headImgUrl + '?x-oss-process=image/resize,h_250')) : '/images/theme@2x.png'
                this.setData({
                    obj: res.data,
                    isMyself:res.data.onlineCustomerId===this.data.myCustomerId
                },()=>{
                    if(this.data.type!='my'){ 
                        this.getHouseList()
                    }
                })
                // this.setData({
                //     obj: res.data
                // }, this.getHouseList)
            } else {
                wx.showToast({
                    title: res.message,
                    icon: 'none',
                    duration: 3000
                });
            }
            
        }).catch(err=>{
            console.error(err)
        });
    },
    reportCustomer({sourceType,sourceId,registerType,sourceProjectId,customerId}){
        // ai名片报备，规则
        // 1、判断sourceType是1顾问，2经纪人，3双重身份时，且register_type是1扫码名片，2扫码海报，调用wx/reportCustomer，参数通code2Session；
        if((sourceType==1||sourceType==2||sourceType==3)&&sourceId){
            reportCustomer({
                sourceType,
                sourceId,
                registerType,
                sourceProjectId,
                customerId
            })
        }
    },
    getPhoneNo,
    onShow() {
        this.getPhoneNo()
        //如果是从房源详情进入的顾问详情，可能不一定是哪个顾问，这个时候this.getHouseList的作用是  获取这个顾问下有哪些项目
       //如果是从我的 进入的顾问详情，这是需要先知道我有哪些项目权限，再去分享名片
        if(this.data.type == 'my'){
            this.getHouseList()
        }else{
            this.getDetail()  //这时候getHouseList会依赖this.getDetail的数据
        }
       
        
    },
    // goMapFun(e) {
    //     wx.openLocation({
    //         latitude: Number(this.data.obj.map.split('|')[0]),
    //         longitude: Number(this.data.obj.map.split('|')[1]),
    //         success() {}
    //     })
    // },
    goHouse(e) {
        wx.navigateTo({
            url: `/pages/house/detail/index?houseid=${e.currentTarget.dataset.id}`
        });
    },
    imClickfun(e) {
        if (!wx.getStorageSync("customerId")) {
            // wx.navigateTo({
            //     url: '/pages/login/auth/index'
            // });
            this.setData({
                isUserAuth:1
            });
            return false
        }
        this.generalStatistical({
            statisticalName:'onlineConsulting',
            projectId: this.data.obj.projectId,
        })
        wx.navigateTo({
            url: `/packageIm/pages/main/index?memberid=${this.data.obj.memberId}&houseid=${this.data.obj.projectId}`
        });
    },
    //  拨打电话
    telephone(e) {
        this.generalStatistical({
            statisticalName:'telephoneCounseling',
            projectId: this.data.obj.projectId,
        })
        wx.makePhoneCall({
            phoneNumber: this.data.obj.mobile,
            success(){

            }
        })

    },
    wxQrCode() {
        let url =  this.data.obj.wxQrCode
        if(url.indexOf('http')==-1){
            url = 'https://yxf-bucket-01.oss-cn-beijing.aliyuncs.com/' + this.data.obj.wxQrCode + '?x-oss-process=image/quality,q_70'
        }
        wx.previewImage({
            urls: [url], // 当前显示图片的http链接
        })
    },
    copy(data) {
        wx.setClipboardData({
            data,
            success (res) {
                wx.getClipboardData({
                    success (res) {
                        console.log(res.data) // data
                    },
                    fail(err){
                        console.error(err)
                    }
                })
            }
        })
    },
    copyWX(){
       this.copy(this.data.obj.wxId)
    },
    copyEmail(){
        this.copy(this.data.obj.mail)
    },
     copyAddress(){
        this.copy(this.data.obj.location)
     },
     copyDepartment(){
        this.copy(this.data.obj.department)
     },
    baocun() {
        let that = this
        wx.showActionSheet({
            itemList: ['呼叫', '添加联系人'],
            success: function (res) {
                if (res.tapIndex === 0) {
                    // 呼叫号码
                    wx.makePhoneCall({
                        phoneNumber: that.data.obj.mobile,
                    })
                } else if (res.tapIndex == 1) {
                    // 添加到手机通讯录
                    wx.addPhoneContact({
                        firstName: that.data.obj.name,//联系人姓名
                        mobilePhoneNumber: that.data.obj.mobile,//联系人手机号
                    })
                }
            }
        })
    },
    onShareAppMessage: function(options) {
       console.log('已转发')
        // const customerId = wx.getStorageSync("customerId")
        // const userinfoLogin = wx.getStorageSync("userinfoLogin")
        // const {userType} = userinfoLogin

        const {memberId,userType,onlineCustomerId,projectId} = this.data.obj;
        console.log(`pages/house/memberDetail/index?hid=${projectId}&shareCId=${onlineCustomerId}&shareCType=${userType||0}&propertyid=${memberId}`)
          const { from } = options;
     //     if (from == 'button') {
            this.generalStatistical({
                statisticalName:'shareBusinessCard',
                projectId: this.data.obj.projectId,
                operateObjectId:this.data.obj.memberId
            })
            this.hideShareDialog()
              return {
                  title: `${this.data.obj.referred}`,
                  path: `pages/house/memberDetail/index?hid=${projectId}&shareCId=${onlineCustomerId}&shareCType=${userType||0}&propertyid=${memberId}`,
                //  imageUrl: shareInfo.shareFriendImg,
              };
     //     }
    },
    // 楼盘
    async getHouseList() {
      //  let userinfoLogin = wx.getStorageSync("userinfoLogin")
         let res= await Api.fetch({
                method: 'post',
                url: '/applet/project/myProjects',
                ContentType: true,
                data: {
                    cityCode: '',
                    pageSize:12,
                    customerId:this.data.obj.onlineCustomerId,
                    mobile: this.data.type=='my'?wx.getStorageSync('userPhone')||wx.getStorageSync('userinfoLogin').phoneNo:this.data.obj.mobile,
                    memberId:this.data.obj.memberId,
                }
            })
        // const res = await Api.getHouseDetails({projectId: this.data.obj.projectId})

            if (res.code === 200) {
                const arr = res.data.records
                if(this.data.type=="my"&&arr.length){
                    let {projectId,referred} = arr[0]
                    this.setData({
                        projectId:projectId,
                        referred,
                        selectdProjectIdx:0,
                        selectdProjectId:projectId,
                    },this.getDetail)
                }
                arr.forEach(function (item, i) {
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
                    houseList: arr,
                    
                    isMyself:this.data.obj.onlineCustomerId===this.data.myCustomerId
                })

               
            } else {
                wx.showToast({
                    icon:'none',
                    title: res.message,
                    duration:3000
                })
            }
    },
        changeShareDialogFlag(bool){
            this.setData({
              showShareDialogFlag:bool
            })
          },
          hideShareDialog(){
              this.changeShareDialogFlag(false)
          },
          switch(){
              this.setData({
                showMoreMessage:!this.data.showMoreMessage
              })
          },
          generalStatistical,
          getUserInfo,
          showProjectList(){
            this.setData({
              projectListShow:true
            })
          },
          closeProjectListShowPopup(){
            this.setData({
              projectListShow:false
            })
          },
          changeSelected(e){
            let idx = e.currentTarget.dataset.idx
            let key = e.currentTarget.dataset.key
            this.setData({
              [key]:idx
            })
          },
          setProject () {
            let option = this.data.houseList[this.data.selectdProjectIdx]
            this.setData({
                referred:option.referred,
              selectdProjectId:option.projectId
            })
            this.closeProjectListShowPopup()
          },
          gotoEdit(){
              wx.navigateTo({
                  url:`/pages/user/card/index?propertyid=${this.data.obj.memberId}`
              })
          },
          closePhoneBox(){
              this.setData({
                  isPhoneAuth:0
              })
          },
          getCustomerId(){
            return wx.getStorageSync('customerId')
          },
          setCustomerId(){
            if (!this.getCustomerId()) {
                //必须再  生成海报前拿到  customerId
                wx.setStorageSync('isIndexGo',1)
                this.getUserInfo(true,()=>{})
            }
          },
          getUserPhone(e){
           // this.setCustomerId()
            getUserPhone(e,()=>{
                this.showShareDialog()
                this.getPhoneNo()
            })
          },
          async showShareDialog(){
            //this.setCustomerId()
            if(!this.data.obj.onlineCustomerId||!this.data.obj.userType){
              await this.getDetail()
            }
            this.changeShareDialogFlag(true)
        }
});
