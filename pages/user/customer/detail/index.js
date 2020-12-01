import Api from '../../../../utils/api.js';
const app = getApp()
let tenantId = app.globalData.tenantId
console.log(tenantId)
Page({
  data:{
      customers: null,
      isEdit: false,
      customerRegister: {
        registerId: '',
        name: '',
        sex: '0'
      },
      sexText: '男',
      sexData: [
        {text: '男', value: '0'},
        {text: '女', value: '1'}
      ],
      isPopShow: {
        sex: false
      },
    h5DoMain: app.globalData.h5DoMain,
    tenantId:tenantId,
    customersReportHistory: []
  },
  async getCustomers ({registerId}={}) {
    wx.showLoading({
      title: '数据加载中...',
    })
    const result = await Api.fetchChannelManager({
      method: 'get',
      url: '/customersForThird/customers/'+(registerId||this.data.customerRegister.registerId||''),
    })
      wx.hideLoading()
    if (result.code === 200) {
      let data = result.data
      let sex = data.sex.toString()
      data.name = data.name || '暂无'
      data.reportStatusName = data.reportStatusName || '暂无'
      data.mobile = data.mobile || '暂无'
      data.projectName = data.projectName || '暂无'
      data.reportSourceName = data.reportSourceName || '暂无'
      data.memberName = data.memberName || '暂无'
      data.reportTime = data.reportTime || '暂无'
      data.effectiveReportTime = data.effectiveReportTime || '暂无'
      data.dealProtectTime = data.dealProtectTime || '暂无'
      data.otherMobiles = data.otherMobiles?data.otherMobiles.join('、') : '暂无'
      
      this.setData({
        customers: data,
        "customerRegister.registerId":data.registerId,
        "customerRegister.name":data.name,
        "customerRegister.sex":sex,
        sexText:sex==='0'?'男':'女'
      })
    } else {
      this.toast(result.message)
    }
  },
  async getCustomersReportHistory ({registerId}={}) {
    wx.showLoading({
      title: '数据加载中...',
    })
    const result = await Api.fetchChannelManager({
      method: 'get',
      url: '/customersForThird/customers/reportHistory/'+(registerId||this.data.customerRegister.registerId||''),
    })
      wx.hideLoading()
    if (result.code === 200) {
      this.setData({
        customersReportHistory: result.data
      })
     
    } else {
      this.toast(result.message)
    }
  },
  toast(title){
    wx.showToast({
      icon:'none',
      title,
      duration:3000
    })
  },
  onLoad(option){
    this.getCustomers(option)
    this.getCustomersReportHistory(option)
    this.setData({
      registerId:option.registerId
    })
  },
  onShow(){
 
  },
  async getCustomersCustomerRegisterRecover () {
    const result = await Api.fetchChannelManager({
      method: 'get',
      url: `/customersForThird/customers/customerRegister/recover/${this.data.registerId}`
    })

    if (result.code === 200) {
     this.toast('报备成功')
      this.getCustomers()
    } else {
      this.toast(result.message)
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
      ["customerRegister."+key]:value
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
  async editCustomerRegister () {
    this.setData({
      isEdit:!this.data.isEdit
    })

    if (!this.data.isEdit) {
      const res = await Api.fetchChannelManager({
        method: 'put',
        url: `/customersForThird/customers/customerRegister`,
        data:this.data.customerRegister
      })
      if(res.code==200){
        this.getCustomers()
        this.toast('修改成功')
      }

    }
  },
  async subscribeMessages () {
    const result = await Api.fetchChannelManager({
      method: 'get',
      url: `/wx/appConfig`
    })



    if(result.code==200){
      let url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${app.globalData.appid}&redirect_uri=${app.globalData.h5DoMain}/iCloud-rest/channel-manager/wx/bindingOpenId?userId=${wx.getStorageSync("agentId")}%26registerId=${this.data.registerId}%26tenantId=${getApp().globalData.tenantId}&response_type=code&scope=snsapi_base&state=STATE&component_appid=${result.data.componentAppId}`
      let webUrllist = url.split('?')
      if (webUrllist.length > 1) {
          wx.navigateTo({
              url: '/pages/h5/index/index?webUrl=' + webUrllist[0] + '&' + webUrllist[1]+'&' + webUrllist[2]
          })
      } 
    }

  },
  setSex (e) {
    if(!this.data.isEdit){
      return
    }

    const text =e.currentTarget.dataset.text

    this.setData({
      "customerRegister.sex": e.detail.value||e.currentTarget.dataset.value,
      sexText:text
    })
  },
  goNexts(e) {
        let {url} = e.currentTarget.dataset
        wx.navigateTo({
            url: url
        })
    }
})