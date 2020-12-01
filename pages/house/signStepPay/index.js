import Api from "../../../utils/api";
import { signStepChange } from "../../../utils/util";
const app = getApp();

Page({
    data: {
        developers: '',
        payId:null,
        payAmount: '',
        stepsNum: '',
        stepsOptions: '',
        payInfo: {
            provider: '', //服务提供商，通过 uni.getProvider 获取。
            orderInfo: '', //订单数据，注意事项
            timeStamp: '', // 时间戳
            nonceStr: '', // 随机字符串，长度为32个字符以下。
            package: '', // 统一下单接口返回的 prepay_id 参数值，提交格式如：prepay_id=xx。
            signType: '', // 签名算法，暂支持 MD5。
            paySign: '' // 签名，具体签名方案参见 微信小程序支付文档
        },
    },
    onLoad(option) {
        // 获取支付参数
        this.setData({
            developers: wx.getStorageSync('projectInfo').developers,
            payAmount: getApp().globalData.payAmount,
            stepsNum: getApp().globalData.signStepNum,
            stepsOptions: getApp().globalData.processArr,
            payId: wx.getStorageSync('recordId')
        })
        if(3 === getApp().globalData.processArr.findIndex(item => item.id == 3)){
            this.setData({
                stepsNum: 4
            })
            getApp().globalData.signStepNum = 4
        }
        Api.fetch({
            url: "/wxPay/orderPay",
            method: "POST",
            data: {
                "id": this.data.payId // 支付记录id
            },
            host: "pay"
        }).then(res => {
            this.setData({
                payInfo: res.data
            })
        })
    },
    onShow() {},
    prevPage() {
        signStepChange('?id=15', 'prev')
    },
    nextPage() {
        wx.requestPayment({
            ...this.data.payInfo,
            success:(res)=>{
                wx.redirectTo({
                    url: "/pages/house/signStepPaySuccess/index?id=" + this.data.payId
                })
            },
            fail:(res)=>{
                console.log(res,"支付失败")
            }
        })
    }
});
