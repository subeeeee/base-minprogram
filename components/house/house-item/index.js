const app =  getApp();
Component({
  properties: {
    showTel:{
      type:Boolean,
      default:false
    },
      projectData: {
          type: Object,
          observer(newVal) {
              this.setData({
                  recommend: newVal
              })
          }
      }
  },
  data: {
    imgServerUrl:app.globalData.imgServerUrl,
    globalProjectName:app.globalData.projectName,
    cdnUrl:app.globalData.cdnUrl
  },
  methods: {
    goHouse(e) {
      const houseid = e.currentTarget.dataset.houseid
      wx.navigateTo({
          url: '/pages/house/detail/index?houseid=' + houseid
      })
  },
  },
  created: function(){
  },
  attached: function(){

  },
  ready: function(){

  },
  moved: function(){

  },
  detached: function(){

  },
});