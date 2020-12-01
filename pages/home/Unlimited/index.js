import Api from '../../../utils/api.js';
const app =  getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
      houseList: [],
      limitedUrl:'',
      cityNames: '', //城市信息
          pageNo: 1,
      totalNum:1,
      cdnUrl:app.globalData.cdnUrl,
      globalProjectName:app.globalData.projectName,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 设置城市
    this.setData({
       cityNames: wx.getStorageSync('cityName'),
       pageNo:1
    })
    this.getHouseList()
    this.getUnlimitedImageUrl()
  },
      // 楼盘
    getHouseList() {
      let city = wx.getStorageSync('codeC')
        Api.fetch({
            method: 'post',
            url: '/applet/project/pageList',
            ContentType: true,
            data: {
                cityCode: city == -1 ? '' : city,
                isLimit : 0,
                pageSize: 10,
                pageNo: this.data.pageNo
            }
        }).then((res) => {
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
                this.setData({
                    houseList: this.data.pageNo === 1 ? data : [...this.data.houseList, ...data],
                    totalNum: Math.ceil(res.data.totalNum/10)
                })
                console.log(this.data.totalNum)
            } else {
                wx.showToast({
                    icon:'none',
                    title: res.message,
                    duration:3000
                })
            }
        })
    },
    // 前往城市选择页面
    goCity() {
        wx.navigateTo({
            url: '/pages/home/city/city'
        })
    },
    // 前往楼盘详情
    goHouse(e) {
        var houseid = e.currentTarget.dataset.houseid
        wx.navigateTo({
            url: '/pages/house/detail/index?houseid=' + houseid
        })
    },
    getUnlimitedImageUrl(){
      let tenantid=getApp().globalData.tenantId
      Api.fetch({
        method: 'get',
        url: '/appConfig/getUnlimitedImageUrl/'+tenantid
      }).then((res) => {
        this.setData({
              limitedUrl: res.data
          })
      });
    },
    // 滚动到底部
    onReachBottom(e) {
        if(this.data.totalNum>this.data.pageNo){
          this.setData({
              pageNo: this.data.pageNo + 1
          });
          this.getHouseList();
        }
    }
})