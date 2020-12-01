import Api from "../../utils/api";

const app =  getApp();
Component({
    properties: {
        numProp: {
            type: [Number, null],
            value: null,
            observer(newVal) {
                this.setData({
                    num: Number(newVal)
                })
            }
        },
        count: {
            type: [Number, null],
            value: 0,
            observer(newVal) {
                this.setData({
                    count: Number(newVal)
                })
            }
        },

    },
    data: {
        imgServerUrl:app.globalData.imgServerUrl,
        globalProjectName:app.globalData.projectName,
        cdnUrl:app.globalData.cdnUrl,
        isIphoneX: false,
        navigationList: [{
          "sortnum": 1,
          "title": "首页",
          "icon": '/images/index-nor.png',
          "acIcon" :app.globalData.imgServerUrl+'/xcx_images/'+app.globalData.projectName+'/index-hov1.png',
        }, {
            "sortnum": 2,
            "title": "项目",
            "icon": '/images/pro-nor.png',
            "acIcon" :app.globalData.imgServerUrl+'/xcx_images/'+app.globalData.projectName+'/pro-hov1.png',
        },
            {
            "sortnum": 3,
            "title": "消息",
            "icon": '/images/news-nor.png',
            "acIcon": '/images/news-hov1.png',
            "acIcon" :app.globalData.imgServerUrl+'/xcx_images/'+app.globalData.projectName+'/news-hov1.png',
        },
            {
            "sortnum": 4,
            "title": "我的",
            "icon": '/images/mine-nor.png',
            "acIcon": '/images/mine-hov1.png',
            "acIcon" :app.globalData.imgServerUrl+'/xcx_images/'+app.globalData.projectName+'/mine-hov1.png',
        },
        // {
        //     "sortnum": 5,
        //     "title": "扫码",
        //     "icon": '/images/mine-nor.png',
        // "acIcon" :app.globalData.imgServerUrl+'/xcx_images/'+app.globalData.projectName+'/mine-hov1.png',
        // },
    ]
    },

    pageLifetimes: {
        show: function() {
            let that = this;
            wx.getSystemInfo({
                success: res => {
                    let modelmes = res.model;
                    if (modelmes.search('iPhone X') != -1) {
                        that.setData({
                            isIphoneX: true
                        })
                    }
                }
            })
        }
    },
    methods: {
        async getProList() {
            wx.showLoading();
            const res = await Api.getHouseList({
                pageSize: 10,
                pageNo: 1
            })
            wx.hideLoading(); 
            if(res.data.totalNum * 1 === 1) {
                return res.data.records[0]
            }
            return ''
        },
        async getProAddress() {
            const flag = app.globalData.projectName === 'mingYueJiangNan'
            if(flag) {
                const page = await this.getProList()
                if(page) {
                    return `/pages/house/detail/index?houseid=${page.projectId}`
                } else {
                    return '/pages/house/index/index'
                }
            }
            return '/pages/house/index/index'
        },
        async tabTapFun(e) {
            const { sortnum } = e.currentTarget.dataset;
            const urls = {
                1: '/pages/home/index/index',
                2: await this.getProAddress(),
                3: '/packageIm/pages/main/index?pageType=tabBar',
                4: '/pages/user/index/index',
                5: '/pages/scan/index'
            }
            
            this.setData({
                num: sortnum
            })
            wx.reLaunch({
                url: urls[sortnum]
            })
        }
    }
})
