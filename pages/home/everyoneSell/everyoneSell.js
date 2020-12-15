import Api from "../../../utils/api";
const app = getApp()
Page({
  data: {
    recommendPro: {
      fieldName: '推荐项目',
      selectList: [],
      required: true,
    },
    formData: []
  },
  onLoad: function (options) {
      this.getProList()
  },
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
        selectList: res.data,
        required: true,
        rangeKey: 'projectName'
      }
    })
    // TODO reset data
    this.getCostomForm(res.data[7].projectId)
  },
  handleChangeProject({ detail }) {
    console.log(detail)
    this.getCostomForm(detail.data.projectId)
  },
  async getCostomForm(projectId) {
    const res = await Api.fetchChannelManager({
      method: 'get',
      url: '/applet/customizeForm',
      data: {
        userId: wx.getStorageSync('agentId'),
        projectId
      }
    })
    res.data.forEach(item => {
      if(item.fieldCode === 'sex') {
        item.selectList = [
          {label: '男', value: '01'},
          {label: '女', value: '02'},
        ]
        item.rangeKey = 'label'
      }
    })
    this.setData({
      formData: res.data
    })
  },
  handleChange({ detail }) {
    console.log(detail)
  }
});