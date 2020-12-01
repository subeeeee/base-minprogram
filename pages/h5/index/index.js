
const app =  getApp();
Page({
    data: {
        shareUrl: "",
        webUrl: "",
        miniprogramTitle:app.globalData.miniprogramTitle
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        const {
            title = "", webUrl
        } = options;
        console.log(options)
        if (title) {
            wx.setNavigationBarTitle({
                title: title //页面标题为路由参数
            });
        }

        let webUrl1 = `${webUrl}?web=`;
        let shareUrl = `/pages/h5/index/index?webUrl=${webUrl}`;
        for (let i in options) {
            if (i !== "webUrl") {
                shareUrl += `&${i}=${options[i]}`;
                webUrl1 += `&${i}=${options[i]}`;
            }
        }
        console.log(webUrl1)
        this.setData({
            shareUrl: shareUrl,
            webUrl: webUrl1
        });
    },
    onShareAppMessage: function (options) {
        return {
            title: this.data.miniprogramTitle,
            path: this.data.shareUrl
        }
    },
});
