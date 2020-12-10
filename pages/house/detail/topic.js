import Api from "../../../utils/api.js";
import {generalStatistical} from "../../../utils/util.js";
import {imClickfun} from "../../../utils/houseDetailCommon"

const safeArea = require("../../../utils/safe-area.js");

Page({
    data: {
        telephone: '',
        isRefresh: '',
        topicList: [],
        params: {
            pageNo: 1,
            pageSize: 10
        },
        isUserAuth:0
    },
    onLoad(options) {
        wx.showShareMenu({
            withShareTicket: true
        })
        const {houseid, telephone} = options;
        // 针对 iphonex优化
        safeArea.getSafeArea();
        this.setData({
            customerId: wx.getStorageSync("customerId"),
            houseid,
            telephone,
            ...safeArea.data
        });
        this.getData()
    },
    getData() {
        Api.fetch({
            method: 'post',
            url: '/applet/topic/pageList',
            data: {
                ...this.data.params,
                projectIds: this.data.houseid,
                type: 1
            }
        }).then((res) => {
            if (res.code === 200) {
                let data = res.data.records
                this.setData({
                    topicList: this.data.params.pageNo === 1 ? data : [...this.data.topicList, ...data],
                    isRefresh: res.data.records.length === this.data.params.pageSize
                });
            }
        });
    },
    imClickfun,
    goNexts(e) {
        let url = e.currentTarget.dataset.url
        // let webUrllist = url.split('?')
        // if (webUrllist.length > 1) {
        //     wx.navigateTo({
        //         url: '/pages/h5/index/index?webUrl=' + webUrllist[0] + '&' + webUrllist[1] + '&title=资讯&customerId=' + wx.getStorageSync('customerId')
        //     })
        // } else {
        //     wx.navigateTo({
        //         url: '/pages/h5/index/index?webUrl=' + url + '&title=资讯&customerId=' + wx.getStorageSync('customerId')
        //     })
        // }

        let webUrllist = url.split('?')
        if (webUrllist.length > 1) {
            var topicId = webUrllist[1].split('=')[1]
            wx.navigateTo({
                url: '/pages/home/activity/index?topicId=' + topicId
            })
        }
    },
    // goNexts(e) {
    //     wx.navigateTo({
    //         url: '/pages/h5/index/index?webUrl=' + getApp().globalData.activityUrl + '&title=资讯&topicId=' + e.currentTarget.dataset.id + '&customerId=' + wx.getStorageSync('customerId')
    //     })
    // },
    //  拨打电话
    telephone(e) {
        let phone = this.data.telephone
        if (e.currentTarget.dataset.phone) {
            phone = e.currentTarget.dataset.phone
        }
        this.generalStatistical({
            statisticalName:'telephoneCounseling',
            projectId: this.data.houseid,
        })
        wx.makePhoneCall({
            phoneNumber: phone,
            success(){

            }
        })
    },
    // 滚动到底部
    onReachBottom(e) {
        if (this.data.isRefresh) {
            this.setData({
                'params.pageNo': this.data.params.pageNo + 1
            });
            this.getData();
        }
    },
    onShareAppMessage: function() {

    },
    generalStatistical
});
