import Api from "../../../utils/api";
import { signStepChange } from "../../../utils/util";
const app = getApp();

Page({
    data: {
        stepsOptions: []
    },
    onLoad(option) {},
    onShow() {
        getApp().globalData.signStepNum = 1
        wx.removeStorageSync("roomInfo")
        wx.removeStorageSync("recordId")
        this.initsignStepFun()
    },
    toSignInputInfo() {
        wx.redirectTo({
            url: "/pages/house/signStepInputInfo/index"
        })
    },
    initsignStepFun() {
        Api.fetch({
            method: 'post',
            url: '/subscribeConfig/queryConfig',
            data: {
                projectId: wx.getStorageSync("projectInfo").id
            }
        }).then(res => {
            if (res.code === 200) {
                var newArr = [];
                res.data.processArr.forEach(function(item) {
                    switch (item) {
                        case "1":
                            newArr.push({
                                id:1,
                                title: '填写信息'
                            })
                            break
                        case "2":
                            newArr.push({
                                id:2,
                                title: '选定房源'
                            })
                            break
                        case "3":
                            newArr.push({
                                id:3,
                                title: '费用缴纳'
                            })
                            break
                        case "4":
                            newArr.push({
                                id:4,
                                title: '签署协议'
                            })
                            break
                        case "5":
                            newArr.push({
                                id:5,
                                title: '完成认购'
                            })
                            break
                        default:
                            break
                    }
                });

                this.setData({
                    stepsOptions: newArr
                })
                app.globalData.processArr = newArr
                app.globalData.payAmount = res.data.payAmount
                app.globalData.subscribeLimitTime = res.data.subscribeLimitTime
            } else {
                wx.showToast({
                    icon: 'none',
                    title: res.message,
                    duration: 3000
                })
            }
        }).catch(err=>{
            console.log(err)
        })
    }
});
