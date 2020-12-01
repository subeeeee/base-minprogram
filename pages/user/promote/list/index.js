import Api from "../../../../utils/api.js";
import safeArea from "../../../../utils/safe-area.js";

Page({
    data: {
        listData: '',
        pageNum:1,
        pageSize:10,
        totalPageNum:0
    },
    onLoad() {
        // 针对 iphonex优化
        safeArea.getSafeArea();
        this.setData({
            ...safeArea.data
        });
        this.getData()
    },
    onShow() {
        
    },
    async getData() {
        const res = await Api.fetch({
            method: 'post',
            url: '/applet/onlineCustomer/myCustomers',
            data: {
                "pageNum":this.data.pageNum,
                "pageSize":this.data.pageSize,
                "param": {
                  "sourceId": wx.getStorageSync('customerId')
                }
            }
        })
        if (res.code === 200) {
            let {list,pages} = res.data
            list = list.map((item,index)=>{
               this.formImg(item)
               let createTime = item.createTime
               let lastEventTime = item.lastEventTime
               item.createTime = createTime?this.formTime(createTime):''
               item.lastEventTime = lastEventTime?this.formTime(lastEventTime):''
               return item
            })
            this.setData({
                listData: this.data.pageNum === 1 ? list : [...this.data.listData,...list],
                totalPageNum:pages
            })
        }
    },
    formTime(time){
        let [dateStr,timeStr] = time.split(' ')
        let [hh,mm,ss] = timeStr.split(':')
        let [yyyy,MM,dd] = dateStr.split('-')
        timeStr = hh+":"+mm
        let date = new Date()
        
       if(yyyy==date.getFullYear()&&MM==(date.getMonth()+1)&&dd==date.getDate()){
        dateStr='今天' 
       }
       return dateStr +' '+timeStr
    },
    formImg(obj,key='headImgUrl',defaultImgName='theme@2x.png'){
        const name = obj[key];
        obj[key] =  name ? ( name.indexOf('http') != -1 ?  name : ('https://yxf-bucket-01.oss-cn-beijing.aliyuncs.com/' + name + '?x-oss-process=image/resize,h_250')) : '/images/'+defaultImgName
    },
    gotoDetail(e) {
        wx.navigateTo({
            url: `/pages/user/promote/detail/index?customerId=${e.detail}`
        });
    },
    // 滚动到底部
    onReachBottom(e) {
        if(this.data.totalPageNum>this.data.pageNum){
            this.setData({
                pageNum: this.data.pageNum + 1
            });
            this.getData();
        }
    }
});
