import Api from "../../../utils/api";
const app = getApp()
Page({
  data: {
    recommendPro: {
      fieldName: '推荐项目',
      radioList: [],
      required: true,

    }
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
        radioList: res.data,
        required: true,
        rangeKey: 'projectName'
      }
    })
  },
  handleChange({ detail }) {
    console.log(detail)
  }
});