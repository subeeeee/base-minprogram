import Api from '../../../utils/api.js';

Page({
    data: {
        array: [],
        array1: [],
        projectName: '请选择项目',
        projectId: '',
        type: null
    },
    onLoad(option) {
        this.setData({
            type: Number(option.type)
        })
        wx.showLoading();
        Api.getHouseList({
            pageNo: 1,
            pageSize: 9999
        }).then((res) => {
            wx.hideLoading();
            if (res.code === 200) {
                this.setData({
                    array: res.data.records
                })
            } else {
                wx.showToast({
                    title: res.message,
                    icon: 'none',
                    duration: 3000
                });
            }
        });
    },
    bindPickerChange(e) {
        this.setData({
            projectName: this.data.array[e.detail.value].referred,
            projectId: this.data.array[e.detail.value].projectId,
            isVerify: this.data.array[e.detail.value].isVerify,
            developers: this.data.array[e.detail.value].developers
        })
    },
    determine() {
        if (this.data.projectName === '请选择项目' || !this.data.projectName) {
            wx.showToast({
                title: '请选择项目',
                icon: 'none',
                duration: 3000
            })
            return false
        }
        if (this.data.type === 1) {
        //    认购
            Api.fetch({
                method: 'post',
                url: '/subscribeConfig/queryConfig',
                data: {
                    projectId: this.data.projectId,
                }
            }).then((res) => {
                if (res.code === 200) {
                    if (1 !== res.data.enabled) {
                        wx.showToast({
                            title: '项目未开启线上认购，请联系置业顾问！',
                            icon: 'none',
                            duration: 3000
                        })
                    } else {
                        wx.setStorageSync('projectInfo', {
                            name: this.data.projectName,
                            id: this.data.projectId,
                            developers: this.data.developers
                        })
                        wx.navigateTo({
                            url: "/pages/house/signStepIndex/index"
                        })
                    }
                } else {
                    wx.showToast({
                        icon:'none',
                        title: res.message,
                        duration:3000
                    })
                }
            });
        } else {
            // 预约
            wx.navigateTo({
                url: `/pages/house/yuyue/index?projectId=${this.data.projectId}&projectName=${this.data.projectName}&isVerify=${this.data.isVerify}`
            });
        }

    }
});
