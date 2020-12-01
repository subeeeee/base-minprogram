import Api from "../../../utils/api.js";
import safeArea from "../../../utils/safe-area.js";

Page({
    data: {
        signsData: []
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
    getSubscribeStatusName(status,endTime,subscribeLimitTime){
        let text = '--'
        switch (status) {
            case 0:
                text = '已取消'
                break
            case 1:
                text = '未认购'
                break
            case 2:
            case 3:
            case 4:
                text = '认购中'
                break
            case 5:
                text = '已完成'
                break
            default:
                break
        }
        if(0 !== subscribeLimitTime){
            let nowTime = (new Date()).getTime()
            if(((endTime - nowTime) < 0) && 5 !== status){
                text = '已取消'
            }
        }
        return text
    },
    getData() {
        Api.fetch({
            method: 'post',
            url: '/subscribeRecord/queryRecordList',
            data: {
                customerId: wx.getStorageSync('customerId')
            }
        }).then((res) => {
            if (res.code === 200) {
                res.data.map((item,index)=>{
                    item.img = 'https://yxf-bucket-01.oss-cn-beijing.aliyuncs.com/' + item.imageUrls.split(',')[0] + '?x-oss-process=image/resize,h_250'
                    if(0 === index){
                        item.isOpen = true
                    }else{
                        item.isOpen = false
                    }
                    item.showTime = ''
                    item.subscribeStatusName = this.getSubscribeStatusName(item.subscribeStatus,item.endTime,item.subscribeLimitTime)
                })
                this.setData({
                    signsData: res.data
                })
            }
        });
    },
    goDetail(e) {
        wx.navigateTo({
            url: '/pages/user/buyDetail/index?id=' + e.currentTarget.dataset.id
        });
    }
});
