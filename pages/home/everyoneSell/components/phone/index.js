const app = getApp()
Component({
  properties: {
    phoneData: {
      type: Object,
      value: null,
      observer(val) {
        this.setData({
          fieldCode: val.fieldCode,
          fieldName: val.fieldName,
          phoneList: [''],
        })
      }
    }
  },
  data: {
    phoneList: [''],
    fieldName: '',
    name: '',
    styleProjectName:app.globalData.projectName,
    imgServerUrl:app.globalData.imgServerUrl,
  },
  methods: {
    trim(str) {
      return str.replace(/^(\s|\u00A0)+/, '').replace(/(\s|\u00A0)+$/, '');
    },
    add() {
      const phoneList = this.data.phoneList
      if(phoneList.length >= 4) {
        wx.showToast({
          title: `客户手机最多添加4个`,
          icon: 'none',
          duration: 3000
        })
        return
      } else {
        phoneList.push('')
      }
      this.setData({ phoneList })
      this.emit()
    },
    sub({ target }) {
      const phoneList = this.data.phoneList
      phoneList.splice(target.dataset.index, 1)
      this.setData({ phoneList })
      this.emit()
    },
    onInput({ detail, currentTarget }) {
      console.log(detail, currentTarget)
      this.data.phoneList[currentTarget.dataset.index] = detail.value
      this.setData({ phoneList: this.data.phoneList });
      this.emit()
    },
    emit() {
      let isOK = true
      this.data.phoneList.forEach(item => {
        if(!item) {
          isOk = false
        }
      })

      this.triggerEvent('onChage', {
        fieldCode: this.data.fieldCode,
        fieldName: this.data.fieldName,
        isOK,
        data: this.data.phoneList,
        required: this.data.required,
      })
    }
  }
})