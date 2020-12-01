import Api from "../../../utils/api.js";
import safeArea from "../../../utils/safe-area.js";
const app =  getApp();
Page({
    data: {
        ind: 1,
        list1: [],
        list2: [],
        imgServerUrl:app.globalData.imgServerUrl,
        globalProjectName:app.globalData.projectName,
    },
    onLoad() {
        // 针对 iphonex优化
        safeArea.getSafeArea();
        this.setData({
            ...safeArea.data
        });
    },
    onShow() {
        this.getData1()
    },
    indChange(e) {
        this.setData({
            ind: Number(e.currentTarget.dataset.type)
        })
    },
    getData1() {
        Api.fetch({
            method: 'post',
            url: '/applet/collection/likeProjectList',
            data: {
                collectionTypes: '1,2,3',
                pageSize: 1000
            }
        }).then((res) => {
            if (res.code === 200) {
                res.data.records.forEach(function (item, i) {
                    if (item.imageUrls) {
                        item.imageUrls = item.imageUrls.split(',')
                    }
                    if (item.sellPoint) {
                        if (item.sellPoint.indexOf('，') !== -1) {
                            item.sellPoint = item.sellPoint.split('，')
                        } else {
                            item.sellPoint = item.sellPoint.split(' ')
                        }
                    }
                })
                this.setData({
                    list1: res.data.records
                })
            } else {
                wx.showToast({
                    title: res.message,
                    icon: 'none',
                    duration: 3000
                })
            }
        });
        Api.fetch({
            method: 'post',
            url: '/applet/topic/pageList',
            data: {
                //type: 1,
                isLike: 1
            }
        }).then((res) => {
            if (res.code === 200) {
                this.setData({
                    list2: res.data.records
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
    // 前往详情
    goDetail(e) {
       let {isShow} =e.currentTarget.dataset.item
        if(!isShow){
            wx.showToast({
                title: '项目已下线',
                icon: 'none',
                duration: 2000
            })
            return
        }
        wx.navigateTo({
            url: `/pages/house/detail/index?houseid=${e.currentTarget.dataset.houseid}`
        });
    },
    goDetail1(e) {
        let url = e.currentTarget.dataset.url

        let webUrllist = url.split('?')
        if (webUrllist.length > 1) {
            var topicId = webUrllist[1].split('=')[1]
            wx.navigateTo({
                url: '/pages/activity/index?topicId=' + topicId
            })
        } else {
            wx.navigateTo({
                url: '/pages/h5/index/index?webUrl=' + url + '&customerId=' + wx.getStorageSync('customerId')
            })
        }
    }
});
