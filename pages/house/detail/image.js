import Api from "../../../utils/api.js";
import { previewImage,generalStatistical } from '../../../utils/util';
import {imClickfun} from "../../../utils/houseDetailCommon"
const safeArea = require("../../../utils/safe-area.js");

const app =  getApp();
Page({
    data: {
        modelroom: [],
        effect: [],
        communitymatching: [],
        realmap: [],
        shoulou: [],
        imageList: [],
        isUserAuth:0,
        cdnUrl:app.globalData.cdnUrl,
        globalData: app.globalData.projectName
    },
    onLoad(options) {
        const { houseid = "", telephone = '', imageList = '' } = options;
        let n = []
        if (imageList) {
            imageList.split(',').forEach( (item)=> {
                n.push(this.data.cdnUrl + item + '?x-oss-process=image/resize,h_250')
            })
            this.setData({
                imageList: n
            })
        }
        // 针对 iphonex优化
        safeArea.getSafeArea();
        this.setData({
            houseid: houseid,
            telephone: telephone,
            ...safeArea.data
        }, this.getdetailFun);
    },
    getdetailFun() {
        const { houseid = '' } = this.data;

        Api.fetch({
            method: 'get',
            url: '/applet/project/getProjectAlbum',
            showLoading: true,
            data: {
                projectId: houseid
            }
        }).then(({ code, data = [] }) => {
            if (code === 200) {
                let n1 = []
                let n2 = []
                let n3 = []
                let n4 = []
                let n5 = []
                data.forEach( (item, i)=> {
                    item.uri = this.data.cdnUrl + item.uri + '?x-oss-process=image/resize,h_250';
                    if (item.pictureType === 0) {
                        n1.push(item.uri)
                    } else if (item.pictureType === 1) {
                        n2.push(item.uri)
                    } else if (item.pictureType === 2) {
                        n3.push(item.uri)
                    } else if (item.pictureType === 3) {
                        n4.push(item.uri)
                    } else {
                        n5.push(item.uri)
                    }
                })
                this.setData({
                    modelroom: n1,
                    effect: n2,
                    communitymatching: n3,
                    realmap: n4,
                    shoulou: n5,
                })
            }
        });
    },
    imClickfun,
    //  拨打电话
    telephone(e) {
        this.generalStatistical({
            statisticalName:'telephoneCounseling',
            projectId: this.data.houseid,
        })
        wx.makePhoneCall({
            phoneNumber: this.data.telephone,
        })
    },
    previewImage,
    generalStatistical
})
