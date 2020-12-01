import Api from "../../../utils/api.js";
import {generalStatistical} from '../../../utils/util'
import {imClickfun} from "../../../utils/houseDetailCommon"
const app =  getApp();

Page({
    data: {
        houseid: '',
        houseData: {},
        isUserAuth:0,
        globalData: app.globalData.projectName
    },
    onLoad(options) {
        wx.showShareMenu({
            withShareTicket: true
        })
        const { houseid } = options;
        this.setData({
            customerId: wx.getStorageSync("customerId"),
            houseid
        }, this.getDetailFun);
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
    goMapFun(e) {
        wx.openLocation({
            latitude: Number(this.data.houseData.map.split('|')[0]),
            longitude: Number(this.data.houseData.map.split('|')[1]),
            name: this.data.houseData.referred||'',
            address: this.data.houseData.showroomAddress,
            success() {}
        })
    },
    imClickfun,
    getDetailFun() {
        Api.getHouseDetails({ projectId: this.data.houseid }).then((res) => {
            if (res.code == 200) {
                wx.setNavigationBarTitle({
                    title: res.data.referred
                })
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
                let decorateType = {
                    0: '暂无',
                    1: '毛坯',
                    2: '精装',
                    3: '简装',
                    4: '其他',
                }
                res.data.projectType = projectType[res.data.projectType]
                res.data.decorateType = decorateType[res.data.decorateType]
                res.data.imageList = res.data.imageUrls.split(',')
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
                if (res.data.openTime) {
                    res.data.openTime = res.data.openTime.split(' ')[0]
                } else {
                    res.data.openTime = '--'
                }
                if (res.data.lastOpenTime) {
                    res.data.lastOpenTime = res.data.lastOpenTime.split(' ')[0]
                } else {
                    res.data.lastOpenTime = '--'
                }
                if (res.data.deliveryTime) {
                    res.data.deliveryTime = res.data.deliveryTime.split(' ')[0]
                } else {
                    res.data.deliveryTime = '--'
                }
                this.setData({
                    houseData: res.data
                })
                if (!this.data.houseData.vrUrl) {
                    this.data.topType = 2
                    if (!this.data.mainData.videoUrl) {
                        this.data.topType = 3
                        if (!this.data.houseData.imageList || !this.data.houseData.imageList.length) {
                            this.data.topType = null
                        }
                    }
                }
            }
        });
    },
    onShareAppMessage: function() {

    },
    generalStatistical
});
