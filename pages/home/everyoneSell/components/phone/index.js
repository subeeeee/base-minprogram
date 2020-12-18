import { isPhone } from '../../../../../utils/utils.js'

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
          required: val.required,
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
      let toastContent = ''
      try {
        this.data.phoneList.forEach((item, index) => {
          if(!item) {
            isOK = false
            toastContent = `请填写第${index + 1}个客户手机`
            throw new Error(toastContent)
          } else {
            if(!isPhone(item)) {
              isOK = false
              toastContent = `请核查第${index + 1}个客户手机格式`
              throw new Error(toastContent)
            }
          }
        })
      } catch(err) {}
      this.triggerEvent('onChage', {
        fieldCode: this.data.fieldCode,
        fieldName: this.data.fieldName,
        toastContent,
        isOK,
        data: this.data.phoneList,
        required: this.data.required,
      })
    }
  }
})