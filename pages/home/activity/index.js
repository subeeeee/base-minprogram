const HtmlParser = require('../../../html-view/index');
import { getUserPhone, getUserInfo } from "../../../utils/util.js";
import Api from "../../../utils/api.js";
Page({

    /**
     * 页面的初始数据
     */
    data: {
        html: '',
        isShare: false,
        userPhone: '',
        customerId: '',
        token: '',
        isfollow: false,
        isShow: false,
        isSigned: 0,
        isEnable: 1,
        topicId: null,
        projectIds: null,
        ntitle: '',
        activityBtnName: '立即报名',
        signCount: 0,
        signName: '报名',
        activityType: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(option) {
        wx.showShareMenu({
            withShareTicket: true
        });
        this.setData({
            topicId: option.topicId
        })
    },
    onShow() {

        this.setData({
            userPhone: wx.getStorageSync("userPhone") || "",
            customerId: wx.getStorageSync("customerId") || "",
            token: wx.getStorageSync("token") || ""
        });
        if (!wx.getStorageSync("customerId")) {
            //  仅仅想获取一下customerId，借用一下首页的这个  isIndexGo 参数
            wx.setStorageSync('isIndexGo', 1)
            this.getUserInfo(undefined, this.getActivityData)
        } else {
            this.getActivityData();
        }



    },
    shareFun() {
        this.setData({
            isShare: true
        })
    },
    hideShare() {
        this.setData({
            isShare: false
        })
    },
    followFunNum(e) {
        // 是否登陆
        wx.setStorageSync("state", 'follow')
        getUserPhone(e)
    },
    submitFunNum(e) {
        // 是否登陆
        wx.setStorageSync("state", 'save')
        getUserPhone(e)
    },
    async getActivityData() {
        let that = this;
        Api.fetch({
            method: 'get',
            url: '/h5/topic/getTopic',
            data: {
                topicId: this.data.topicId, //专题ID
                customerId: wx.getStorageSync("customerId")
            },
        }).then((res) => {
            if (res.code === 200) {
                if (res.data.projectIds == 0) {
                    that.setData({
                        projectIds: ''
                    })
                } else {
                    that.setData({
                        projectIds: res.data.projectIds
                    })
                };
                var htmlString = (res.data.text).replace(/span/g, "p");
                var _html = new HtmlParser(htmlString).nodes;
                if (res.data.activityType == 0 && res.data.isSigned == 1) {
                    that.setData({
                        activityBtnName: "已报名",
                        signName: "报名"
                    });
                } else if (res.data.activityType == 1 && res.data.isSigned == 1) {
                    that.setData({
                        activityBtnName: "已领取",
                        signName: "领取"
                    });
                } else if (res.data.activityType == 1 && (res.data.isSigned == 0 || res.data.isSigned == null)) {
                    that.setData({
                        activityBtnName: "立即领取",
                        signName: "领取"
                    });
                }
                that.setData({
                        isSigned: res.data.isSigned,
                        isEnable: res.data.isEnable,
                        html: _html,
                        ntitle: res.data.title,
                        signCount: res.data.signCount,
                        activityType: res.data.activityType,
                        dataJson: res.data.dataJson
                    })
                    //type;//"专题类型 1精彩资讯;2热门活动"
                if (res.data.type == 2) {
                    that.setData({
                        isShow: true
                    })
                }
                // 是否已关注
                if (res.data.isLike == 1) {
                    that.setData({
                        isfollow: true
                    })
                }
                // 重新获取数据
                if (wx.getStorageSync("state") == 'follow') {
                    wx.setStorageSync("state", '');
                    this.setFollowData()
                } else if (wx.getStorageSync("state") == 'save') {
                    wx.setStorageSync("state", '');
                    this.submitFun()
                }
            } else {
                wx.showToast({
                    title: res.msg,
                    icon: 'none',
                    duration: 3000
                })
            }
        });
    },
    setFollowData() {
        let that = this;
        var jsonData2 = {
            type: 1,
            customerId: that.data.customerId,
            topicId: that.data.topicId,
            tenantId: getApp().globalData.tenantId, //小程序
            isCancel: "",
            projectId: that.data.projectIds
        }
        if (that.data.isfollow) {
            jsonData2.isCancel = 1;
        } else {
            jsonData2.isCancel = 0;
        }
        Api.fetch({
            method: 'post',
            url: '/h5/topic/apply',
            data: JSON.stringify(jsonData2)
        }).then((res) => {
            if (res.code === 200) {
                wx.showToast({
                    title: '操作成功',
                    icon: 'none',
                    duration: 3000
                });
                if (that.data.isfollow) {
                    that.setData({
                        isfollow: false
                    })
                } else {
                    that.setData({
                        isfollow: true
                    })
                }
            } else {
                wx.showToast({
                    title: res.msg,
                    icon: 'none',
                    duration: 3000
                })
            }
        });
    },
    submitFun() {
        if (this.data.isSigned == 1) return;
        if (this.data.isEnable != 1) {
            wx.showToast({
                title: '活动已失效',
                icon: 'none',
                duration: 2000
            })
            return
        };
        if (this.data.activityType) {
            if (this.data.dataJson) {
                wx.navigateTo({
                    url: '/pages/home/activity/customapply?projectIds=' + this.data.projectIds + '&topicId=' + this.data.topicId + '&type=3'
                })
            } else {
                this.saveCoupon();
            }
        } else {
            if (this.data.dataJson) {
                wx.navigateTo({
                    url: '/pages/home/activity/customapply?projectIds=' + this.data.projectIds + '&topicId=' + this.data.topicId + '&type=2'
                })
            } else {
                wx.showToast({
                    title: '活动报名表单未配置',
                    icon: 'none',
                    duration: 2000
                })
            }
        }
        // if (this.data.activityType) {
        //     wx.navigateTo({
        //         url: '/pages/home/activity/coupon?projectIds=' + this.data.projectIds + '&topicId=' + this.data.topicId
        //     })
        // } else {
        //     wx.navigateTo({
        //         url: '/pages/home/activity/apply?projectIds=' + this.data.projectIds + '&topicId=' + this.data.topicId
        //     })
        // }
    },
    saveCoupon() {
        var obj = {};
        obj.customerId = this.data.customerId || wx.getStorageSync("customerId");
        obj.topicId = this.data.topicId;
        obj.tenantId = getApp().globalData.tenantId;
        obj.type = 3;
        obj.projectId = this.data.projectIds;
        obj.isCancel = 0;
        Api.fetch({
            method: 'post',
            url: '/h5/topic/apply',
            data: obj
        }).then((res) => {
            if (res.code === 200) {
                wx.showToast({
                    title: '领取成功',
                    duration: 2000
                })
            } else {
                wx.showToast({
                    title: res.msg,
                    icon: 'none',
                    duration: 3000
                })
            }
        });
    },
    onShareAppMessage: function() {

    },
    getUserPhone,
    getUserInfo
})