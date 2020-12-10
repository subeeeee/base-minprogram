// pages/home/activity/apply.js
import Api from "../../../utils/api.js";
import {getUserInfo} from "../../../utils/util";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    projectIds:null,
    tenantId:'',
    topicId:null,
    projectName: '请选择项目',
    projectId:'',
    projectList:[],
    isGroup:false,
    customerId:null,
    obj:{
      userName:'',
      idCard:'',
      couponCode:''
    }
  },
  bindPickerProjectChange(e) {
        if(this.data.projectList.length<=0) return;
        this.setData({
            projectName: this.data.projectList[e.detail.value].referred,
            projectId: this.data.projectList[e.detail.value].projectId
        })
    },
    getProjectData(){
      let that=this;
        var jsonData = {
            tenantId:that.data.tenantId,//小程序
            pageNo:1,
            pageSize:999,
            // projectIds:that.data.projectIds,
            statusList:[1,2]
        }
        Api.fetch({
              method: 'post',
              url: "/h5/project/pageList?tenantId="+that.data.tenantId,
              data: JSON.stringify(jsonData)
          }).then((res) => {
              if (res.code === 200) {
                if(res.data.records.length>0){
                  that.setData({
                    projectList:res.data.records,
                    projectName: res.data.records[0].referred,
                    projectId: res.data.records[0].projectId
                  })
                }
              } else {
                  wx.showToast({
                      title: res.message,
                      icon: 'none',
                      duration: 3000
                  })
              }
          });
    },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.projectIds=='-1'){
      this.setData({
          isGroup:true
      });
    }
    if(!wx.getStorageSync("customerId")){
        //  仅仅想获取一下customerId，借用一下首页的这个  isIndexGo 参数
        wx.setStorageSync('isIndexGo',1)
        this.getUserInfo()
    }
    this.setData({
        actCouponId:options.actCouponId,
        projectIds:options.projectIds,
        topicId:options.topicId,
        tenantId:getApp().globalData.tenantId,
        customerId:wx.getStorageSync("customerId")
    });
    this.getProjectData();
  },
   IDChange: function(e) {
        this.setData({
            'obj.idCard': e.detail.value
        })
    },
    nameChange: function(e) {
        this.setData({
            'obj.userName': e.detail.value
        })
    },
    couponChange: function(e) {
        this.setData({
            'obj.couponCode': e.detail.value
        })
    },
   activitySubmit(){
    let obj = this.data.obj;
        if(!(/^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/.test(obj.idCard))){
            wx.showToast({
                title: '请输入正确信息',
                duration:3000,
                icon:'none'
            })
            return false;
        }
        if(!obj.userName){
            wx.showToast({
                title: '请输入正确信息',
                duration:3000,
                icon:'none'
            })
            return false;
        }
        // if(!obj.couponCode){
        //     wx.showToast({
        //         title: '请输入正确信息',
        //         duration:3000,
        //         icon:'none'
        //     })
        //     return false;
        // }
        if(!this.data.projectId){
            wx.showToast({
                title: '请选择意向项目',
                duration:3000,
                icon:'none'
            })
            return false;
        }
        if(this.data.actCouponId){
          obj.actCouponId=this.data.actCouponId;
        }
        obj.projectId = this.data.projectIds;
        obj.intentProjectId=this.data.projectId;
        obj.customerId = this.data.customerId||wx.getStorageSync("customerId");
        obj.topicId = this.data.topicId;
        obj.tenantId = this.data.tenantId;
        Api.fetch({
            method: 'post',
            url: '/applet/act/coupon/receive',
            data: obj
        }).then((res) => {
            if (res.code === 200) {
                wx.showToast({
                    title: '领取成功',
                    duration:2000
                })
                setTimeout(function () {
                    wx.navigateBack()
                }, 2000)
            } else {
                wx.showToast({
                    title: res.message,
                    icon: 'none',
                    duration: 3000
                })
            }
        });
    },
    getUserInfo
})