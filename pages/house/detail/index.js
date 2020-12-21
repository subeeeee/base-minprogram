import Api from "../../../utils/api.js";
import {getUserInfo,getUserPhone,generalStatistical,reportCustomer} from "../../../utils/util.js";
import {getNickName,getPhoneNo} from "../../../utils/login.js";
import {
    getWebFun
} from "../../../utils/goUtils";

const safeArea = require("../../../utils/safe-area.js");
const app = getApp();
var interval = null
Page({
    data: {
        globalData: app.globalData.projectName,
        proName: '',
        remindText: '',
        customerId: '',
        userPhone: '',
        remind: true,
        rule: true,
        topType: 1,
        houseData: {},
        couponList: [],
        memberList: [],
        topicList: [],
        roomList: [],
        topicListShow: [],
        patternList: [],
        onlookersList: [],
        likelist: [],
        onlookersNum: 0,
        isOpen: null,
        isLike: null,
        isPrice: null,
        codeMsg: '获取验证码',
        code: '',
        yuyueInfo: {
            projectName: '',
            projectId: '',
            customerId:  wx.getStorageSync("customerId"),
            appointmentDate: '',
            name: wx.getStorageSync("userinfoLogin").nickName,
            mobile: wx.getStorageSync("userPhone")||wx.getStorageSync("userinfoLogin").phoneNo,
            sex: wx.getStorageSync("userinfoLogin").sex,
        },
        isUserAuth:0,
        isVerify:null,
        isVipShow:false,
        systemFacilityStatus:0,
        systemFacilityList:[],
        customFacilityStatus:0,
        customFacilityList:[],
        wxPidUrls:'',
        isOfficialShow:false,
        imgServerUrl:app.globalData.imgServerUrl,
        globalProjectName:app.globalData.projectName,
        cdnUrl:app.globalData.cdnUrl
    },
    onLoad(options) {
        wx.showShareMenu({
            withShareTicket: true
        })
        const {houseid = "",hid="",shareCId='',shareCType=''} = options;

        // 针对 iphonex优化
        safeArea.getSafeArea();
        this.setData({
            'yuyueInfo.projectId': houseid||hid,
            'yuyueInfo.appointmentDate': this.getDate({
                format: true
            }),
            houseid:houseid||hid,
        });

        if(shareCType||shareCId){
            wx.setStorageSync('shareCId',shareCId)
            wx.setStorageSync('shareCType',shareCType)
            wx.setStorageSync('register_type',2)
            let userinfoLogin = wx.getStorageSync("userinfoLogin")
            console.log(userinfoLogin)
            if(userinfoLogin){
                if(!userinfoLogin.phoneNo&&!wx.getStorageSync('userPhone')){
                    this.setData({
                        isPhoneAuth:1
                    })
                }
                this.reportCustomer({
                    sourceType:shareCType,
                    sourceId:shareCId,
                    registerType:2,
                    sourceProjectId:houseid||hid,
                    customerId:userinfoLogin.customerId
                })
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
                        registerType:2,
                        sourceProjectId:houseid||hid,
                        customerId:userinfoLogin.customerId
                    })
                })
            }

        }
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
    getUserInfo,
    getDate(type) {
        const date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();

        if (type === 'end') {
            year = year + 1;
        }
        month = month > 9 ? month : '0' + month;;
        day = day > 9 ? day : '0' + day;
        return `${year}-${month}-${day}`;
    },
    getlikelist() {
        Api.getHouseList({
            notInId: this.data.houseData.id,
            cityCode: this.data.houseData.cityCode
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
                let data = res.data.records
                this.setData({
                    likelist: data
                });
            } else {
                wx.showToast({
                    title: res.message,
                    icon: 'none',
                    duration: 3000
                });
            }
        });
    },
    showRule(e) {
       this.setData({
           ruleText: e.currentTarget.dataset.rule,
           rule: false
       })
    },
    closeRule() {
        this.setData({
            ruleText: '',
            rule: true
        })
    },
    getNickName,
    getPhoneNo,
    onShow() {
        this.getNickName()
        this.getPhoneNo()
        const token = wx.getStorageSync("token") || "";
        const customerId = wx.getStorageSync("customerId") || "";
        const userPhone = this.getPhone()
        this.setData({
            userPhone,
            customerId,
            token,
            ...safeArea.data
        });
        this.getdetail()
        this.getCoupon()
        this.getPropertyConsultantListFun()
        this.getTopic()
        this.getRoomBrief()
        this.getRoomPattern()
        this.getOnlookers()
        this.getInterface()
    },
    goBuy() {
        // if (!this.data.customerId) {
        //     wx.navigateTo({
        //         url: '/pages/login/auth/index'
        //     });
        //     return false
        // }
        Api.fetch({
            method: 'post',
            url: '/subscribeConfig/queryConfig',
            data: {
                projectId: this.data.houseid,
            }
        }).then((res) => {
            if (res.code === 200) {
                if (1 !== res.data.enabled) {
                    wx.showToast({
                        title: '项目未开启线上认购，请联系置业顾问！',
                        icon: 'none',
                        duration: 3000
                    })
                } else {
                    wx.setStorageSync('projectInfo', {
                        name: this.data.yuyueInfo.projectName,
                        id: this.data.yuyueInfo.projectId,
                        developers: this.data.houseData.developers
                    })
                    // wx.navigateTo({
                    //     url: "/pages/house/signStepIndex/index"
                    // })
                    this.reNavigateTo("/pages/house/signStepIndex/index")
                }
            } else {
                wx.showToast({
                    title: res.message,
                    icon: 'none',
                    duration: 3000
                })
            }
        });

    },
    goMapFun(e) {
        wx.openLocation({
            latitude: Number(this.data.houseData.map.split('|')[0]),
            longitude: Number(this.data.houseData.map.split('|')[1]),
            name: this.data.houseData.referred||'',
            address: this.data.houseData.showroomAddress,
            success() {}
        })
    },
    // getPhoneNumber (e) {
    //     console.log(e.detail.errMsg)
    //     console.log(e.detail.iv)
    //     console.log(e.detail.encryptedData)
    // },
    codeChange(e) {
        this.setData({
            code: e.detail.value
        })
    },
    // 看房
    kanfang(event) {
        const that=this;
        var type=2;
        if(event==1 || event==2){
           type=event;
        }else{
           type=event.currentTarget.dataset.type;
        }
        //type 1vip登记 2预约看房
        // wx.navigateTo({
        //     url: `/pages/house/yuyue/index?projectId=${this.data.houseid}&projectName=${this.data.houseData.referred}&isVerify=${this.data.houseData.isVerify}&type=${type}`
        // });
        this.reNavigateTo(`/pages/house/yuyue/index?projectId=${this.data.houseid}&projectName=${this.data.houseData.referred}&isVerify=${this.data.houseData.isVerify}&type=${type}`)
    },
    reNavigateTo(url){
        if (getCurrentPages().length >= 10) {//判断当前页面栈是否大于等于10.如果大于或等于就使用wx.reLaunch来跳转页面，清除当前页面栈
            wx.reLaunch({url})
        }else{
            wx.navigateTo({url});
        }
    },
    getCustomerId(){
       return wx.getStorageSync('customerId')
    },
    imClickfun(e) {
        // 是否有customerId  ?  从微信登陆获取用户id  :   -> 继续
        if (!this.getCustomerId()) {
            this.setData({
                isUserAuth:1
            })
            return false
        }

        // ->  可能是一个埋点  ->  继续 
        this.generalStatistical({
            statisticalName:'onlineConsulting',
            projectId: this.data.houseid,
        })
        // ->拿到顾问id
        let id = e.currentTarget.dataset.id
        // ->  如果有顾问 跳转到main页面   具体干什么不知道参数需要houseid和顾问id
        if (id) {
            // wx.navigateTo({
            //     url: `/packageIm/pages/main/index?memberid=${id}&houseid=${this.data.houseid}`
            // });
            this.reNavigateTo(`/packageIm/pages/main/index?memberid=${id}&houseid=${this.data.houseid}`)
        } else {
            Api.fetch({
                method: 'get',
                url: '/applet/member/getMemberCycle',
                data: {
                    projectId: this.data.houseid,
                }
            }).then((res) => {
                if (res.code === 200) {
                    if (res.data) {
                        // wx.navigateTo({
                        //     url: `/packageIm/pages/main/index?memberid=${res.data.memberId}&houseid=${this.data.houseid}`
                        // });
                        this.reNavigateTo(`/packageIm/pages/main/index?memberid=${res.data.memberId}&houseid=${this.data.houseid}`)
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

    },
    memberDetail(e) {
        let id = e.currentTarget.dataset.id
        // wx.navigateTo({
        //     url: `/pages/house/memberDetail/index?propertyid=${id}&type=project&hid=${this.data.houseid}`
        // });
        this.reNavigateTo(`/pages/house/memberDetail/index?propertyid=${id}&type=project&hid=${this.data.houseid}`)
    },
    //  开启订阅提醒弹框
    remindShow(e) {
        // if (!this.data.customerId) {
        //     wx.navigateTo({
        //         url: '/pages/login/auth/index'
        //     });
        //     return false
        // }
        let text=''
        if(e && e.currentTarget && e.currentTarget.dataset.text){
            text=e.currentTarget.dataset.text
        }else{
            text=e.text
        }
        this.setData({
            phone: this.getPhone(),
            remindText: text,
            remind: false
        })
    },
    //  关闭订阅提醒弹框
    remindHide() {
        this.setData({
            remind: true,
            rule: true
        })
    },
    //  预览图片
    showPreview(e) {
        let {src} = e.currentTarget.dataset
        if(!src){
          return
        }
        wx.previewImage({
            urls: [this.data.cdnUrl + src + '?x-oss-process=image/quality,q_70']
        })
    },
    //  特价房源
    roomDetail(e) {
        let data = e.currentTarget.dataset.item
        wx.setStorageSync('projectInfo', {
            name: this.data.yuyueInfo.projectName,
            id: this.data.yuyueInfo.projectId,
            developers: this.data.houseData.developers
        })
        // wx.navigateTo({
        //     url: '/pages/house/roomDetail/index?id=' + data.roomId
        // })
        this.reNavigateTo('/pages/house/roomDetail/index?id=' + data.roomId)
    },
    //  详情
    goDetail() {
        // wx.navigateTo({
        //     url: '/pages/house/detail/detail?houseid=' + this.data.houseid
        // })
        this.reNavigateTo('/pages/house/detail/detail?houseid=' + this.data.houseid)
    },
    //  去别的楼盘
    goHouse(e) {
        var houseid = e.currentTarget.dataset.houseid
        // wx.navigateTo({
        //     url: '/pages/house/detail/index?houseid=' + houseid
        // })

        this.reNavigateTo('/pages/house/detail/index?houseid=' + houseid)
    },
    //  拨打电话
    telephone(e) {
        this.generalStatistical({
            statisticalName:'telephoneCounseling',
            projectId: this.data.houseid,
        })
        wx.makePhoneCall({
            phoneNumber: e.currentTarget.dataset.phone,
        })
    },
    topTypeChange(e) {
        this.setData({
            topType: Number(e.currentTarget.dataset.type)
        })
    },
    //  打开全景
    openOverView() {
        if (this.data.houseData.vrUrl) {
            if (this.data.houseData.vrUrl.indexOf('?') !== -1) {
                // wx.navigateTo({
                //     url: '/pages/h5/index/index?webUrl=' + this.data.houseData.vrUrl.split('?')[0] + '&' + this.data.houseData.vrUrl.split('?')[1]
                // })

                this.reNavigateTo('/pages/h5/index/index?webUrl=' + this.data.houseData.vrUrl.split('?')[0] + '&' + this.data.houseData.vrUrl.split('?')[1])
            } else {
                // wx.navigateTo({
                //     url: '/pages/h5/index/index?webUrl=' + this.data.houseData.vrUrl
                // })
                this.reNavigateTo('/pages/h5/index/index?webUrl=' + this.data.houseData.vrUrl)
            }
        } else {
            wx.showToast({
                title: '该项目全景数据有误，请稍后再试',
                icon: 'none',
                duration: 3000
            })
        }
    },
    // 获取详情
    getdetail() {
        this.generalStatistical({
            statisticalName:'viewProject',
            projectId: this.data.houseid,
        })
        Api.getHouseDetails({projectId: this.data.houseid}).then((res) => {
            if (res.code == 200) {

                let {isShow} =  res.data
                if(!isShow){
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


                wx.setNavigationBarTitle({
                    title: res.data.referred
                })
                this.setData({
                    'yuyueInfo.projectName': res.data.referred
                });
                let projectType = {
                    0: '综合',
                    1: '住宅',
                    2: '别墅',
                    3: '商铺',
                    4: '商住',
                    5: '写字楼',
                    6: '地下室',
                    7: '市政工程',
                    8: '车位',
                    9: '其他'
                }
                res.data.projectType = projectType[res.data.projectType]
                if (res.data.imageUrls) {
                    res.data.imageList = res.data.imageUrls.split(',')
                }
                if (res.data.sellPoint) {
                    if (res.data.sellPoint.indexOf('，') !== -1) {
                        res.data.sellPoint = res.data.sellPoint.split('，')
                    } else {
                        res.data.sellPoint = res.data.sellPoint.split(' ')
                    }
                }
                res.data.sellPoint = res.data.sellPoint || []
                res.data.longitude = res.data.map.split('|')[1].substring(0, 8)
                res.data.latitude = res.data.map.split('|')[0].substring(0, 7)
                res.data.openTime = res.data.openTime ? res.data.openTime.substring(0, 10) : ''

                var systemFacilityStatusList=[]
                if(res.data.systemFacilityStatus==1){
                    systemFacilityStatusList=res.data.systemFacilityList
                }else{
                    systemFacilityStatusList=[]
                }
                if(res.data.customFacilityList){
                    var customFacilityList=res.data.customFacilityList;
                    customFacilityList.forEach(function(item,i){
                        item.description=item.description.split('；');
                    });
                }

                this.setData({
                    houseData: res.data,
                    isVerify:res.data.isVerify,
                    isVipShow:res.data.isVerify == 1 ? true : false,
                    customFacilityStatus:res.data.customFacilityStatus,
                    customFacilityList:customFacilityList || [],
                    systemFacilityStatus:res.data.systemFacilityStatus,
                    systemFacilityList:systemFacilityStatusList,
                    wxPidUrls:res.data.wxPidUrls
                })
                this.getlikelist()
                if (!this.data.houseData.vrUrl){
                    this.setData({
                        topType: 2
                    })
                    if (!this.data.houseData.videoUrl) {
                        this.setData({
                            topType: 3
                        })
                        if (!this.data.houseData.imageList || !this.data.houseData.imageList.length) {
                            this.setData({
                                topType: null
                            })
                        }
                    }
                }
                //获得房屋信息后才能预约
                if(wx.getStorageSync("userPhone")||wx.getStorageSync("userinfoLogin").phoneNo){
                    if(wx.getStorageSync("state")=='subscription'){
                        wx.setStorageSync("state",'')
                        this.goBuy()
                    }else if(wx.getStorageSync("state")=='appointment'){
                        wx.setStorageSync("state",'')
                        this.kanfang(2)
                    }else if(wx.getStorageSync("state")=='appointmentVip'){
                        wx.setStorageSync("state",'')
                        this.kanfang(1)
                    }
                }else{
                    wx.setStorageSync("state",'')
                }

            } else {
                wx.showToast({
                    title: res.message,
                    icon: 'none',
                    duration: 3000
                })
            }
        });
    },
    //  获取优惠券
    getCoupon() {
        Api.fetch({
            method: 'post',
            url: '/applet/act/coupon/pageList',
            data: {
                projectId: this.data.houseid,
                pageSize: 999
            }
        }).then((res) => {
            if (res.code === 200) {
                this.setData({
                    couponList: res.data.records
                })
            } else {
                wx.showToast({
                    title: res.message,
                    icon: 'none',
                    duration: 3000
                })
            }
        });
    },
    invertedTime() {
        let that = this
        let time = parseInt(that.data.codeMsg)
        interval = setInterval(function () {
            if (time <= 0) {
                clearInterval(interval)
                that.setData({
                    codeMsg: '获取验证码'
                })
            }else{
                time--
                that.setData({
                    codeMsg: time
                })
            }
        }, 1000)

    },
    //  获取验证码
    getCode() {
        if (this.data.phone) {
            if (this.data.codeMsg !== '获取验证码') {
                return false
            }
            Api.fetch({
                method: 'get',
                url: '/applet/collection/checkCode',
                data: {
                    mobile: this.data.phone
                }
            }).then((res) => {
                if (res.code === 200) {
                    wx.showToast({
                        title: '验证码发送成功!',
                        duration: 3000
                    })
                    this.setData({
                        codeMsg: 60
                    })
                    this.invertedTime()
                } else {
                    wx.showToast({
                        title: res.message,
                        icon: 'none',
                        duration: 3000
                    })
                }
            });
        } else {
            wx.showToast({
                title: '请输入手机号!',
                icon: 'none',
                duration: 3000
            })
        }
    },
    //  领取优惠券
    receive(e) {
           getUserPhone(e,()=>{


                    this.setReceive(e)
                    const userPhone = this.getPhone()
                    this.setData({
                        userPhone
                    });
                    this.getCoupon()
                    this.getOnlookers()
                    this.getInterface()

            })


    },
    setReceive(e){
      if(e.currentTarget.dataset.type==0){
        Api.fetch({
            method: 'post',
            url: '/applet/act/coupon/receive',
            data: {
                actCouponId: e.currentTarget.dataset.id,
                projectId:this.data.houseid,
                operateObjectId:e.currentTarget.dataset.id,
                idCard:null,
                intentProjectId:null,
                topicId:null,
                userName:null,
                couponCode:null
            }
        }).then((res) => {
            if (res.code === 200) {
                wx.showToast({
                    title: '领取成功！',
                    duration: 3000
                })
            } else {
                wx.showToast({
                    title: '领取失败！',
                    icon: 'none',
                    duration: 3000
                })
            }
            this.getCoupon()
        });
    }else{
        // wx.navigateTo({
        //     url: '/pages/activity/coupon?projectIds=' + this.data.houseid +'&actCouponId='+e.currentTarget.dataset.id
        // })
        this.reNavigateTo('/pages/activity/coupon?projectIds=' + this.data.houseid +'&actCouponId='+e.currentTarget.dataset.id)
    }
    },
    //  获取围观
    getOnlookers() {
        Api.fetch({
            method: 'post',
            url: '/applet/collection/onlookers',
            data: {
                projectId: this.data.houseid,
                pageSize: 5
            }
        }).then((res) => {
            if (res.code === 200) {
                this.setData({
                    onlookersList: res.data.records,
                    onlookersNum: res.data.totalNum
                })
            } else {
                wx.showToast({
                    title: res.message,
                    icon: 'none',
                    duration: 3000
                })
            }
        });
    },
    //  获取订阅以及关注状态
    getInterface() {
        Api.fetch({
            method: 'get',
            url: '/applet/collection/getUserCollection',
            data: {
                projectId: this.data.houseid,
                customerId: this.getCustomerId()
            }
        }).then((res) => {
            if (res.code === 200) {
                this.setData({
                    isOpen: res.data.isOpen,
                    isLike: res.data.isLike,
                    isPrice: res.data.isPrice
                })
                //获取手机号是否打开订阅号
                if(wx.getStorageSync("state")=='changePrice'){
                    wx.setStorageSync("state",'')
                    if(res.data.isPrice=='0'){
                        this.remindShow({type:1,text:'变价'});
                    }else{
                        this.showModal({type:1,text:'变价'});
                    }
                }else if(wx.getStorageSync("state")=='quotation'){
                    wx.setStorageSync("state",'')
                    if(res.data.isOpen=='0'){
                        this.remindShow({type:2,text:'开盘'});
                    }else{
                        this.showModal({type:2,text:'开盘'});
                    }
                }
                if(res.data.isPrice=='1' || res.data.isOpen=='1'){
                    this.setData({
                        remind: true
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
    },
    valChange(e) {
        this.setData({
            phone: e.detail.value
        })
    },
    //  订阅信息取消确认
    showModal(e) {
        let that = this
        let text=''
        if(e && e.currentTarget && e.currentTarget.dataset.text){
            text=e.currentTarget.dataset.text
        }else{
            text=e.text
        }
        wx.showModal({
            title: '提示',
            content: `确定要取消订阅${text}提醒吗？`,
            success(res) {
                if (res.confirm) {
                    that.userCollection(e)
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })
    },
    //  改变订阅关注状态
    userCollection(e) {
        // if (!this.getCustomerId()) {
        //     // wx.navigateTo({
        //     //     url: '/pages/login/auth/index'
        //     // });
        //     this.setData({
        //         isUserAuth:1
        //     });
        //     return false
        // }
        let collectionType = e
        if (e && e.currentTarget && e.currentTarget.dataset.type) {
            collectionType = e.currentTarget.dataset.type
        }else{
            collectionType=e.type
        }
        Api.fetch({
            method: 'post',
            url: '/applet/collection/userCollection',
            data: {
                projectId: this.data.houseid,
                customerId: this.getCustomerId(),
                collectionType: collectionType,
                phone: this.data.phone,
                code: this.data.code,
                isCancel: collectionType == '3' ? this.data.isLike : collectionType == '2' ? this.data.isOpen : this.data.isPrice
            }
        }).then((res) => {
            if (res.code === 200) {
                this.getInterface()
                //  订阅项目 和 关注项目 上报
                let params={
                    statisticalName:'',
                    projectId: this.data.houseid,
                }
                if( (collectionType == '2'&&!Number(this.data.isOpen)) || (collectionType == '1'&&!Number(this.data.isPrice))){
                    params.statisticalName='subscribeProject'
                }
                if(collectionType == '3'&&!Number(this.data.isLike)){
                    params.statisticalName='focusProject'
                }
                 if(params.statisticalName){
                    this.generalStatistical(params)
                 }

            } else {
                wx.showToast({
                    title: res.message,
                    icon: 'none',
                    duration: 3000
                })
            }
            clearInterval(interval)
            this.setData({
                codeMsg: '获取验证码',
                code: ''
            })
        });
    },
    // 获取置业顾问列表
    getPropertyConsultantListFun() {
        Api.fetch({
            method: 'post',
            url: '/applet/member/pageList',
            data: {
                projectId: this.data.houseid
            }
        }).then((res) => {
            if (res.code === 200) {
                let that = this
                res.data.records.forEach(function (item) {

                    item.headImgUrl = item.headImgUrl ? (item.headImgUrl.indexOf('http') != -1 ? item.headImgUrl : (that.data.cdnUrl + item.headImgUrl + '?x-oss-process=image/resize,h_250')) : '/images/theme@2x.png'
                })
                this.setData({
                    memberList: res.data.records
                })
            } else {
                wx.showToast({
                    title: res.message,
                    icon: 'none',
                    duration: 3000
                })
            }
        });
    },
    // 获取资讯
    getTopic() {
        Api.fetch({
            method: 'post',
            url: '/applet/topic/pageList',
            data: {
                type: 1,
                projectIds: this.data.houseid
            }
        }).then((res) => {
            if (res.code === 200) {
                this.setData({
                    topicList: res.data.records
                })
            } else {
                wx.showToast({
                    title: res.message,
                    icon: 'none',
                    duration: 3000
                })
            }
        });
    },
    // 获取房间
    getRoomBrief() {
        Api.fetch({
            method: 'post',
            url: '/applet/project/getRoomBrief',
            data: {
                projectId: this.data.houseid,
                isDiscount: 1,
                pageSize: 2
            }
        }).then((res) => {
            if (res.code === 200) {
                res.data.records.forEach(function (item, i) {
                    if (item.imageSrcs) {
                        item.imageSrcs = item.imageSrcs.split(',')[0]
                    }
                    if(!item.buildingName){
                        item.buildingName=''
                    }
                })
                this.setData({
                    roomList: res.data.records
                })
            } else {
                wx.showToast({
                    title: res.message,
                    icon: 'none',
                    duration: 3000
                })
            }
        });
    },
    // 获取户型
    getRoomPattern() {
        Api.fetch({
            method: 'post',
            url: '/applet/project/getRoomPattern',
            data: {
                projectId: this.data.houseid,
                pageSize: 9999,
                isEnabled: 1
            }
        }).then((res) => {
            if (res.code === 200) {
                res.data.records.forEach(function (item, i) {
                    if (item.imageSrcs) {
                        item.imageSrcs = item.imageSrcs.split(',')[0]
                    }
                })
                this.setData({
                    patternList: res.data.records
                })
            } else {
                wx.showToast({
                    title: res.message,
                    icon: 'none',
                    duration: 3000
                })
            }
        });
    },
    // 点赞
    addFabulousFun(e) {
        const {
            item
        } = e.currentTarget.dataset;
        const {
            fabulousstate,
            fabulousnum,
            houseid
        } = item;
        const afterState = fabulousstate === "1" ? "0" : "1";
        const afterNum =
            fabulousstate === "1" ? Number(fabulousnum) - 1 : Number(fabulousnum) + 1;
        Api.addFabulous({
            houseid: houseid,
            state: afterState,
            token: wx.getStorageSync("token") || ""
        }).then(({
                     code
                 }) => {
            if (code == 200) {
                this.setData({
                    'house.fabulousstate': afterState,
                    'house.fabulousnum': afterNum
                });
                app.globalData.fabulousObj = {
                    houseid,
                    fabulousstate: afterState,
                    fabulousnum: afterNum
                };
            } else {
                wx.showToast({
                    title: res.message,
                    icon: 'none',
                    duration: 3000
                })
            }
        });
    },
    goNexts(e) {
        let url = e.currentTarget.dataset.url
        let webUrllist = url.split('?')
        if (webUrllist.length > 1) {
            var topicId = webUrllist[1].split('=')[1]
            // wx.navigateTo({
            //     url: '/pages/activity/index?topicId=' + topicId
            // })
            this.reNavigateTo('/pages/home/activity/index?topicId=' + topicId)
        }
    },
    // 前往其他页面
    goPageFun(e) {
        const {
            type,
        } = e.currentTarget.dataset;
        let url;
        switch (type) {
            case 'allPattern':
                url = `/pages/house/detail/allPattern?houseid=${this.data.houseid}&telephone=${this.data.houseData.telephone}`;
                break;
            case 'member':
                url = `/pages/house/detail/member?houseid=${this.data.houseid}&telephone=${this.data.houseData.telephone}`;
                break;
            case 'topic':
                url = `/pages/house/detail/topic?telephone=${this.data.houseData.telephone}&houseid=${this.data.houseid}`;
                break;
            case 'image':
                url = `/pages/house/detail/image?houseid=${this.data.houseid}&telephone=${this.data.houseData.telephone}&imageList=${this.data.houseData.imageList || []}`;
                break;
        }
        if (url) {
            // wx.navigateTo({
            //     url: url
            // });
            this.reNavigateTo(url)
        }
    },
    //打电话
    gophoneFun(e) {
        const {
            phone
        } = e.currentTarget.dataset;
        this.setData({
            jumpShow: true
        });
        wx.makePhoneCall({
            phoneNumber: phone,
            complete: () => {
                const token = wx.getStorageSync("token") || "";
                if (token) {
                    this.setData({
                        jumpShow: false
                    });
                    Api.savePhoneLog({
                        phone: phone,
                        token: token,
                        houseid: this.data.houseid
                    }).then(({
                                 code,
                                 data = {}
                             }) => {
                        if (code == 200) {
                            this.setData({
                                linkkey: data.linkkey || "",
                                isfirst: data.isfirst || ""
                            });
                        }
                    });
                }
            }
        });
    },
    buyHouse(e){
        wx.setStorageSync("state",'subscription')
        getUserPhone(e)
    },
    orderHouse(e){
        wx.setStorageSync("state",'appointment')
        getUserPhone(e)
    },
    vipHouse(e){
        wx.setStorageSync("state",'appointmentVip')
        getUserPhone(e)
    },
    changePriceTap(e){
        wx.setStorageSync("state",'changePrice')
        getUserPhone(e)
    },
    quotationTap(e){
        wx.setStorageSync("state",'quotation')
        getUserPhone(e)
    },
    getWebFun,
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function(options) {

        const customerId = wx.getStorageSync("customerId")
        const userinfoLogin = wx.getStorageSync("userinfoLogin")
        const {userType} = userinfoLogin

          const { from } = options;
          console.log(`pages/house/detail/index?hid=${this.data.houseid}&shareCId=${customerId}&shareCType=${userType||0}`)
      //    if (from == 'button') {
            this.generalStatistical({
                statisticalName:'shareProject',
                projectId: this.data.houseid,
          })
          this.hideShareDialog()
              return {
                  title: `${this.data.houseData.referred}`,
                  path: `pages/house/detail/index?hid=${this.data.houseid}&shareCId=${customerId}&shareCType=${userType||0}`,
                //  imageUrl: shareInfo.shareFriendImg,
              };
         // }
    },
    changeShareDialogFlag(bool){
      this.setData({
        showShareDialogFlag:bool
      })
    },
    async setCustomerId(){
        if (!this.getCustomerId()) {
            //必须再  生成海报前拿到  customerId
            wx.setStorageSync('isIndexGo',1)
            await this.getUserInfo(true,()=>{})
        }
    },
    async getPhoneNumber(e){
       // await this.setCustomerId()
        getUserPhone(e,()=>{
            this.changeShareDialogFlag(true)
                this.getCoupon()
                this.getOnlookers()
                this.getInterface()
        })
    },
    async changeUserCollection(e){
        // await this.setCustomerId()
         getUserPhone(e,()=>{
                const userPhone = this.getPhone()
                this.setData({
                    userPhone
                });
                 this.userCollection(e)
                 this.getCoupon()
                 this.getOnlookers()
                 this.getInterface()
         })
     },
    showShareDialog(e){
      // this.setCustomerId()
       this.changeShareDialogFlag(true)
    },
    hideShareDialog(){
        this.changeShareDialogFlag(false)
    },
    generalStatistical,
    closePhoneBox(){
        this.setData({
            isPhoneAuth:0
        })
    },
    getPhone(){
        const userinfoLogin = wx.getStorageSync("userinfoLogin") || {};
        let {phoneNo} = userinfoLogin
        if(!phoneNo){
          phoneNo = wx.getStorageSync("userPhone")
        }
        return phoneNo
    },
    openOfficial(){
        // this.setData({
        //     isOfficialShow:true
        // })
        wx.previewImage({
            urls: [this.data.cdnUrl + this.data.wxPidUrls+ '?x-oss-process=image/quality,q_70'], // 当前显示图片的http链接
        })
    },
    gotoMap(){
        let {searchId=null} = this.selectComponent('.mymap').data
        this.reNavigateTo(`/pages/house/detail/map/index?houseid=${this.data.houseid}&activeSearchId=${searchId}`)
    }
});
