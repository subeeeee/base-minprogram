import moment from "../../../utils/moment";
import Api from "../../../utils/api";
const app = getApp();

Page({
    data: {
        obj: {
            isAble: '',
            projectId: '',
            projectName: '',
            customerId: '',
            name: '',
            mobile: '',
            appointmentDate: '',
            sex: 1,
        },
        start: '',
        isShow: false,
        imgs: [],
        imgs1: [],
        gender: ['男', '女'],
        imgServerUrl:app.globalData.imgServerUrl,
        globalProjectName:app.globalData.projectName,
        cdnUrl:app.globalData.cdnUrl
    },
    onLoad(option) {
        this.setData({
            start: moment().format('YYYY-MM-DD'),
            isVerify: option.isVerify,
            isShow: option.isVerify == 1 ? true : false,
            obj: {
                isAble: '',
                appointmentDate: moment().format('YYYY-MM-DD'),
                projectId: option.projectId,
                projectName: option.projectName,
                customerId: wx.getStorageSync("customerId"),
                name: wx.getStorageSync("userinfoLogin").nickName,
                mobile: wx.getStorageSync("userPhone"),
                sex: wx.getStorageSync("userinfoLogin").sex === '1' ? 0 : 1,
            }
        })
    },
    onShow() {},
    back() {
        wx.navigateBack()
    },
    showChange() {
        this.setData({
            isShow: false
        })
    },
    removeImg(e) {
        let {index, key} = e.currentTarget.dataset
        let imgs = JSON.parse(JSON.stringify(this.data[key]))
        imgs.splice(index, 1)
        this.setData({
            [key]: imgs
        })
    },
    upload(e) {
        let {key} = e.currentTarget.dataset
        let that = this
        wx.chooseImage({
            success (res) {
                const tempFilePaths = res.tempFilePaths
                Api.uploadFile({
                    url: '/uploadImage?biz=1',
                    ContentType: true,
                    filePath: tempFilePaths[0],
                    name: 'pic',
                    header: {
                        'Content-Type': 'application/json;charset=UTF-8',
                        tenantId: getApp().globalData.tenantId,
                        customerId: wx.getStorageSync("customerId")
                    },
                    method: 'post',
                    success(res) {
                        let imgs = that.data[key]
                        if (JSON.parse(res.data).code === 200) {
                            imgs.push(JSON.parse(res.data).data.url)
                            that.setData({
                                [key]: imgs
                            })
                        } else {
                            wx.showToast({
                                title: res.msg,
                                icon: 'none',
                                duration: 3000
                            })
                        }
                    }
                })
            }
        })

    },
    bindDateChange: function(e) {
        this.setData({
            'obj.appointmentDate': e.detail.value
        })
    },
    bindPickerChange: function(e) {
        this.setData({
            'obj.sex': e.detail.value
        })
    },
    mobileChange: function(e) {
        this.setData({
            'obj.mobile': e.detail.value
        })
    },
    nameChange: function(e) {
        this.setData({
            'obj.name': e.detail.value
        })
    },
    yuyueSubmit(){
        let obj = this.data.obj
        if(!(/^1[3456789]\d{9}$/.test(obj.mobile))){
            wx.showToast({
                title: '手机号有误',
                duration:3000,
                icon:'none'
            })
            return false;
        }
        obj.sex = (Number(obj.sex) + 1)
        obj.verificationPicture = this.data.imgs.concat(this.data.imgs1).join(',')
        Api.fetch({
            method: 'post',
            url: '/customerAppointment/saveCustomerAppointment',
            data: obj
        }).then((res) => {
            if (res.code === 200) {
                wx.showToast({
                    title: this.data.isVerify == 1 ? '资料提交成功' : '预约成功',
                    duration:2000
                })
                setTimeout(function () {
                    wx.navigateBack()
                }, 2000)
            } else {
                wx.showToast({
                    title: res.message,
                    icon: 'none',
                    duration: 3000
                })
            }
        });
    },
});
