import Api from "../../../utils/api.js";
Component({
    properties: {
        uploadData: {
            type: Object,
            value: null,
            observer(newVal) {
                this.setData({
                    key: newVal.fieldName,
                    fieldType: newVal.fieldType,
                    required: newVal.required,
                    sort: newVal.sort
                })
            }
        }
    },
    data: {
        imgs: []
    },
    methods: {
        removeImg(e) {
            let { index, key } = e.currentTarget.dataset
            let imgs = JSON.parse(JSON.stringify(this.data[key]))
            imgs.splice(index, 1)
            this.setData({
                [key]: imgs
            })
        },
        upload(e) {
            let { key } = e.currentTarget.dataset
            let that = this
            let imgs = that.data[key]
            if (imgs.length >= 5) {
                wx.showToast({
                    title: '最多上传5张',
                    icon: 'none',
                    duration: 3000
                })
                return false
            }
            wx.chooseImage({
                success(res) {
                    const tempFilePaths = res.tempFilePaths
                    Api.uploadFile({
                        url: '/uploadImage?biz=1',
                        ContentType: true,
                        filePath: tempFilePaths[0],
                        name: 'pic',
                        header: {
                            'Content-Type': 'application/json;charset=UTF-8',
                            tenantId: that.data.tenantId,
                            customerId: that.data.customerId
                        },
                        method: 'post',
                        success(res) {
                            if (JSON.parse(res.data).code === 200) {
                                imgs.push(JSON.parse(res.data).data.url)
                                that.setData({
                                    [key]: imgs
                                });
                                that.triggerEvent('myevent', {
                                    fieldName: that.data.key,
                                    fieldValue: JSON.stringify(imgs),
                                    fieldType: that.data.fieldType,
                                    sort: that.data.sort
                                });
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
    }
})