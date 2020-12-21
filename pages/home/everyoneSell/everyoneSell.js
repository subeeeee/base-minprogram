import Api from "../../../utils/api";
const app = getApp()
const errString = (index, str) => `${index} break forEach: because required ${ str } was undefined!!!
This is a custom Error, if you have any question, pleace send E-maill to me, but you don't have my contact information, Ha, ha, ha!`
Page({
  data: {
    changeModeType: 0,
    recommendPro: {
      fieldName: '推荐项目',
      optionList: [],
      required: true,
    },
    memberCellOption: {
      fieldName: '置业顾问',
      optionList: [],
      required: false,
    },
    // 选中的推荐项目
    currentProInfo: {},
    // 在template中遍历的表单数据
    formData: [],
    // 是否隐号报备

    isHide: false
  },
  onLoad: function (options) {
    this.getProList()
  },
  /**
   * 请求活动列表
   */
  async getMemberList(projectId) {
    const res = await Api.fetchChannelManager({
      method: 'get',
      url: '/customersForThird/customers/members',
      data: { projectId }
    })
    res.data.forEach(item => {
      item.memberInfo = `${item.name}-${item.mobile}`
    })
    this.setData({
      memberCellOption: {
        fieldName: '置业顾问',
        optionList: res.data,
        rangeKey: 'memberInfo',
        required: false,
      }
    })
  },
  /**
   * 请求活动列表
   */
  async getProList() {
    const res = await Api.fetchChannelManager({
      method: 'get',
      url: '/projects/options',
      data: {
        tenantId:app.globalData.tenantId,
      }
    })
    this.setData({
      recommendPro: {
        fieldName: '推荐项目',
        optionList: res.data,
        required: true,
        rangeKey: 'projectName'
      }
    })
    // this.handleChangeProject({detail: {data:res.data[7]}})
  },
  /**
   * 选择活动列表
   */
  handleChangeProject({ detail }) {
    this.setData({
      currentProInfo: detail.data,
      canHideMobile: detail.data.canHideMobile,
      autoChooseMember: detail.data.autoChooseMember,
      canChooseMember: detail.data.canChooseMember,
      modeType: detail.data.modeType,
    })
    this.getCostomForm(detail.data.projectId)
    this.getMemberList(detail.data.projectId)
  },
  /**
   * 选择置业顾问
   */
  handleMemberChange({ detail }) {
    this.setData({
      memberId: detail.data.memberId
    })
  },
  /**
   * 根据活动列表获取自定义表单内容
   */
  async getCostomForm(projectId) {
    const res = await Api.fetchChannelManager({
      method: 'get',
      url: '/applet/customizeForm',
      data: {
        userId: wx.getStorageSync('agentId'),
        projectId
      }
    })
    // 所有需要提交的item
    const subList = []
    res.data.forEach(item => {
      if(item.fieldCode === "projectId") return
      if(item.fieldCode !== 'tips') {
        subList.push(item)
      }
      if(item.fieldType === 1) {
        item.rangeKey = 'fieldName'
      }

    })
    this.setData({
      formData: res.data,
      subList
    })
  },
  /**
   * 自定义列表改变监听器
   */
  handleChange({ detail }) {
    const {
      fieldCode,
      data,
      isOK,
      toastContent,
    } = detail
    this.data.subList.forEach(item => {
      if(item.fieldCode === fieldCode) {
        switch(fieldCode) {
          case 'name':
            item.data = data
            item.isOK = isOK
            break;
          case 'remark':
            item.data = data
            item.isOK = isOK
            break;
          case 'mobiles':
            item.data = data
            item.isOK = isOK
            item.toastContent = toastContent
            break;
          case 'sex':
            item.data = data.fieldCode
            item.isOK = isOK
            break;
          case 'location':
            item.data = data
            item.code = detail.code
            item.isOK = isOK
            break;
          case 'extend1':
            item.data = data
            item.isOK = isOK
            break;
          case 'extend2':
            item.data = data
            item.isOK = isOK
            break;

        }
      }
    })
    this.setData({
      subList: this.data.subList
    })
  },
  /**
   * 是否隐号报备
   */
  changeIsHide({ detail }) {
    this.setData(detail)
  },
  /**
   * 点击推荐客户提交
   */
  async handleSubmit() {
    const flag = this.hasUnfinished();
    if(flag) return
    console.log(this.data.subList)
    const params = {
      changeModeType: this.data.changeModeType,
      projectId: this.data.currentProInfo.projectId,
      modeType: this.data.modeType,
      memberId: this.data.memberId,
      reporterId: wx.getStorageSync('agentId'),
    }
    this.data.subList.forEach(item => {
      console.log(item)
      if(item.data || item.data === 0) {
        if(item.fieldCode === 'location') {
          params['location'] = item.code
          params['locationName'] = item.data
        }
        params[item.fieldCode] = item.data

      }
    })
    console.log(params)
    const res = await Api.fetchChannelManager({
      method: 'post',
      url: '/customersForThird/reportCustomer',
      data: params
    })
    if(res.code === 200) {
      wx.showToast({
        title: '推荐客户成功',
        icon: 'none',
        duration: 3000
      })
    } else {
      wx.showToast({
        title: res.message,
        icon: 'none',
        duration: 3000
      })
    }
  },
  /**
   * 验证必填项
   */
  hasUnfinished() {
    let flag = false
    if(!this.data.currentProInfo.projectId) {
      // wx.showToast({
      //   title: "请选择推荐项目",
      //   icon: 'none',
      //   duration: 3000
      // })
      wx.showToast({
        title: "请选择推荐项目",
        icon: 'none',
        duration: 3000
      })
      flag = true
      return flag
    }
    try{
      this.data.subList.forEach(item => {
        if(item.required) {
          console.log(item.data, !item.isOK)
          if (!item.data && item.data !== 0 && item.data !== 1 && !item.isOK) {
            console.log(item)
            wx.showToast({
              title: '请填写' + item.fieldName,
              icon: 'none',
              duration: 3000
            })
            throw new Error(errString(1, `${item.fieldName}  ${item.fieldCode}`))
          } else if (item.data && item.data !== 0 && item.data !== 1 && !item.isOK) {

            console.log(item)
            wx.showToast({
              title: item.toastContent,
              icon: 'none',
              duration: 3000
            })
            throw new Error(errString(2, `${item.fieldName}  ${item.fieldCode}`))
          }
        } else {
          if (item.data && item.data !== 0 && item.data !== 1 && !item.isOK) {
            console.log(item)
            wx.showToast({
              title: item.toastContent,
              icon: 'none',
              duration: 3000
            })
            throw new Error(errString(3, `${item.fieldName}  ${item.fieldCode}`))
          }
        }

      })
    } catch(err) {
      console.log(err)
      flag = true
    }
    return flag
  }
});