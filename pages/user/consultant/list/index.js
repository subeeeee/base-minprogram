import Api from "../../../../utils/api.js";
import safeArea from "../../../../utils/safe-area.js";
import {generalStatistical} from "../../../../utils/util"
const app =  getApp();
Page({
    data: {
        // {
        //     projectName:'张伟',
        //     icon:'/images/theme@2x.png'
        // }
        listData: '',
        pageNum:1,
        pageSize:10,
        totalPageNum:0,
        imgServerUrl:app.globalData.imgServerUrl,
        globalProjectName:app.globalData.projectName,
        cdnUrl:app.globalData.cdnUrl
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
       // this.getData()
    },
    async getData() {
        const res = await Api.fetch({
            method: 'post',
            url: '/applet/onlineCustomer/myMembers',
            data: {
                "pageNum":this.data.pageNum,
                "pageSize":this.data.pageSize,
                "param": {
                  "customerId": wx.getStorageSync('customerId')
                }
            }
        })
        if (res.code === 200) {
            const {list,pages} = res.data;
            list.map((item,index)=>{
                this.formImg(item)
            })
            this.setData({
                listData: this.data.pageNum === 1 ? list : [...this.data.listData,...list],
                totalPageNum:pages
            })
        }
    },
    formImg(obj,key='headImgUrl',defaultImgName='theme@2x.png'){
        const name = obj[key];
        obj[key] =  name ? ( name.indexOf('http') != -1 ?  name : ('https://yxf-bucket-01.oss-cn-beijing.aliyuncs.com/' + name + '?x-oss-process=image/resize,h_250')) : '/images/'+defaultImgName
    },
    // 滚动到底部
    onReachBottom(e) {
        if(this.data.totalPageNum>this.data.pageNum){
            this.setData({
                pageNum: this.data.pageNum + 1
            });
            this.getData();
        }
    },
    imClickfun(e) {
        let id = e.currentTarget.dataset.id
        let projectId = e.currentTarget.dataset.projectId
        this.generalStatistical({
            statisticalName:'onlineConsulting',
            projectId,
        })
        if (id) {
            wx.navigateTo({
                url: `/packageIm/pages/main/index?memberid=${id}&houseid=${projectId}`
            });
        } else {
            Api.fetch({
                method: 'get',
                url: '/applet/member/getMemberCycle',
                data: {
                    projectId,
                }
            }).then((res) => {
                if (res.code === 200) {
                    if (res.data) {
                        wx.navigateTo({
                            url: `/packageIm/pages/main/index?memberid=${res.data.memberId}&houseid=${projectId}`
                        });
                    } else {
                        wx.showToast({
                            title: '该项目暂无置业顾问！',
                            icon: 'none',
                            duration: 3000
                        })
                    }
                } else {
                    wx.showToast({
                        title: res.message,
                        icon: 'none',
                        duration: 3000
                    })
                }
            });
        }

    },
    //  拨打电话
    telephone(e) {
        this.generalStatistical({
            statisticalName:'telephoneCounseling',
            projectId: this.data.houseid,
        })
        wx.makePhoneCall({
            phoneNumber: e.currentTarget.dataset.phone,
        })
    },
    generalStatistical,
    gotoCard(e){
        let id = e.currentTarget.dataset.id
        let projectid = e.currentTarget.dataset.projectid
        let  url=`/pages/house/memberDetail/index?propertyid=${id}&type=project&hid=${projectid}`
        wx.navigateTo({
            url
        })
    },
});
