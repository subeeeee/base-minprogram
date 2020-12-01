import Api from "../../../utils/api.js";
import safeArea from "../../../utils/safe-area.js";
import drawQrcode from '../../../utils/weapp.qrcode.esm.js'

Page({
    data: {
        listData: {},
        ruleText: '',
        rule: true,
        couponName:''
    },
    onLoad() {
        // 针对 iphonex优化
        safeArea.getSafeArea();
        this.setData({
            ...safeArea.data
        });
    },
    onShow() {
        this.getData()
    },
    getData() {
        Api.fetch({
            method: 'post',
            url: '/applet/act/coupon/userList',
            data: {
                pageSize:  9999
            }
        }).then((res) => {
            if (res.code === 200) {
                res.data.records.forEach(function (item, i) {
                    if (item.state==0) {
                        item.state = '未使用'; 
                    }else if(item.state==1){
                        item.state = '已使用';
                    }else if(item.state==2){
                        item.state = '已失效';
                    }
                })
                this.setData({
                    listData: res.data.records
                })
            }
        });
    },
    getCode(codeInfo){
        drawQrcode({
          width: 200,
          height: 200,
          canvasId: 'myQrcode',
          ctx: wx.createCanvasContext('myQrcode'),
          text: '/pages/user/coupon/check?'+codeInfo.couponCode+'&'+codeInfo.onlineCustomerId+'&'+codeInfo.projectId+'&'+codeInfo.tenantId+'&'+codeInfo.actWinningLogId
        })
    },
    closeRule() {
        this.setData({
            ruleText: '',
            rule: true
        })
    },
    remindHide() {
        this.setData({
            rule: true
        })
    },
    showRule(e) {
        if(e.currentTarget.dataset.code){
            this.getCode(e.currentTarget.dataset.code);
        }
        this.setData({
            ruleText: e.currentTarget.dataset.rule,
            ruleCode:e.currentTarget.dataset.code.couponCode,
            couponName:e.currentTarget.dataset.name,
            rule: false
        })
    },
});
