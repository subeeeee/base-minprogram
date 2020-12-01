import Api from "../../../utils/api";
import { signStepChange } from "../../../utils/util";
const app = getApp();

Page({
    data: {
        showPrevBtn:false,
        // isFee:getApp().globalData.processArr.findIndex(item => item.id == 3) >= 0,
        isFee: true,
        projectInfo: '',
        payAmount: '',
        roomInfo: {},
        stepsNum: '',
        stepsOptions: ''
    },
    onLoad(option) {
        this.setData({
            projectInfo: wx.getStorageSync('projectInfo'),
            payAmount: getApp().globalData.payAmount||0,
            stepsNum: getApp().globalData.signStepNum,
            stepsOptions: getApp().globalData.processArr,
            info: {
                customerId: wx.getStorageSync("customerId"),
                projectId: wx.getStorageSync('projectInfo').id,
                mobile: wx.getStorageSync('projectInfo').mobile,
                identityNo: wx.getStorageSync('projectInfo').identityNo,
                customerName: wx.getStorageSync('projectInfo').customerName
            }
        })
    },
    onShow() {
        let roomInfo = wx.getStorageSync("roomInfo")
        if (roomInfo) {
            this.setData({
                roomInfo: roomInfo
            })
        }
        // 选房[2]的顺序
        let checkRoomIndex = getApp().globalData.processArr.findIndex(item => item.id == 2)
        // 支付[3]的顺序
        let payIndex = getApp().globalData.processArr.findIndex(item => item.id == 3)
        if(checkRoomIndex < payIndex){
            // 选房在支付前
            this.setData({
                showPrevBtn: true
            })
        }
    },
    checkRoom() {
        wx.navigateTo({
            url: "/pages/house/signStepCheckRoom/index"
        })
    },
    prevPage() {
        signStepChange('?id=15', 'prev')
    },
    nextPage() {
        if(!this.data.roomInfo.id){
            wx.showToast({
                icon:'none',
                title:'请先选择认购房源信息',
                duration:3000
            })
            return false
        }
        // 选定房源
        Api.fetch({
            method: 'post',
            url: '/subscribeRecord/updateRecord',
            data: {
                "id": wx.getStorageSync('recordId'),
                "roomId": this.data.roomInfo.id
            }
        }).then(res => {
            if (getApp().globalData.processArr.findIndex(item => item.id == 4) >= 0) {
                Api.fetch({
                    url: "/signResult/getSignParams/" + wx.getStorageSync('recordId'),
                }).then(data => {
                    wx.setStorageSync('contractId', data.data.contractId)
                    wx.setStorageSync('contractMobile', data.data.contact)
                    wx.setStorageSync('payId', res.data.id)
                    signStepChange('', 'next')
                })
            } else {
                wx.setStorageSync('payId', res.data.id)
                signStepChange('', 'next')
            }
        })
    }
});
