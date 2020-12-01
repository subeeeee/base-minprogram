import Api from "../../../utils/api";
import { signStepChange } from "../../../utils/util";
const app = getApp();

Page({
    data: {
        images:[],
        modeName1: '',
        roomInfo: {
            id: null,
            buildingInfo: {}
        },
        projectInfo: {}
    },
    onLoad(options) {
        if (options.room) {
            let roomInfo = JSON.parse(decodeURI(options.room))
            this.setData({
                roomInfo: roomInfo,
                modeName1: this.modeName(roomInfo.sourceType)
            })
        }
        this.setData({
            projectInfo: wx.getStorageSync('projectInfo')
        })
        this.initBanner()
    },
    onShow() {},
    modeName(data) {
        // 住宅 商铺 别墅  储藏室 车位 公寓 写字楼
        let txt = '--'
        switch (data) {
            case 0:
                txt = '住宅'
                break
            case 1:
                txt = '商铺'
                break
            case 2:
                txt = '别墅'
                break
            case 3:
                txt = '储藏室'
                break
            case 4:
                txt = '车位'
                break
            case 5:
                txt = '公寓'
                break
            case 6:
                txt = '写字楼'
                break
            default:
                break
        }
        return txt
    },
    initBanner(){
        Api.fetch({
            url: "/applet/project/getRoomPatternImages?patternId=" + this.data.roomInfo.roomPatternId,
        }).then(res => {
            if (res.code === 200) {
                this.setData({
                    images: res.data
                })
            } else {
                wx.showToast({
                    title: res.message,
                    icon: 'none',
                    duration: 3000
                });
            }
        })
    },
    back() {
        wx.navigateBack()
    },
    ok() {
        let arr = []
        arr.push(this.data.roomInfo.buildingInfo.name)
        arr.push(this.data.roomInfo.viewUnitNumber)
        arr.push(this.data.roomInfo.roomName)
        wx.setStorageSync('roomInfo', {
            name: arr.join('-'),
            id: this.data.roomInfo.roomId,
            outArea: this.data.roomInfo.outArea,
            presentTotalPrice: this.data.roomInfo.presentTotalPrice
        })
        wx.navigateBack({
            delta: 2
        });
    }
});
