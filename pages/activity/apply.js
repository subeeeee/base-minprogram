// pages/home/activity/apply.js
import Api from "../../utils/api.js";
import {getUserInfo} from "../../utils/util";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    array: ['业主', '员工', '意向客户', '其他'],
    selctIndex:0,
    imgs:[],
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
      userPhone:'',
      extension:''
    }
  },
  bindPickerProjectChange(e) {
        this.setData({
            projectName: this.data.projectList[e.detail.value].referred,
            projectId: this.data.projectList[e.detail.value].projectId
        })
    },
  bindPickerChange(e) {
    this.setData({
      selctIndex: e.detail.value
    })
  },
  removeImg(e) {
        let {index, key} = e.currentTarget.dataset
        let imgs = JSON.parse(JSON.stringify(this.data[key]))
        imgs.splice(index, 1)
        this.setData({
            [key]: imgs
        })
    },
  upload(e) {
        let {key} = e.currentTarget.dataset
        let that = this
        let imgs = that.data[key]
        if(imgs.length>=5){
            wx.showToast({
                    title: '最多上传5张',
                    icon: 'none',
                    duration: 3000
                })
            return false
        }
        wx.chooseImage({
            success (res) {
                const tempFilePaths = res.tempFilePaths
                Api.uploadFile({
                    url: '/uploadImage?biz=1',
                    ContentType: true,
                    filePath: tempFilePaths[0],
                    name: 'pic',
                    header: {
                        'Content-Type': 'application/json;charset=UTF-8',
                        tenantId: that.data.tenantId,
                        customerId: that.data.customerId
                    },
                    method: 'post',
                    success(res) {
                        if (JSON.parse(res.data).code === 200) {
                            imgs.push(JSON.parse(res.data).data.url)
                            that.setData({
                                [key]: imgs
                            })
                        } else {
                            wx.showToast({
                                title: res.msg,
                                icon: 'none',
                                duration: 3000
                            })
                        }
                    }
                })
            }
        })

    },
    getProjectData(){
      let that=this;
        var jsonData = {
            tenantId:that.data.tenantId,//小程序
            pageNo:1,
            pageSize:999,
            projectIds:that.data.projectIds
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
        projectIds:options.projectIds,
        topicId:options.topicId,
        tenantId:getApp().globalData.tenantId,
        customerId:wx.getStorageSync("customerId")
    });
    this.getProjectData();
  },
  mobileChange: function(e) {
        this.setData({
            'obj.userPhone': e.detail.value
        })
    },
    nameChange: function(e) {
        this.setData({
            'obj.userName': e.detail.value
        })
    },
    infoChange: function(e) {
        this.setData({
            'obj.extension': e.detail.value
        })
    },
   activitySubmit(){
    let obj = this.data.obj;
        if(!(/^1[3456789]\d{9}$/.test(obj.userPhone))){
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
        if(!obj.extension && this.data.projectIds=='-1'){
            wx.showToast({
                title: '请输入正确信息',
                duration:3000,
                icon:'none'
            })
            return false;
        }
        if(this.data.imgs.length==0 && this.data.projectIds=='-1'){
            wx.showToast({
                title: '请上传附件',
                duration:3000,
                icon:'none'
            })
            return false;
        }
        obj.type = 2;
        if(this.data.projectIds=='-1'){
          obj.projectId = '-1';
        }else{
          obj.projectId = this.data.projectId;
        }
        obj.customerId = this.data.customerId||wx.getStorageSync("customerId");
        obj.topicId = this.data.topicId;
        obj.tenantId = this.data.tenantId;
        obj.identityType= this.data.selctIndex;
        obj.isCancel = 0;
        obj.imageUrl = this.data.imgs.join(',')
        Api.fetch({
            method: 'post',
            url: '/h5/topic/apply',
            data: obj
        }).then((res) => {
            if (res.code === 200) {
                wx.showToast({
                    title: '报名成功',
                    duration:2000
                })
                setTimeout(function () {
                    wx.navigateBack()
                }, 2000)
            } else {
                wx.showToast({
                    title: res.msg,
                    icon: 'none',
                    duration: 3000
                })
            }
        });
    },
    getUserInfo
})