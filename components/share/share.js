//Component Object
Component({
  properties: {
    houseid:String
  },
  data: {

  },
  methods: {
    hideShareDialog(){
      this.triggerEvent("hideShareDialog")
    },
    downloadShareBg(){
      let {houseid} = this.data;
      wx.navigateTo({
          url: `/pages/house/detail/saveShareImg/saveShareImg?houseid=${houseid}`
      });
      this.hideShareDialog()
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