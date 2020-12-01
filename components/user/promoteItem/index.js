
const app =  getApp();
//Component Object
Component({
  properties: {
    item:{
      type:Object,
      value:{}
    },
    type:String
  },
  data: {
    projectName:app.globalData.projectName
  },
  methods: {
    gotoDetail(e){
      console.log(e.currentTarget.dataset.id)
      this.triggerEvent("gotoDetail",e.currentTarget.dataset.id)
    },
        //  拨打电话
    telephone(e) {
          wx.makePhoneCall({
              phoneNumber: e.currentTarget.dataset.phone,
          })
      }
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