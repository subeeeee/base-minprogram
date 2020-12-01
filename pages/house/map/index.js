var app = getApp();
import Api from "../../../utils/api";
import QQMapWX from '../../../utils/qqmap-wx-jssdk.min';
var qqmapsdk = new QQMapWX({
    key: 'SNJBZ-DG5LW-345RS-RVV54-UGN33-3DF2T'
});
Page({
  data: {
    url:'',
    isShow:false,
    scale:7,
    nscale:7,
    Height:'0',
    controls:'40',
    latitude:'',
    longitude:'',
    markers: [],
    imgServerUrl:app.globalData.imgServerUrl,
    globalProjectName:app.globalData.projectName,
    cdnUrl:app.globalData.cdnUrl,
    darkColor:app.globalData.darkColor
  },
  onLoad: function () {
    var that = this;
    Api.fetch({
            method: 'post',
            url: '/applet/project/pageListByMap',
            ContentType: true,
            data:{}
        }).then((res) => {
            if (res.code === 200) {
                res.data.cityStatics.forEach(function (item, i) {
                    let projectMap=item.map.split('|');
                    item.id={'type':1,'longitude':projectMap[1],'latitude':projectMap[0]}
                    item.placeName=item.cityName+'('+item.projectCount+')'
                    item.placeLongitude=projectMap[1]
                    item.placeLatitude=projectMap[0]
                    if(i==0){
                      that.setData({
                        latitude:item.placeLatitude,
                        longitude:item.placeLongitude,
                      })
                    }
                    if(that.data.mayCity==item.cityName){
                      that.setData({
                        latitude:item.placeLatitude,
                        longitude:item.placeLongitude,
                      })
                    }
                })
                res.data.areaStatics.forEach(function (item, i) {
                    let areaMap=item.map.split('|');
                    item.id={'type':2,'longitude':areaMap[1],'latitude':areaMap[0]}
                    item.placeName=item.areaName+'('+item.projectCount+')'
                    item.placeLongitude=areaMap[1]
                    item.placeLatitude=areaMap[0]
                })
                res.data.projectList.forEach(function (item, i) {
                    let projectMap=item.map.split('|');
                    item.id={'type':3,'projectId':item.project_id,'longitude':projectMap[1],'latitude':projectMap[0]}
                    if(item.average_price){
                      item.placeName=item.referred+'\n'+item.average_price+'元/㎡'
                    }else{
                      item.placeName=item.referred+'\n'+'价格待定'
                    }
                    item.placeLongitude=projectMap[1]
                    item.placeLatitude=projectMap[0]
                })
                that.setData({
                  areaStatics:res.data.areaStatics,
                  cityStatics:res.data.cityStatics,
                  projectList:res.data.projectList
                })

                wx.getLocation({
                  type: 'wgs84', //返回可以用于wx.openLocation的经纬度
                  success: (res) => {
                    that.setData({
                        markers: that.getHouseMarkers(that.data.cityStatics),
                        scale: 7,
                    })
                    var param = {
                      location: res.latitude + ',' + res.longitude,
                      key: 'FCOBZ-54I6X-GH242-TKF6S-MKBHS-QYBDE',
                      get_poi: 1
                    };
                    wx.request({
                        url: 'https://apis.map.qq.com/ws/geocoder/v1/?location=', 
                        data: param,
                        success (res) {
                          that.data.cityStatics.forEach(function (item, i) {
                                if(res.data.result.address_component.city==item.cityName){
                                  that.setData({
                                    scale: 10,
                                    latitude:item.placeLatitude,
                                    longitude:item.placeLongitude,
                                  })
                                }
                            })
                        }
                    });
                  }
                });
            } else {
                wx.showToast({
                    icon:'none',
                    title: res.message,
                    duration:3000
                })
            }
        })

    
    wx.getSystemInfo({
      success: function (res) {
        //设置map高度，根据当前设备宽高满屏显示
        that.setData({
          view: {
            Height: res.windowHeight
          },

        })
      }
    })
  },
  getHouseMarkers(listData) {
    var market = [];
    for (let item of listData) {
      let marker1 = this.createMarker(item);
      market.push(marker1)
    }
    return market;
  },
  strSub:function(a){
    var str = a.split(".")[1];
    str = str.substring(0, str.length - 1)
    return a.split(".")[0] + '.' + str;
  },
  createMarker(point) {
    let latitude = this.strSub(point.placeLatitude);
    let longitude = point.placeLongitude;
    let marker = {
      iconPath: this.data.imgServerUrl+'/xcx_images/'+this.data.globalProjectName+'/map_dot.png',
      id: point.id || 0,
      name: point.placeName || '',
      title: point.placeName || '',
      latitude: latitude,
      longitude: longitude,
      callout:{
        content: point.placeName,
        color: '#ffffff',
        fontSize:16,
        borderWidth:1,
        borderColor:this.data.darkColor,
        borderRadius:4,
        bgColor:this.data.darkColor,
        padding:5,
        textAlign:'center',
        display:'ALWAYS',
        anchorY:1
      },
      width: 16,
      height: 20
    };
    return marker;
  },
  markertap(e) {
    console.log("定位文字被点击",e)
    this.setData({
      scale:'8',
      longitude:e.markerId.longitude,
      latitude:e.markerId.latitude
    })
  },
  bindcallouttap(e) {
   let that=this
   let num=8;
   if(e.markerId.type==3){
     Api.fetch({
            method: 'get',
            url: '/applet/project/get',
            ContentType: true,
            data: {
                projectId:e.markerId.projectId
            }
        }).then((res) => {
            if (res.code === 200) {
              res.data.sellPoint = res.data.sellPoint.split('，');
              if (res.data.city) {
                  res.data.city = res.data.city.split('-')[res.data.city.split('-').length - 1]
              }
              let resData=[];
              resData.push(res.data);
              that.setData({
                houseDetail:resData,
                isShow:true
              })
            }else{
              wx.showToast({
                    icon:'none',
                    title: res.message,
                    duration:3000
                })
            }
        })
   }else{
      if(e.markerId.type==1){
          num=8;
       }else if(e.markerId.type==2){
          num=12;
       }
       this.setData({
          scale:num,
          nscale:num,
          longitude:e.markerId.longitude,
          latitude:e.markerId.latitude
        })
       this.setMarketList();
   }
  },
  regionchange(e){
    var that=this;
    var mapCtx=wx.createMapContext('map');
    var _scale=14;
    if(e.causedBy=='scale'){
      mapCtx.getScale({
        success: function (res) {
          _scale=res.scale;
          console.log(res.scale)
          that.setData({
            nscale:_scale,
          })
        }
      });
      that.setMarketList();
    }
  },
  setMarketList(){
    let that=this
    if(that.data.nscale>11){
        that.setData({
          markers: that.getHouseMarkers(this.data.projectList),
        })
      }else if(that.data.nscale>=8 && that.data.nscale<=11){
        that.setData({
          markers: that.getHouseMarkers(this.data.areaStatics),
        })
      }else if(that.data.nscale>4 && that.data.nscale<8){
        that.setData({
          markers: that.getHouseMarkers(this.data.cityStatics),
        })
      }else{
        that.setData({
          markers: that.getHouseMarkers(this.data.cityStatics),
        })
      }
  },
  closeDeatail(){
    this.setData({
      isShow:false
    })
  }
})