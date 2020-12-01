import Api from "../../../utils/api";

const safeArea = require("../../../utils/safe-area.js");
const app = getApp();

Page({
    data: {
        isUserAuth:0,
        obj: {}
    },
    onLoad(option) {
        wx.showShareMenu({
            withShareTicket: true
        })

        // 针对 iphonex优化
        safeArea.getSafeArea();
        this.setData({
            name: wx.getStorageSync('projectInfo').name,
            ...safeArea.data
        });
        const {id = ''} = option
        let that = this
        Api.fetch({
            method: 'post',
            url: '/applet/project/getRoomBrief',
            data: {
                roomId: id
            }
        }).then((res) => {
            if (res.code === 200) {
                let sourceType = {
                   0:'住宅',
                   1:'公寓',
                   2:'洋房',
                   3:'别墅',
                   4:'商铺',
                   5:'办公',
                   6:'车位',
                   7:'产权车位',
                   8:'人防车位',
                   9:'储藏室'
                }
                res.data.records.forEach(function (item, i) {
                    if (item.imageSrcs) {
                        item.imageSrc = item.imageSrcs.split(',')[0]
                    }
                    item.sourceType = sourceType[item.sourceType]
                    item.presentTotalPrice = that.toThousands(item.presentTotalPrice)
                })
                this.setData({
                    obj: res.data.records[0]
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
    onShow() {
    },
    toThousands(num) {
        return (num || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
    },
    goBuy() {
        if (!wx.getStorageSync("customerId")) {
            // wx.navigateTo({
            //     url: '/pages/login/auth/index'
            // });
            this.setData({
                isUserAuth:1
            });
            return false
        }
        Api.fetch({
            method: 'post',
            url: '/subscribeConfig/queryConfig',
            data: {
                projectId: wx.getStorageSync('projectInfo').id,
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
                    wx.navigateTo({
                        url: "/pages/house/signStepIndex/index"
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
    showImg() {
        wx.previewImage({
            urls: ['https://yxf-bucket-01.oss-cn-beijing.aliyuncs.com/' + this.data.obj.imageSrc + '?x-oss-process=image/quality,q_70'], // 当前显示图片的http链接
        })
    },
    onShareAppMessage: function() {

    }
});
