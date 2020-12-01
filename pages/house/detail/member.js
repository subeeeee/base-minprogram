import Api from "../../../utils/api.js";
import {generalStatistical} from "../../../utils/util.js";
const safeArea = require("../../../utils/safe-area.js");
const app =  getApp();
Page({
    data: {
        isRefresh: '',
        houseid: '',
        telephone: '',
        memberList: [],
        params: {
            pageNo: 1,
            pageSize: 10
        },
        isUserAuth:0,
        imgServerUrl:app.globalData.imgServerUrl,
        globalProjectName:app.globalData.projectName,
        cdnUrl:app.globalData.cdnUrl
    },
    generalStatistical,
    onLoad(options) {
        wx.showShareMenu({
            withShareTicket: true
        })
        const {houseid, telephone} = options;
        // 针对 iphonex优化
        safeArea.getSafeArea();
        this.setData({
            telephone,
            houseid,
            ...safeArea.data
        });
        this.getData()
    },
    memberDetail(e) {
        let id = e.currentTarget.dataset.id
        wx.navigateTo({
            url: `/pages/house/memberDetail/index?propertyid=${id}&type=project&hid=${this.data.houseid}`
        });
    },
    imClickfun(e) {
        if (!wx.getStorageSync("customerId")) {
            // wx.navigateTo({
            //     url: '/pages/login/auth/index'
            // });
            this.setData({
                isUserAuth:1
            });
            return false
        }
        wx.navigateTo({
            url: `/packageIm/pages/main/index?memberid=${e.currentTarget.dataset.id}&houseid=${this.data.houseid}`
        });
    },
    getData() {
        Api.fetch({
            method: 'post',
            url: '/applet/member/pageList',
            data: {
                ...this.data.params,
                projectId: this.data.houseid
            }
        }).then((res) => {
            if (res.code === 200) {
                let data = res.data.records
                data.forEach(function (item) {
                    item.headImgUrl = item.headImgUrl ? (item.headImgUrl.indexOf('http') != -1 ? item.headImgUrl : ('https://yxf-bucket-01.oss-cn-beijing.aliyuncs.com/' + item.headImgUrl + '?x-oss-process=image/resize,h_250')) : '/images/theme@2x.png'
                })
                this.setData({
                    memberList: this.data.params.pageNo === 1 ? data : [...this.data.memberList, ...data],
                    isRefresh: res.data.records.length === this.data.params.pageSize
                });
            }
        });
    },
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
            phoneNumber: phone
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

    }
});
