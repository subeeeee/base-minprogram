
const app =  getApp();
Component({
    properties: {
        projectData: {
            type: Object,
            observer(newVal) {
                this.setData({
                    recommend: newVal
                })
            }
        }
    },
    data: {
        imgServerUrl:app.globalData.imgServerUrl,
        cdnUrl:app.globalData.cdnUrl
    },
    methods: {
        // 前往楼盘详情
        goHouse(e) {
            var houseid = e.currentTarget.dataset.houseid
            wx.navigateTo({
                url: '/pages/house/detail/index?houseid=' + houseid
            })
        }
    }
});
