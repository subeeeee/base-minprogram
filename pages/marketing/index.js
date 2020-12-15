import Api from '../../utils/api.js';
import Dialog from '../../components/vant/dialog/dialog';
const app =  getApp();
Page({
  data:{
    ManagerForm: {
      name: '', // 客户姓名
      
      sex: '0', // 性别
      mobiles: [''], // 客户手机
      projectId: '', // 推荐项目选中ID 数组
      memberId: '', // 置业顾问Id
      modeType: '', // 报备模式
      changeModeType: 0, // 是否改变报备模式 0不是 1是
      reporterId:'' // 报备人ID
    },
    splitMobiles: [],
    splitMobilesInput: '',
    canChooseMember: 0,
    canHideMobile: 0,
    projectName: '',
    sexData: [
      {text: '男', value: '0'},
      {text: '女', value: '1'}
    ],
    projectData: [],
    memberNameOrMobiles: '',
    customersMembers: [],
    lookIco: true,
    account:{},
    projectListShow:false,
    projectData:[],
    CustomerShow:false,
    selectdProjectIdx:0,
    splitMobilesInputSpan:['','','',''],
    styleProjectName:app.globalData.projectName,
    imgServerUrl:app.globalData.imgServerUrl,
  },
  onLoad(){


  },
  onShow(){
    this.projectsOptions()
  },
  async projectsOptions () {
    let userinfoLogin = wx.getStorageSync('userinfoLogin') || {}
    const res = await Api.fetchChannelManager({
      method: 'get',
      url: '/projects/options',
      data: {
        tenantId:getApp().globalData.tenantId,
        userId:wx.getStorageSync('agentId')||userinfoLogin.agentId
      }
    })

    if (res.code === 200) {
      const list = res.data
      let projectData = []
      for (let i = 0; i < list.length; i++) {
        let json = {
          label: list[i].projectName,
          value: list[i].projectId,
          modeType: list[i].modeType,
          canChooseMember: list[i].canChooseMember,
          canHideMobile: list[i].canHideMobile,
          autoChooseMember: list[i].autoChooseMember
        }
        projectData.push(json)
      }
      this.setData({
        projectData
      })
    }
  },
  bindKeyInput(e) {
    let key = e.currentTarget.dataset.key
    const value = e.detail.value || e.currentTarget.dataset.value
    this.setData({
      ['ManagerForm.'+key]:value
    })
  },
  bindMobile(e){
    let idx = e.currentTarget.dataset.idx
    const value = e.detail.value
    let mobiles = this.data.ManagerForm.mobiles
    mobiles[idx] = value


    if (!this.data.lookIco) {
      if (value.length === 3) {
        mobiles[0] = value + '****'
      }
    }


    this.setData({
      'ManagerForm.mobiles':mobiles
    })
  },
  changeSelected(e){
    let idx = e.currentTarget.dataset.idx
    let key = e.currentTarget.dataset.key
    this.setData({
      [key]:idx
    })
  },
  removeNonBmpUnicode () {
    const emoji = new RegExp(/[^\u0020-\u007E\u00A0-\u00BE\u2E80-\uA4CF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF\u0080-\u009F\u2000-\u201f\u2026\u2022\u20ac\r\n]/g)
    this.setData({
      "ManagerForm.name":this.data.ManagerForm.name.replace(emoji, ''),
      splitMobilesInput:this.data.splitMobilesInput.replace(emoji, ''),
      memberNameOrMobiles:this.data.memberNameOrMobiles.replace(emoji, ''),
    })
  },
  failed(title){
     wx.showToast({
       title,
       icon: 'none',
       duration: 3000,
     })
  },
  async save(){
    const {name,mobiles,sex,projectId,memberId,modeType,changeModeType} = this.data.ManagerForm
    const reg = /^1[0-9]{10}$/
    if (projectId === '') {
      this.failed('请选择推荐项目')
      return false
    }
    if (name === '') {
      this.failed('请填写客户姓名')
      return false
    }
    if (this.data.lookIco) {
      for (let i = 0; i < mobiles.length; i++) {
        if (mobiles[i] === '') {
          if (i === 0) {
            this.failed(`请填写客户手机`)
          } else {
            this.failed(`请填写第${i + 1}个客户手机`)
          }
          return false
        } else if (!reg.test(mobiles[i])) {
          if (i === 0) {
            this.failed('客户手机格式不正确')
          } else {
            this.failed(`第${i + 1}个客户手机格式不正确`)
          }
          return false
        }
      }
    } else {
      if (mobiles[0] === '') {
        this.failed(`请填写客户手机`)
        return false
      } else if (mobiles[0].length !== 11) {
        this.failed('客户手机号码长度不正确')
        return false
      }
    }



    let userinfoLogin = wx.getStorageSync('userinfoLogin') || {}


    const result = await Api.fetchChannelManager({
      method: 'post',
      url: '/customersForThird/reportCustomer',
      data: {
        projectId,
        name,
        mobiles,
        sex,
        reporterId: wx.getStorageSync('agentId')||userinfoLogin.agentId,
       // remark: "",
        memberId,
        modeType,
        changeModeType
      }
    })
    if (result.code === 200) {
      wx.showToast({
        title: '报备成功',
        duration: 3000,
        success:()=>{
          setTimeout(() => {
            wx.navigateTo({
              url: '/pages/home/index/index'
            });
          }, 3000);
        }
      });

    } else if (result.code === 201) {
      this.setData({
        splitMobilesInput:'',
        open201:true,
        basicDialogText:result.message,

      })
      this.splitNum(this.data.ManagerForm.mobiles[0])
    } else if (result.code === 202) {
      // 保护模式下存在相同的手机号码，是否以竞争模式报备
      this.handle202(result.message)
    }else{
      this.failed(result.message)
    }
  },
  handle202(message){
    Dialog.confirm({
      title: '温馨提示',
      message,
      confirmButtonText:'继续报备',
      cancelButtonText:'放弃报备'
    })
      .then(() => {
        console.log('confirm')
        this.setData({
          "ManagerForm.modeType":1,
          "ManagerForm.changeModeType":1
        },this.save)

      })
      .catch(() => {
        console.log('cancel')
        
      });
  },
  showProjectList(){
    this.setData({
      projectListShow:true
    })
  },
  closeProjectListShowPopup(){
    this.setData({
      projectListShow:false
    })
  },
  lookPsw () {
    if (this.data.canHideMobile === 0) {
      this.failed('此项目不支持隐号报备')
      return false
    }
    this.setData({
      lookIco:!this.data.lookIco,
      "ManagerForm.mobiles":['']
    })
  },
  addMobile () {
    let {mobiles} = this.data.ManagerForm;
    if (mobiles.length < 4) {
      mobiles.push('')
    } else {
      this.failed('客户手机最多添加4个')
    }
    this.setData({
      "ManagerForm.mobiles":mobiles
    })
  },
  delMobile (e) {
    const index = e.currentTarget.dataset.index
    let {mobiles} = this.data.ManagerForm;
    for (let i = 0; i < mobiles.length; i++) {
      if (index === i) {
        mobiles.splice(i, 1)
      }
    }

    this.setData({
      "ManagerForm.mobiles":mobiles
    })
  },
  onBasicConfirm201 () {
    const reg = /^[0-9]*$/
    if (this.data.splitMobilesInput === '') {
      this.failed('请填写完整的报备手机号码')
      return false
    }
    if (!reg.test(this.data.splitMobilesInput)) {
      this.failed('手机号码输入有误')
      return false
    }
    let mobile = this.data.splitMobiles[0] + this.data.splitMobilesInput + this.data.splitMobiles[1]

    this.setData({
      "ManagerForm.mobiles":[mobile],
      open201:false
    })
    this.save()
  },
  splitNum (Num) {
    let fristNum = ''
    let lastNum = ''
    for (let i = 0; i < Num.length; i++) {
      if (i < 3) {
        fristNum += Num[i]
      }
      if (i > 6) {
        lastNum += Num[i]
      }
    }
    this.setData({
      splitMobiles:[fristNum, lastNum]
    })
  },
  setProject () {
    let option = this.data.projectData[this.data.selectdProjectIdx]
    let memberId;
    if (option.autoChooseMember) {
      memberId = 0
    } else {
      memberId = ''
    }
    this.setData({
      "ManagerForm.projectId":option.value,
      "ManagerForm.modeType": option.modeType,
     // "ManagerForm.mobiles":[''],
      "ManagerForm.memberId":memberId,
      projectName:option.label,
      memberNameOrMobiles:'',
      canChooseMember: option.canChooseMember,
      canHideMobile:option.canHideMobile,
      lookIco:true,
    })
    this.closeProjectListShowPopup()
  },
  getMembers(memberNameOrMobiles){
    Api.fetchChannelManager({
      method: 'get',
      url: '/customersForThird/customers/members',
      data: {
        projectId:this.data.ManagerForm.projectId,
        nameOrMobile:memberNameOrMobiles
      }
    }).then(result=>{
      if (result.data.length > 0) {
        this.setData({
          customersMembers:result.data
        })
        this.showCustomerShowPopup()
      } else {
        this.setData({
          customersMembers:[]
        })
        this.closeCustomerShowPopup()
        this.failed('没有相关顾问')
      }
    })
  },
  memberInput (e) {
    let reg = /^[\u4e00-\u9fa5]+$/
    let memberNameOrMobiles =e.detail.value
    console.log(reg.test(memberNameOrMobiles))
    if (reg.test(memberNameOrMobiles)) {
       this.getMembers(memberNameOrMobiles)
    } else {
      if (memberNameOrMobiles.length > 6) {
        this.getMembers(memberNameOrMobiles)
      }
    }
    this.setData({
      memberNameOrMobiles
    })
    return memberNameOrMobiles
  },
  closeCustomerShowPopup(){
    this.setData({
      CustomerShow:false
    })
  },
  showCustomerShowPopup(){
    this.setData({
      CustomerShow:true
    })
  },
  setCustomer(){
    let option = this.data.customersMembers[this.data.selectdCustomerIdx]
    let memberId;

    this.setData({
      "ManagerForm.memberId":option.memberId,
      memberNameOrMobiles:`${option.name} ${option.mobile}`
    })
    this.closeCustomerShowPopup()
  },
  changeSplitMobilesInput(e){
    let splitMobilesInputSpan = this.data.splitMobilesInputSpan;
    splitMobilesInputSpan.forEach((i,idx)=>{
      splitMobilesInputSpan[idx] = e.detail.value[idx]||''
    })
     this.setData({
      splitMobilesInput:e.detail.value,
      splitMobilesInputSpan
     })
  }
})