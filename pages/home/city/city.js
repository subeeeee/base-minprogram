import Api from '../../../utils/api.js';
Page({
  data: {
    list: [],
    cityid: '',
    cityName: '',
    hotList: [],
    cityList: [],
    cityName_dw: "",
  },
  onLoad() {
    let codeC = wx.getStorageSync('codeC') ? wx.getStorageSync('codeC') : '-1';
    let codeC_dw = wx.getStorageSync('codeC_dw') ? wx.getStorageSync('codeC_dw') : '-1';
    let cityName = wx.getStorageSync('cityName') ? wx.getStorageSync('cityName') : '全国';
    let cityList = wx.getStorageSync('cityList') ? wx.getStorageSync('cityList') : [];
    let cityName_dw = wx.getStorageSync('cityName_dw') ? wx.getStorageSync('cityName_dw') : '全国';
    wx.setStorageSync('cityList', cityList);

    var newarr = [];
    for (var i = 0; i < cityList.length; i++) {
      var isadd = true;
      for (var j = 0; j < newarr.length; j++) {
        if (cityList[i].cityid === newarr[j].cityid) {
          isadd = false;
          break;
        }
      }
      if (isadd) {
        newarr.push(cityList[i]);
      }
    }

    this.setData({
      codeC: codeC,
      cityName: cityName,
      cityList: newarr,
      cityName_dw: cityName_dw,
      codeC_dw: codeC_dw
    })

    let datas = {};
    Api.getCityList(datas).then(({
      code,
      data
    }) => {
      if (code == 200) {
        this.setData({
            list: data
        })
      }
    })
  },
  goBacks(e) {
    let codeC = e.currentTarget.dataset.codec;
    let cityName = e.currentTarget.dataset.cityname;
    wx.setStorageSync('codeC', codeC)
    wx.setStorageSync('dwType', false)
    wx.setStorageSync('cityName', cityName)
    let cityList = this.data.cityList;
    if (cityList.length < 6 || cityList.length == 0) {
      if (cityList.length != 0) {
        for (var i = 0; i < cityList.length; i++) {
          if (cityList[i].codeC == codeC) {
            cityList.splice(i, 1);
          }
        }
        cityList.unshift({
          'codeC': codeC,
          'name': cityName
        })
        wx.setStorageSync('cityList', cityList)
      } else {
        cityList.unshift({
          'codeC': codeC,
          'name': cityName
        })
        wx.setStorageSync('cityList', cityList)
      }
    } else {
      cityList.pop()
      cityList.unshift({
        'codeC': codeC,
        'name': cityName
      })
      wx.setStorageSync('cityList', cityList)
    }
    this.setData({
      cityList: cityList
    });
    wx.navigateBack()
  }
});
