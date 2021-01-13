const app = getApp()

Component({
  properties: {
    selectorData: {
      type: Object,
      value: null,
      observer(val) {
        const data = {
          fieldName: val.fieldName,
          optionList: val.optionList,
          required: val.required,
          canChooseMember: val.canChooseMember,
        }
        this.setData(val)
      }
    },
    isHide: {
      type: Boolean,
      value: false,
      observer(isHide) {
        this.changeIsHide(isHide)

      }
    },
  },
  data: {
    fieldName: '',
    optionList: [],
    required: false,
    selectContent: '请选择',
    imgServerUrl:app.globalData.imgServerUrl,
    globalProjectName:app.globalData.projectName,
    cdnUrl:app.globalData.cdnUrl,
    darkColor:app.globalData.darkColor,
    lightColor:app.globalData.lightColor
  },
  methods: {
    handleChange({ detail }) {
      let selectContent = null
      let data = null
      let isOK = false
      const selectItem = this.data.optionList[+detail.value]
      this.setData({
        selectContent: selectItem.memberInfo
      })
      const params = {
        fieldName: this.data.fieldName || '',
        required: this.data.required || '',
        data: selectItem.memberId,
        dataDesc: selectItem,
        isOK,
      }
      this.triggerEvent('onChange', params)
    },
    changeIsHide(isHide) {
      this.setData({
        isHide,
        selectContent: '请选择'
      })
      // 手动触发更改
      this.triggerEvent('onChange', {
        fieldName: this.data.fieldName || '',
        required: this.data.required || '',
        data: '',
        isOK: false,
      })
    }
  }
})
