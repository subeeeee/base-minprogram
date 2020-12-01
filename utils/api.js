import config from "../config.js";

const testHost = 'https://yxftest.juzhouyun.com/'; // 云易测试
const host = config.CONFIG_INFO.env === 'test' ? testHost : config.CONFIG_INFO_PRO.hostAddress





const serviceName="iCloud-signpay/"

function getUrl() {
  let pages = getCurrentPages()
  let currPage = null
  if (pages.length) {
    currPage = pages[pages.length - 1]
  }
  wx.setStorageSync('Router', currPage.route)
}

function fetchNoSignpay(opt,serviceName="icloud-wxthird") {
  return fetch(opt,serviceName)
}
function fetchChannelManager(opt,serviceName="iCloud-rest/channel-manager",returnResData) {
  return fetch(opt,serviceName,returnResData)
}


function fetch(opt,serviceName='iCloud-signpay/',returnResData=true) {
  let isOutTime = true;
  let loading = opt.showLoading || false;
  if (loading) {
    wx.showLoading()
  }
  // let ContentType = 'application/x-www-form-urlencoded'
  // if (opt.ContentType) {
  let ContentType = 'application/json;charset=UTF-8'

  // }
  return new Promise((resolve, reject) => {
    let customerId = wx.getStorageSync('customerId') ? wx.getStorageSync('customerId') : ''
      // let customerId = '1164523599620829185'
    let statisticalDictionary = wx.getStorageSync('statisticalDictionary')|| {}
    let header = {
      'Content-Type': ContentType,
      deviceType: wx.getStorageSync('deviceType'),
      tenantId: config.CONFIG_INFO_PRO.tenantId,
      customerId: opt&&opt.headers&&opt.headers.customerId||customerId
  }
  // // debugger

  const {statisticalName} = opt.data||{}
  let statisticalItem= statisticalDictionary[opt.url]
  if(statisticalName){
    statisticalItem= statisticalDictionary[statisticalName]
  }
  // let userinfoLogin = wx.getStorageSync('userinfoLogin')|| {}
  // let {sourceType,sourceId} = userinfoLogin

  if(statisticalItem){ //如果这个接口需要追踪，就给header里面加一个behavior字段
    let operateObjectType = statisticalItem.operateObjectType
    if(operateObjectType==null||operateObjectType==undefined||operateObjectType===""||operateObjectType=="null"||operateObjectType=='undefined'){
      operateObjectType = null
 }
    header.behavior=encodeURI(JSON.stringify({
        operateObjectType,
        operateObjectId:opt.data.operateObjectId||opt.data.projectId||null,
        operateAction:statisticalItem.id||null,
        projectId:opt.data.projectId||null,
      }))
  }

    wx.request({
      url: `${host+serviceName}` + opt.url,
      data: opt.data,
      ContentType: true,
      header,
      method: opt.method,
      success(res) {
        isOutTime = false
        // if (token != '') {
        //   if (
        //     res.data.code == 801 ||
        //     res.data.code == 802 ||
        //     res.data.code == 804
        //   ) {
        //     wx.showToast({
        //       title: res.data.info,
        //       icon: 'none',
        //       duration: 3000
        //     });
        //     wx.setStorageSync('token', '')
        //     setTimeout(function () {
        //       wx.navigateTo({
        //         url: '/pages/login/index/index'
        //       })
        //     }, 2000)
        //   }
        // } else {
        //   if (res.data.code == 801) {
        //     wx.navigateTo({
        //       url: '/pages/login/index/index'
        //     })
        //   }
        // }
        if(returnResData){
          resolve(res.data)
        }else{
          resolve(res)
        }

      },
      fail(error) {
        wx.showModal({
          title: '提示',
          content: '网络异常',
          showCancel: false,
          success: (res) => {}
        });
        reject(error);
      },
      complete: () => {
        if (loading) {
          wx.hideLoading();
        }
        if (isOutTime) {
          wx.showToast({
            title: '请求超时！',
            icon: 'loading',
            duration: 3000
          })
        }
        isOutTime = true //无论如果都要返回true否则下次无法显示弹框了。
      }
    });
  });
}
module.exports = {
  fetch,
  fetchNoSignpay,
  fetchChannelManager,
  uploadFile(opt) {
    opt.url = `${host}${serviceName}${opt.url}`
    return wx.uploadFile(opt)
  },
  getUrl,
  // 楼盘列表获取
  getHouseList(data) {
    return fetch({
      method: 'post',
      url: '/applet/project/pageList',
      ContentType: true,
      data
    })
  },
  //获取全部城市
  getCityList(data) {
    return fetch({
      method: 'get',
      url: '/applet/project/citys',
      data
    })
  },
    //获取全部城市
  getAreaList(data) {
    return fetch({
      method: 'get',
      url: '/applet/project/areas',
      data
    })
  },
    //楼盘详情
  getHouseDetails(data) {
    return fetch({
      method: 'get',
      url: '/applet/project/get',
      data
    })
  },

}
