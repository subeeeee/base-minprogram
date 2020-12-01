import Api from '../../../utils/api.js';
const app = getApp()
let tenantId = app.globalData.tenantId
Page({
  data:{
      name: '', // 客户姓名
      sex: '0', // 性别
      projectId: '', // 推荐项目选中ID 数组
      identityList:[],
      mobile:'',
      identity:'',
    projectName: '',
    sexData: [
      {text: '男', value: '0'},
      {text: '女', value: '1'}
    ],
    projectData: [],
    projectListShow:false,
    identityShow:false,
    agreement:true,
    h5DoMain: app.globalData.h5DoMain,
    tenantId:tenantId
  },
  setMobile(){
    const userinfoLogin = wx.getStorageSync('userinfoLogin') || {}
    const mobile = userinfoLogin.phoneNo||wx.getStorageSync('userPhone')||''
    this.setData({
      mobile
    })
  },
  onLoad(option){
    this.setData({
      type:option.type
    })
  },
  onShow(){
    this.setMobile()
    this.getIdentityList()
    this.managerTenantConfig()
    this.projectsOptions()
  },
  async projectsOptions () {
    let userinfoLogin = wx.getStorageSync('userinfoLogin') || {}
    const res = await Api.fetchChannelManager({
      method: 'get',
      url: '/projects/options',
      data: {
        tenantId:getApp().globalData.tenantId,
       // userId:wx.getStorageSync('agentId')||userinfoLogin.agentId
      }
    })

    if (res.code === 200) {
      const list = res.data
      this.setData({
        projectData:list
      })
    }
  },
  async getIdentityList () {
    const res = await Api.fetchChannelManager({
      method: 'get',
      url: `/customersForThird/identity`,
      data: {
        tenantId:getApp().globalData.tenantId,
        type:5
      }
    })

    if (res.code === 200) {
      const list = res.data
      this.setData({
        identityList:list.filter(i => {
          return i.checked
        })
      })
    }
  },
  async managerTenantConfig () {
    const res = await Api.fetchChannelManager({
      method: 'get',
      url: `/customersForThird//tenantConfig/${tenantId}/3`,
      data: {
        tenantId:getApp().globalData.tenantId,
        type:5
      }
    })

    if (res.code === 200) {
      this.setData({
        registerPics:res.data.registerPics[0]
      })
    }
  },
  bindKeyInput(e) {
    let key = e.currentTarget.dataset.key
    const value = e.detail
    this.setData({
      [key]:value
    })
  },
  bindKeyInputNative(e){
    let key = e.currentTarget.dataset.key
    const value = e.detail.value||e.currentTarget.dataset.value
    this.setData({
      [key]:value
    })
  },
  changeSelected(e){
    let {id,name,key,value} = e.currentTarget.dataset
    
    this.setData({
      [key]:id,
      [name+'Name']:value
    })


    this.closeProjectListShowPopup()
    
  },
  changeSelectedIdentity(e){
    let {id,name,key,value,option} = e.currentTarget.dataset
    this.setData({
      [key]:id,
      [name+'Name']:value,
      projectMust:option.associatedProject ? true:false,
      idCardMust:!!option.needIdCard
    })
    this.closeIdentityShowPopup()
  },
  toast(title){
     wx.showToast({
       title,
       icon: 'none',
       duration: 3000,
     })
  },
  submit () {
    if (this.data.name === '') {
      this.toast('姓名不能为空')
    } else if (this.data.identity === '') {
      this.toast('请选择身份')
    } else if (!this.data.agreement) {
      this.toast('请同意注册协议')
    } else if (this.data.projectMust && !this.data.projectId) {
      this.toast('请选择注册来源')
    } else if (this.data.idCardMust && !this.data.idCard) {
      this.toast('身份证号不能为空')
    } else {
      this.accountsRegister()
    }


  },
  async accountsRegister () {
    const {name,sex,projectId,mobile,identity,idCard} = this.data||{}
    const result = await Api.fetchChannelManager({
      method: 'post',
      url: '/customersForThird/accounts/register',
      data:{
        name,
        sex,
        projectId, 
        mobile,
        identity,
        idCard,
        tenantId,
        password: "123456",
      //  "parentUserId": null,
      //  "userName": null,
      //  "teamId": null,
      //   "city": null,
  
      }
    })
    console.log(this.data.type)
    if (result.code === 200) {
      this.toast('注册成功')
      setTimeout(() => {
        wx.setStorageSync("agentId",result.data.userId)
        // wx.redirectTo({
        //   url:"/pages/marketing/index"
        // })
        this.handleUrl()
      }, 3000);
    } else {
      this.toast(result.message)
    }
  },
  handleUrl(){
    // type 可能是 [object Object] 是从全民营销的按钮里面传过来的值，没处理，就让它跳转全民营销的报备页面了
    if(this.data.type=="mycustomer"){
      let userinfoLogin = wx.getStorageSync('userinfoLogin')
      let reporterId=wx.getStorageSync('agentId') || userinfoLogin.agentId

      
      // let params = `?webUrl=${this.data.h5DoMain}/admin-channel/#/CustomerXcx&tenantId=${app.globalData.tenantId}&reporterId=${reporterId}&title=我的客户`
      // wx.redirectTo({
      //   url:"/pages/h5/index/index"+params
      // })
      wx.navigateTo({
        url: '/pages/user/customer/list/index'
      })
    }else{
       wx.redirectTo({
          url:"/pages/marketing/index"
        })
    }
  },
  showProjectList(){
    this.setData({
      projectListShow:true,
      nameDisabled:true,
      idCardDisabled:true
    })
  },
  closeProjectListShowPopup(){
    this.setData({
      projectListShow:false,
      nameDisabled:false,
      idCardDisabled:false
    })
  },
  closeIdentityShowPopup(){
    this.setData({
      identityShow:false,
      nameDisabled:false,
      idCardDisabled:false
    })
  },
  showIdentityShowPopup(){
    this.setData({
      identityShow:true,
      nameDisabled:true,
      idCardDisabled:true
    })
  },
  agreementTab (e) {
    this.setData({
      agreement:e.detail
    })
  },
      // 工具栏事件
      goNexts(e) {
        let {url} = e.currentTarget.dataset
        wx.navigateTo({
            url: url
        })
    },
    goH5(e){
      let {type, url, title, appid} = e.currentTarget.dataset
  
      let webUrllist = url.split('?')
      if (webUrllist.length > 1) {
          wx.navigateTo({
              url: '/pages/h5/index/index?webUrl=' + webUrllist[0] + '&' + webUrllist[1] + '&title=' + title + '&color=blue' + '&customerId=' + wx.getStorageSync('customerId') + '&appId=' + appid + '&tenantId=' + this.data.tenantId
          })
      } else {
          wx.navigateTo({
              url: '/pages/h5/index/index?webUrl=' + url + '&title=' + title + '&color=blue' + '&customerId=' + wx.getStorageSync('customerId') + '&appId=' + appid + '&tenantId=' + this.data.tenantId
          })
      }
    }
})