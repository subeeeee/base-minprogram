const app = getApp();
import { getUserPhone } from "../../../utils/util.js";
Page({
    data: {
        userPhone: '',
        customerId: ''
    },
    onLoad() {
    },
    onUnload(){

    },
    onShow() {
        console.log("onShow")
        wx.setNavigationBarTitle({
          title: '购房服务'
        })
        this.setUserData()
        // if(wx.getStorageSync("state")=='subscription'){
        //     wx.setStorageSync("state",'')
        //     this.jump(1)
        // }else if(wx.getStorageSync("state")=='appointment'){
        //     wx.setStorageSync("state",'')
        //     this.jump(2)
        // }
    },
    setUserData(){
        this.setData({
            userPhone: wx.getStorageSync("userPhone") || "",
            customerId: wx.getStorageSync("customerId") || ""
        })
    },
    onHide(){
        console.log("onHide")
        //
    },
    jump(e) {
        // if (!this.data.customerId) {
        //     wx.navigateTo({
        //         url: '/pages/login/auth/index'
        //     });
        //     return false
        // }
        let _type
        if(e.type){
            _type=e.currentTarget.dataset.type
        }else{
            _type=e
        }
        wx.navigateTo({
            url: '/pages/home/projectSelect/index?type=' + _type
        })
    },
    buyHouse(e){
        getUserPhone(e,()=>{
            // wx.setStorageSync("state",'subscription')
            this.jump(1)
            this.setUserData()
        })
    },
    orderHouse(e){
        getUserPhone(e,()=>{
            // wx.setStorageSync("state",'appointment')
            this.jump(2)
            this.setUserData()
        })
    },
    getUserPhone
});
