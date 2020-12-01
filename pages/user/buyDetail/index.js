import Api from "../../../utils/api.js";
import safeArea from "../../../utils/safe-area.js";
import { signStepChange } from "../../../utils/util";
var timer = null
Page({
    data: {
        info: {}
    },
    onLoad(options) {
        // 针对 iphonex优化
        safeArea.getSafeArea();
        this.setData({
            ...safeArea.data
        });
        this.getData(options.id)
    },
    onShow() {},
    goAgreement() {
        let params = 'id='
        let url = getApp().globalData.h5DoMain + '/wxapph5/personalSign.html'
        params += this.data.info.contractId
        params += '&mobile='
        params += this.data.info.mobile
        params += '&projectId='
        params += this.data.info.projectId
        wx.navigateTo({
            url: '/pages/h5/index/index?webUrl=' + url + '&title=协议&' + params
        })
    },
    clearTimer(){
        this.data.info.timer && clearInterval(this.data.info.timer)
        this.data.info.timer = null
    },
    showTimer(){
        let endTime = this.data.info.endTime
        let nowTime = (new Date()).getTime()
        let timeRemaining = endTime - nowTime
        if(timeRemaining < 0 || 0 === this.data.info.subscribeStatus){
            this.setData({
                'info.showTime': ''
            })
            this.clearTimer()
            if(5 !== this.data.info.subscribeStatus){
                this.setData({
                    'info.subscribeStatusName': '已取消'
                })
            }
            return false
        }
        let h = parseInt(timeRemaining / 3600000)
        let hR = timeRemaining % 3600000
        let m = parseInt(hR / 60000)
        let mR = hR % 60000
        let s = parseInt(mR / 1000)
        h = h > 9 ? '' + h : '0' + h
        m = m > 9 ? '' + m : '0' + m
        s = s > 9 ? '' + s : '0' + s
        this.setData({
            'info.showTime': h + ':' + m + ':' + s
        })
    },
    setTimer(){
        if(0 === this.data.info.subscribeLimitTime){
            this.setData({
                'info.showTime': ' '
            })
            return false
        }
        this.showTimer()
        timer = setInterval(()=>{
            this.showTimer()
        },1000)
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
    goOn() {
        Api.fetch({
            method: 'post',
            url: '/subscribeConfig/queryConfig',
            data: {
                projectId: this.data.info.projectId
            }
        }).then((res) => {
            if (res.code === 200) {
                var newArr = [];
                res.data.processArr.forEach(function(item) {
                    switch (item) {
                        case "1":
                            newArr.push({
                                id:1,
                                title: '填写信息'
                            })
                            break
                        case "2":
                            newArr.push({
                                id:2,
                                title: '选定房源'
                            })
                            break
                        case "3":
                            newArr.push({
                                id:3,
                                title: '费用缴纳'
                            })
                            break
                        case "4":
                            newArr.push({
                                id:4,
                                title: '签署协议'
                            })
                            break
                        case "5":
                            newArr.push({
                                id:5,
                                title: '完成认购'
                            })
                            break
                        default:
                            break
                    }
                });
                let nowStep = this.data.info.subscribeStatus
                wx.setStorageSync("projectInfo",{
                    name:this.data.info.projectName,
                    id:this.data.info.projectId,
                    developers:this.data.info.developers || '--'
                })
                let idx = newArr.findIndex((item)=> nowStep == item.id)
                let idx2 =  newArr.findIndex((item)=>2 == item.id) // 选房索引
                let idx3 =  newArr.findIndex((item)=>3 == item.id) // 缴费索引
                if((4 == nowStep || 3 == nowStep) && (idx2 < idx3)){
                    Api.fetch({
                        url: "/signResult/getSignParams/" + this.data.info.id,
                    }).then(data => {
                        wx.setStorageSync('contractId', data.data.contractId)
                        wx.setStorageSync('contractMobile', data.data.contact)

                        wx.setStorageSync('projectInfo', {
                            name: this.data.info.projectName,
                            id: this.data.info.projectId,
                            developers: this.data.info.developers
                        })
                        getApp().globalData.signStepNum = idx
                        wx.setStorageSync('recordId',this.data.info.id)
                        wx.setStorageSync('payId',this.data.info.id)
                        getApp().globalData.processArr = newArr
                        getApp().globalData.payAmount = this.data.info.payAmount
                        signStepChange('', 'next',false)

                    })
                }else{
                    wx.setStorageSync('projectInfo', {
                        name: this.data.info.projectName,
                        id: this.data.info.projectId,
                        developers: this.data.info.developers
                    })
                    getApp().globalData.signStepNum = idx
                    wx.setStorageSync('recordId',this.data.info.id)
                    wx.setStorageSync('payId',this.data.info.id)
                    getApp().globalData.processArr = newArr
                    getApp().globalData.payAmount = this.data.info.payAmount
                    signStepChange('', 'next',false)
                }
            }
        });
    },
    getData(id) {
        Api.fetch({
            method: 'post',
            url: '/subscribeRecord/queryRecordList',
            data: {
                id: id,
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
                    info: res.data[0]
                })
                if(this.data.info.isOpen){
                    this.setTimer()
                }
            }
        });
    },
});
