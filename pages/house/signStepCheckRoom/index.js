import Api from "../../../utils/api";
import { signStepChange } from "../../../utils/util";
const app = getApp();
let scrollTimer = null
Page({
    data: {
        isOnlyUnChecked:false,
        // 楼栋列表
        buildingList: [],
        // 当前已选楼栋Id
        activeBuilding: {},
        // 单元列表
        unitList: [],
        // 当前已选单元ID
        activeUnitId: null,
        // 楼层列表
        floorList: [],
        floorScrollTop: 0
    },
    onLoad(option) {
        this.getBuildingList()
    },
    onShow() {},
    changeType(){
        this.setData({
            isOnlyUnChecked: !this.data.isOnlyUnChecked
        })
    },
    /**
     * @param {Object} item
     * 切换楼栋
     */
    changeBuilding(e) {
        this.setData({
            activeBuilding: e.currentTarget.dataset.item
        })
        this.getUnitList()
    },
    /**
     * @param {Object} item
     * 切换单元
     */
    changeUnit(e) {
        this.setData({
            activeUnitId: e.currentTarget.dataset.item
        })
        this.getFloorList()
    },
    /**
     * 获取楼层列表
     */
    getFloorList() {
        Api.fetch({
            url: "/applet/project/getRoomBriefList" + '?unitId=' + this.data.activeUnitId
        }).then(res => {
            if (res.code === 200) {
                this.setData({
                    floorList: [{
                        floorNumber: '',
                        rooms: []
                    }]
                })
                let floorList = this.data.floorList
                res.data.forEach((roomBrief) => {
                    let flag = false
                    let index = 0
                    for (let i = 0; i < this.data.floorList.length; i++) {
                        if (roomBrief.floorNumber === this.data.floorList[i].floorNumber) {
                            flag = true
                            index = i
                        }
                    }
                    if (flag) {
                        floorList[index].rooms.push(roomBrief)
                    } else {
                        floorList.push({
                            floorNumber: roomBrief.floorNumber,
                            rooms: [roomBrief]
                        })
                    }
                })
                floorList.splice(0, 1)
                floorList.reverse()
                floorList.forEach((briefs) => {
                    briefs.rooms.reverse()
                })
                this.setData({
                    floorList: floorList
                })
                setTimeout(() => {
                    this.floorScrollTop = 0
                }, 1000)
            } else {
                wx.showToast({
                    title: res.message,
                    icon: 'none',
                    duration: 3000
                });
            }
        })
    },
    scroll(e) {
        scrollTimer && clearTimeout(scrollTimer)
        scrollTimer = setTimeout(() => {
            this.setData({
                floorScrollTop: e.detail.scrollTop
            })
        }, 50)
    },
    /**
     * 获取单元列表
     */
    getUnitList() {
        const {buildingId} = this.data.activeBuilding
        if(!buildingId){
            wx.showToast({
                title: '请置业顾问配置房源信息',
                icon: 'none',
                duration: 3000
            });
          return
        }
        Api.fetch({
            url: "/applet/project/getUnitList" + '?buildingId=' + buildingId,
        }).then(res => {
            if (res.code === 200) {
                res.data.map((item, index) => {
                    if (0 === index) {
                        this.setData({
                            activeUnitId: item.unitId
                        })
                        item.active = true
                    } else {
                        item.active = false
                    }
                })
                this.setData({
                    unitList: res.data
                })
                this.getFloorList()
            } else {
                wx.showToast({
                    title: res.message,
                    icon: 'none',
                    duration: 3000
                });
            }
        })
    },
    /**
     * 获取楼栋列表
     */
    getBuildingList() {
        Api.fetch({
            url: "/applet/project/getBuildingList" + '?projectId=' + wx.getStorageSync('projectInfo').id,
        }).then(res => {
           if (res.code === 200) {
               res.data.map((item, index) => {
                   if (0 === index) {
                       this.setData({
                           activeBuilding: item
                       })
                       item.active = true
                   } else {
                       item.active = false
                   }
               })
               this.setData({
                   buildingList: res.data
               })
               this.getUnitList()
           } else {
               wx.showToast({
                   title: res.message,
                   icon: 'none',
                   duration: 3000
               });
           }
        })
    },
    /**
     * 打开房间详情
     */
    openRoomInfo(e) {
        let room = e.currentTarget.dataset.item
        if (0 === room.roomStatus) {
            room.buildingInfo = this.data.activeBuilding
            wx.navigateTo({
                url: "/pages/house/signStepCheckRoomInfo/index?room=" + JSON.stringify(room)
            })
        }
    }
});
