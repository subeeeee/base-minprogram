Page({
    data: {
        params: {
            totalPrice: [],
            areas: [],
            roomCount: [],
        },
        paramsName: {
            totalPrice: [],
            areas: [],
            roomCount: [],
        },
        cityNames: '',
        returnData: [
            {
                name: '请选择总预算',
                type: 'totalPrice',
                multi: true,
                data: [
                    {
                        qiuhao: 'totalPrice',
                        name: '50万以下',
                        val: '0-50'
                    },
                    {
                        qiuhao: 'totalPrice',
                        name: '50-80万',
                        val: '50-80'
                    },
                    {
                        qiuhao: 'totalPrice',
                        name: '80-100万',
                        val: '80-100'
                    },
                    {
                        qiuhao: 'totalPrice',
                        name: '100-120万',
                        val: '100-120'
                    },
                    {
                        qiuhao: 'totalPrice',
                        name: '120-150万',
                        val: '120-150'
                    },
                    {
                        qiuhao: 'totalPrice',
                        name: '150-200万',
                        val: '150-200'
                    },
                    {
                        qiuhao: 'totalPrice',
                        name: '200-300万',
                        val: '200-300'

                    },
                    {
                        qiuhao: 'totalPrice',
                        name: '300万以上',
                        val: '300-0'
                    }
                ]
            },
            {
                name: '请选择购房面积',
                type: 'areas',
                multi: true,
                data: [
                    {
                        qiuhao: 'areas',
                        name: '50㎡以下',
                        val: '0-50'
                    },
                    {
                        qiuhao: 'areas',
                        name: '50-70㎡',
                        val: '50-70'
                    },
                    {
                        qiuhao: 'areas',
                        name: '70-90㎡',
                        val: '70-90'
                    },
                    {
                        qiuhao: 'areas',
                        name: '90-110㎡',
                        val: '90-110'
                    },
                    {
                        qiuhao: 'areas',
                        name: '110-130㎡',
                        val: '110-130'
                    },
                    {
                        qiuhao: 'areas',
                        name: '130-150㎡',
                        val: '130-150'
                    },
                    {
                        qiuhao: 'areas',
                        name: '150-180㎡',
                        val: '150-180'

                    },
                    {
                        qiuhao: 'areas',
                        name: '200㎡以上',
                        val: '200-0'
                    }
                ]
            },
            {
                name: '请选择购房户型',
                type: 'roomCount',
                multi: true,
                data: [
                    {
                        qiuhao: 'roomCount',
                        title: '不限',
                        name: '不限',
                        type: 1,
                        value: '',
                        val: ''
                    },
                    {
                        qiuhao: 'roomCount',
                        title: '一居',
                        name: '一居',
                        type: 1,
                        value: '1',
                        val: '1'
                    },
                    {
                        qiuhao: 'roomCount',
                        title: '二居',
                        name: '二居',
                        type: 1,
                        value: '2',
                        val: '2'
                    },
                    {
                        qiuhao: 'roomCount',
                        title: '三居',
                        name: '三居',
                        type: 1,
                        value: '3',
                        val: '3'
                    },
                    {
                        qiuhao: 'roomCount',
                        title: '四居',
                        name: '四居',
                        type: 1,
                        value: '4',
                        val: '4'
                    },
                    {
                        qiuhao: 'roomCount',
                        title: '五居',
                        name: '五居',
                        type: 1,
                        value: '5',
                        val: '5'
                    },
                    {
                        qiuhao: 'roomCount',
                        title: '五居以上',
                        name: '五居以上',
                        type: 1,
                        value: '6',
                        val: '6'
                    }
                ]
            }
        ]
    },
    // 前往城市选择页面
    goCity() {
        wx.navigateTo({
            url: '/pages/home/city/city'
        })
    },
    itemHandleClickFun(e) {
        const {item} = e.currentTarget.dataset;
        let arr = this.data.params[item.qiuhao]
        let arr2 = this.data.paramsName[item.qiuhao]
        const idx = arr.indexOf(item.val);
        if (item.val) {
            if (idx < 0) {
                arr.push(item.val)
                arr2.push(item.name)
            } else {
                arr.splice(idx, 1)
                arr2.splice(idx, 1)
            }
        } else {
            arr = [];
            arr2 = [];
        }
        this.setData({
            [`params.${item.qiuhao}`]: arr,
            [`paramsName.${item.qiuhao}`]: arr2,
        });
    },
    houseList() {
        wx.setStorageSync('filterCriteria', this.data.params)
        wx.setStorageSync('filterCriteriaName', this.data.paramsName)
        wx.navigateTo({
            url: '/pages/house/index/index'
        })
    },
    onLoad() {
    },
    onShow() {
        this.setData({
            cityNames: wx.getStorageSync('cityName')
        })
        wx.setNavigationBarTitle({
            title: '帮我找房'
        })
    },
});
