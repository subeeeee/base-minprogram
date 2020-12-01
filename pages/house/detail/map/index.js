import Api from "../../../../utils/api"

Page({
  data:{
    systemFacilityList:[],
    houseData:{},
    activeSearchId:null
  },
  onLoad(options){
      this.setData({
        activeSearchId:options.activeSearchId
      })
    this.getdetail(options.houseid)
  },
  // 获取详情
  getdetail(houseid) {
        Api.getHouseDetails({projectId: houseid}).then((res) => {
            if (res.code == 200) {
                res.data.longitude = res.data.map.split('|')[1].substring(0, 8)
                res.data.latitude = res.data.map.split('|')[0].substring(0, 7)

                var systemFacilityStatusList=[]
                if(res.data.systemFacilityStatus==1){
                    systemFacilityStatusList=res.data.systemFacilityList
                }else{
                    systemFacilityStatusList=[]
                }
                if(res.data.customFacilityList){
                    var customFacilityList=res.data.customFacilityList;
                    customFacilityList.forEach(function(item,i){
                        item.description=item.description.split('；');
                    });
                }

                this.setData({
                    houseData: res.data,
                    customFacilityStatus:res.data.customFacilityStatus,
                    customFacilityList:customFacilityList || [],
                    systemFacilityStatus:res.data.systemFacilityStatus,
                    systemFacilityList:systemFacilityStatusList
                })

            } else {
                wx.showToast({
                    title: res.message,
                    icon: 'none',
                    duration: 3000
                })
            }
        });
    },
})