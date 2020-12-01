import Api from "../../../utils/api";
import { signStepChange } from "../../../utils/util";
const app = getApp();

Page({
    data: {
        info: {

        },
        stepsNum: app.globalData.signStepNum,
        stepsOptions: app.globalData.processArr
    },
    onLoad(option) {
        this.setData({
            stepsOptions: app.globalData.processArr,
            stepsNum: app.globalData.signStepNum,
            info: {
                customerId: wx.getStorageSync("customerId"),
                projectId: wx.getStorageSync('projectInfo').id,
                mobile: wx.getStorageSync('projectInfo').mobile,
                identityNo: wx.getStorageSync('projectInfo').identityNo,
                customerName: wx.getStorageSync('projectInfo').customerName
            }
        })
    },
    onShow() {},
    getPhoneValidate(str) {
        if (/^(13[0-9]|14[579]|15[0-3,5-9]|16[36]|17[0135678]|18[0-9]|19[89])+\d{8}$/.test(str)) {
            return true;
        } else {
            return false;
        }
    },
    bindKeyInput(e) {
        let key = e.currentTarget.dataset.key
        let data = this.data.info
        data[key] = e.detail.value
        this.setData({
            info: data
        })
    },
    submit() {
        wx.setStorageSync('signStepInputInfo', {
            mobile: this.data.info.mobile,
            identityNo: this.data.info.identityNo,
            customerName: this.data.info.customerName
        })
        return Api.fetch({
            method: 'post',
            url: '/subscribeRecord/addRecord',
            data: {
                ...this.data.info,
                id: wx.getStorageSync('recordId')
            }
        })
    },
    nextPage() {
        if ('' == this.data.info.customerName) {
            wx.showToast({
                icon: 'none',
                title: "请输入认购人姓名",
                duration: 3000
            })
            return false
        }
        if ('' == this.data.info.mobile) {
            wx.showToast({
                icon: 'none',
                title: "请输入认购人手机号",
                duration: 3000
            })
            return false
        }
        if (!this.getPhoneValidate(this.data.info.mobile)) {
            wx.showToast({
                icon: 'none',
                title: "请输入正确的手机号",
                duration: 3000
            })
            return false
        }
        if ('' == this.data.info.identityNo) {
            wx.showToast({
                icon: 'none',
                title: "请输入认购人证件号",
                duration: 3000
            })
            return false
        }
        if (this.data.info.identityNo && this.data.info.identityNo.length !== 18) {
            wx.showToast({
                icon: 'none',
                title: "认购人证件号输入有误",
                duration: 3000
            })
            return false
        }
        this.submit().then(res => {
            if (res.code === 200) {
                wx.setStorageSync('recordId', res.data.id)
                signStepChange('', 'next')
            } else {
                wx.showToast({
                    icon: 'none',
                    title: res.message,
                    duration: 3000
                })
            }
        })
    }
});
