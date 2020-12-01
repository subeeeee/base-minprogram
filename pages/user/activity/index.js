import Api from "../../../utils/api.js";
import safeArea from "../../../utils/safe-area.js";

Page({
    data: {
        list: []
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
            url: '/applet/topic/pageList',
            data: {
                // type: 2,
                isSigned: 1
            }
        }).then((res) => {
            if (res.code === 200) {
                this.setData({
                    list: res.data.records
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
    goDetail(e) {
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
