import QQMapWX from '../../../utils/qqmap-wx-jssdk.min'
import {generalStatistical} from "../../../utils/util"
var qqmapsdk = new QQMapWX({
    key: 'LAIBZ-P6V36-2MASP-EEV4C-ZVHBF-Y3BTU'
})
const app =  getApp();
Component({
    properties: {
        location: {
            type: Object,
            value: null,
            observer(newVal) {
                console.log(newVal)
                let {longitude=116.4717292800,latitude=39.9072673000} = newVal
              //  if(longitude||latitude){
                  let defaultLongitude = 116.4717292800
                  let defautLatitude = 39.9072673000
                    this.setData({
                        longitude: Number(longitude)||defaultLongitude,
                        latitude: Number(latitude)||defautLatitude,
                        centerLongitude: Number(longitude)||defaultLongitude,
                        centerLatitude: Number(latitude)||defautLatitude
                    })
                    this.initMap(true)
               // }
               
            }
        },
        localName: {
            type: String,
            value: '--',
            observer(newVal) {
                this.setData({
                    name: newVal
                })
            }
        },
        mapOption:{
            type: Array,
            value:null,
            observer(newVal) {
                this.updateOption(newVal);
            }
        },
        type:{
            type:String,
            value:'small', // small是显示在house/detail/index里面的小的部分，big是点击进入的全屏地图house/detail/map/index
        },
        activeSearchId:{
            type:Number,
            value:null,
            observer(newV){
                this.setData({
                    searchId:newV
                })
            }
        }
    },
    data: {
        markers: [],
        areaList: [],
        name: '',
        longitude: 116.4717292800, //搜索用的经度
        latitude: 39.9072673000, ////搜索用的纬度
        centerLongitude: 116.4717292800, //地图展示用的中心点的经度
        centerLatitude: 39.9072673000, ////地图展示用的中心点的纬度
        obj:{},
        searchId:null,
        searchListText:['地铁','公交','医疗','学校','银行','购物'],//0 地铁 1公交  默认的地图筛选排序
        projectName:app.globalData.projectName,
        imgServerUrl:app.globalData.imgServerUrl,
        darkColor:app.globalData.darkColor
    },
    methods: {
        initMap(isDot = true) {
            let myMap = wx.createMapContext('myMap', this)
            myMap.moveToLocation({
                longitude: this.data.longitude,
                 latitude: this.data.latitude,
                 success:function(){
                     generalStatistical({
                        statisticalName:'authorizedLocation',
                        projectId:0,
                        operateObjectId:0
                    })
                  },
                  fail(err){
                    console.error(err)
                  }
                 })
            this.myMap = myMap
            if (isDot) {
                this.setData({
                    markers: [{ // 获取返回结果，放到mks数组中
                        title: this.data.name,
                        id: 1,
                        ...{longitude: this.data.longitude, latitude: this.data.latitude},
                        iconPath: `${this.data.imgServerUrl}/xcx_images/map_dot_center.png`,
                        width: 24,
                        height: 24
                    }]
                })
            }
        },
        updateOption(newVal){
            
            let dt=newVal.indexOf(1)>=0;
                let gj=newVal.indexOf(2)>=0;
                let yl=newVal.indexOf(3)>=0;
                let xx=newVal.indexOf(4)>=0;
                let yh=newVal.indexOf(5)>=0;
                let gw=newVal.indexOf(6)>=0;
                this.setData({
                    obj:{
                        isdt:dt,
                        isgj:gj,
                        isyl:yl,
                        isxx:xx,
                        isyh:yh,
                        isgw:gw
                    }
                },()=>{
                    this.search(null,this.data.searchListText[this.data.searchId===null?(newVal[0]-1)||0:this.data.searchId]) //默认搜索已经配置过的 筛选的第一条
                })
        },
        search(e,defaultType) {
            //this.initMap(false)
            let areaList = []
            this.setData({
                areaList
            })
            let filter=''
            let activeId=null;
            let type = e?e.currentTarget.dataset.type:defaultType
            switch(type){
                case '地铁':
                    activeId=0
                break;
                case '公交':
                    activeId=1
                break;
                case '医疗':
                    activeId=2
                    filter = 'category<>门诊,社区'
                break;
                case '学校':
                    activeId=3
                    filter = 'category=大学,中学'
                break;
                case '银行':
                    activeId=4
                break;
                case '购物':
                    activeId=5
                  //  filter = 'category=综合商场'
                break;
                default:
                break;
            }
            this.setData({
                searchId:activeId
            })
            
            qqmapsdk.search({
                keyword: type,
                //keyword:'奥莱',
                location: {longitude: this.data.longitude, latitude: this.data.latitude},
                filter:filter,
               // filter:'category=地名地址',
               page_size:this.data.type=='small'?3:20,
                success: res => {
                    res.data.map((item, index) => {
                     //   if (index < 3) {
                            areaList.push(item)
                      //  }
                    })
                    this.setData({
                        areaList: areaList
                    })
                    var mks = [{ // 获取返回结果，放到mks数组中
                        title: this.data.name,
                        id: 1,
                        ...{longitude: this.data.longitude, latitude: this.data.latitude},
                        iconPath:`${this.data.imgServerUrl}/xcx_images/map_dot_center.png`,
                        width: 24,
                        height: 24
                    }]
                    for (var i = 0; i < res.data.length; i++) {
                        mks.push({ // 获取返回结果，放到mks数组中
                            title: res.data[i].title,
                            id: res.data[i].id,
                            latitude: res.data[i].location.lat,
                            longitude: res.data[i].location.lng,
                            iconPath:`${this.data.imgServerUrl}/xcx_images/${this.data.projectName}/map_dot.png`,
                            width: 16,
                            height: 20,
                        })
                    }

                    this.setData({
                        markers: mks
                    })
                }
            })
        },
        mapclick(){
            if(this.data.type=="small"){
                this.triggerEvent('mapclick')
            }
            
        },
        changMarket(e){
            let item = e.currentTarget.dataset.item
            let id = ''
            if(item){
              id = item.id
            }else{
                id = e.markerId
            }
            
            let markers = this.data.markers
            markers = markers.map(i=>{
                i.zIndex = 1
                delete i.callout
                return i
            })
            let marketObj = markers.find(i=>i.id==(id))
            if(marketObj){
                marketObj.zIndex = 999
                marketObj.callout={
                    content: marketObj.title,
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
                }
            }
            return markers
        },
        moveToMarks(e){
            let {location={}} = e.currentTarget.dataset.item
            
            let {lng,lat} = location
            let markers = this.changMarket(e)

            this.setData({
                 centerLongitude: lng,
                 centerLatitude: lat,
                 markers
            })
            // let {location={}} = e.currentTarget.dataset.item
            // let {lng,lat} = location
            // this.myMap.moveToLocation({
            //      longitude: lng,
            //      latitude: lat,
            //      success:function(){

            //       },
            //       fail(err){
            //         console.error(err)
            //         if(err.indexOf('fail')>-1){

            //         }
            //       }
            // })
        },
        markertap(e){
          console.log(e)
          let markers = this.changMarket(e)

          this.setData({
               markers
          })
        },
        poitap(e){
          console.log(e)
        }
    }
});
