import Api from "../../../utils/api";
import { signStepChange } from "../../../utils/util";
const app = getApp();

Page({
    data: {
        stepsNum: '',
        stepsOptions: ''
    },
    onLoad(option) {
        this.setData({
            stepsNum: getApp().globalData.signStepNum,
            stepsOptions: getApp().globalData.processArr,
            subscribeLimitTime: app.globalData.subscribeLimitTime
        })
    },
    onShow() {},
});
