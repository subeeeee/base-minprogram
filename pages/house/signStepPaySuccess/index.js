import Api from "../../../utils/api";
import { signStepChange } from "../../../utils/util";
const app = getApp();

Page({
    data: {
        showNext:true,
        rData:{
            "orderNo": "", // 订单号
            "payAmount": 0.00, // 定金金额
            "lastModifyTime": "", // 交易时间
            "roomName": "" // 房源
        }
    },
    onLoad(options) {
        if(1 == options.hideBtn){
            this.setData({
                showNext: false
            })
        }
        Api.fetch({
            url: "/payResult/queryPayResult",
            method: "POST",
            data: {
                id: options.id
            },
        }).then(res => {
              this.setData({
                  rData: res.data
              })
        })
    },
    onShow() {},
    nextPage() {
        signStepChange('', 'next')
    }
});
