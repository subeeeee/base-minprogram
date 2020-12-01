import Api from "../../../utils/api";
const safeArea = require("../../../utils/safe-area.js");
import {generalStatistical} from "../../../utils/util";
const app = getApp();

Page({
    data: {
        cityid: '',
        cityNames: '',
        params: {
            pageNo: 1,
            pageSize: 10
        },
        houseData: [],
        isRefresh: true,
        location: {},
        name: '',
        globalProjectName:app.globalData.projectName,
    },

    onLoad(option) {
        wx.showShareMenu({
            withShareTicket: true
        })
        let that = this
        getApp().watch('unReadMessageNum', function () {
            that.setData({
                count: getApp().globalData.unReadMessageNum
            })
        })
        // 针对 iphonex优化
        safeArea.getSafeArea();
        this.setData({
            cityNames: wx.getStorageSync('cityName'),
            cityid: wx.getStorageSync("codeC") || "",
            name: wx.getStorageSync("houseName") || "",
            count: getApp().globalData.unReadMessageNum,
            ...safeArea.data
        });
        wx.setStorageSync("houseName", '')
        wx.setNavigationBarTitle({
            title: '项目'
        })
        this.getHouseDataFun()
    },
    onShow() {
        let that = this
        getApp().watch('unReadMessageNum', function () {
            that.setData({
                count: getApp().globalData.unReadMessageNum
            })
        })
        if (this.data.cityid !== wx.getStorageSync("codeC")) {
            console.log(this.data.params.pageNo)
            this.setData({
                cityNames: wx.getStorageSync('cityName'),
                cityid: wx.getStorageSync("codeC") || "",
                'params.pageNo':1,
                'params.pageSize':10
            })
            this.getHouseDataFun()
        }
    },
    inputChange(e) {
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
            this.setData({
                name: e.detail.value,
                'params.pageNo': 1
            })
            this.getHouseDataFun()
        }, 300);
        
    },
    // 获取楼盘数据
    getHouseDataFun() {
        wx.showLoading();
        let that = this
        const params = {
            cityCode: this.data.cityid == -1 ? '' : this.data.cityid,
            referred: this.data.name,
        }
        Api.getHouseList({
            ...this.data.params,
            ...params
        }).then((res) => {
            wx.hideLoading();
            if (res.code === 200) {
                res.data.records.forEach(function (item, i) {
                    if (item.city) {
                        item.city = item.city.split('-')[item.city.split('-').length - 1]
                    }
                    if (item.imageUrls) {
                        item.imageUrls = item.imageUrls.split(',')
                    }
                    if (item.sellPoint) {
                        if (item.sellPoint.indexOf('，') !== -1) {
                            item.sellPoint = item.sellPoint.split('，')
                        } else {
                            item.sellPoint = item.sellPoint.split(' ')
                        }
                    }
                })
                let data = res.data.records
                that.setData({
                    houseData: that.data.params.pageNo === 1 ? data : [...that.data.houseData, ...data],
                    isRefresh: res.data.records.length === that.data.params.pageSize
                });
                if (that.data.params.pageNo === 1) {
                    wx.showToast({
                        title: `为您找到${res.data.totalNum}个楼盘`,
                        icon: 'none',
                        duration: 3000
                    });
                }
            } else { 
                wx.showToast({
                    title: res.message,
                    icon: 'none',
                    duration: 3000
                });
            }
        });
    },
    // 滚动到底部
    onReachBottom(e) {
        if (this.data.isRefresh) {
            this.setData({
                'params.pageNo': this.data.params.pageNo + 1
            });
            this.getHouseDataFun();
        }
    },
    // 前往搜索页
    goSearchFun(e) {
        wx.navigateTo({
            url: `/pages/house/search/index`
        });
    },
    // 前往详情
    goDetail(e) {
        wx.navigateTo({
            url: `/pages/house/detail/index?houseid=${e.currentTarget.dataset.houseid}`
        });
    },
    // 前往城市选择页面
    goCity() {
        wx.navigateTo({
            url: '/pages/home/city/city'
        })
    },
    // 开启定位后回调
    locationChangeCallbackFun(e) {
        this.setData({
            location: e.detail.res,
            'params.pageNo': 1
        });
        this.getHouseDataFun();
    },
    // 筛选项
    filterHandleFun(e) {
        const {
            params,
            sort
        } = e.detail;
        let submitParams = this.data.params;
        submitParams.sortColumns = ''
        submitParams.orderType = ''
        for (let m in sort) {
            switch (m) {
                case 'averagePrice':
                case 'lastOpenTime':
                    if (sort[m]) {
                        submitParams.sortColumns = m;
                        submitParams.orderType = sort[m];
                    }
                    break;
            }
        }
        for (let n in params) {
            switch (n) {
                case 'areas':
                    let arr = []
                    params[n].forEach(function (item, i) {
                        arr.push({
                            minArea: item.split('-')[0],
                            maxArea: item.split('-')[1]
                        })
                    })
                    submitParams[n] = arr;
                    break;
                case 'totalPrice':
                    let arr1 = []
                    params[n].forEach(function (item, i) {
                        arr1.push({
                            minPrice: item.split('-')[0] + '0000',
                            maxPrice: item.split('-')[1] + '0000'
                        })
                    })
                    submitParams['totalPrices'] = arr1;
                    break;
                default:
                    submitParams[n] = params[n]
            }
        }
        submitParams.pageNo = 1;
        this.setData({
            params: submitParams,
            houseData: []
        });
        this.getHouseDataFun();
    },
    //  拨打电话
    telephone(e) {
        this.generalStatistical({
            statisticalName:'telephoneCounseling',
            projectId: e.currentTarget.dataset.houseid,
        })
        wx.makePhoneCall({
            phoneNumber: e.currentTarget.dataset.phone,
            success(){

            }
        })
    },
    onShareAppMessage: function() {

    },
    generalStatistical
});
