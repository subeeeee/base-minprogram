import Api from "../../../../utils/api.js";
import safeArea from "../../../../utils/safe-area.js";

Page({
    data: {
        listData: [],
        linkObj:{
            0:'/pages/house/detail/index', //项目
            1:'',
            2:'/pages/activity/index',   //活动
            3:'/pages/house/memberDetail/index',
            4:'/pages/activity/index',   //文章
        },
        pageNum:1,
        pageSize:10,
        totalPageNum:0,
        userDetail:[]
    },
    onLoad(options) {
        // 针对 iphonex优化
        safeArea.getSafeArea();
        this.setData({
            ...safeArea.data,
            customerId:options.customerId
        });
        this.getData()
    },
    onShow() {
        
    },
    async getData() {
        const res = await Api.fetch({
            method: 'post',
            url: '/applet/onlineCustomer/events',
            data: {
                customerId: this.data.customerId,
                "pageNo":this.data.pageNum,
                "pageSize":this.data.pageSize,
                "webGetType":1,
                "operateActions":[]
                //Array(28).fill(0).map((i,idx)=>idx+1)
            }
        })
        if (res.code === 200) {
            // res.data.map((item,index)=>{
            //     item.img = 'https://yxf-bucket-01.oss-cn-beijing.aliyuncs.com/' + item.imageUrls.split(',')[0] + '?x-oss-process=image/resize,h_250'
            // })
            let {records,totalNum,pageSize} = res.data.events
            if(res.data&&res.data.customer){
                let customer = res.data.customer
                let createTime = customer.createTime
                let lastEventTime = customer.lastEventTime
                customer.createTime = createTime?this.formTime(createTime):''
                customer.lastEventTime = lastEventTime?this.formTime(lastEventTime):''
            }

            records = records&&records.map((item,index)=>{
                let lastModifyTime = item.lastModifyTime
                item.lastModifyTime = lastModifyTime?this.formTime(lastModifyTime):''
                return item
             })


            this.setData({
                listData: this.data.pageNum === 1 ? records : [...this.data.listData,...records],
                totalPageNum:Math.ceil(totalNum/pageSize),
                userDetail:[res.data.customer]
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
    gotoDetail(e) {
    },
    gotoOther(e){
        //id 可能是项目id，顾问id，或者活动id，或者文章id
       const {type,id,projectid} = e.currentTarget.dataset
       console.log(e.currentTarget.dataset)
       let url = this.data.linkObj[type]
       //不同的跳转地址需要的url上的key不同，定义一个数组
       const keyArr=['houseid','','topicId','propertyid','topicId']
       const key=keyArr[type]
        if(key){
            
            wx.navigateTo({
                url: url+`?${key}=${id}&type=project&hid=${projectid}`
            });
        }
    },
    // 滚动到底部
    onReachBottom(e) {
        console.log(this.data.totalPageNum)
        if(this.data.totalPageNum>this.data.pageNum){
            this.setData({
                pageNum: this.data.pageNum + 1
            });
            this.getData();
        }
    }
});
