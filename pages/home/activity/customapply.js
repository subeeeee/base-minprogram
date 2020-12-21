import Api from "../../../utils/api.js";
import { getUserInfo } from "../../../utils/util";
Page({
    /**
     * 页面的初始数据type1关注 2报名 3领取优惠券
     */
    data: {
        obj: [],
        sList: [],
        type: null
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        if (!wx.getStorageSync("customerId")) {
            //  仅仅想获取一下customerId，借用一下首页的这个  isIndexGo 参数
            wx.setStorageSync('isIndexGo', 1)
            this.getUserInfo()
        }
        this.setData({
            projectIds: options.projectIds,
            topicId: options.topicId,
            type: options.type,
            tenantId: getApp().globalData.tenantId,
            customerId: wx.getStorageSync("customerId")
        });
        this.getApplyData(options.topicId)
    },
    getApplyData: function(topicId) {
        Api.fetch({
            method: 'get',
            url: '/h5/topic/getTopic',
            data: {
                topicId: topicId, //专题ID
                customerId: wx.getStorageSync("customerId")
            },
        }).then((res) => {
            if (res.code === 200) {
                this.setData({
                    list: JSON.parse(res.data.dataJson),
                });
                this.drawFormData()
            } else {
                wx.showToast({
                    title: res.msg,
                    icon: 'none',
                    duration: 3000
                })
            }
        });
    },
    /**
     * 初始化form表单
     */
    drawFormData: function() {
        var that = this;
        var tmpObj = [];
        var tmpsList = [];
        var dataList = that.data.list;
        dataList.forEach(function(item) {
            if (item.required) {
                tmpObj.push({ 'fieldName': item.fieldName, 'fieldValue': '', 'fieldType': item.fieldType })
            };
            if (item.dataType == 0 && item.onlineCustomizeDtos && item.onlineCustomizeDtos.length > 0) {
                item.onlineCustomizeDtos.forEach(function(sitem) {
                    tmpsList.push(sitem)
                    if (sitem.required) {
                        tmpObj.push({ 'fieldName': sitem.fieldName, 'fieldValue': '', 'fieldType': sitem.fieldType })
                    }
                })
            } else if (item.dataType == 1 && item.url) {
                that.getProjectData(item.fieldName, item.url, 1);
            }
        });
        this.setData({
            list: dataList,
            obj: tmpObj,
            sList: tmpsList
        });
    },
    /**
     * 父组件获得子组件返回值
     */
    myevent: function(e) {
        var obj = this.data.obj;
        var that = this;
        obj.forEach(function(item, idx) {
            if (item.fieldName == e.detail.fieldName) {
                obj.splice(idx, 1);
            }
        });
        if (e.detail.correlationCustomizeId) {
            that.setData({
                correlationCustomizeId: e.detail.correlationCustomizeId,
                correlationCustomizeName: e.detail.correlationCustomizeName
            });
            that.data.sList.forEach(function(sItem) {
                if (sItem.customizeId == e.detail.correlationCustomizeId && sItem.url) {
                    that.getProjectData(e.detail.correlationCustomizeName, sItem.url);
                }
            })
        }
        if (e.detail.fieldName == "手机号") {
            this.setData({
                phoneObj: e.detail
            })
        }
        obj.push(e.detail);
        this.setData({
            obj: obj
        })
    },
    getProjectData(correlationCustomizeName, url, type) {
        let that = this;
        Api.fetch({
            method: 'get',
            url: url
        }).then((res) => {
            if (res.code == 200) {
                if (res.data.length > 0) {
                    if (type == 1) {
                        var tmpList = that.data.list;
                    } else {
                        var tmpList = that.data.sList;
                    }
                    tmpList.forEach(function(items) {
                        if (items.fieldName == correlationCustomizeName) {
                            items.onlineCustomizeOptionList = res.data;
                        }
                    });
                    if (type == 1) {
                        that.setData({
                            list: tmpList
                        });
                    } else {
                        that.setData({
                            sList: tmpList
                        });
                    }
                }
            }
        });
    },
    activitySubmit() {
        var isGo = 1;
        var obj = {};
        console.log(this.data.obj)
        this.data.obj.forEach(function(item) {
            if (item.fieldValue == '' && item.required) {
                wx.showToast({
                    title: '必填项不能为空',
                    icon: 'none',
                    duration: 3000
                });
                isGo = 0;
                return;
            }
        });
        if (isGo) {
            if (this.data.phoneObj.fieldName && this.data.phoneObj.fieldName == "手机号" && !(/^1[3456789]\d{9}$/.test(this.data.phoneObj.fieldValue))) {
                wx.showToast({
                    title: '手机号格式错误',
                    icon: 'none',
                    duration: 3000
                });
                return;
            }
            if (this.data.type == 2 && this.data.obj.length <= 0) {
                wx.showToast({
                    title: '必填项不能为空',
                    icon: 'none',
                    duration: 3000
                });
                return;
            }
            obj.data = this.data.obj;
            obj.customerId = this.data.customerId || wx.getStorageSync("customerId");
            obj.topicId = this.data.topicId;
            obj.tenantId = this.data.tenantId;
            obj.type = this.data.type;
            obj.projectId = -1;
            obj.isCancel = 0;
            Api.fetch({
                method: 'post',
                url: '/h5/topic/apply',
                data: obj
            }).then((res) => {
                if (res.code === 200) {
                    if (this.data.type == 2) {
                        wx.showToast({
                            title: '报名成功',
                            duration: 2000
                        })
                    } else {
                        wx.showToast({
                            title: '领取成功',
                            duration: 2000
                        })
                    }

                    setTimeout(function() {
                        wx.navigateBack()
                    }, 2000)
                } else {
                    wx.showToast({
                        title: res.msg,
                        icon: 'none',
                        duration: 3000
                    })
                }
            });
        }
    },
    getUserInfo
})