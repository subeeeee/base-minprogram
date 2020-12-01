import Api from "../../../utils/api.js";
import {generalStatistical} from "../../../utils/util";
import {imClickfun} from "../../../utils/houseDetailCommon"

const safeArea = require("../../../utils/safe-area.js");
const app =  getApp();
Page({
    data: {
        tabInd: 0,
        houseid: '',
        telephone: '',
        patternList: [],
        tabs: [],
        isUserAuth:0,
        imgServerUrl:app.globalData.imgServerUrl,
        globalProjectName:app.globalData.projectName,
        cdnUrl:app.globalData.cdnUrl
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
            telephone,
            houseid,
            ...safeArea.data
        });
        Api.fetch({
            method: 'post',
            url: '/applet/project/getRoomPattern',
            data: {
                projectId: this.data.houseid,
                pageSize: 9999
            }
        }).then((res) => {
            if (res.code === 200) {
                let n = [
                    {
                        name: '一室',
                        count: 0,
                        id: 1
                    },
                    {
                        name: '二室',
                        count: 0,
                        id: 2
                    },
                    {
                        name: '三室',
                        count: 0,
                        id: 3
                    },
                    {
                        name: '四室',
                        count: 0,
                        id: 4
                    },
                    {
                        name: '五室',
                        count: 0,
                        id: 5
                    },
                    {
                        name: '五室以上',
                        count: 0,
                        id: 6
                    },
                ]
                
                res.data.records.forEach( (item) => {
                    let imageSrcs = []
                    if (item.imageSrcs) {
                        console.log(item.imageSrcs)
                        item.imageSrcs.split(',').forEach( (obj)=> {
                            imageSrcs.push(this.data.cdnUrl + obj + '?x-oss-process=image/resize,h_250')
                        })
                    }
                    item.imageSrcs = imageSrcs
                    
                    if(item.roomCount){
                        n[item.roomCount - 1].count += 1
                    }
                })
                let b = []
                n.forEach(function (item) {
                   if (item.count !== 0) {
                       b.push(item)
                   }
                })
                this.setData({
                    patternList: res.data.records,
                    tabs: b,
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
    imClickfun,
    tabChange(e) {
        this.setData({
            tabInd: e.currentTarget.dataset.ind
        })
    },
    //  预览图片
    showPreview(e) {
        let url = e.currentTarget.dataset.src
        url.forEach(function (item, i) {
            url[i] = item.split('?')[0] + '?x-oss-process=image/quality,q_70'
        })
        wx.previewImage({
            urls: url
        })
    },
    //  拨打电话
    telephone(e) {
        this.generalStatistical({
            statisticalName:'telephoneCounseling',
            projectId: this.data.projectId,
        })
        wx.makePhoneCall({
            phoneNumber: this.data.telephone
        })
    },
    onShareAppMessage: function() {

    },
    generalStatistical
});
